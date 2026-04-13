'use client'

import type { ReactNode } from 'react'
import { Badge, Pill } from '@/components/ui/pill'
import { Button } from '@/components/ui/button'
import { formatCompactDate, formatCurrency } from '@/lib/formatters'
import type { Category, PlannedItem } from '@/lib/finance.types'
import { cn } from '@/lib/utils'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  FolderPlus,
  Sparkles,
  Tags,
} from 'lucide-react'

export function FinanceEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Tags
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#17211c] bg-[#101713] px-6 py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-[#213227] bg-[#16211b] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <Icon className="size-7 text-[#8bff62]" strokeWidth={2.2} />
      </div>
      <h3 className="text-[18px] font-bold tracking-tight text-[#f4f7f5]">
        {title}
      </h3>
      <p className="mt-2 max-w-[260px] text-[14px] leading-relaxed font-medium text-[#7f8c86]">
        {description}
      </p>
    </div>
  )
}

export function FrontendOnlyBadge() {
  return (
    <Badge
      label="Frontend only"
      size="md"
      variant="subtle"
      className="border border-[#1d2b22] bg-[#131b17] text-[#8bff62]"
    />
  )
}

export function CategoryRow({
  category,
  isLast,
}: {
  category: Category
  isLast?: boolean
}) {
  const isIncome = category.type === 'INCOME'

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3.5',
        !isLast && 'border-b border-[#17211c]/60'
      )}
    >
      <div
        className="flex size-10 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: `${category.colorHex ?? '#18221d'}22` }}
      >
        <div
          className="size-3 rounded-full"
          style={{ backgroundColor: category.colorHex ?? '#8bff62' }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[#f4f7f5]">
          {category.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Pill
            label={isIncome ? 'Income' : 'Expense'}
            variant="subtle"
            className={cn(
              'border border-transparent',
              isIncome
                ? 'bg-[#16211b] text-[#41d6b2]'
                : 'bg-[#241719] text-[#ff8a94]'
            )}
          />

          {category.isDefault ? (
            <span className="text-[11px] font-bold text-[#6d786f]">
              Default
            </span>
          ) : (
            <span className="text-[11px] font-bold text-[#6d786f]">Custom</span>
          )}
        </div>
      </div>
      <span className="text-[11px] font-bold tracking-[1.8px] text-[#4a5650] uppercase">
        {category.slug}
      </span>
    </div>
  )
}

function formatRecurrenceLabel(item: PlannedItem) {
  if (item.recurrence === 'WEEKLY') return 'Every week'
  if (item.recurrence === 'MONTHLY') return 'Every month'
  if (item.recurrence === 'QUARTERLY') return 'Every quarter'
  if (item.recurrence === 'YEARLY') return 'Every year'
  if (item.recurrence === 'SEMI_MONTHLY') {
    const [first, second] = item.semiMonthlyDays
    return first && second ? `${first} & ${second} each month` : 'Twice a month'
  }
  return item.recurrence
}

export function PlannedItemRow({
  item,
  scheduledFor,
  statusLabel,
  statusTone = 'neutral',
  helperText,
  isLast,
  action,
}: {
  item: PlannedItem
  scheduledFor?: string
  statusLabel?: string
  statusTone?: 'danger' | 'success' | 'neutral'
  helperText?: string
  isLast?: boolean
  action?: ReactNode
}) {
  const isExpense = item.type === 'EXPENSE'

  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-4 py-4',
        !isLast && 'border-b border-[#17211c]/60'
      )}
    >
      {/* Top row: icon + text */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[14px]',
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
            {item.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-[#7f8c86]">
            <span>
              {formatCompactDate(
                scheduledFor ?? item.nextOccurrenceAt ?? item.startDate
              )}
            </span>
            <span className="text-[#314238]">·</span>
            <span>{formatRecurrenceLabel(item)}</span>
            {statusLabel ? (
              <>
                <span className="text-[#314238]">·</span>
                <span
                  className={cn(
                    'font-bold tracking-[1.2px] uppercase',
                    statusTone === 'danger'
                      ? 'text-[#ff8a94]'
                      : statusTone === 'success'
                        ? 'text-[#41d6b2]'
                        : 'text-[#ffc857]'
                  )}
                >
                  {statusLabel}
                </span>
              </>
            ) : null}
          </div>
          {helperText ? (
            <p className="mt-1 text-[12px] font-medium text-[#93a19a]">
              {helperText}
            </p>
          ) : null}
        </div>
      </div>

      {/* Bottom row: amount + actions */}
      <div className="flex items-center justify-between gap-2 pl-[52px]">
        <p
          className={cn(
            'text-[15px] font-bold',
            isExpense ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
          )}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(Number(item.amount), item.currency)}
        </p>
        {action}
      </div>
    </div>
  )
}

export function CreationHint({
  title,
  description,
  actionLabel,
}: {
  title: string
  description: string
  actionLabel: string
}) {
  return (
    <div className="rounded-[28px] border border-[#17211c] bg-[#101713] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Draft flow
          </p>
          <h3 className="mt-2 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
            {title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            {description}
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <Sparkles className="size-5 text-[#8bff62]" />
        </div>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#18221d] px-4 py-2">
        <FolderPlus className="size-4 text-[#8bff62]" />
        <span className="text-[12px] font-bold text-[#dce2de]">
          {actionLabel}
        </span>
      </div>
    </div>
  )
}

export function SectionActionLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Button
      asChild
      variant="secondary"
      size="sm"
      className="bg-[#131b17] text-[#dce2de] hover:bg-[#1a2620]"
    >
      <a href={href}>{label}</a>
    </Button>
  )
}

export function DateMetaPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#131b17] px-3 py-1.5">
      <Calendar className="size-3.5 text-[#8bff62]" />
      <span className="text-[12px] font-bold text-[#dce2de]">{label}</span>
    </div>
  )
}
