import type { ReactNode } from 'react'

type BudgetSectionProps = {
  title: string
  badge: string
  badgeColor: string
  children: ReactNode
}

export function BudgetSection({
  title,
  badge,
  badgeColor,
  children,
}: BudgetSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-[13px] font-bold tracking-[1.8px] text-[#4a5650] uppercase">
          {title}
        </h3>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
          style={{ color: badgeColor, backgroundColor: `${badgeColor}15` }}
        >
          {badge}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}
