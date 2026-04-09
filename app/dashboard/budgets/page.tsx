'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/ui/mobile-sheet'
import FormErrorMessage from '@/components/ui/form-error-message'
import { FinanceEmptyState } from '@/components/finance/management-components'
import { useBudgetsQuery, useCreateBudgetMutation, useDeleteBudgetMutation, useUpdateBudgetMutation } from '@/hooks/finance/use-budgets-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import { getSpentForBudget } from '@/lib/selectors'
import type { Budget } from '@/lib/finance.types'
import { formatCurrency, formatCompactDate } from '@/lib/formatters'
import { Goal, Pencil, Plus, Trash2 } from 'lucide-react'

type BudgetForm = {
  name: string
  amount: string
  categoryId: string
  alertThreshold: string
  periodStart: string
  periodEnd: string
}

const now = new Date()
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

const DEFAULT_FORM: BudgetForm = {
  name: '',
  amount: '',
  categoryId: '',
  alertThreshold: '80',
  periodStart: startOfMonth,
  periodEnd: endOfMonth,
}

const budgetFormSchema = z
  .object({
    name: z.string(),
    amount: z
      .string()
      .trim()
      .min(1, 'Enter a budget amount.')
      .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, 'Enter a valid budget amount.'),
    categoryId: z.string(),
    alertThreshold: z
      .string()
      .trim()
      .min(1, 'Enter an alert threshold.')
      .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 100, 'Alert threshold must be between 1 and 100.'),
    periodStart: z.string().min(1, 'Choose a start date.'),
    periodEnd: z.string().min(1, 'Choose an end date.'),
  })
  .superRefine((value, ctx) => {
    if (!value.periodStart || !value.periodEnd) {
      return
    }

    if (new Date(value.periodEnd).getTime() < new Date(value.periodStart).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periodEnd'],
        message: 'Period end must be on or after the start date.',
      })
    }
  })

function toIsoDate(dateValue: string, endOfDay = false) {
  return new Date(`${dateValue}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString()
}

function mapBudgetToForm(budget: Budget): BudgetForm {
  return {
    name: budget.name ?? '',
    amount: String(budget.amount),
    categoryId: budget.categoryId ?? '',
    alertThreshold: String(budget.alertThreshold),
    periodStart: budget.periodStart.slice(0, 10),
    periodEnd: budget.periodEnd.slice(0, 10),
  }
}

type BudgetTimingStatus = 'CURRENT' | 'UPCOMING' | 'PAST'

function getBudgetTimingStatus(budget: Budget, now: Date): BudgetTimingStatus {
  const start = new Date(budget.periodStart)
  const end = new Date(budget.periodEnd)

  if (now < start) return 'UPCOMING'
  if (now > end) return 'PAST'
  return 'CURRENT'
}

function getBudgetStatusLabel(status: BudgetTimingStatus) {
  if (status === 'CURRENT') return 'Current'
  if (status === 'UPCOMING') return 'Upcoming'
  return 'Past'
}

function getBudgetStatusTone(status: BudgetTimingStatus) {
  if (status === 'CURRENT') return 'text-[#8bff62] bg-[#16211b]'
  if (status === 'UPCOMING') return 'text-[#9dd6ff] bg-[#151f25]'
  return 'text-[#93a19a] bg-[#18221d]'
}

function getBudgetProgressState(spent: number, limit: number, alertThreshold: number) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const isOver = spent > limit
  const isReached = !isOver && limit > 0 && spent >= limit
  const isWarning = pct >= alertThreshold

  return {
    pct,
    isOver,
    isReached,
    isWarning,
    label: isOver ? 'Over budget' : isReached ? 'Budget reached' : isWarning ? 'Approaching limit' : 'On track',
    labelClass: isOver ? 'text-[#ff8a94]' : isReached ? 'text-[#ffc857]' : isWarning ? 'text-[#ffc857]' : 'text-[#93a19a]',
    barColor: isOver ? '#ff8a94' : isReached ? '#ffc857' : isWarning ? '#ffc857' : '#8bff62',
  }
}

export default function BudgetsPage() {
  const budgetsQuery = useBudgetsQuery()
  const categoriesQuery = useCategoriesQuery('EXPENSE')
  const transactionsQuery = useTransactionsQuery()
  const createBudgetMutation = useCreateBudgetMutation()
  const updateBudgetMutation = useUpdateBudgetMutation()
  const deleteBudgetMutation = useDeleteBudgetMutation()

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: DEFAULT_FORM,
  })

  const categoryId = useWatch({ control, name: 'categoryId' })

  const budgets = budgetsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const transactions = transactionsQuery.data ?? []
  const today = new Date()

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) map.set(category.id, category.name)
    return map
  }, [categories])

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      const statusOrder: Record<BudgetTimingStatus, number> = {
        CURRENT: 0,
        UPCOMING: 1,
        PAST: 2,
      }

      const aStatus = getBudgetTimingStatus(a, today)
      const bStatus = getBudgetTimingStatus(b, today)

      if (aStatus !== bStatus) {
        return statusOrder[aStatus] - statusOrder[bStatus]
      }

      if (aStatus === 'PAST') {
        return new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
      }

      return new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    })
  }, [budgets, today])

  const currentBudgets = useMemo(
    () => sortedBudgets.filter((budget) => getBudgetTimingStatus(budget, today) === 'CURRENT'),
    [sortedBudgets, today]
  )

  const upcomingBudgets = useMemo(
    () => sortedBudgets.filter((budget) => getBudgetTimingStatus(budget, today) === 'UPCOMING'),
    [sortedBudgets, today]
  )

  const pastBudgets = useMemo(
    () => sortedBudgets.filter((budget) => getBudgetTimingStatus(budget, today) === 'PAST'),
    [sortedBudgets, today]
  )

  const resetForm = () => {
    setEditingBudgetId(null)
    reset(DEFAULT_FORM)
    setShowComposer(false)
  }

  const handleBudgetSubmit = (values: BudgetForm) => {
    const amount = Number(values.amount)

    const payload = {
      name: values.name.trim() || undefined,
      categoryId: values.categoryId || undefined,
      amount: amount.toFixed(2),
      currency: 'PHP',
      alertThreshold: Number(values.alertThreshold || 80),
      periodStart: toIsoDate(values.periodStart),
      periodEnd: toIsoDate(values.periodEnd, true),
    }

    if (editingBudgetId) {
      updateBudgetMutation.mutate(
        { id: editingBudgetId, input: payload },
        {
          onSuccess: () => {
            toast.success('Budget updated.')
            resetForm()
          },
          onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not update budget.'),
        }
      )
      return
    }

    createBudgetMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Budget created.')
        resetForm()
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not create budget.'),
    })
  }

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleBudgetSubmit)}
      className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="flex items-start justify-between gap-4 max-lg:hidden">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
            {editingBudgetId ? 'Edit budget' : 'Create budget'}
          </p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
            {editingBudgetId ? 'Adjust this limit' : 'Set a spending guardrail'}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            Budgets track your category spending against a limit over a period you define.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Goal className="size-5 text-[#ffc857]" />
        </div>
      </div>

      <div className="mt-6 space-y-4 max-lg:mt-0">
        <div className="space-y-2">
          <Label htmlFor="budget-name">Budget name</Label>
          <Input id="budget-name" {...register('name')} placeholder="e.g. Food, Shopping, Family" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget-category">Expense category</Label>
          <select
            id="budget-category"
            value={categoryId}
            onChange={(e) =>
              setValue('categoryId', e.target.value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            <option value="">Optional category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Amount</Label>
            <Input id="budget-amount" type="number" {...register('amount')} placeholder="5000.00" />
            <FormErrorMessage message={errors.amount?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-alert">Alert threshold (%)</Label>
            <Input id="budget-alert" type="number" min="1" max="100" {...register('alertThreshold')} placeholder="80" />
            <FormErrorMessage message={errors.alertThreshold?.message} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget-start">Period start</Label>
            <Input id="budget-start" type="date" {...register('periodStart')} />
            <FormErrorMessage message={errors.periodStart?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-end">Period end</Label>
            <Input id="budget-end" type="date" {...register('periodEnd')} />
            <FormErrorMessage message={errors.periodEnd?.message} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
        >
          <Plus className="size-4" />
          {editingBudgetId ? 'Save budget' : 'Create budget'}
        </Button>
        <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
      </div>
    </form>
  )

  const renderBudgetList = (items: Budget[]) => (
    <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
      <div className="divide-y divide-[#17211c]/60">
        {items.map((budget) => {
          const spent = getSpentForBudget(budget, transactions)
          const limit = Number(budget.amount)
          const remaining = limit - spent
          const { pct, label, labelClass, barColor } = getBudgetProgressState(
            spent,
            limit,
            budget.alertThreshold
          )
          const timingStatus = getBudgetTimingStatus(budget, today)
          const categoryName = categoryMap.get(budget.categoryId ?? '')

          return (
            <div key={budget.id} className="p-4">
              <div className="overflow-hidden rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[16px] font-bold text-[#f4f7f5]">
                        {budget.name || categoryName || 'Unnamed budget'}
                      </p>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.3px] ${getBudgetStatusTone(timingStatus)}`}>
                        {getBudgetStatusLabel(timingStatus)}
                      </span>
                      {categoryName ? (
                        <span className="rounded-full bg-[#18221d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[#93a19a]">
                          {categoryName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[12px] font-medium text-[#7f8c86]">
                      {formatCurrency(spent, budget.currency)} of {formatCurrency(limit, budget.currency)} · {formatCompactDate(budget.periodStart)} to {formatCompactDate(budget.periodEnd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBudgetId(budget.id)
                        reset(mapBudgetToForm(budget))
                        setShowComposer(true)
                      }}
                      className="flex size-9 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#213129]"
                      aria-label={`Edit ${budget.name || 'budget'}`}
                    >
                      <Pencil className="size-4 text-[#8bff62]" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteBudgetMutation.mutate(budget.id, {
                          onSuccess: () => toast.success(`${budget.name || 'Budget'} deleted.`),
                          onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not delete budget.'),
                        })
                      }
                      className="flex size-9 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
                      aria-label={`Delete ${budget.name || 'budget'}`}
                    >
                      <Trash2 className="size-4 text-[#ff8a94]" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1a2c1f]">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold" style={{ color: remaining < 0 ? '#ff8a94' : '#dce2de' }}>
                    {remaining < 0 ? 'Over ' : 'Left '}{formatCurrency(Math.abs(remaining), budget.currency)}
                  </p>
                  <span className={`text-[12px] font-semibold ${labelClass}`}>{label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Budget planning"
          title="Budgets"
          subtitle="Set monthly spending limits and keep category drift visible."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pb-28 pt-6 md:px-6 lg:px-8">
        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">
                Guardrails
              </p>
              <p className="mt-1 text-[14px] font-medium text-[#93a19a]">
                Open the composer only when you need to add or adjust a budget.
              </p>
            </div>
            <Button onClick={() => setShowComposer((current) => !current)} className="lg:self-stretch">
              <Plus className="size-4" />
              {showComposer ? 'Close composer' : 'New budget'}
            </Button>
          </div>
        </div>

        {showComposer ? <div className="hidden lg:block">{composerContent}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Current</p>
            <p className="mt-3 text-[28px] font-bold tracking-tight text-[#8bff62]">{currentBudgets.length}</p>
            <p className="mt-1 text-[13px] font-medium text-[#7f8c86]">Budgets active right now.</p>
          </div>
          <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Upcoming</p>
            <p className="mt-3 text-[28px] font-bold tracking-tight text-[#9dd6ff]">{upcomingBudgets.length}</p>
            <p className="mt-1 text-[13px] font-medium text-[#7f8c86]">Scheduled for a future period.</p>
          </div>
          <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Past</p>
            <p className="mt-3 text-[28px] font-bold tracking-tight text-[#93a19a]">{pastBudgets.length}</p>
            <p className="mt-1 text-[13px] font-medium text-[#7f8c86]">Older periods kept for reference.</p>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">Current budgets</h3>
              <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">Only budgets whose period includes today show up here.</p>
            </div>
            <span className="rounded-full bg-[#16211b] px-3 py-1 text-[11px] font-bold text-[#8bff62]">
              {currentBudgets.length} current
            </span>
          </div>

          <div className="mt-5">
            {budgetsQuery.isLoading ? (
              <div className="space-y-3 p-4">
                <div className="h-24 rounded-[20px] bg-[#131b17] animate-pulse" />
                <div className="h-24 rounded-[20px] bg-[#131b17] animate-pulse" />
              </div>
            ) : currentBudgets.length > 0 ? (
              renderBudgetList(currentBudgets)
            ) : (
              <FinanceEmptyState
                icon={Goal}
                title="No current budgets"
                description={
                  budgets.length > 0
                    ? 'You have budgets saved, but none are active for today.'
                    : 'Set a budget to start tracking category drift and remaining room.'
                }
              />
            )}
          </div>
        </div>

        {!budgetsQuery.isLoading && upcomingBudgets.length > 0 ? (
          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[24px] font-bold tracking-tight text-[#f4f7f5]">Upcoming budgets</h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">Already set up, but their period has not started yet.</p>
              </div>
              <span className="rounded-full bg-[#151f25] px-3 py-1 text-[11px] font-bold text-[#9dd6ff]">
                {upcomingBudgets.length} upcoming
              </span>
            </div>
            <div className="mt-5">{renderBudgetList(upcomingBudgets)}</div>
          </div>
        ) : null}

        {!budgetsQuery.isLoading && pastBudgets.length > 0 ? (
          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[24px] font-bold tracking-tight text-[#f4f7f5]">Past budgets</h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">Older budget periods kept for reference so they do not clutter the live view.</p>
              </div>
              <span className="rounded-full bg-[#18221d] px-3 py-1 text-[11px] font-bold text-[#93a19a]">
                {pastBudgets.length} past
              </span>
            </div>
            <div className="mt-5">{renderBudgetList(pastBudgets)}</div>
          </div>
        ) : null}
      </div>

      <MobileSheet
        open={showComposer}
        onClose={resetForm}
        eyebrow="Budget"
        title={editingBudgetId ? 'Edit budget' : 'New budget'}
      >
        {composerContent}
      </MobileSheet>
    </>
  )
}
