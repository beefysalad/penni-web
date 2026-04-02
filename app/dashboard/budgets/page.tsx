'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function BudgetsPage() {
  const budgetsQuery = useBudgetsQuery()
  const categoriesQuery = useCategoriesQuery('EXPENSE')
  const transactionsQuery = useTransactionsQuery()
  const createBudgetMutation = useCreateBudgetMutation()
  const updateBudgetMutation = useUpdateBudgetMutation()
  const deleteBudgetMutation = useDeleteBudgetMutation()

  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [form, setForm] = useState<BudgetForm>(DEFAULT_FORM)

  const budgets = budgetsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const transactions = transactionsQuery.data ?? []

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) map.set(category.id, category.name)
    return map
  }, [categories])

  const resetForm = () => {
    setEditingBudgetId(null)
    setForm(DEFAULT_FORM)
  }

  const handleSubmit = () => {
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid budget amount.')
      return
    }

    const payload = {
      name: form.name.trim() || undefined,
      categoryId: form.categoryId || undefined,
      amount: amount.toFixed(2),
      currency: 'PHP',
      alertThreshold: Number(form.alertThreshold || 80),
      periodStart: toIsoDate(form.periodStart),
      periodEnd: toIsoDate(form.periodEnd, true),
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
                  {editingBudgetId ? 'Edit budget' : 'Create budget'}
                </p>
                <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
                  {editingBudgetId ? 'Adjust this limit' : 'Set a spending guardrail'}
                </h2>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Goal className="size-5 text-[#ffc857]" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget-name">Budget name</Label>
                <Input id="budget-name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="e.g. Food, Shopping, Family" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-category">Expense category</Label>
                <select
                  id="budget-category"
                  value={form.categoryId}
                  onChange={(e) => setForm((c) => ({ ...c, categoryId: e.target.value }))}
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
                  <Input id="budget-amount" type="number" value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} placeholder="5000.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-alert">Alert threshold</Label>
                  <Input id="budget-alert" type="number" min="1" max="100" value={form.alertThreshold} onChange={(e) => setForm((c) => ({ ...c, alertThreshold: e.target.value }))} placeholder="80" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget-start">Period start</Label>
                  <Input id="budget-start" type="date" value={form.periodStart} onChange={(e) => setForm((c) => ({ ...c, periodStart: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-end">Period end</Label>
                  <Input id="budget-end" type="date" value={form.periodEnd} onChange={(e) => setForm((c) => ({ ...c, periodEnd: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
              >
                <Plus className="size-4" />
                {editingBudgetId ? 'Save budget' : 'Create budget'}
              </Button>
              {editingBudgetId ? (
                <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">Active budgets</h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">Live against the backend with current transaction spend.</p>
              </div>
              <span className="rounded-full bg-[#2a2518] px-3 py-1 text-[11px] font-bold text-[#ffc857]">
                {budgets.length} budgets
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {budgetsQuery.isLoading ? (
                <>
                  <div className="h-24 rounded-[24px] bg-[#131b17] animate-pulse" />
                  <div className="h-24 rounded-[24px] bg-[#131b17] animate-pulse" />
                </>
              ) : budgets.length > 0 ? (
                budgets.map((budget) => {
                  const spent = getSpentForBudget(budget, transactions)
                  const limit = Number(budget.amount)
                  const remaining = limit - spent
                  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
                  const isOver = spent > limit
                  const barColor = isOver ? '#ff8a94' : pct > 80 ? '#ffc857' : '#8bff62'

                  return (
                    <div key={budget.id} className="rounded-[24px] bg-[#131b17] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[16px] font-bold text-[#f4f7f5]">{budget.name || categoryMap.get(budget.categoryId ?? '') || 'Unnamed budget'}</p>
                          <p className="mt-1 text-[12px] font-medium text-[#7f8c86]">
                            {formatCurrency(spent, budget.currency)} of {formatCurrency(limit, budget.currency)} • {formatCompactDate(budget.periodStart)} to {formatCompactDate(budget.periodEnd)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBudgetId(budget.id)
                              setForm(mapBudgetToForm(budget))
                            }}
                            className="flex size-9 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#213129]"
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
                          >
                            <Trash2 className="size-4 text-[#ff8a94]" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1a2c1f]">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      <p className="mt-3 text-[13px] font-semibold text={remaining < 0 ? '#ff8a94' : '#dce2de'}">
                        {remaining < 0 ? 'Over ' : 'Left '}{formatCurrency(Math.abs(remaining), budget.currency)}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-[24px] bg-[#131b17] px-5 py-8 text-center">
                  <p className="text-[14px] leading-relaxed font-medium text-[#7f8c86]">
                    Set a budget to start tracking category drift and remaining room.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
