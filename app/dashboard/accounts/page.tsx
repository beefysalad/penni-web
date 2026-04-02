'use client'

import { useState, useMemo } from 'react'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { 
  AccountCard, 
  NetWorthCard, 
  AccountSkeletonCard 
} from '@/components/finance/finance-components'
import { Pill } from '@/components/ui/pill'
import { useAccountsQuery } from '@/hooks/use-finance-queries'
import { getNetWorth, getTypeBreakdown } from '@/lib/selectors'
import { ACCOUNT_FILTERS, type AccountFilter } from '@/lib/constants'
import { WalletCards } from 'lucide-react'

export default function AccountsPage() {
  const accountsQuery = useAccountsQuery()
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('All')

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const totalBalance = useMemo(() => getNetWorth(accounts), [accounts])
  const typeBreakdown = useMemo(() => getTypeBreakdown(accounts), [accounts])

  const filteredAccounts = useMemo(() => {
    if (activeFilter === 'All') return accounts
    return accounts.filter((account) => {
      if (activeFilter === 'Debit') return account.type === 'BANK_ACCOUNT'
      if (activeFilter === 'Credit') return account.type === 'CREDIT_CARD'
      if (activeFilter === 'Cash') return account.type === 'CASH'
      if (activeFilter === 'E-wallet') return account.type === 'E_WALLET'
      if (activeFilter === 'Other') return account.type === 'OTHER'
      return true
    })
  }, [accounts, activeFilter])

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Wallets and balances"
          title="Accounts"
          subtitle="See all your money in one place. Track cash, bank balances, and limits."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pt-6 md:px-6 lg:px-8 animate-in fade-in duration-500 pb-20">
        {accountsQuery.isLoading ? (
          <div className="h-40 w-full rounded-[30px] bg-[#111916] animate-pulse" />
        ) : (
          <NetWorthCard 
            totalBalance={totalBalance} 
            typeBreakdown={typeBreakdown} 
          />
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {ACCOUNT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as AccountFilter)}
                className="focus:outline-none"
              >
                <Pill
                  label={filter}
                  variant={activeFilter === filter ? 'selected' : 'default'}
                  className="cursor-pointer transition-all active:scale-95"
                />
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {accountsQuery.isLoading ? (
              <>
                <AccountSkeletonCard />
                <AccountSkeletonCard />
                <AccountSkeletonCard />
              </>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#0f1512] py-20 px-6 text-center border border-[#17211c]">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#18221d] mb-5">
                  <WalletCards className="size-8 text-[#1b2a21]" />
                </div>
                <h4 className="text-[18px] font-bold text-[#f4f7f5]">No accounts found</h4>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86] max-w-[240px]">
                  {activeFilter === 'All' 
                    ? "You haven't added any accounts yet. Connect one to start tracking."
                    : `No ${activeFilter.toLowerCase()} accounts found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
