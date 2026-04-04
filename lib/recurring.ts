import type { PlannedItem, Transaction } from '@/lib/finance.types'

export type RecurringStatus = 'UPCOMING' | 'DUE' | 'OVERDUE' | 'COMPLETE'

export type PlannedItemWithRecurringState = {
  item: PlannedItem
  status: RecurringStatus
  matchedTransaction: Transaction | null
  scheduledFor: string
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function addDays(value: Date, days: number) {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next
}

function isWithinWindow(target: Date, from: Date, to: Date) {
  return target >= from && target <= to
}

export function getRecurringMatchForItem(item: PlannedItem, transactions: Transaction[]) {
  const scheduledFor = item.nextOccurrenceAt ?? item.startDate
  const scheduledDate = startOfDay(new Date(scheduledFor))
  const windowStart = addDays(scheduledDate, -3)
  const windowEnd = addDays(scheduledDate, 5)

  return (
    transactions
      .filter((transaction) => {
        if (transaction.type !== item.type) return false

        if (transaction.plannedItemId === item.id) {
          return true
        }

        if (item.accountId && transaction.accountId !== item.accountId) return false
        if (Number(transaction.amount) !== Number(item.amount)) return false

        const transactionDate = startOfDay(new Date(transaction.transactionAt))
        return isWithinWindow(transactionDate, windowStart, windowEnd)
      })
      .sort((a, b) => new Date(b.transactionAt).getTime() - new Date(a.transactionAt).getTime())[0] ?? null
  )
}

export function getPlannedItemRecurringState(item: PlannedItem, transactions: Transaction[]): PlannedItemWithRecurringState {
  const scheduledFor = item.nextOccurrenceAt ?? item.startDate
  const matchedTransaction = getRecurringMatchForItem(item, transactions)

  if (matchedTransaction) {
    return {
      item,
      status: 'COMPLETE',
      matchedTransaction,
      scheduledFor,
    }
  }

  const today = startOfDay(new Date())
  const scheduledDate = startOfDay(new Date(scheduledFor))

  if (scheduledDate.getTime() < today.getTime()) {
    return {
      item,
      status: 'OVERDUE',
      matchedTransaction: null,
      scheduledFor,
    }
  }

  if (scheduledDate.getTime() === today.getTime()) {
    return {
      item,
      status: 'DUE',
      matchedTransaction: null,
      scheduledFor,
    }
  }

  return {
    item,
    status: 'UPCOMING',
    matchedTransaction: null,
    scheduledFor,
  }
}
