'use client'

import { useMemo } from 'react'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { 
  ExpenseDonut, 
  StatTile, 
  AccountSkeletonCard 
} from '@/components/finance/finance-components'
import { 
  useTransactionsQuery, 
  useCategoriesQuery 
} from '@/hooks/use-finance-queries'
import { buildMonthlyExpenseDistribution } from '@/lib/selectors'
import { formatCurrency } from '@/lib/formatters'
import { 
  BarChart3, 
  PieChart 
} from 'lucide-react'

export default function StatsPage() {
  const transactionsQuery = useTransactionsQuery()
  const categoriesQuery = useCategoriesQuery('EXPENSE')

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data])
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])

  const stats = useMemo(
    () => buildMonthlyExpenseDistribution(transactions, categories),
    [transactions, categories]
  )

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())

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
            label="Top category"
            value={stats.topCategoryName}
            hint={`${stats.topCategoryShare}% of spend`}
            icon={PieChart}
            color="#ffc857"
          />
          <StatTile
            label="Month drift"
            value={stats.monthExpenses > stats.monthIncome ? 'Negative' : 'Healthy'}
            hint={stats.monthExpenses > stats.monthIncome ? 'Exceeded income' : 'Within means'}
            icon={BarChart3}
            color="#8bff62"
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
