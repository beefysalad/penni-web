'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Budget } from '@/lib/finance.types'
import { formatCompactDate, formatCurrency } from '@/lib/formatters'
import { getBudgetProgressState } from '../_lib/budgets-page.helpers'

type BudgetRowProps = {
  budget: Budget
  spent: number
  categoryName: string | null
  onEdit: () => void
  onDelete: () => void
}

export function BudgetRow({
  budget,
  spent,
  categoryName,
  onEdit,
  onDelete,
}: BudgetRowProps) {
  const limit = Number(budget.amount)
  const remaining = limit - spent
  const { pct, label, labelColor, barColor } = getBudgetProgressState(
    spent,
    limit,
    budget.alertThreshold
  )

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-[#f4f7f5]">
            {budget.name || categoryName || 'Unnamed budget'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#4a5650]">
            {formatCompactDate(budget.periodStart)} →{' '}
            {formatCompactDate(budget.periodEnd)}
            {categoryName ? (
              <span className="ml-2 text-[#41d6b2]">{categoryName}</span>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-8 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#213129]"
            aria-label="Edit budget"
          >
            <Pencil className="size-3.5 text-[#8bff62]" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex size-8 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
            aria-label="Delete budget"
          >
            <Trash2 className="size-3.5 text-[#ff8a94]" />
          </button>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a2c1f]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[12px] font-semibold"
          style={{ color: remaining < 0 ? '#ff8a94' : '#93a19a' }}
        >
          {remaining < 0 ? 'Over ' : ''}
          {formatCurrency(Math.abs(remaining), budget.currency)} left
          <span className="ml-1.5 font-normal text-[#4a5650]">
            of {formatCurrency(limit, budget.currency)}
          </span>
        </p>
        <span className="text-[11px] font-bold" style={{ color: labelColor }}>
          {label}
        </span>
      </div>
    </div>
  )
}
