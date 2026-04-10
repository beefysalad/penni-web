'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ACCOUNT_TYPE_META } from '@/lib/constants'
import { formatCurrency, formatDueDayOfMonth, formatShortDate } from '@/lib/formatters'
import { Badge } from '@/components/ui/pill'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft,
  ChevronRight,
  LucideIcon,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  getAccountAvailableCredit,
  getAccountCreditLimit,
  getAccountDueDayOfMonth,
  getAccountStatementDayOfMonth,
  type Account,
  type Transaction,
} from '@/lib/finance.types'

// --- Account Card ---

export function AccountCard({
  account,
  action,
  onClick,
}: {
  account: Account
  action?: ReactNode
  onClick?: () => void
}) {
  const meta = ACCOUNT_TYPE_META[account.type]
  const TypeIcon = meta.icon
  const isCreditCard = account.type === 'CREDIT_CARD'
  const availableCredit = getAccountAvailableCredit(account)
  const creditLimit = getAccountCreditLimit(account)
  const dueDayLabel = formatDueDayOfMonth(getAccountDueDayOfMonth(account))
  const statementDayLabel = formatDueDayOfMonth(getAccountStatementDayOfMonth(account))
  const usedCredit =
    creditLimit !== null && availableCredit !== null
      ? Math.max(0, creditLimit - availableCredit)
      : Number(account.balance)

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'group rounded-[28px] border border-[#1b2a21]/60 bg-[#111916] p-5 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
        onClick ? 'cursor-pointer' : ''
      )}
    >
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-row items-center gap-4">
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

        <div className="flex shrink-0 flex-col items-end gap-3">
          {action ? (
            <div className="flex items-center gap-2 self-end">
              {action}
            </div>
          ) : null}
          <div className="flex max-w-[140px] flex-col items-end sm:max-w-none">
            <p
              className={cn(
                'max-w-full break-words text-right text-[22px] leading-tight font-bold tracking-tight sm:text-xl',
                isCreditCard
                  ? 'text-[#f4f7f5]'
                  : Number(account.balance) < 0
                    ? 'text-[#ff8a94]'
                    : 'text-[#f4f7f5]'
              )}
            >
              {isCreditCard && availableCredit !== null
                ? formatCurrency(availableCredit, account.currency)
                : formatCurrency(Number(account.balance), account.currency)}
            </p>
            {isCreditCard ? (
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                Available credit
              </p>
            ) : null}
            {account.institutionName && (
              <p className="mt-1 max-w-full truncate text-[11px] font-bold uppercase tracking-wider text-[#5c6e64]">
                {account.institutionName}
              </p>
            )}
          </div>
        </div>
      </div>

      {isCreditCard && (availableCredit !== null || creditLimit !== null || dueDayLabel || statementDayLabel) && (
        <div className="mt-4 border-t border-[#1b2a21]/30 pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-row sm:items-center sm:gap-5">
              {usedCredit !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                    Used
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-[#f4f7f5]">
                    {formatCurrency(usedCredit, account.currency)}
                  </p>
                </div>
              )}
              {availableCredit !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                    Available
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#8d9f95]">
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
            <div className="flex flex-row flex-wrap items-start gap-4 sm:flex-col sm:items-end sm:gap-3">
              {statementDayLabel && (
                <div className="flex flex-col items-start sm:items-end">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                    Statement Day
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-[#9dd6ff]">{statementDayLabel}</p>
                </div>
              )}
              {dueDayLabel && (
                <div className="flex flex-col items-start sm:items-end">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#5c6e64]">
                    Due Date
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold text-[#ffc857]">{dueDayLabel}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {onClick ? (
        <div className="mt-4 border-t border-[#1b2a21]/30 pt-4">
          <div className="flex items-center justify-between rounded-[18px] bg-[#0f1512] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[#f4f7f5]">
                {isCreditCard ? 'View card details' : 'View details'}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#7f8c86]">
                {isCreditCard
                  ? 'See activity, due dates, and card-specific actions.'
                  : 'Open activity, balances, and recurring items.'}
              </p>
            </div>
            <div className="ml-4 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#18221d] text-[#8bff62] transition-transform group-hover:translate-x-0.5">
              <ChevronRight className="size-5" />
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}

// --- Transaction Row ---

export function TransactionRow({
  transaction,
  accountLabel,
  isLast,
  action,
}: {
  transaction: Transaction
  accountLabel?: string | null
  isLast?: boolean
  action?: ReactNode
}) {
  const isExpense = transaction.type === 'EXPENSE'
  const sign = isExpense ? '-' : '+'
  const isTransfer = transaction.source === 'TRANSFER'
  const amountColor = isTransfer ? 'text-[#ffd66b]' : isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
  const iconBg = isTransfer ? 'bg-[#2a2412]' : isExpense ? 'bg-[#241719]' : 'bg-[#16211b]'
  const Icon = isTransfer ? ArrowRightLeft : isExpense ? ArrowDownLeft : ArrowUpRight
  const iconColor = isTransfer ? 'text-[#ffd66b]' : isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
  const sourceLabel =
    transaction.source === 'RECURRING'
      ? 'Recurring'
      : transaction.source === 'IMPORTED'
        ? 'Imported'
        : transaction.source === 'TRANSFER'
          ? 'Transfer'
          : null

  return (
    <div className={cn('px-4 py-3.5 transition-colors hover:bg-white/5', !isLast && 'border-b border-[#17211c]/60')}>
      <div className="flex items-start gap-3">
        <div className={cn('flex size-11 items-center justify-center rounded-[14px]', iconBg)}>
          <Icon className={cn('size-[17px]', iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-bold text-[#f4f7f5]">{transaction.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[13px] font-medium text-[#6d786f]">{formatShortDate(transaction.transactionAt)}</span>
                {sourceLabel && (
                  <Badge
                    label={sourceLabel}
                    variant="subtle"
                    size="sm"
                    className="bg-[#18221d] text-[#93a19a] max-sm:px-2 max-sm:py-1 max-sm:text-[10px]"
                  />
                )}
                {accountLabel && (
                  <span className="inline-flex max-w-[128px] truncate rounded-full bg-[#131b17] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.2px] text-[#b6c2bb] ring-1 ring-[#1f2c25] sm:max-w-[180px] sm:px-3 sm:text-[11px] sm:tracking-[1.4px]">
                    {accountLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-2">
              <p className={cn('pt-0.5 text-right text-[15px] font-bold leading-tight sm:text-[17px]', amountColor)}>
                {sign}{formatCurrency(Number(transaction.amount), transaction.currency)}
              </p>
              {action}
            </div>
          </div>
        </div>
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
