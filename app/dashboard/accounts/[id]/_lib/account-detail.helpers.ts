import { formatShortDate } from '@/lib/formatters'
import { getPlannedItemRecurringState } from '@/lib/recurring'

export function getRecurringStatusLabel(
  status: ReturnType<typeof getPlannedItemRecurringState>['status']
) {
  if (status === 'OVERDUE') return 'Overdue'
  if (status === 'DUE') return 'Due today'
  if (status === 'COMPLETE') return 'Complete'
  return 'Upcoming'
}

export function getRecurringStatusTone(
  status: ReturnType<typeof getPlannedItemRecurringState>['status']
) {
  if (status === 'OVERDUE') return 'danger' as const
  if (status === 'COMPLETE') return 'success' as const
  return 'neutral' as const
}

export function getRecurringHelperText(
  item: ReturnType<typeof getPlannedItemRecurringState>
) {
  if (item.status === 'COMPLETE' && item.matchedTransaction) {
    return item.item.type === 'INCOME'
      ? `Matched deposit on ${formatShortDate(item.matchedTransaction.transactionAt)}.`
      : `Matched payment on ${formatShortDate(item.matchedTransaction.transactionAt)}.`
  }

  if (item.status === 'DUE') {
    return item.item.type === 'INCOME'
      ? 'Expected today.'
      : 'Planned to be paid today.'
  }

  if (item.status === 'OVERDUE') {
    return `Expected on ${formatShortDate(item.scheduledFor)}.`
  }

  return `Scheduled for ${formatShortDate(item.scheduledFor)}.`
}
