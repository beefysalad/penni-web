'use client'

import { useState, useMemo } from 'react'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { 
  TransactionRow, 
  AccountSkeletonCard 
} from '@/components/finance/finance-components'
import { Pill } from '@/components/ui/pill'
import { cn } from '@/lib/utils'
import { 
  useTransactionsQuery, 
  usePlannedItemsQuery 
} from '@/hooks/use-finance-queries'
import { groupTransactionsIntoSections } from '@/lib/selectors'
import { TYPE_FILTERS, type TypeFilter } from '@/lib/constants'
import { 
  ReceiptText, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus 
} from 'lucide-react'
import { formatCurrency, formatCompactDate } from '@/lib/formatters'
import { getDaysUntil } from '@/lib/home-helpers'

export default function ActivityPage() {
  const transactionsQuery = useTransactionsQuery()
  const plannedItemsQuery = usePlannedItemsQuery(true)
  const [activeTab, setActiveTab] = useState<'All' | 'Recurring'>('All')
  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const allTransactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data])
  const allPlannedItems = useMemo(() => plannedItemsQuery.data ?? [], [plannedItemsQuery.data])

  // --- Transaction Logic ---

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesType = activeTypeFilter === 'All' || 
                         (activeTypeFilter === 'Expenses' && t.type === 'EXPENSE') || 
                         (activeTypeFilter === 'Income' && t.type === 'INCOME')
      return matchesSearch && matchesType
    })
  }, [allTransactions, searchQuery, activeTypeFilter])

  const sections = useMemo(() => groupTransactionsIntoSections(filteredTransactions), [filteredTransactions])

  // --- Recurring Logic ---

  const filteredPlannedItems = useMemo(() => {
    return allPlannedItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = activeTypeFilter === 'All' || 
                         (activeTypeFilter === 'Expenses' && item.type === 'EXPENSE') || 
                         (activeTypeFilter === 'Income' && item.type === 'INCOME')
      return matchesSearch && matchesType
    })
  }, [allPlannedItems, searchQuery, activeTypeFilter])

  return (
    <>
      <DashboardHeaderShell innerClassName="px-6 pb-4 pt-6 md:px-8 md:pb-5">
        <AppPageHeader
          eyebrow="Transaction history"
          title="Activity"
          subtitle="Review your income and expenses. Track where every penny goes."
          inverted
        />

        <div className="mt-6 flex flex-row gap-1 rounded-2xl bg-[#131b17] p-1.5">
          <button
            onClick={() => setActiveTab('All')}
            className={`flex-1 rounded-[12px] py-2 text-[13px] font-bold transition-all ${
              activeTab === 'All' ? 'bg-[#1a2c1f] text-[#8bff62] shadow-sm' : 'text-[#73827a]'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('Recurring')}
            className={`flex-1 rounded-[12px] py-2 text-[13px] font-bold transition-all ${
              activeTab === 'Recurring' ? 'bg-[#1a2c1f] text-[#8bff62] shadow-sm' : 'text-[#73827a]'
            }`}
          >
            Planned
          </button>
        </div>
      </DashboardHeaderShell>

      <div className="flex flex-col gap-5 px-4 pt-6 md:px-6 lg:px-8 animate-in fade-in duration-500 pb-28">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#4a5650]" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#17211c] bg-[#111916] py-3.5 pl-11 pr-4 text-[15px] text-[#f4f7f5] placeholder:text-[#4a5650] focus:border-[#2a3a31] focus:outline-none focus:ring-1 focus:ring-[#2a3a31]"
            />
          </div>

          <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveTypeFilter(filter as TypeFilter)}
                className="focus:outline-none"
              >
                <Pill
                  label={filter}
                  variant={activeTypeFilter === filter ? 'selected' : 'default'}
                  className="cursor-pointer transition-all active:scale-95"
                />
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'All' ? (
          <div className="flex flex-col gap-6">
            {transactionsQuery.isLoading ? (
              <div className="space-y-4">
                <AccountSkeletonCard />
                <AccountSkeletonCard />
                <AccountSkeletonCard />
              </div>
            ) : sections.length > 0 ? (
              sections.map((section) => (
                <div key={section.title} className="flex flex-col gap-2.5">
                  <h4 className="px-1 text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
                    {section.title}
                  </h4>
                  <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
                    {section.data.map((transaction, index) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        isLast={index === section.data.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#0f1512] py-20 px-6 text-center border border-[#17211c]">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#18221d] mb-5">
                  <ReceiptText className="size-8 text-[#1b2a21]" />
                </div>
                <h4 className="text-[18px] font-bold text-[#f4f7f5]">No history found</h4>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86] max-w-[240px]">
                  {searchQuery ? `No matches for &quot;${searchQuery}&quot;` : "You haven't logged any transactions yet."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {plannedItemsQuery.isLoading ? (
              <div className="space-y-4">
                <AccountSkeletonCard />
                <AccountSkeletonCard />
              </div>
            ) : filteredPlannedItems.length > 0 ? (
              filteredPlannedItems.map((item) => {
                const isExpense = item.type === 'EXPENSE'
                const occurrenceDate = item.nextOccurrenceAt ?? item.startDate
                const daysUntil = getDaysUntil(occurrenceDate)
                const showUrgency = daysUntil >= 0 && daysUntil <= 3

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex flex-row items-center gap-4 rounded-[28px] border border-[#17211c] bg-[#111916] p-4 transition-colors hover:bg-[#1a2620]",
                      showUrgency && isExpense && "border-[#331f25] bg-[#161213]"
                    )}
                  >
                    <div className={cn(
                      "flex size-11 items-center justify-center rounded-[14px]",
                      isExpense ? "bg-[#241719]" : "bg-[#16211b]"
                    )}>
                      {isExpense ? (
                        <ArrowDownLeft className="size-5 text-[#ff8a94]" />
                      ) : (
                        <ArrowUpRight className="size-5 text-[#41d6b2]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[16px] font-bold text-[#f4f7f5]">{item.title}</p>
                      <div className="mt-1 flex flex-row items-center gap-2">
                        <span className="text-[13px] font-medium text-[#6d786f]">
                          {formatCompactDate(occurrenceDate)}
                        </span>
                        {showUrgency && isExpense && (
                          <span className="text-[11px] font-bold text-[#ff8a94] uppercase tracking-wider">
                            {daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={cn(
                      "text-[17px] font-bold",
                      isExpense ? "text-[#f4f7f5]" : "text-[#41d6b2]"
                    )}>
                      {formatCurrency(Number(item.amount), item.currency)}
                    </p>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#0f1512] py-20 px-6 text-center border border-[#17211c]">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#18221d] mb-5">
                  <Calendar className="size-8 text-[#1b2a21]" />
                </div>
                <h4 className="text-[18px] font-bold text-[#f4f7f5]">No planned items</h4>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86] max-w-[240px]">
                  Use &quot;Plan ahead&quot; to start tracking recurring bills and income.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button className="fixed bottom-32 right-6 size-16 rounded-full bg-[#8bff62] shadow-2xl shadow-[#8bff62]/10 flex items-center justify-center text-[#07110a] hover:scale-105 active:scale-95 transition-transform z-40">
        <Plus className="size-8" />
      </button>
    </>
  )
}
