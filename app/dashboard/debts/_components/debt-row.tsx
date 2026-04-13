import { Trash2 } from 'lucide-react'
import type { Debt } from '@/lib/finance.types'
import { formatCurrency, formatShortDate } from '@/lib/formatters'

type DebtRowProps = {
  debt: Debt
  onDelete: () => void
}

export function DebtRow({ debt, onDelete }: DebtRowProps) {
  const progress =
    Number(debt.originalAmount) > 0
      ? Math.min(
          (Number(debt.currentBalance) / Number(debt.originalAmount)) * 100,
          100
        )
      : 0

  const isOwedToMe = debt.direction === 'OWED_TO_ME'
  const isSettled = debt.status === 'SETTLED'
  const accentColor = isSettled ? '#93a19a' : isOwedToMe ? '#8bff62' : '#ff8a94'
  const pillBg = isSettled ? '#18221d' : isOwedToMe ? '#1a2c1f' : '#2b1719'
  const pillLabel = isSettled ? 'Settled' : isOwedToMe ? 'Owed to me' : 'I owe'

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[15px] font-bold text-[#f4f7f5]">{debt.title}</p>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1.2px]"
              style={{ color: accentColor, backgroundColor: pillBg }}
            >
              {pillLabel}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-[#4a5650]">
            {debt.counterpartyName}
            {debt.dueDate ? (
              <span className="ml-2 text-[#7f8c86]">· Due {formatShortDate(debt.dueDate)}</span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
          aria-label={`Delete ${debt.title}`}
        >
          <Trash2 className="size-3.5 text-[#ff8a94]" />
        </button>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#1a2c1f]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold" style={{ color: accentColor }}>
          {formatCurrency(debt.currentBalance, debt.currency)}
          <span className="ml-1 font-normal text-[#4a5650]">
            remaining of {formatCurrency(debt.originalAmount, debt.currency)}
          </span>
        </p>
      </div>

      {debt.notes ? (
        <p className="text-[12px] leading-5 text-[#7f8c86]">{debt.notes}</p>
      ) : null}
    </div>
  )
}
