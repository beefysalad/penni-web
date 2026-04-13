'use client'

import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
import { cn } from '@/lib/utils'
import {
  FinanceEmptyState,
  PlannedItemRow,
} from '@/components/finance/management-components'
import { useAccountsQuery } from '@/hooks/finance/use-accounts-query'
import {
  useCreatePlannedItemMutation,
  useCompletePlannedItemMutation,
  useDeletePlannedItemMutation,
  usePlannedItemsQuery,
} from '@/hooks/finance/use-planned-items-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import type {
  CategoryType,
  PlannedItem,
  RecurrenceFrequency,
} from '@/lib/finance.types'
import { formatCurrency, formatShortDate } from '@/lib/formatters'
import {
  getPlannedItemRecurringState,
  type PlannedItemWithRecurringState,
} from '@/lib/recurring'
import { Calendar, Plus, Sparkles, Trash2 } from 'lucide-react'

type PlannedItemForm = {
  type: CategoryType
  categoryId: string
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
  categoryId: '',
  title: '',
  amount: '',
  accountId: '',
  startDate: new Date().toISOString().slice(0, 10),
  recurrence: 'MONTHLY',
  firstSemiMonthlyDay: '15',
  secondSemiMonthlyDay: '30',
}

const RECURRENCE_OPTIONS: Array<{ label: string; value: RecurrenceFrequency }> =
  [
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Semi-monthly', value: 'SEMI_MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ]

const plannedItemFormSchema = z
  .object({
    type: z.enum(['EXPENSE', 'INCOME']),
    categoryId: z.string(),
    title: z.string().trim().min(1, 'A recurring item name is required.'),
    amount: z
      .string()
      .trim()
      .min(1, 'Enter a valid amount.')
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        'Enter a valid amount.'
      ),
    accountId: z.string(),
    startDate: z.string().min(1, 'Choose a start date.'),
    recurrence: z.enum([
      'WEEKLY',
      'MONTHLY',
      'SEMI_MONTHLY',
      'QUARTERLY',
      'YEARLY',
    ]),
    firstSemiMonthlyDay: z.string(),
    secondSemiMonthlyDay: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'INCOME' && !value.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['accountId'],
        message: 'Income recurring items need an account.',
      })
    }

    if (value.recurrence !== 'SEMI_MONTHLY') {
      return
    }

    const first = Number(value.firstSemiMonthlyDay)
    const second = Number(value.secondSemiMonthlyDay)

    if (!Number.isInteger(first) || first < 1 || first > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firstSemiMonthlyDay'],
        message: 'Choose a day between 1 and 31.',
      })
    }

    if (!Number.isInteger(second) || second < 1 || second > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondSemiMonthlyDay'],
        message: 'Choose a day between 1 and 31.',
      })
    }

    if (
      Number.isInteger(first) &&
      Number.isInteger(second) &&
      first === second
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondSemiMonthlyDay'],
        message: 'The two semi-monthly days need to be different.',
      })
    }
  })

function toIsoDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString()
}

function getStatusLabel(status: PlannedItemWithRecurringState['status']) {
  if (status === 'OVERDUE') return 'Overdue'
  if (status === 'DUE') return 'Due today'
  if (status === 'COMPLETE') return 'Complete'
  return 'Upcoming'
}

function getCompletionActionLabel(type: CategoryType) {
  return type === 'INCOME' ? 'Mark received' : 'Mark paid'
}

function getCompletionToastLabel(type: CategoryType) {
  return type === 'INCOME' ? 'marked as received' : 'marked as paid'
}

function getCompletedSectionLabel(type: CategoryType) {
  return type === 'INCOME' ? 'Received' : 'Paid'
}

function getStatusTone(status: PlannedItemWithRecurringState['status']) {
  if (status === 'OVERDUE') return 'danger' as const
  if (status === 'COMPLETE') return 'success' as const
  return 'neutral' as const
}

function getHelperText(plannedItem: PlannedItemWithRecurringState) {
  const actionLabel =
    plannedItem.item.type === 'INCOME' ? 'Mark it received' : 'Mark it paid'

  if (plannedItem.status === 'COMPLETE' && plannedItem.matchedTransaction) {
    return plannedItem.item.type === 'INCOME'
      ? `Matched deposit on ${formatShortDate(plannedItem.matchedTransaction.transactionAt)}.`
      : `Matched payment on ${formatShortDate(plannedItem.matchedTransaction.transactionAt)}.`
  }

  if (plannedItem.status === 'DUE') {
    return `Expected today. ${actionLabel} once the transaction lands.`
  }

  if (plannedItem.status === 'OVERDUE') {
    return `Expected on ${formatShortDate(plannedItem.scheduledFor)}.`
  }

  return `Scheduled for ${formatShortDate(plannedItem.scheduledFor)}.`
}

export default function PlannedItemsPage() {
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true })
  const accountsQuery = useAccountsQuery()
  const expenseCategoriesQuery = useCategoriesQuery('EXPENSE')
  const incomeCategoriesQuery = useCategoriesQuery('INCOME')
  const transactionsQuery = useTransactionsQuery()
  const createPlannedItemMutation = useCreatePlannedItemMutation()
  const completePlannedItemMutation = useCompletePlannedItemMutation()
  const deletePlannedItemMutation = useDeletePlannedItemMutation()

  const [showComposer, setShowComposer] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm<PlannedItemForm>({
    resolver: zodResolver(plannedItemFormSchema),
    defaultValues: DEFAULT_PLANNED_ITEM_FORM,
  })

  const type = useWatch({ control, name: 'type' })
  const accountId = useWatch({ control, name: 'accountId' })
  const categoryId = useWatch({ control, name: 'categoryId' })
  const recurrence = useWatch({ control, name: 'recurrence' })
  const title = useWatch({ control, name: 'title' })
  const amount = useWatch({ control, name: 'amount' })

  const accounts = accountsQuery.data ?? []
  const expenseCategories = expenseCategoriesQuery.data ?? []
  const incomeCategories = incomeCategoriesQuery.data ?? []
  const categories = type === 'INCOME' ? incomeCategories : expenseCategories
  const plannedItems = plannedItemsQuery.data ?? []
  const transactions = transactionsQuery.data ?? []

  useEffect(() => {
    if (!categoryId) return
    if (categories.some((category) => category.id === categoryId)) return
    setValue('categoryId', '', { shouldDirty: true, shouldTouch: true })
  }, [categories, categoryId, setValue])

  useEffect(() => {
    if (categoryId || categories.length === 0) return
    setValue('categoryId', categories[0]?.id ?? '', {
      shouldDirty: true,
      shouldTouch: true,
    })
  }, [categories, categoryId, setValue, type])

  const plannedItemsWithState = useMemo(
    () =>
      plannedItems.map((item) =>
        getPlannedItemRecurringState(item, transactions)
      ),
    [plannedItems, transactions]
  )

  const incomeItems = useMemo(
    () => plannedItemsWithState.filter((item) => item.item.type === 'INCOME'),
    [plannedItemsWithState]
  )
  const expenseItems = useMemo(
    () => plannedItemsWithState.filter((item) => item.item.type === 'EXPENSE'),
    [plannedItemsWithState]
  )

  const selectedAccount =
    accounts.find((account) => account.id === accountId) ?? null
  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? null
  const requiresAccount = type === 'INCOME'
  const isSemiMonthly = recurrence === 'SEMI_MONTHLY'
  const isLoading =
    plannedItemsQuery.isLoading ||
    accountsQuery.isLoading ||
    expenseCategoriesQuery.isLoading ||
    incomeCategoriesQuery.isLoading ||
    transactionsQuery.isLoading

  const resetComposer = () => {
    reset(DEFAULT_PLANNED_ITEM_FORM)
    setShowComposer(false)
  }

  const handleCreatePlannedItem = (values: PlannedItemForm) => {
    const title = values.title.trim()
    const amount = Number(values.amount)

    const semiMonthlyDays = isSemiMonthly
      ? [
          Number(values.firstSemiMonthlyDay),
          Number(values.secondSemiMonthlyDay),
        ].filter((value) => Number.isFinite(value))
      : undefined

    createPlannedItemMutation.mutate(
      {
        accountId: values.accountId || undefined,
        categoryId: values.categoryId || undefined,
        type: values.type,
        title,
        amount: amount.toFixed(2),
        currency: 'PHP',
        startDate: toIsoDate(values.startDate),
        recurrence: values.recurrence,
        semiMonthlyDays,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success(`${title} is now in your recurring schedule.`)
          resetComposer()
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Could not create planned item.'
          )
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
        toast.error(
          error instanceof Error
            ? error.message
            : 'Could not delete planned item.'
        )
      },
    })
  }

  const handleCompletePlannedItem = (item: PlannedItemWithRecurringState) => {
    completePlannedItemMutation.mutate(
      {
        id: item.item.id,
        input: {
          transactionAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `${item.item.title} ${getCompletionToastLabel(item.item.type)}.`
          )
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Could not complete planned item.'
          )
        },
      }
    )
  }

  const renderPlannedItemGroup = (
    title: string,
    items: PlannedItemWithRecurringState[],
    emptyState: {
      icon: typeof Calendar
      title: string
      description: string
    },
    accentClassName: string
  ) => {
    const itemType = items[0]?.item.type ?? 'EXPENSE'
    const overdueItems = items.filter((item) => item.status === 'OVERDUE')
    const dueItems = items.filter((item) => item.status === 'DUE')
    const upcomingItems = items.filter((item) => item.status === 'UPCOMING')
    const completedItems = items.filter((item) => item.status === 'COMPLETE')

    const sections = [
      { title: 'Overdue', items: overdueItems },
      { title: 'Due today', items: dueItems },
      { title: 'Upcoming', items: upcomingItems },
      { title: getCompletedSectionLabel(itemType), items: completedItems },
    ].filter((section) => section.items.length > 0)

    return (
      <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">
              {title}
            </h3>
            <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
              {title === 'Recurring expenses'
                ? 'Bills stay expected until you confirm the payment.'
                : 'Recurring income stays projected until the money actually lands.'}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-bold',
              accentClassName
            )}
          >
            {items.length} items
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border border-[#17211c] bg-[#111916]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <div className="h-16 animate-pulse rounded-[20px] bg-[#131b17]" />
              <div className="h-16 animate-pulse rounded-[20px] bg-[#131b17]" />
            </div>
          ) : sections.length > 0 ? (
            <div className="divide-y divide-[#17211c]/60">
              {sections.map((section) => (
                <div key={section.title} className="p-3">
                  <div className="px-2 pb-2">
                    <p className="text-[11px] font-bold tracking-[1.8px] text-[#6f7c75] uppercase">
                      {section.title}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-[20px] border border-[#17211c] bg-[#0f1512]">
                    {section.items.map((entry, index) => (
                      <PlannedItemRow
                        key={entry.item.id}
                        item={entry.item}
                        scheduledFor={entry.scheduledFor}
                        statusLabel={getStatusLabel(entry.status)}
                        statusTone={getStatusTone(entry.status)}
                        helperText={getHelperText(entry)}
                        isLast={index === section.items.length - 1}
                        action={
                          <div className="flex items-center gap-2">
                            {entry.status !== 'COMPLETE' ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleCompletePlannedItem(entry)}
                                disabled={completePlannedItemMutation.isPending}
                                className="h-8 rounded-full px-3"
                              >
                                {getCompletionActionLabel(entry.item.type)}
                              </Button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePlannedItem(entry.item)
                              }
                              className={cn(
                                'flex size-8 items-center justify-center rounded-full transition',
                                entry.item.type === 'EXPENSE'
                                  ? 'bg-[#241719] hover:bg-[#311d22]'
                                  : 'bg-[#16211b] hover:bg-[#1d2a20]'
                              )}
                              aria-label={`Delete ${entry.item.title}`}
                            >
                              <Trash2
                                className={cn(
                                  'size-4',
                                  entry.item.type === 'EXPENSE'
                                    ? 'text-[#ff8a94]'
                                    : 'text-[#41d6b2]'
                                )}
                              />
                            </button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <FinanceEmptyState
                icon={emptyState.icon}
                title={emptyState.title}
                description={emptyState.description}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleCreatePlannedItem)}
      className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="flex items-start justify-between gap-4 max-lg:hidden">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Plan ahead
          </p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
            Add a recurring item
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            Bills and income both live here. Income is connected to an account,
            just like the mobile flow.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Calendar className="size-5 text-[#8bff62]" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 max-lg:mt-0 xl:grid-cols-2">
        <div className="space-y-2 lg:hidden xl:col-span-2">
          <Label>Type</Label>
          <div className="flex rounded-[20px] bg-[#0d1411] p-1.5">
            {(['EXPENSE', 'INCOME'] as const).map((item) => {
              const selected = type === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={async () => {
                    setValue('type', item, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                    await trigger(['type', 'accountId'])
                  }}
                  className={cn(
                    'flex-1 rounded-[16px] px-4 py-3 text-[15px] font-semibold transition',
                    selected ? 'bg-[#8bff62] text-[#07110a]' : 'text-[#97a49c]'
                  )}
                >
                  {item === 'EXPENSE' ? 'Bill' : 'Income'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="planned-type">Type</Label>
          <select
            id="planned-type"
            value={type}
            onChange={async (event) => {
              setValue('type', event.target.value as CategoryType, {
                shouldDirty: true,
                shouldTouch: true,
              })
              await trigger(['type', 'accountId'])
            }}
            className="hidden h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30 lg:block"
          >
            <option value="EXPENSE">Bill / Expense</option>
            <option value="INCOME">Income / Salary</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="planned-date">
            {type === 'INCOME' ? 'First payout date' : 'First due date'}
          </Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Input id="planned-date" type="date" {...field} />
            )}
          />
          <FormErrorMessage message={errors.startDate?.message} />
        </div>

        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="planned-title">
            {type === 'INCOME' ? 'Income name' : 'Bill name'}
          </Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                id="planned-title"
                {...field}
                placeholder={
                  type === 'INCOME'
                    ? 'e.g. Payroll, Freelance retainer'
                    : 'e.g. Rent, Internet, Credit card'
                }
              />
            )}
          />
          <FormErrorMessage message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="planned-amount">Amount</Label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                id="planned-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                {...field}
                placeholder="0.00"
              />
            )}
          />
          <FormErrorMessage message={errors.amount?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="planned-category">Category</Label>
          <select
            id="planned-category"
            value={categoryId}
            onChange={(event) =>
              setValue('categoryId', event.target.value, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.length === 0 ? (
            <p className="text-[12px] font-medium text-[#7f8c86]">
              {type === 'INCOME'
                ? 'No income categories yet.'
                : 'No expense categories yet.'}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="planned-account">
            {type === 'INCOME' ? 'Deposit into' : 'Pay from'}
          </Label>
          <select
            id="planned-account"
            value={accountId}
            onChange={(event) =>
              setValue('accountId', event.target.value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            <option value="">
              {requiresAccount ? 'Choose an account' : 'Optional for now'}
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} · {account.currency}
              </option>
            ))}
          </select>
          {selectedAccount ? (
            <p className="text-[12px] font-medium text-[#7f8c86]">
              {type === 'INCOME' ? 'Will land in' : 'Planned against'}{' '}
              {selectedAccount.name}.
            </p>
          ) : null}
          <FormErrorMessage message={errors.accountId?.message} />
        </div>

        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="planned-recurrence">Repeat every</Label>
          <select
            id="planned-recurrence"
            value={recurrence}
            onChange={async (event) => {
              setValue(
                'recurrence',
                event.target.value as RecurrenceFrequency,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                }
              )
              await trigger(['firstSemiMonthlyDay', 'secondSemiMonthlyDay'])
            }}
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
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
              <Controller
                name="firstSemiMonthlyDay"
                control={control}
                render={({ field }) => (
                  <Input
                    id="semi-first"
                    type="number"
                    min="1"
                    max="31"
                    {...field}
                  />
                )}
              />
              <FormErrorMessage message={errors.firstSemiMonthlyDay?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semi-second">Second day</Label>
              <Controller
                name="secondSemiMonthlyDay"
                control={control}
                render={({ field }) => (
                  <Input
                    id="semi-second"
                    type="number"
                    min="1"
                    max="31"
                    {...field}
                  />
                )}
              />
              <FormErrorMessage
                message={errors.secondSemiMonthlyDay?.message}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-6 rounded-[22px] border border-[#17211c] bg-[#101713] p-4">
        <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
          Preview
        </p>
        <p className="mt-2 text-[16px] font-bold text-[#f4f7f5]">
          {title?.trim() || 'Your recurring item'}
        </p>
        {selectedCategory ? (
          <p className="mt-1 text-[12px] font-semibold text-[#93a19a]">
            {selectedCategory.name}
          </p>
        ) : null}
        <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
          {amount ? formatCurrency(Number(amount) || 0) : '₱0.00'} •{' '}
          {RECURRENCE_OPTIONS.find((option) => option.value === recurrence)
            ?.label ?? 'Every month'}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={createPlannedItemMutation.isPending}
        >
          {createPlannedItemMutation.isPending
            ? 'Saving...'
            : 'Add planned item'}
        </Button>
        <Button type="button" variant="secondary" onClick={resetComposer}>
          Cancel
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Schedule"
          title="Recurring"
          subtitle="Manage recurring bills and income in one place."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pt-6 pb-28 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">Bills</span>
              <span className="text-[15px] font-bold text-[#ff8a94]">{expenseItems.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#17211c] bg-[#111916] px-4 py-2">
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">Income</span>
              <span className="text-[15px] font-bold text-[#41d6b2]">{incomeItems.length}</span>
            </div>
          </div>
          <Button
            onClick={() => setShowComposer((current) => !current)}
            className="rounded-full px-5"
          >
            <Plus className="size-4" />
            {showComposer ? 'Close' : 'Add recurring item'}
          </Button>
        </div>

        {showComposer ? (
          <div className="hidden lg:block">{composerContent}</div>
        ) : null}

        <div className="space-y-6">
          {renderPlannedItemGroup(
            'Recurring expenses',
            expenseItems,
            {
              icon: Calendar,
              title: 'No recurring item',
              description:
                "You haven't scheduled any recurring income or expenses yet.",
            },
            'bg-[#241719] text-[#ff8a94]'
          )}

          {renderPlannedItemGroup(
            'Recurring income',
            incomeItems,
            {
              icon: Sparkles,
              title: 'No recurring income yet',
              description:
                'Add salary or repeat payouts here so Home can project incoming cash more clearly.',
            },
            'bg-[#16211b] text-[#41d6b2]'
          )}
        </div>
      </div>

      <MobileSheet
        open={showComposer}
        onClose={resetComposer}
        eyebrow="Recurring"
        title="Create planned item"
      >
        {composerContent}
      </MobileSheet>
    </>
  )
}
