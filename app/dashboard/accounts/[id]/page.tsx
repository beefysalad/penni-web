'use client'

import {
  AccountCard,
  AccountSkeletonCard,
  TransactionRow,
} from '@/components/finance/finance-components'
import {
  FinanceEmptyState,
  PlannedItemRow,
} from '@/components/finance/management-components'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import { useAccountsQuery } from '@/hooks/finance/use-accounts-query'
import { usePlannedItemsQuery } from '@/hooks/finance/use-planned-items-query'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import { ACCOUNT_TYPE_META } from '@/lib/constants'
import { formatCurrency, formatShortDate } from '@/lib/formatters'
import { getPlannedItemRecurringState } from '@/lib/recurring'
import { groupTransactionsIntoSections } from '@/lib/selectors'
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Calendar,
  ReceiptText,
} from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useMemo } from 'react'
import { AccountDetailStatsTile } from './_components/account-detail-stats-tile'
import {
  getRecurringHelperText,
  getRecurringStatusLabel,
  getRecurringStatusTone,
} from './_lib/account-detail.helpers'

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>()
  const accountId = Array.isArray(params.id) ? params.id[0] : params.id

  const accountsQuery = useAccountsQuery()
  const transactionsQuery = useTransactionsQuery()
  const plannedItemsQuery = usePlannedItemsQuery({ accountId, isActive: true })

  const accounts = accountsQuery.data ?? []
  const allTransactions = transactionsQuery.data ?? []
  const plannedItems = plannedItemsQuery.data ?? []

  const account = useMemo(
    () => accounts.find((entry) => entry.id === accountId) ?? null,
    [accounts, accountId]
  )
  const isCreditCard = account?.type === 'CREDIT_CARD'

  const accountTransactions = useMemo(
    () =>
      allTransactions.filter(
        (transaction) => transaction.accountId === accountId
      ),
    [allTransactions, accountId]
  )

  const signedTransactionDelta = useMemo(
    () =>
      accountTransactions.reduce((sum, transaction) => {
        const amount = Number(transaction.amount)
        return transaction.type === 'INCOME' ? sum + amount : sum - amount
      }, 0),
    [accountTransactions]
  )

  const sections = useMemo(
    () => groupTransactionsIntoSections(accountTransactions),
    [accountTransactions]
  )

  const plannedItemsWithState = useMemo(
    () =>
      plannedItems.map((item) =>
        getPlannedItemRecurringState(item, allTransactions)
      ),
    [plannedItems, allTransactions]
  )

  const openingBalance = useMemo(
    () => (account ? Number(account.balance) - signedTransactionDelta : 0),
    [account, signedTransactionDelta]
  )

  const cashFlowTransactions = useMemo(
    () =>
      accountTransactions.filter(
        (transaction) => transaction.source !== 'TRANSFER'
      ),
    [accountTransactions]
  )

  const moneyIn = useMemo(
    () =>
      cashFlowTransactions
        .filter(
          (transaction) =>
            transaction.type === 'INCOME' && transaction.source !== 'TRANSFER'
        )
        .reduce(
          (sum, transaction) => sum + Number(transaction.amount),
          Math.max(openingBalance, 0)
        ),
    [cashFlowTransactions, openingBalance]
  )

  const moneyOut = useMemo(
    () =>
      cashFlowTransactions
        .filter(
          (transaction) =>
            transaction.type === 'EXPENSE' && transaction.source !== 'TRANSFER'
        )
        .reduce(
          (sum, transaction) => sum + Number(transaction.amount),
          Math.abs(Math.min(openingBalance, 0))
        ),
    [cashFlowTransactions, openingBalance]
  )

  const creditCardPayments = useMemo(
    () =>
      cashFlowTransactions
        .filter((transaction) => transaction.type === 'INCOME')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [cashFlowTransactions]
  )

  const creditCardCharges = useMemo(
    () =>
      cashFlowTransactions
        .filter((transaction) => transaction.type === 'EXPENSE')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [cashFlowTransactions]
  )

  const transferMoves = useMemo(
    () =>
      accountTransactions
        .filter((transaction) => transaction.source === 'TRANSFER')
        .reduce(
          (sum, transaction) => sum + Math.abs(Number(transaction.amount)),
          0
        ),
    [accountTransactions]
  )

  const lastActivity = accountTransactions[0]
    ? formatShortDate(accountTransactions[0].transactionAt)
    : 'No activity yet'
  const isLoading =
    accountsQuery.isLoading ||
    transactionsQuery.isLoading ||
    plannedItemsQuery.isLoading

  if (!accountId) notFound()
  if (!isLoading && !account) notFound()

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Account detail"
          title={account?.name ?? 'Account'}
          subtitle="See the current balance, recent activity, and recurring items tied to this account."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pt-6 pb-28 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="bg-[#131b17] text-[#dce2de] hover:bg-[#1a2620]"
          >
            <Link href="/dashboard/accounts">Back to accounts</Link>
          </Button>
          {isCreditCard ? (
            <Button asChild size="sm">
              <Link
                href={`/dashboard/activity?mode=TRANSFER&toAccountId=${accountId}&intent=card-payment`}
              >
                Pay card
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href="/dashboard/activity">Add transaction</Link>
          </Button>
        </div>

        {isLoading || !account ? (
          <AccountSkeletonCard />
        ) : (
          <AccountCard account={account} />
        )}

        {!isLoading && account ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AccountDetailStatsTile
              label={isCreditCard ? 'Payments' : 'Money in'}
              value={formatCurrency(
                isCreditCard ? creditCardPayments : moneyIn,
                account.currency
              )}
              hint={
                isCreditCard
                  ? 'Credits and payments posted to this card so far.'
                  : 'Includes opening balance and posted income.'
              }
              tone="positive"
              icon={ArrowUpRight}
            />
            <AccountDetailStatsTile
              label={isCreditCard ? 'Charges' : 'Money out'}
              value={formatCurrency(
                isCreditCard ? creditCardCharges : moneyOut,
                account.currency
              )}
              hint={
                isCreditCard
                  ? 'Card spend posted to this account so far.'
                  : 'Expenses posted from this account so far.'
              }
              tone="negative"
              icon={ArrowDownLeft}
            />
            <AccountDetailStatsTile
              label="Transfers"
              value={formatCurrency(transferMoves, account.currency)}
              hint="Internal balance moves tied to this account."
              tone="transfer"
              icon={ArrowRightLeft}
            />
            <AccountDetailStatsTile
              label="Last activity"
              value={lastActivity}
              hint={`${accountTransactions.length} total transaction${accountTransactions.length === 1 ? '' : 's'}.`}
              icon={Calendar}
            />
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">
                  Recent activity
                </h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
                  Everything that has touched this account so far.
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
                <ReceiptText className="size-5 text-[#8bff62]" />
              </div>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <div className="space-y-3">
                  <AccountSkeletonCard />
                  <AccountSkeletonCard />
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-5">
                  {sections.map((section) => (
                    <div key={section.title} className="space-y-2.5">
                      <p className="px-1 text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
                        {section.title}
                      </p>
                      <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
                        {section.data.map((transaction, index) => (
                          <TransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            accountLabel={
                              ACCOUNT_TYPE_META[account!.type].label
                            }
                            accountType={account!.type}
                            isLast={index === section.data.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <FinanceEmptyState
                  icon={ReceiptText}
                  title="No account activity yet"
                  description="Transactions tied to this account will show up here once you start using it."
                />
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#17211c] bg-[#0f1512] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">
                  Recurring tied here
                </h3>
                <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
                  Planned bills and income currently linked to this account.
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
                <Calendar className="size-5 text-[#41d6b2]" />
              </div>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <div className="space-y-3">
                  <AccountSkeletonCard />
                  <AccountSkeletonCard />
                </div>
              ) : plannedItemsWithState.length > 0 ? (
                <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
                  {plannedItemsWithState.map((entry, index) => (
                    <PlannedItemRow
                      key={entry.item.id}
                      item={entry.item}
                      scheduledFor={entry.scheduledFor}
                      statusLabel={getRecurringStatusLabel(entry.status)}
                      statusTone={getRecurringStatusTone(entry.status)}
                      helperText={getRecurringHelperText(entry)}
                      isLast={index === plannedItemsWithState.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <FinanceEmptyState
                  icon={Calendar}
                  title="No recurring items here yet"
                  description="Link bills or recurring income to this account to make the timeline more useful."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
