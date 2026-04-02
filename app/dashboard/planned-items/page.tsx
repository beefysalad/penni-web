'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FinanceEmptyState, PlannedItemRow } from '@/components/finance/management-components'
import { useAccountsQuery } from '@/hooks/finance/use-accounts-query'
import {
  useCreatePlannedItemMutation,
  useDeletePlannedItemMutation,
  usePlannedItemsQuery,
} from '@/hooks/finance/use-planned-items-query'
import type { CategoryType, PlannedItem, RecurrenceFrequency } from '@/lib/finance.types'
import { formatCurrency } from '@/lib/formatters'
import { Calendar, Plus, Sparkles, Trash2 } from 'lucide-react'

type PlannedItemForm = {
  type: CategoryType
  title: string
  amount: string
  accountId: string
  startDate: string
  recurrence: RecurrenceFrequency
  firstSemiMonthlyDay: string
  secondSemiMonthlyDay: string
}

const DEFAULT_PLANNED_ITEM_FORM: PlannedItemForm = {
  type: 'EXPENSE',
  title: '',
  amount: '',
  accountId: '',
  startDate: new Date().toISOString().slice(0, 10),
  recurrence: 'MONTHLY',
  firstSemiMonthlyDay: '15',
  secondSemiMonthlyDay: '30',
}

const RECURRENCE_OPTIONS: Array<{ label: string; value: RecurrenceFrequency }> = [
  { label: 'Every week', value: 'WEEKLY' },
  { label: 'Every month', value: 'MONTHLY' },
  { label: 'Twice a month', value: 'SEMI_MONTHLY' },
  { label: 'Every quarter', value: 'QUARTERLY' },
  { label: 'Every year', value: 'YEARLY' },
]

function toIsoDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString()
}

export default function PlannedItemsPage() {
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true })
  const accountsQuery = useAccountsQuery()
  const createPlannedItemMutation = useCreatePlannedItemMutation()
  const deletePlannedItemMutation = useDeletePlannedItemMutation()

  const [showComposer, setShowComposer] = useState(false)
  const [form, setForm] = useState<PlannedItemForm>(DEFAULT_PLANNED_ITEM_FORM)

  const accounts = accountsQuery.data ?? []
  const plannedItems = plannedItemsQuery.data ?? []

  const incomeItems = useMemo(
    () => plannedItems.filter((item) => item.type === 'INCOME'),
    [plannedItems]
  )
  const expenseItems = useMemo(
    () => plannedItems.filter((item) => item.type === 'EXPENSE'),
    [plannedItems]
  )

  const selectedAccount = accounts.find((account) => account.id === form.accountId) ?? null
  const requiresAccount = form.type === 'INCOME'
  const isSemiMonthly = form.recurrence === 'SEMI_MONTHLY'
  const isLoading = plannedItemsQuery.isLoading || accountsQuery.isLoading

  const resetComposer = () => {
    setForm(DEFAULT_PLANNED_ITEM_FORM)
    setShowComposer(false)
  }

  const handleCreatePlannedItem = () => {
    const title = form.title.trim()
    const amount = Number(form.amount)

    if (!title) {
      toast.error('A recurring item name is required.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount.')
      return
    }

    if (requiresAccount && !form.accountId) {
      toast.error('Income recurring items need an account.')
      return
    }

    const semiMonthlyDays = isSemiMonthly
      ? [Number(form.firstSemiMonthlyDay), Number(form.secondSemiMonthlyDay)].filter((value) =>
          Number.isFinite(value)
        )
      : undefined

    createPlannedItemMutation.mutate(
      {
        accountId: form.accountId || undefined,
        type: form.type,
        title,
        amount: amount.toFixed(2),
        currency: 'PHP',
        startDate: toIsoDate(form.startDate),
        recurrence: form.recurrence,
        semiMonthlyDays,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success(`${title} is now in your recurring schedule.`)
          resetComposer()
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Could not create planned item.')
        },
      }
    )
  }

  const handleDeletePlannedItem = (item: PlannedItem) => {
    deletePlannedItemMutation.mutate(item.id, {
      onSuccess: () => {
        toast.success(`${item.title} removed from recurring items.`)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Could not delete planned item.')
      },
    })
  }

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Recurring manager"
          title="Planned Items"
          subtitle="Create and manage recurring bills and income from the web dashboard."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pb-28 pt-6 md:px-6 lg:px-8">
        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">
                Planning flow
              </p>
              <p className="mt-1 text-[14px] font-medium text-[#93a19a]">
                Keep recurring items readable. Open the composer only when you want to add one.
              </p>
            </div>
            <Button onClick={() => setShowComposer((current) => !current)} className="lg:self-stretch">
              <Plus className="size-4" />
              {showComposer ? 'Close composer' : 'New recurring item'}
            </Button>
          </div>
        </div>

        {showComposer ? (
          <div className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
                  Plan ahead
                </p>
                <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
                  Add a recurring item
                </h2>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86]">
                  Bills and income both live here. Income is connected to an account, just like the
                  mobile flow.
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Calendar className="size-5 text-[#8bff62]" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="planned-type">Type</Label>
                <select
                  id="planned-type"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as CategoryType,
                    }))
                  }
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
                >
                  <option value="EXPENSE">Bill / Expense</option>
                  <option value="INCOME">Income / Salary</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planned-date">
                  {form.type === 'INCOME' ? 'First payout date' : 'First due date'}
                </Label>
                <Input
                  id="planned-date"
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                />
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="planned-title">
                  {form.type === 'INCOME' ? 'Income name' : 'Bill name'}
                </Label>
                <Input
                  id="planned-title"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder={
                    form.type === 'INCOME'
                      ? 'e.g. Payroll, Freelance retainer'
                      : 'e.g. Rent, Internet, Credit card'
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planned-amount">Amount</Label>
                <Input
                  id="planned-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planned-account">
                  {form.type === 'INCOME' ? 'Destination account' : 'Source account'}
                </Label>
                <select
                  id="planned-account"
                  value={form.accountId}
                  onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))}
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
                >
                  <option value="">{requiresAccount ? 'Choose an account' : 'Optional for now'}</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} · {account.currency}
                    </option>
                  ))}
                </select>
                {selectedAccount ? (
                  <p className="text-[12px] font-medium text-[#7f8c86]">
                    {form.type === 'INCOME' ? 'Will land in' : 'Planned against'} {selectedAccount.name}.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="planned-recurrence">Repeat every</Label>
                <select
                  id="planned-recurrence"
                  value={form.recurrence}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, recurrence: event.target.value as RecurrenceFrequency }))
                  }
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isSemiMonthly ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="semi-first">First day</Label>
                    <Input
                      id="semi-first"
                      type="number"
                      min="1"
                      max="31"
                      value={form.firstSemiMonthlyDay}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, firstSemiMonthlyDay: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semi-second">Second day</Label>
                    <Input
                      id="semi-second"
                      type="number"
                      min="1"
                      max="31"
                      value={form.secondSemiMonthlyDay}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, secondSemiMonthlyDay: event.target.value }))
                      }
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-6 rounded-[22px] border border-[#17211c] bg-[#101713] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">Preview</p>
              <p className="mt-2 text-[16px] font-bold text-[#f4f7f5]">
                {form.title.trim() || 'Your recurring item'}
              </p>
              <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
                {form.amount ? formatCurrency(Number(form.amount) || 0) : '₱0.00'} •{' '}
                {RECURRENCE_OPTIONS.find((option) => option.value === form.recurrence)?.label ?? 'Every month'}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleCreatePlannedItem}
                className="flex-1"
                disabled={createPlannedItemMutation.isPending}
              >
                {createPlannedItemMutation.isPending ? 'Saving...' : 'Add planned item'}
              </Button>
              <Button variant="secondary" onClick={resetComposer}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">
                  Recurring expenses
                </h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
                  Bills, rent, subscriptions, and card dues.
                </p>
              </div>
              <span className="rounded-full bg-[#241719] px-3 py-1 text-[11px] font-bold text-[#ff8a94]">
                {expenseItems.length} items
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-16 animate-pulse rounded-[20px] bg-[#131b17]" />
                  <div className="h-16 animate-pulse rounded-[20px] bg-[#131b17]" />
                </div>
              ) : expenseItems.length > 0 ? (
                expenseItems.map((item, index) => (
                  <PlannedItemRow
                    key={item.id}
                    item={item}
                    isLast={index === expenseItems.length - 1}
                    action={
                      <button
                        type="button"
                        onClick={() => handleDeletePlannedItem(item)}
                        className="flex size-8 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="size-4 text-[#ff8a94]" />
                      </button>
                    }
                  />
                ))
              ) : (
                <div className="p-4">
                  <FinanceEmptyState
                    icon={Calendar}
                    title="No recurring expenses yet"
                    description="Add your first bill so the planning side of Penni starts to feel real."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">
                  Recurring income
                </h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
                  Salary, allowances, and repeat payouts.
                </p>
              </div>
              <span className="rounded-full bg-[#16211b] px-3 py-1 text-[11px] font-bold text-[#41d6b2]">
                {incomeItems.length} items
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-16 animate-pulse rounded-[20px] bg-[#131b17]" />
                  <div className="h-16 animate-pulse rounded-[20px] bg-[#131b17]" />
                </div>
              ) : incomeItems.length > 0 ? (
                incomeItems.map((item, index) => (
                  <PlannedItemRow
                    key={item.id}
                    item={item}
                    isLast={index === incomeItems.length - 1}
                    action={
                      <button
                        type="button"
                        onClick={() => handleDeletePlannedItem(item)}
                        className="flex size-8 items-center justify-center rounded-full bg-[#16211b] transition hover:bg-[#1d2a20]"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="size-4 text-[#41d6b2]" />
                      </button>
                    }
                  />
                ))
              ) : (
                <div className="p-4">
                  <FinanceEmptyState
                    icon={Sparkles}
                    title="No recurring income yet"
                    description="Add salary or repeat payouts here so Home can project incoming cash more clearly."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
