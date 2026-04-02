'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function DashboardHeaderShell({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
}) {
  return (
    <div className={cn('px-4 pt-4 md:px-6 md:pt-6 lg:px-8', className)}>
      <div
        className={cn(
          'rounded-[32px] border border-[#17211c] bg-[#0b120e] px-6 pb-6 pt-6 md:px-8 md:pb-8',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
