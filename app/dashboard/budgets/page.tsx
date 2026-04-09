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
import {
  useBudgetsQuery,
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '@/hooks/finance/use-budgets-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import { getSpentForBudget } from '@/lib/selectors'
import type { Budget } from '@/lib/finance.types'
import { formatCurrency, formatCompactDate } from '@/lib/formatters'
import { Goal, Pencil, Plus, Trash2 } from 'lucide-react'

// ─── Types & constants ─────────────────────────────────────────────────────────

type BudgetForm = {
  name: string
  amount: string
  categoryId: string
  alertThreshold: string
  periodStart: string
  periodEnd: string
}

type BudgetTimingStatus = 'CURRENT' | 'UPCOMING' | 'PAST'

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
      .refine(
        (v) => Number.isFinite(Number(v)) && Number(v) > 0,
        'Enter a valid budget amount.'
      ),
    categoryId: z.string(),
    alertThreshold: z
      .string()
      .trim()
      .min(1, 'Enter an alert threshold.')
      .refine(
        (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 100,
        'Alert threshold must be between 1 and 100.'
      ),
    periodStart: z.string().min(1, 'Choose a start date.'),
    periodEnd: z.string().min(1, 'Choose an end date.'),
  })
  .superRefine((v, ctx) => {
    if (!v.periodStart || !v.periodEnd) return
    if (new Date(v.periodEnd).getTime() < new Date(v.periodStart).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periodEnd'],
        message: 'Period end must be on or after the start date.',
      })
    }
  })

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

function getBudgetTimingStatus(budget: Budget, today: Date): BudgetTimingStatus {
  const start = new Date(budget.periodStart)
  const end = new Date(budget.periodEnd)
  if (today < start) return 'UPCOMING'
  if (today > end) return 'PAST'
  return 'CURRENT'
}

function getProgressState(spent: number, limit: number, alertThreshold: number) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const isOver = spent > limit
  const isReached = !isOver && limit > 0 && spent >= limit
  const isWarning = pct >= alertThreshold
  return {
    pct,
    isOver,
    label: isOver ? 'Over budget' : isReached ? 'Budget reached' : isWarning ? 'Approaching' : 'On track',
    labelColor: isOver ? '#ff8a94' : isReached || isWarning ? '#ffc857' : '#4a5650',
    barColor: isOver ? '#ff8a94' : isReached || isWarning ? '#ffc857' : '#8bff62',
  }
}

// ─── Budget row ────────────────────────────────────────────────────────────────

function BudgetRow({
  budget,
  spent,
  categoryName,
  onEdit,
  onDelete,
}: {
  budget: Budget
  spent: number
  categoryName: string | null
  onEdit: () => void
  onDelete: () => void
}) {
  const limit = Number(budget.amount)
  const remaining = limit - spent
  const { pct, label, labelColor, barColor } = getProgressState(spent, limit, budget.alertThreshold)

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-[#f4f7f5]">
            {budget.name || categoryName || 'Unnamed budget'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#4a5650]">
            {formatCompactDate(budget.periodStart)} → {formatCompactDate(budget.periodEnd)}
            {categoryName ? <span className="ml-2 text-[#41d6b2]">{categoryName}</span> : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-8 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#213129]"
            aria-label="Edit budget"
          >
            <Pencil className="size-3.5 text-[#8bff62]" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex size-8 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
            aria-label="Delete budget"
          >
            <Trash2 className="size-3.5 text-[#ff8a94]" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a2c1f]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold" style={{ color: remaining < 0 ? '#ff8a94' : '#93a19a' }}>
          {remaining < 0 ? 'Over ' : ''}{formatCurrency(Math.abs(remaining), budget.currency)} left
          <span className="ml-1.5 font-normal text-[#4a5650]">
            of {formatCurrency(limit, budget.currency)}
          </span>
        </p>
        <span className="text-[11px] font-bold" style={{ color: labelColor }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ─── Section block ─────────────────────────────────────────────────────────────

function BudgetSection({
  title,
  badge,
  badgeColor,
  children,
}: {
  title: string
  badge: string
  badgeColor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-[13px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">{title}</h3>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: badgeColor, backgroundColor: `${badgeColor}15` }}
        >
          {badge}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
    for (const c of categories) map.set(c.id, c.name)
    return map
  }, [categories])

  const sortedBudgets = useMemo(() => {
    const order: Record<BudgetTimingStatus, number> = { CURRENT: 0, UPCOMING: 1, PAST: 2 }
    return [...budgets].sort((a, b) => {
      const as = getBudgetTimingStatus(a, today)
      const bs = getBudgetTimingStatus(b, today)
      if (as !== bs) return order[as] - order[bs]
      if (as === 'PAST')
        return new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
      return new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    })
  }, [budgets, today])

  const currentBudgets = useMemo(
    () => sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'CURRENT'),
    [sortedBudgets, today]
  )
  const upcomingBudgets = useMemo(
    () => sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'UPCOMING'),
    [sortedBudgets, today]
  )
  const pastBudgets = useMemo(
    () => sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'PAST'),
    [sortedBudgets, today]
  )

  const resetForm = () => {
    setEditingBudgetId(null)
    reset(DEFAULT_FORM)
    setShowComposer(false)
  }

  const handleBudgetSubmit = (values: BudgetForm) => {
    const payload = {
      name: values.name.trim() || undefined,
      categoryId: values.categoryId || undefined,
      amount: Number(values.amount).toFixed(2),
      currency: 'PHP',
      alertThreshold: Number(values.alertThreshold || 80),
      periodStart: toIsoDate(values.periodStart),
      periodEnd: toIsoDate(values.periodEnd, true),
    }

    if (editingBudgetId) {
      updateBudgetMutation.mutate(
        { id: editingBudgetId, input: payload },
        {
          onSuccess: () => { toast.success('Budget updated.'); resetForm() },
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update budget.'),
        }
      )
      return
    }

    createBudgetMutation.mutate(payload, {
      onSuccess: () => { toast.success('Budget created.'); resetForm() },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not create budget.'),
    })
  }

  // ── Composer form ────────────────────────────────────────────────────────────

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleBudgetSubmit)}
      className="rounded-[24px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="hidden items-start justify-between gap-4 lg:flex">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#4a5650]">
            {editingBudgetId ? 'Editing budget' : 'New budget'}
          </p>
          <h2 className="mt-1.5 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
            {editingBudgetId ? 'Adjust this limit' : 'Set a spending guardrail'}
          </h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-[#18221d]">
          <Goal className="size-4 text-[#ffc857]" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:mt-5 max-lg:mt-0">
        <div className="space-y-1.5">
          <Label htmlFor="budget-name" className="text-[10px] tracking-widest uppercase text-[#4a5650]">Budget name</Label>
          <Input id="budget-name" {...register('name')} placeholder="Food, Shopping, Bills…" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-category" className="text-[10px] tracking-widest uppercase text-[#4a5650]">Category</Label>
          <select
            id="budget-category"
            value={categoryId}
            onChange={(e) => setValue('categoryId', e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
            className="h-11 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[14px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31]"
          >
            <option value="">Optional category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-amount" className="text-[10px] tracking-widest uppercase text-[#4a5650]">Amount</Label>
          <Input id="budget-amount" type="number" {...register('amount')} placeholder="5000.00" />
          <FormErrorMessage message={errors.amount?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-alert" className="text-[10px] tracking-widest uppercase text-[#4a5650]">Alert threshold (%)</Label>
          <Input id="budget-alert" type="number" min="1" max="100" {...register('alertThreshold')} placeholder="80" />
          <FormErrorMessage message={errors.alertThreshold?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-start" className="text-[10px] tracking-widest uppercase text-[#4a5650]">Period start</Label>
          <Input id="budget-start" type="date" {...register('periodStart')} />
          <FormErrorMessage message={errors.periodStart?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-end" className="text-[10px] tracking-widest uppercase text-[#4a5650]">Period end</Label>
          <Input id="budget-end" type="date" {...register('periodEnd')} />
          <FormErrorMessage message={errors.periodEnd?.message} />
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <Button
          type="submit"
          className="flex-1 rounded-full"
          disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
        >
          <Plus className="size-4" />
          {editingBudgetId ? 'Save changes' : 'Create budget'}
        </Button>
        <Button type="button" variant="secondary" className="rounded-full" onClick={resetForm}>
          Cancel
        </Button>
      </div>
    </form>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Budget planning"
          title="Budgets"
          subtitle="Set spending limits and track category drift over any period."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-5 px-4 pb-28 pt-6 md:px-6 lg:px-8">

        {/* ── Stat chips + action row ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {/* Current chip */}
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Current</span>
              <span className="text-[15px] font-bold text-[#8bff62]">{currentBudgets.length}</span>
            </div>
            {/* Upcoming chip */}
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Upcoming</span>
              <span className="text-[15px] font-bold text-[#9dd6ff]">{upcomingBudgets.length}</span>
            </div>
            {/* Past chip */}
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Past</span>
              <span className="text-[15px] font-bold text-[#93a19a]">{pastBudgets.length}</span>
            </div>
          </div>

          <Button
            className="rounded-full px-5"
            onClick={() => {
              if (showComposer) {
                resetForm()
              } else {
                reset(DEFAULT_FORM)
                setEditingBudgetId(null)
                setShowComposer(true)
              }
            }}
          >
            <Plus className="size-4" />
            {showComposer ? 'Close' : 'New budget'}
          </Button>
        </div>

        {/* ── Desktop composer ── */}
        {showComposer ? <div className="hidden lg:block">{composerContent}</div> : null}

        {/* ── Current budgets ── */}
        <BudgetSection title="Current" badge={`${currentBudgets.length} active`} badgeColor="#8bff62">
          {budgetsQuery.isLoading ? (
            <>
              <div className="h-[88px] animate-pulse rounded-[20px] bg-[#131b17]" />
              <div className="h-[88px] animate-pulse rounded-[20px] bg-[#131b17]" />
            </>
          ) : currentBudgets.length > 0 ? (
            currentBudgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                spent={getSpentForBudget(budget, transactions)}
                categoryName={categoryMap.get(budget.categoryId ?? '') ?? null}
                onEdit={() => {
                  setEditingBudgetId(budget.id)
                  reset(mapBudgetToForm(budget))
                  setShowComposer(true)
                }}
                onDelete={() =>
                  deleteBudgetMutation.mutate(budget.id, {
                    onSuccess: () => toast.success(`${budget.name || 'Budget'} deleted.`),
                    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete.'),
                  })
                }
              />
            ))
          ) : (
            <FinanceEmptyState
              icon={Goal}
              title="No current budgets"
              description={
                budgets.length > 0
                  ? 'You have budgets saved, but none are active for today.'
                  : 'Create your first budget to start tracking spending against a limit.'
              }
            />
          )}
        </BudgetSection>

        {/* ── Upcoming budgets ── */}
        {!budgetsQuery.isLoading && upcomingBudgets.length > 0 ? (
          <BudgetSection title="Upcoming" badge={`${upcomingBudgets.length} scheduled`} badgeColor="#9dd6ff">
            {upcomingBudgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                spent={getSpentForBudget(budget, transactions)}
                categoryName={categoryMap.get(budget.categoryId ?? '') ?? null}
                onEdit={() => {
                  setEditingBudgetId(budget.id)
                  reset(mapBudgetToForm(budget))
                  setShowComposer(true)
                }}
                onDelete={() =>
                  deleteBudgetMutation.mutate(budget.id, {
                    onSuccess: () => toast.success(`${budget.name || 'Budget'} deleted.`),
                    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete.'),
                  })
                }
              />
            ))}
          </BudgetSection>
        ) : null}

        {/* ── Past budgets ── */}
        {!budgetsQuery.isLoading && pastBudgets.length > 0 ? (
          <BudgetSection title="Past" badge={`${pastBudgets.length} archived`} badgeColor="#93a19a">
            {pastBudgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                spent={getSpentForBudget(budget, transactions)}
                categoryName={categoryMap.get(budget.categoryId ?? '') ?? null}
                onEdit={() => {
                  setEditingBudgetId(budget.id)
                  reset(mapBudgetToForm(budget))
                  setShowComposer(true)
                }}
                onDelete={() =>
                  deleteBudgetMutation.mutate(budget.id, {
                    onSuccess: () => toast.success(`${budget.name || 'Budget'} deleted.`),
                    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete.'),
                  })
                }
              />
            ))}
          </BudgetSection>
        ) : null}
      </div>

      {/* ── Mobile sheet ── */}
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
