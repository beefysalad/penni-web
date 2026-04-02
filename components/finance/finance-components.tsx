'use client'

import { cn } from '@/lib/utils'
import { ACCOUNT_TYPE_META } from '@/lib/constants'
import { formatCurrency, formatDueDayOfMonth, formatShortDate } from '@/lib/formatters'
import { Badge } from '@/components/ui/pill'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  LucideIcon,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { Account, Transaction } from '@/lib/finance.types'

// --- Account Card ---

export function AccountCard({ account }: { account: Account }) {
  const meta = ACCOUNT_TYPE_META[account.type]
  const TypeIcon = meta.icon
  const isCreditCard = account.type === 'CREDIT_CARD'
  const availableCredit = account.availableCredit ? Number(account.availableCredit) : null
  const creditLimit = account.creditLimit ? Number(account.creditLimit) : null
  const dueDayLabel = formatDueDayOfMonth(account.dueDayOfMonth)

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="rounded-[28px] border border-[#1b2a21]/60 bg-[#111916] p-5 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-1 flex-row items-center gap-4">
          <div className={cn('flex size-12 items-center justify-center rounded-2xl', meta.iconWrapClassName)}>
            <TypeIcon className="size-6" style={{ color: meta.accentColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[17px] font-bold tracking-tight text-[#f4f7f5]">
              {account.name}
            </p>
            <div className="mt-1 flex flex-row items-center gap-2">
              <span className={cn('text-[12px] font-bold', meta.accentTextClassName)}>
                {meta.label}
              </span>
              <div className="size-1 rounded-full bg-[#2a3a31]" />
              <span className="text-[12px] font-semibold text-[#73827a]">{account.currency}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className={cn('text-xl font-bold tracking-tight', Number(account.balance) < 0 ? 'text-[#ff8a94]' : 'text-[#f4f7f5]')}>
            {formatCurrency(Number(account.balance), account.currency)}
          </p>
          {account.institutionName && (
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#5c6e64]">
              {account.institutionName}
            </p>
          )}
        </div>
      </div>

      {isCreditCard && (availableCredit !== null || creditLimit !== null || dueDayLabel) && (
        <div className="mt-4 border-t border-[#1b2a21]/30 pt-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-5">
              {availableCredit !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                    Available
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-[#f4f7f5]">
                    {formatCurrency(availableCredit, account.currency)}
                  </p>
                </div>
              )}
              {creditLimit !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                    Limit
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#8d9f95]">
                    {formatCurrency(creditLimit, account.currency)}
                  </p>
                </div>
              )}
            </div>
            {dueDayLabel && (
              <div className="flex flex-col items-end">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                  Due Date
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-[#ffc857]">{dueDayLabel}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// --- Transaction Row ---

export function TransactionRow({ transaction, isLast }: { transaction: Transaction; isLast?: boolean }) {
  const isExpense = transaction.type === 'EXPENSE'
  const sign = isExpense ? '-' : '+'
  const amountColor = isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
  const iconBg = isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'
  const Icon = isExpense ? ArrowDownLeft : ArrowUpRight

  return (
    <div className={cn('px-4 py-3.5 transition-colors hover:bg-white/5', !isLast && 'border-b border-[#17211c]/60')}>
      <div className="flex flex-row items-center gap-3">
        <div className={cn('flex size-11 items-center justify-center rounded-[14px]', iconBg)}>
          <Icon className={cn('size-[17px]', isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]')} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-[16px] font-bold text-[#f4f7f5]">{transaction.title}</p>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="text-[13px] font-medium text-[#6d786f]">{formatShortDate(transaction.transactionAt)}</span>
            {transaction.source && transaction.source !== 'MANUAL' && (
              <Badge
                label={transaction.source === 'RECURRING' ? 'Recurring' : 'Imported'}
                variant="subtle"
                size="sm"
                className="bg-[#18221d] text-[#93a19a]"
              />
            )}
          </div>
        </div>

        <p className={cn('text-[17px] font-bold', amountColor)}>
          {sign}{formatCurrency(Number(transaction.amount), transaction.currency)}
        </p>
      </div>

      {transaction.notes && (
        <p className="ml-14 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#7f8c86]">
          {transaction.notes}
        </p>
      )}
    </div>
  )
}

// --- Stat Tile ---

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  color: string
}) {
  return (
    <div className="flex-1 rounded-[28px] border border-[#17211c] bg-[#0f1512] p-5">
      <div className="flex size-11 items-center justify-center rounded-full bg-[#131b17]">
        <Icon className="size-5" style={{ color }} />
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[1.8px] text-[#6d786f]">{label}</p>
      <p className="mt-2 text-[17px] font-bold leading-tight text-[#f4f7f5]">{value}</p>
      <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#7f8c86]">{hint}</p>
    </div>
  )
}

// --- Expense Donut ---

export function ExpenseDonut({
  rows,
  total,
}: {
  rows: Array<{ colorHex: string | null; amount: number; name: string }>
  total: number
}) {
  const size = 184
  const strokeWidth = 22
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#17211c"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {rows.map((row, index) => {
          const dash = total > 0 ? (row.amount / total) * circumference : 0
          // Calculate offset by summing previous amounts
          const currentOffset = rows.slice(0, index).reduce((sum, r) => sum + (r.amount / total) * circumference, 0)
          
          return (
            <circle
              key={`${row.name}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={row.colorHex ?? '#7f8c86'}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <p className="text-[32px] font-bold tracking-tight text-[#f4f7f5]">
          {rows[0]?.amount && total > 0 ? `${Math.round((rows[0].amount / total) * 100)}%` : '0%'}
        </p>
        <p className="mt-0.5 text-[12px] font-bold text-[#7f8c86] uppercase tracking-wider">
          {rows[0]?.name ? rows[0].name : 'No spend'}
        </p>
      </div>
    </div>
  )
}

// --- Net Worth Card ---

export function NetWorthCard({ totalBalance, typeBreakdown }: { totalBalance: number; typeBreakdown: [string, number][] }) {
  const isNegative = totalBalance < 0

  return (
    <div className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-bold text-[#7f8c86] uppercase tracking-wider">Net worth</p>
          <h2 className={cn(
            "mt-1 text-[34px] font-bold tracking-tight",
            isNegative ? "text-[#ff8a94]" : "text-[#f4f7f5]"
          )}>
            {formatCurrency(totalBalance)}
          </h2>
        </div>
        <div className={cn(
          "flex size-12 items-center justify-center rounded-full transition-colors",
          isNegative ? "bg-[#2c1a1f]" : "bg-[#1a2c1f]"
        )}>
          {isNegative ? (
            <ArrowDownLeft className="size-5 text-[#ff8a94]" />
          ) : (
            <TrendingUp className="size-5 text-[#8bff62]" />
          )}
        </div>
      </div>

      {typeBreakdown.length > 0 && (
        <div className="mt-4 flex flex-row gap-2 overflow-x-auto no-scrollbar pb-1">
          {typeBreakdown.map(([type, balance]) => {
            const meta = ACCOUNT_TYPE_META[type as keyof typeof ACCOUNT_TYPE_META]
            const TypeIcon = meta.icon
            const isNegativeBreakdown = balance < 0

            return (
              <div
                key={type}
                className="flex flex-row items-center gap-2 rounded-full bg-[#18221d] px-3 py-2 transition-colors hover:bg-[#1f2c25] whitespace-nowrap"
              >
                <TypeIcon className="size-3.5" style={{ color: meta.accentColor }} />
                <span className={cn("text-[11px] font-bold", meta.accentTextClassName)}>
                  {meta.label}
                </span>
                <span className={cn("text-[11px] font-medium", isNegativeBreakdown ? "text-[#ff8a94]" : "text-[#7f8c86]")}>
                  {formatCurrency(balance)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Skeleton Cards ---

export function AccountSkeletonCard() {
  return (
    <div className="rounded-[24px] border border-[#17211c] bg-[#131b17] p-4 animate-pulse">
      <div className="flex flex-row items-center gap-3">
        <div className="size-11 rounded-full bg-[#1a2620]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded-full bg-[#1a2620]" />
          <div className="h-3 w-20 rounded-full bg-[#162019]" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 w-24 rounded-full bg-[#1a2620]" />
          <div className="h-3 w-14 rounded-full bg-[#162019]" />
        </div>
      </div>
    </div>
  )
}
