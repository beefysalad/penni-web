'use client'

import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatCompactDate,
} from '@/lib/formatters'
import { getSpentForBudget } from '@/lib/selectors'
import type { Budget, PlannedItem, Transaction } from '@/lib/finance.types'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Plus,
  ReceiptText,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// --- Skeleton ---

export function SkeletonHeroCard() {
  return (
    <div className="animate-pulse rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
      <div className="h-4 w-20 rounded-full bg-[#1a2620]" />
      <div className="mt-3 h-10 w-40 rounded-full bg-[#1a2620]" />
      <div className="mt-4 flex flex-row gap-3">
        <div className="flex-1 rounded-[20px] bg-[#18221d] p-4">
          <div className="h-3 w-16 rounded-full bg-[#1f3325]" />
          <div className="mt-3 h-6 w-28 rounded-full bg-[#1f3325]" />
        </div>
        <div className="flex-1 rounded-[20px] bg-[#18221d] p-4">
          <div className="h-3 w-16 rounded-full bg-[#1f3325]" />
          <div className="mt-3 h-6 w-28 rounded-full bg-[#1f3325]" />
        </div>
      </div>
    </div>
  )
}

// --- Home Balance Hero ---

export function HomeBalanceHero({
  leftAfterRecurring,
  nextBillName,
  nextBillTiming,
  nextIncomeName,
  nextIncomeTiming,
}: {
  leftAfterRecurring: number
  nextBillName: string
  nextBillTiming: string
  nextIncomeName: string
  nextIncomeTiming: string
}) {
  const isNegative = leftAfterRecurring < 0

  return (
    <div className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-bold tracking-wider text-[#73827a] uppercase">
            Left after recurring
          </p>
          <h2
            className={cn(
              'mt-2 text-[38px] leading-none font-bold tracking-tight',
              isNegative ? 'text-[#ff8a94]' : 'text-[#f4f7f5]'
            )}
          >
            {formatCurrency(leftAfterRecurring)}
          </h2>
        </div>
        <div
          className={cn(
            'rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[1.5px] uppercase',
            isNegative
              ? 'bg-[#2c1a1f] text-[#ff8a94]'
              : 'bg-[#1a2c1f] text-[#8bff62]'
          )}
        >
          {isNegative ? 'Tight' : 'Planned'}
        </div>
      </div>

      <div className="mt-6 flex flex-row gap-3">
        <div className="flex-1 rounded-[24px] bg-[#18221d] p-4 transition-colors hover:bg-[#1c2822]">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#1f3325]">
            <Calendar className="size-5 text-[#8bff62]" />
          </div>
          <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#93a19a] uppercase">
            Next bill
          </p>
          <p className="mt-2 truncate text-[17px] leading-tight font-bold text-[#f4f7f5]">
            {nextBillName}
          </p>
          <p className="mt-1 text-[13px] font-medium text-[#93a19a]">
            {nextBillTiming}
          </p>
        </div>

        <div className="flex-1 rounded-[24px] bg-[#141b1f] p-4 transition-colors hover:bg-[#192126]">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#1c2830]">
            <TrendingUp className="size-5 text-[#41d6b2]" />
          </div>
          <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#93a19a] uppercase">
            Next income
          </p>
          <p className="mt-2 truncate text-[17px] leading-tight font-bold text-[#f4f7f5]">
            {nextIncomeName}
          </p>
          <p className="mt-1 text-[13px] font-medium text-[#93a19a]">
            {nextIncomeTiming}
          </p>
        </div>
      </div>

      <div className="no-scrollbar mt-5 flex flex-row gap-2.5 overflow-x-auto pb-1">
        <Link
          href="/dashboard/activity?add=true"
          className="flex flex-row items-center gap-2 rounded-full bg-[#16211b] px-4 py-2 whitespace-nowrap transition-colors hover:bg-[#1c2b23]"
        >
          <Plus className="size-3.5 text-[#41d6b2]" />
          <span className="text-[11px] font-bold text-[#41d6b2]">
            Add Transaction
          </span>
        </Link>
        <Link
          href="/dashboard/accounts"
          className="flex flex-row items-center gap-2 rounded-full bg-[#18221d] px-4 py-2 whitespace-nowrap transition-colors hover:bg-[#202c26]"
        >
          <WalletCards className="size-3.5 text-[#8bff62]" />
          <span className="text-[11px] font-bold text-[#93a19a]">Accounts</span>
        </Link>
      </div>
    </div>
  )
}

// --- Recent Transactions ---

export function RecentTransactionsSection({
  isLoading,
  recentTransactions,
  recentIncome,
  recentExpense,
}: {
  isLoading: boolean
  recentTransactions: Transaction[]
  recentIncome: number
  recentExpense: number
}) {
  return (
    <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-[28px] font-bold tracking-tight text-[#f4f7f5]">
            Recent
          </h3>
          <p className="mt-1 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            Latest transactions at a glance.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <ReceiptText className="size-5 text-[#8bff62]" />
        </div>
      </div>

      {recentTransactions.length > 0 && (
        <div className="mt-5 flex flex-row gap-2.5">
          <div className="flex flex-row items-center gap-2 rounded-full bg-[#16211b] px-3.5 py-1.5 shadow-sm">
            <ArrowUpRight className="size-3.5 text-[#41d6b2]" />
            <span className="text-[11.5px] font-bold text-[#41d6b2]">
              +{formatCurrency(recentIncome)}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 rounded-full bg-[#1d1518] px-3.5 py-1.5 shadow-sm">
            <ArrowDownLeft className="size-3.5 text-[#ff8a94]" />
            <span className="text-[11.5px] font-bold text-[#ff8a94]">
              -{formatCurrency(recentExpense)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="animate-pulse rounded-[20px] bg-[#131b17] p-4">
            <div className="h-4 w-32 rounded bg-[#1a2620]" />
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
            {recentTransactions.map((transaction, index) => {
              const isExpense = transaction.type === 'EXPENSE'
              return (
                <div
                  key={transaction.id}
                  className={cn(
                    'flex flex-row items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/5',
                    index > 0 && 'border-t border-[#17211c]/60'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-[12px]',
                      isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'
                    )}
                  >
                    {isExpense ? (
                      <ArrowDownLeft className="size-4 text-[#ff8a94]" />
                    ) : (
                      <ArrowUpRight className="size-4 text-[#41d6b2]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-[#f4f7f5]">
                      {transaction.title}
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-[#6d786f]">
                      {formatCompactDate(transaction.transactionAt)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-[15px] font-bold',
                      isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
                    )}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(
                      Number(transaction.amount),
                      transaction.currency
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[24px] bg-[#131b17] px-6 py-10 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#1a2620]">
              <ReceiptText className="size-7 text-[#1b2a21]" />
            </div>
            <p className="text-[14px] font-medium text-[#7f8c86]">
              No transactions yet. Log your first expense to start.
            </p>
          </div>
        )}
      </div>

      <Link
        href="/dashboard/activity"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#131b17] px-5 py-2.5 transition-colors hover:bg-[#1a2620]"
      >
        <span className="text-[12px] font-bold text-[#dce2de]">View all</span>
        <ArrowUpRight className="size-4 text-[#8bff62]" />
      </Link>
    </div>
  )
}

// --- Upcoming Section ---

export function UpcomingSection({
  isLoading,
  incomePlannedItems,
  expensePlannedItems,
}: {
  isLoading: boolean
  incomePlannedItems: PlannedItem[]
  expensePlannedItems: PlannedItem[]
}) {
  const hasPlanned =
    incomePlannedItems.length > 0 || expensePlannedItems.length > 0

  return (
    <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-[28px] font-bold tracking-tight text-[#f4f7f5]">
            Upcoming
          </h3>
          <p className="mt-1 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            Bills and income on your schedule.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Calendar className="size-5 text-[#41d6b2]" />
        </div>
      </div>

      <Link
        href="/dashboard/planned-items"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8bff62] px-5 py-2.5 transition-colors hover:bg-[#9eff7a]"
      >
        <Plus className="size-3.5 text-[#07110a]" />
        <span className="text-[12px] font-bold text-[#07110a]">Plan ahead</span>
      </Link>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="animate-pulse rounded-[24px] bg-[#131b17] p-5">
            <div className="h-4 w-40 rounded bg-[#1a2620]" />
          </div>
        ) : hasPlanned ? (
          <>
            {incomePlannedItems.length > 0 && (
              <div className="rounded-[24px] bg-[#131b17] p-4 shadow-sm">
                <p className="text-[10px] font-bold tracking-[2px] text-[#41d6b2] uppercase">
                  Income
                </p>
                <div className="mt-3 space-y-2">
                  {incomePlannedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-row items-center gap-3 rounded-[16px] bg-[#1a2620] p-3 transition-colors hover:bg-[#202d26]"
                    >
                      <div className="flex size-9 items-center justify-center rounded-[12px] bg-[#24382c]">
                        <TrendingUp className="size-4 text-[#41d6b2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-bold text-[#f4f7f5]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#7f8c86]">
                          {formatCompactDate(
                            item.nextOccurrenceAt ?? item.startDate
                          )}
                        </p>
                      </div>
                      <p className="text-[14.5px] font-bold text-[#41d6b2]">
                        {formatCurrency(Number(item.amount), item.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expensePlannedItems.length > 0 && (
              <div className="rounded-[24px] bg-[#131b17] p-4 shadow-sm">
                <p className="text-[10px] font-bold tracking-[2px] text-[#ff8a94] uppercase">
                  Expenses
                </p>
                <div className="mt-3 space-y-2">
                  {expensePlannedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-row items-center gap-3 rounded-[16px] bg-[#1a2620] p-3 transition-colors hover:bg-[#202d26]"
                    >
                      <div className="flex size-9 items-center justify-center rounded-[12px] bg-[#331f25]">
                        <ArrowDownLeft className="size-4 text-[#ff8a94]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-bold text-[#f4f7f5]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#7f8c86]">
                          {formatCompactDate(
                            item.nextOccurrenceAt ?? item.startDate
                          )}
                        </p>
                      </div>
                      <p className="text-[14.5px] font-bold text-[#f4f7f5]">
                        {formatCurrency(Number(item.amount), item.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[24px] bg-[#131b17] px-6 py-10 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#1a2620]">
              <Calendar className="size-7 text-[#1b2a21]" />
            </div>
            <p className="text-[14px] leading-relaxed font-medium text-[#7f8c86]">
              No planned items yet. Use Plan ahead to add recurring bills or
              income.
            </p>
          </div>
        )}
      </div>

      <Link
        href="/dashboard/planned-items"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#131b17] px-5 py-2.5 transition-colors hover:bg-[#1a2620]"
      >
        <span className="text-[12px] font-bold text-[#dce2de]">View all</span>
        <ArrowUpRight className="size-4 text-[#8bff62]" />
      </Link>
    </div>
  )
}

// --- Budgets Section ---

export function BudgetsSection({
  isLoading,
  budgets,
  transactions,
}: {
  isLoading: boolean
  budgets: Budget[]
  transactions: Transaction[]
}) {
  return (
    <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-[28px] font-bold tracking-tight text-[#f4f7f5]">
            Budgets
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            Track spending limits early.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Target className="size-5 text-[#ffc857]" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-[24px] bg-[#131b17]" />
        ) : budgets.length > 0 ? (
          budgets.slice(0, 3).map((budget) => {
            const spent = getSpentForBudget(budget, transactions)
            const limit = Number(budget.amount)
            const remaining = limit - spent
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            const isOver = spent > limit
            const barColor = isOver
              ? '#ff8a94'
              : pct > 80
                ? '#ffc857'
                : '#8bff62'

            return (
              <div
                key={budget.id}
                className="rounded-[24px] bg-[#131b17] p-5 transition-transform hover:scale-[1.01] hover:bg-[#1a2620]"
              >
                <div className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-bold text-[#f4f7f5]">
                      {budget.name || 'Unnamed budget'}
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-[#7f8c86]">
                      {formatCurrency(spent, budget.currency)} of{' '}
                      {formatCurrency(limit, budget.currency)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p
                      className={cn(
                        'text-[14px] font-bold',
                        remaining < 0 ? 'text-[#ff8a94]' : 'text-[#dce2de]'
                      )}
                    >
                      {remaining < 0 ? 'Over' : 'Left'}{' '}
                      {formatCurrency(Math.abs(remaining), budget.currency)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1a2c1f]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full transition-all duration-300"
                    style={{ backgroundColor: barColor }}
                  />
                </div>
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

      <Link
        href="/dashboard/budgets"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#131b17] px-5 py-2.5 transition-colors hover:bg-[#1a2620]"
      >
        <span className="text-[12px] font-bold text-[#dce2de]">View all</span>
        <ArrowUpRight className="size-4 text-[#ffc857]" />
      </Link>
    </div>
  )
}
