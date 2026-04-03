'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type MobileSheetProps = {
  open: boolean
  onClose: () => void
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function MobileSheet({
  open,
  onClose,
  eyebrow,
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

        <div className="relative px-5 pt-4 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-5 top-4 flex size-11 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#202c26]"
            aria-label="Dismiss"
          >
            <X className="size-4 text-[#dce2de]" />
          </button>

          <div className="px-12 text-center">
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#8bff62]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 text-[22px] font-bold tracking-tight text-[#f4f7f5]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-[14px] font-medium leading-relaxed text-[#7f8c86]">{description}</p>
            ) : null}
          </div>
        </div>

        <div className="max-h-[calc(88vh-88px)] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
