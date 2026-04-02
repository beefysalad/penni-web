'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type MobileSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function MobileSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: MobileSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[32px] border border-[#1b2a21] bg-[#0d1411] shadow-2xl shadow-black/50',
          className
        )}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-14 rounded-full bg-[#243129]" />
        </div>

        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[22px] font-bold tracking-tight text-[#f4f7f5]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-[14px] font-medium leading-relaxed text-[#7f8c86]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#202c26]"
            aria-label="Dismiss"
          >
            <X className="size-4 text-[#dce2de]" />
          </button>
        </div>

        <div className="max-h-[calc(88vh-88px)] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
