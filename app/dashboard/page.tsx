'use client'

import { useUser } from '@clerk/nextjs'
import { useMemo } from 'react'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import {
  HomeBalanceHero,
  RecentTransactionsSection,
  UpcomingSection,
  BudgetsSection,
  SkeletonHeroCard,
} from '@/components/dashboard/home-sections'
import { useAccountsQuery } from '@/hooks/finance/use-accounts-query'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import { usePlannedItemsQuery } from '@/hooks/finance/use-planned-items-query'
import { useBudgetsQuery } from '@/hooks/finance/use-budgets-query'
import {
  getGreeting,
  getNextPlannedItem,
  getPlannedItemsForRestOfMonth,
  getProjectedBalanceAfterRecurring,
  getUpcomingTimingLabel,
} from '@/lib/home-helpers'
import { getNetWorth } from '@/lib/selectors'

export default function DashboardPage() {
  const { user } = useUser()
  const accountsQuery = useAccountsQuery()
  const plannedItemsQuery = usePlannedItemsQuery({ isActive: true })
  const transactionsQuery = useTransactionsQuery()
  const budgetsQuery = useBudgetsQuery()

  const firstName = user?.firstName || 'there'
  const accounts = accountsQuery.data ?? []

  const allPlannedItems = useMemo(
    () => plannedItemsQuery.data ?? [],
    [plannedItemsQuery.data]
  )

  const monthScopedPlannedItems = useMemo(
    () => getPlannedItemsForRestOfMonth(allPlannedItems),
    [allPlannedItems]
  )
  const plannedItems = useMemo(
    () => allPlannedItems.slice(0, 5),
    [allPlannedItems]
  )
  const allTransactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data]
  )
  const recentTransactions = useMemo(
    () => allTransactions.slice(0, 5),
    [allTransactions]
  )
  const budgets = budgetsQuery.data ?? []

  const incomePlannedItems = useMemo(
    () => plannedItems.filter((item) => item.type === 'INCOME'),
    [plannedItems]
  )
  const expensePlannedItems = useMemo(
    () => plannedItems.filter((item) => item.type === 'EXPENSE'),
    [plannedItems]
  )

  const totalBalance = useMemo(() => getNetWorth(accounts), [accounts])

  const leftAfterRecurring = useMemo(
    () =>
      getProjectedBalanceAfterRecurring(totalBalance, monthScopedPlannedItems),
    [totalBalance, monthScopedPlannedItems]
  )

  const nextBill = useMemo(
    () => getNextPlannedItem(allPlannedItems, 'EXPENSE'),
    [allPlannedItems]
  )
  const nextIncome = useMemo(
    () => getNextPlannedItem(allPlannedItems, 'INCOME'),
    [allPlannedItems]
  )

  const nextBillTiming = useMemo(
    () =>
      nextBill
        ? getUpcomingTimingLabel(
            nextBill.nextOccurrenceAt ?? nextBill.startDate
          )
        : 'No bill scheduled',
    [nextBill]
  )

  const nextIncomeTiming = useMemo(
    () =>
      nextIncome
        ? getUpcomingTimingLabel(
            nextIncome.nextOccurrenceAt ?? nextIncome.startDate
          )
        : 'No income scheduled',
    [nextIncome]
  )

  const recentIncome = useMemo(
    () =>
      recentTransactions
        .filter(
          (transaction) =>
            transaction.type === 'INCOME' && transaction.source !== 'TRANSFER'
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [recentTransactions]
  )

  const recentExpense = useMemo(
    () =>
      recentTransactions
        .filter(
          (transaction) =>
            transaction.type === 'EXPENSE' && transaction.source !== 'TRANSFER'
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [recentTransactions]
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Dashboard"
          title={`${getGreeting()}, ${firstName}!`}
          subtitle="Track balances, upcoming bills, and the categories shaping your month."
          inverted
        />
      </DashboardHeaderShell>

      <div className="animate-in fade-in grid gap-6 px-4 py-6 md:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-12">
          {accountsQuery.isLoading ? (
            <SkeletonHeroCard />
          ) : (
            <HomeBalanceHero
              leftAfterRecurring={leftAfterRecurring}
              nextBillName={nextBill?.title ?? 'Nothing due'}
              nextBillTiming={nextBillTiming}
              nextIncomeName={nextIncome?.title ?? 'Nothing incoming'}
              nextIncomeTiming={nextIncomeTiming}
            />
          )}
        </div>

        <div className="lg:col-span-7">
          <RecentTransactionsSection
            isLoading={transactionsQuery.isLoading}
            recentTransactions={recentTransactions}
            recentIncome={recentIncome}
            recentExpense={recentExpense}
          />
        </div>

        <div className="lg:col-span-5">
          <UpcomingSection
            isLoading={plannedItemsQuery.isLoading}
            incomePlannedItems={incomePlannedItems}
            expensePlannedItems={expensePlannedItems}
          />
        </div>

        <div className="lg:col-span-12">
          <BudgetsSection
            isLoading={budgetsQuery.isLoading}
            budgets={budgets}
            transactions={allTransactions}
          />
        </div>
      </div>
    </>
  )
}
