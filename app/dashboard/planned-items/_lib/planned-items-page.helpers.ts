import { z } from 'zod'
import type {
  CategoryType,
  PlannedItem,
  RecurrenceFrequency,
} from '@/lib/finance.types'
import { formatShortDate } from '@/lib/formatters'
import type { PlannedItemWithRecurringState } from '@/lib/recurring'

export type PlannedItemForm = {
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

export const DEFAULT_PLANNED_ITEM_FORM: PlannedItemForm = {
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

export const RECURRENCE_OPTIONS: Array<{
  label: string
  value: RecurrenceFrequency
}> = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Semi-monthly', value: 'SEMI_MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Yearly', value: 'YEARLY' },
]

export const plannedItemFormSchema = z
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

export function toPlannedItemIsoDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toISOString()
}

export function getPlannedItemStatusLabel(
  status: PlannedItemWithRecurringState['status']
) {
  if (status === 'OVERDUE') return 'Overdue'
  if (status === 'DUE') return 'Due today'
  if (status === 'COMPLETE') return 'Complete'
  return 'Upcoming'
}

export function getCompletionActionLabel(type: CategoryType) {
  return type === 'INCOME' ? 'Mark received' : 'Mark paid'
}

export function getCompletionToastLabel(type: CategoryType) {
  return type === 'INCOME' ? 'marked as received' : 'marked as paid'
}

export function getCompletedSectionLabel(type: CategoryType) {
  return type === 'INCOME' ? 'Received' : 'Paid'
}

export function getPlannedItemStatusTone(
  status: PlannedItemWithRecurringState['status']
) {
  if (status === 'OVERDUE') return 'danger' as const
  if (status === 'COMPLETE') return 'success' as const
  return 'neutral' as const
}

export function getPlannedItemHelperText(plannedItem: PlannedItemWithRecurringState) {
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

export function getPlannedItemGroups(items: PlannedItemWithRecurringState[]) {
  const itemType = items[0]?.item.type ?? 'EXPENSE'
  const overdueItems = items.filter((item) => item.status === 'OVERDUE')
  const dueItems = items.filter((item) => item.status === 'DUE')
  const upcomingItems = items.filter((item) => item.status === 'UPCOMING')
  const completedItems = items.filter((item) => item.status === 'COMPLETE')

  return {
    itemType,
    sections: [
      { title: 'Overdue', items: overdueItems },
      { title: 'Due today', items: dueItems },
      { title: 'Upcoming', items: upcomingItems },
      { title: getCompletedSectionLabel(itemType), items: completedItems },
    ].filter((section) => section.items.length > 0),
  }
}

export function handleDeletePlannedItemToast(item: PlannedItem) {
  return `${item.title} removed from recurring items.`
}
