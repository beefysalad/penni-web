import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/pill'
import { ACCOUNT_TYPE_META } from '@/lib/constants'
import { formatCurrency, formatDueDayOfMonth } from '@/lib/formatters'
import {
  getAccountAvailableCredit,
  getAccountCreditLimit,
  getAccountDueDayOfMonth,
  getAccountStatementDayOfMonth,
  type Account,
} from '@/lib/finance.types'
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  CalendarClock,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getHeroPalette(type: Account['type']) {
  if (type === 'BANK_ACCOUNT') {
    return {
      surface: 'bg-[#6f788d]',
      border: 'border-[#808aa1]',
      glow: 'bg-[#d9dfef]/20',
      accent: 'bg-[#c4ccde]/25',
    }
  }
  if (type === 'CREDIT_CARD') {
    return {
      surface: 'bg-[#514867]',
      border: 'border-[#6a5f83]',
      glow: 'bg-[#d8c5ff]/15',
      accent: 'bg-[#8a7ca8]/25',
    }
  }
  if (type === 'E_WALLET') {
    return {
      surface: 'bg-[#37546c]',
      border: 'border-[#486d88]',
      glow: 'bg-[#b8e6ff]/15',
      accent: 'bg-[#5a9dff]/20',
    }
  }
  if (type === 'CASH') {
    return {
      surface: 'bg-[#56654a]',
      border: 'border-[#68785a]',
      glow: 'bg-[#dcf5b0]/12',
      accent: 'bg-[#9fdb61]/18',
    }
  }
  return {
    surface: 'bg-[#535a67]',
    border: 'border-[#687181]',
    glow: 'bg-[#d8dde8]/15',
    accent: 'bg-[#a8b4c6]/18',
  }
}

type AccountDetailOverviewProps = {
  account: Account
  moneyIn: number
  moneyOut: number
  recurringCount: number
  totalTransactions: number
}

export function AccountDetailOverview({
  account,
  moneyIn,
  moneyOut,
  recurringCount,
  totalTransactions,
}: AccountDetailOverviewProps) {
  const meta = ACCOUNT_TYPE_META[account.type]
  const TypeIcon = meta.icon
  const palette = getHeroPalette(account.type)
  const isCreditCard = account.type === 'CREDIT_CARD'
  const availableCredit = getAccountAvailableCredit(account) ?? 0
  const creditLimit = getAccountCreditLimit(account) ?? 0
  const usedCredit = Math.max(0, creditLimit - availableCredit)
  const dueDay = getAccountDueDayOfMonth(account)
  const statementDay = getAccountStatementDayOfMonth(account)

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div
        className={cn(
          'relative overflow-hidden rounded-[34px] border px-6 pb-7 pt-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)]',
          palette.surface,
          palette.border
        )}
      >
        <div className={cn('absolute -left-12 top-10 size-56 rounded-full', palette.glow)} />
        <div className={cn('absolute right-10 top-0 size-44 rounded-full', palette.accent)} />
        <div className="absolute inset-x-0 top-28 h-20 bg-white/5" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-[22px] bg-white">
              <TypeIcon className="size-8" style={{ color: meta.accentColor }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-white/75">
                {account.institutionName || meta.label}
              </p>
              <h2 className="mt-1 truncate text-[24px] font-bold tracking-tight text-white sm:text-[30px]">
                {account.name}
              </h2>
            </div>
          </div>

          <Badge
            label={meta.label}
            variant="subtle"
            size="sm"
            className="bg-black/15 text-white/80"
          />
        </div>

        <div className="relative mt-20">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-white/65">
            {isCreditCard ? 'Available credit' : 'Balance'}
          </p>
          <p className="mt-2 break-words text-[32px] leading-none font-bold tracking-tight text-white sm:text-[42px]">
            {formatCurrency(
              isCreditCard ? availableCredit : Number(account.balance),
              account.currency
            )}
          </p>
        </div>
      </div>

      <div className="rounded-[34px] border border-[#1b2a21] bg-[#111916] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
              {isCreditCard ? 'Used credit' : 'Net balance'}
            </p>
            <p className="mt-2 truncate text-[28px] font-bold tracking-tight text-white">
              {formatCurrency(
                isCreditCard ? usedCredit : Number(account.balance),
                account.currency
              )}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
              {isCreditCard ? 'Available' : 'Spendable'}
            </p>
            <p className="mt-2 truncate text-[28px] font-bold tracking-tight text-white">
              {formatCurrency(
                isCreditCard ? availableCredit : Number(account.balance),
                account.currency
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            asChild
            className="h-14 justify-start rounded-[22px] bg-[#1f3725] px-5 text-[#7dbd78] hover:bg-[#24402b]"
            variant="ghost"
          >
            <Link
              href={
                isCreditCard
                  ? `/dashboard/activity?mode=TRANSFER&toAccountId=${account.id}&intent=card-payment`
                  : '/dashboard/activity?mode=TRANSFER'
              }
            >
              <ArrowRightLeft className="mr-2 size-5" />
              {isCreditCard ? 'Pay card' : 'Transfer'}
            </Link>
          </Button>

          <Button
            asChild
            className="h-14 justify-start rounded-[22px] bg-[#17221b] px-5 text-[#7dbd78] hover:bg-[#1c2a20]"
            variant="ghost"
          >
            <Link href="/dashboard/planned-items">
              <CalendarClock className="mr-2 size-5" />
              {'Recurring'}
            </Link>
          </Button>

          <Button
            asChild
            className="h-14 justify-start rounded-[22px] bg-[#4a2020] px-5 text-[#ef8c8c] hover:bg-[#562525]"
            variant="ghost"
          >
            <Link href="/dashboard/activity">
              <ArrowDownLeft className="mr-2 size-5" />
              {isCreditCard ? 'Add charge' : 'Add expense'}
            </Link>
          </Button>

          <Button
            asChild
            className="h-14 justify-start rounded-[22px] bg-[#203323] px-5 text-[#7dbd78] hover:bg-[#28402c]"
            variant="ghost"
          >
            <Link href="/dashboard/activity">
              {isCreditCard ? (
                <Plus className="mr-2 size-5" />
              ) : (
                <ArrowUpRight className="mr-2 size-5" />
              )}
              {isCreditCard ? 'Add credit' : 'Add income'}
            </Link>
          </Button>
        </div>

        <div className="mt-4 rounded-[26px] bg-[#0b0f0d] p-4">
          {isCreditCard ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[#111916] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Limit
                </p>
                <p className="mt-1 text-[16px] font-semibold text-[#f4f7f5]">
                  {formatCurrency(creditLimit, account.currency)}
                </p>
              </div>
              <div className="rounded-[18px] bg-[#111916] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Statement
                </p>
                <p className="mt-1 text-[16px] font-semibold text-[#9dd6ff]">
                  {statementDay ? formatDueDayOfMonth(statementDay) : 'Not set'}
                </p>
              </div>
              <div className="rounded-[18px] bg-[#111916] px-4 py-3 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Due day
                </p>
                <p className="mt-1 text-[16px] font-semibold text-[#ffc857]">
                  {dueDay ? formatDueDayOfMonth(dueDay) : 'Not set'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Money in
                </p>
                <p className="mt-2 text-[18px] font-semibold text-[#41d6b2]">
                  {formatCurrency(moneyIn, account.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Money out
                </p>
                <p className="mt-2 text-[18px] font-semibold text-[#ff8a94]">
                  {formatCurrency(moneyOut, account.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#5f6c65]">
                  Activity
                </p>
                <p className="mt-2 text-[18px] font-semibold text-white">
                  {totalTransactions}
                </p>
                <p className="mt-1 text-[12px] font-medium text-[#7f8c86]">
                  {recurringCount} recurring linked
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
