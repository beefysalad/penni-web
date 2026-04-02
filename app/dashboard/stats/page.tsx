'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { 
  ExpenseDonut, 
  StatTile, 
  AccountSkeletonCard 
} from '@/components/finance/finance-components'
import { useTransactionsQuery } from '@/hooks/finance/use-transactions-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { buildMonthlyExpenseDistribution, getCurrentMonthBounds, getTransactionMonthOptions } from '@/lib/selectors'
import { formatCurrency } from '@/lib/formatters'
import { 
  BarChart3, 
  PieChart,
  Activity,
  Wallet
} from 'lucide-react'

export default function StatsPage() {
  const transactionsQuery = useTransactionsQuery()
  const categoriesQuery = useCategoriesQuery('EXPENSE')

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data])
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const monthOptions = useMemo(() => getTransactionMonthOptions(transactions), [transactions])
  const currentPeriod = useMemo(() => getCurrentMonthBounds(), [])
  const currentMonthValue = `${currentPeriod.year}-${String(currentPeriod.month + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue)

  useEffect(() => {
    const hasSelectedMonth = monthOptions.some((option) => option.value === selectedMonth)
    if (hasSelectedMonth || monthOptions.length === 0) return
    setSelectedMonth(currentMonthValue)
  }, [currentMonthValue, monthOptions, selectedMonth])

  const selectedPeriod = useMemo(() => {
    const selectedOption = monthOptions.find((option) => option.value === selectedMonth)
    return selectedOption
      ? { year: selectedOption.year, month: selectedOption.month }
      : currentPeriod
  }, [currentPeriod, monthOptions, selectedMonth])

  const stats = useMemo(
    () => buildMonthlyExpenseDistribution(transactions, categories, selectedPeriod),
    [transactions, categories, selectedPeriod]
  )

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    new Date(selectedPeriod.year, selectedPeriod.month, 1)
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Spending trends"
          title="Trends"
          subtitle={`Understand your money movement for ${monthName}. Review categories and drift.`}
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pt-6 md:px-6 lg:px-8 animate-in fade-in duration-500 pb-28">
        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Time window</p>
              <p className="mt-1 text-[14px] font-medium text-[#93a19a]">
                Stats default to this month, but you can switch to an earlier month anytime.
              </p>
            </div>

            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-12 min-w-[220px] rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
            >
              <option value={currentMonthValue}>
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                  new Date(currentPeriod.year, currentPeriod.month, 1)
                )}
              </option>
              {monthOptions
                .filter((option) => option.value !== currentMonthValue)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {transactionsQuery.isLoading || categoriesQuery.isLoading ? (
          <div className="h-64 w-full rounded-[30px] bg-[#111916] animate-pulse" />
        ) : (
          <div className="flex flex-col items-center rounded-[30px] border border-[#17211c] bg-[#111916] p-8 shadow-xl shadow-black/20">
            <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650] mb-6">
              Monthly overview
            </h4>
            <ExpenseDonut 
              rows={stats.distributionRows} 
              total={stats.monthExpenses} 
            />
            
            <div className="mt-10 flex w-full flex-row justify-between border-t border-[#1b2a21]/30 pt-6">
              <div className="flex flex-col items-center flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Spending</p>
                <p className="mt-1 text-[17px] font-bold text-[#f4f7f5]">{formatCurrency(stats.monthExpenses)}</p>
              </div>
              <div className="w-px h-10 bg-[#1b2a21]/30" />
              <div className="flex flex-col items-center flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Income</p>
                <p className="mt-1 text-[17px] font-bold text-[#41d6b2]">{formatCurrency(stats.monthIncome)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row gap-3">
          <StatTile
            label="Spend pace"
            value={formatCurrency(stats.monthExpenses)}
            hint="This month"
            icon={Activity}
            color="#8bff62"
          />
          <StatTile
            label="Top category"
            value={stats.topCategoryName}
            hint={`${stats.topCategoryShare}% of spending`}
            icon={BarChart3}
            color="#5aa9ff"
          />
        </div>

        <div className="flex flex-row gap-3">
          <StatTile
            label="Net cash flow"
            value={formatCurrency(stats.monthIncome - stats.monthExpenses)}
            hint="Income vs spending"
            icon={Wallet}
            color="#41d6b2"
          />
          <StatTile
            label="Budget drift"
            value={stats.monthExpenses > stats.monthIncome ? 'Negative' : 'Soon'}
            hint={stats.monthExpenses > stats.monthIncome ? 'Exceeded income' : 'Budget tracking comes next'}
            icon={PieChart}
            color="#ffc857"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="px-1 text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
            Category breakdown
          </h4>
          
          <div className="flex flex-col gap-2.5">
            {transactionsQuery.isLoading || categoriesQuery.isLoading ? (
              <>
                <AccountSkeletonCard />
                <AccountSkeletonCard />
                <AccountSkeletonCard />
              </>
            ) : stats.distributionRows.length > 0 ? (
              stats.distributionRows.map((row) => (
                <div 
                  key={row.id} 
                  className="flex flex-row items-center gap-4 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-4 transition-transform hover:scale-[1.01]"
                >
                  <div 
                    className="flex size-11 items-center justify-center rounded-[14px]" 
                    style={{ backgroundColor: `${row.colorHex}15` }}
                  >
                    <BarChart3 className="size-5" style={{ color: row.colorHex ?? '#73827a' }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[16px] font-bold text-[#f4f7f5]">{row.name}</p>
                    <div className="mt-1 flex flex-row items-center gap-2">
                       <div className="h-1.5 flex-1 rounded-full bg-[#1b2a21]/50 overflow-hidden max-w-[80px]">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${row.share}%`, 
                              backgroundColor: row.colorHex ?? '#73827a' 
                            }}
                          />
                       </div>
                       <span className="text-[12px] font-bold text-[#4a5650]">{row.share}%</span>
                    </div>
                  </div>

                  <p className="text-[17px] font-bold text-[#f4f7f5]">
                    {formatCurrency(row.amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#0f1512] py-16 px-6 text-center border border-[#17211c]">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#18221d] mb-5">
                  <PieChart className="size-8 text-[#1b2a21]" />
                </div>
                <h4 className="text-[18px] font-bold text-[#f4f7f5]">No data yet</h4>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86] max-w-[240px]">
                  Log expenses to see your spending distribution by category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
