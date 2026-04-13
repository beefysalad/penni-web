'use client'

import { FinanceEmptyState } from '@/components/finance/management-components'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import FormErrorMessage from '@/components/ui/form-error-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/ui/mobile-sheet'
import {
  useBudgetsQuery,
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '@/hooks/finance/use-budgets-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import { getSpentForBudget } from '@/lib/selectors'
import { zodResolver } from '@hookform/resolvers/zod'
import { Goal, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { BudgetRow } from './_components/budget-row'
import { BudgetSection } from './_components/budget-section'
import {
  budgetFormSchema,
  DEFAULT_BUDGET_FORM,
  getBudgetTimingStatus,
  mapBudgetToForm,
  toBudgetIsoDate,
  type BudgetForm,
  type BudgetTimingStatus,
} from './_lib/budgets-page.helpers'

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
    defaultValues: DEFAULT_BUDGET_FORM,
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
    const order: Record<BudgetTimingStatus, number> = {
      CURRENT: 0,
      UPCOMING: 1,
      PAST: 2,
    }
    return [...budgets].sort((a, b) => {
      const as = getBudgetTimingStatus(a, today)
      const bs = getBudgetTimingStatus(b, today)
      if (as !== bs) return order[as] - order[bs]
      if (as === 'PAST')
        return new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime()
      return (
        new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
      )
    })
  }, [budgets, today])

  const currentBudgets = useMemo(
    () =>
      sortedBudgets.filter(
        (b) => getBudgetTimingStatus(b, today) === 'CURRENT'
      ),
    [sortedBudgets, today]
  )
  const upcomingBudgets = useMemo(
    () =>
      sortedBudgets.filter(
        (b) => getBudgetTimingStatus(b, today) === 'UPCOMING'
      ),
    [sortedBudgets, today]
  )
  const pastBudgets = useMemo(
    () =>
      sortedBudgets.filter((b) => getBudgetTimingStatus(b, today) === 'PAST'),
    [sortedBudgets, today]
  )

  const resetForm = () => {
    setEditingBudgetId(null)
    reset(DEFAULT_BUDGET_FORM)
    setShowComposer(false)
  }

  const handleBudgetSubmit = (values: BudgetForm) => {
    const payload = {
      name: values.name.trim() || undefined,
      categoryId: values.categoryId || undefined,
      amount: Number(values.amount).toFixed(2),
      currency: 'PHP',
      alertThreshold: Number(values.alertThreshold || 80),
      periodStart: toBudgetIsoDate(values.periodStart),
      periodEnd: toBudgetIsoDate(values.periodEnd, true),
    }

    if (editingBudgetId) {
      updateBudgetMutation.mutate(
        { id: editingBudgetId, input: payload },
        {
          onSuccess: () => {
            toast.success('Budget updated.')
            resetForm()
          },
          onError: (e) =>
            toast.error(
              e instanceof Error ? e.message : 'Could not update budget.'
            ),
        }
      )
      return
    }

    createBudgetMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Budget created.')
        resetForm()
      },
      onError: (e) =>
        toast.error(
          e instanceof Error ? e.message : 'Could not create budget.'
        ),
    })
  }

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleBudgetSubmit)}
      className="rounded-[24px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="hidden items-start justify-between gap-4 lg:flex">
        <div>
          <p className="text-[10px] font-bold tracking-[2px] text-[#4a5650] uppercase">
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

      <div className="mt-5 grid gap-4 max-lg:mt-0 sm:grid-cols-2 lg:mt-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="budget-name"
            className="text-[10px] tracking-widest text-[#4a5650] uppercase"
          >
            Budget name
          </Label>
          <Input
            id="budget-name"
            {...register('name')}
            placeholder="Food, Shopping, Bills…"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="budget-category"
            className="text-[10px] tracking-widest text-[#4a5650] uppercase"
          >
            Category
          </Label>
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
            className="h-11 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[14px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31]"
          >
            <option value="">Optional category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="budget-amount"
            className="text-[10px] tracking-widest text-[#4a5650] uppercase"
          >
            Amount
          </Label>
          <Input
            id="budget-amount"
            type="number"
            {...register('amount')}
            placeholder="5000.00"
          />
          <FormErrorMessage message={errors.amount?.message} />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="budget-alert"
            className="text-[10px] tracking-widest text-[#4a5650] uppercase"
          >
            Alert threshold (%)
          </Label>
          <Input
            id="budget-alert"
            type="number"
            min="1"
            max="100"
            {...register('alertThreshold')}
            placeholder="80"
          />
          <FormErrorMessage message={errors.alertThreshold?.message} />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="budget-start"
            className="text-[10px] tracking-widest text-[#4a5650] uppercase"
          >
            Period start
          </Label>
          <Input id="budget-start" type="date" {...register('periodStart')} />
          <FormErrorMessage message={errors.periodStart?.message} />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="budget-end"
            className="text-[10px] tracking-widest text-[#4a5650] uppercase"
          >
            Period end
          </Label>
          <Input id="budget-end" type="date" {...register('periodEnd')} />
          <FormErrorMessage message={errors.periodEnd?.message} />
        </div>
      </div>

      <div className="mt-5 flex gap-2.5">
        <Button
          type="submit"
          className="flex-1 rounded-full"
          disabled={
            createBudgetMutation.isPending || updateBudgetMutation.isPending
          }
        >
          <Plus className="size-4" />
          {editingBudgetId ? 'Save changes' : 'Create budget'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          onClick={resetForm}
        >
          Cancel
        </Button>
      </div>
    </form>
  )

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

      <div className="flex flex-col gap-5 px-4 pt-6 pb-28 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">
                Current
              </span>
              <span className="text-[15px] font-bold text-[#8bff62]">
                {currentBudgets.length}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">
                Upcoming
              </span>
              <span className="text-[15px] font-bold text-[#9dd6ff]">
                {upcomingBudgets.length}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">
                Past
              </span>
              <span className="text-[15px] font-bold text-[#93a19a]">
                {pastBudgets.length}
              </span>
            </div>
          </div>

          <Button
            className="rounded-full px-5"
            onClick={() => {
              if (showComposer) {
                resetForm()
              } else {
                reset(DEFAULT_BUDGET_FORM)
                setEditingBudgetId(null)
                setShowComposer(true)
              }
            }}
          >
            <Plus className="size-4" />
            {showComposer ? 'Close' : 'New budget'}
          </Button>
        </div>

        {showComposer ? (
          <div className="hidden lg:block">{composerContent}</div>
        ) : null}

        <BudgetSection
          title="Current"
          badge={`${currentBudgets.length} active`}
          badgeColor="#8bff62"
        >
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
                    onSuccess: () =>
                      toast.success(`${budget.name || 'Budget'} deleted.`),
                    onError: (e) =>
                      toast.error(
                        e instanceof Error ? e.message : 'Could not delete.'
                      ),
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

        {!budgetsQuery.isLoading && upcomingBudgets.length > 0 ? (
          <BudgetSection
            title="Upcoming"
            badge={`${upcomingBudgets.length} scheduled`}
            badgeColor="#9dd6ff"
          >
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
                    onSuccess: () =>
                      toast.success(`${budget.name || 'Budget'} deleted.`),
                    onError: (e) =>
                      toast.error(
                        e instanceof Error ? e.message : 'Could not delete.'
                      ),
                  })
                }
              />
            ))}
          </BudgetSection>
        ) : null}

        {!budgetsQuery.isLoading && pastBudgets.length > 0 ? (
          <BudgetSection
            title="Past"
            badge={`${pastBudgets.length} archived`}
            badgeColor="#93a19a"
          >
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
                    onSuccess: () =>
                      toast.success(`${budget.name || 'Budget'} deleted.`),
                    onError: (e) =>
                      toast.error(
                        e instanceof Error ? e.message : 'Could not delete.'
                      ),
                  })
                }
              />
            ))}
          </BudgetSection>
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
