'use client'

import { useUser } from '@clerk/nextjs'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'
import { Clock } from 'lucide-react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type AppPageHeaderProps = {
  eyebrow?: string
  title: string
  meta?: string
  subtitle?: string
  inverted?: boolean
}

export function AppPageHeader({
  eyebrow,
  title,
  meta,
  subtitle,
  inverted = false,
}: AppPageHeaderProps) {
  const { user } = useUser()

  return (
    <div className="flex min-w-0 max-w-full flex-row items-start justify-between gap-4 overflow-hidden">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p
            className={cn(
              'text-[10.5px] font-bold uppercase tracking-[2.4px]',
              inverted ? 'text-[#8bff62]/70' : 'text-[#7b8499]'
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            'mt-2 break-words text-[28px] font-bold leading-[1.2] tracking-tight',
            inverted ? 'text-[#f4f7f5]' : 'text-[#172033]'
          )}
        >
          {title}
        </h1>
        {meta && (
          <div className="mt-2.5 flex items-center gap-2">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
                inverted
                  ? 'border-[#8bff62]/15 bg-[#8bff62]/8'
                  : 'border-[#3d4f62]/40 bg-[#1a2230]/60'
              )}
            >
              <Clock
                className={cn(
                  'size-3',
                  inverted ? 'text-[#8bff62]/70' : 'text-[#5a7a90]'
                )}
              />
              {/* Split the meta string on the last space before the time part to visually separate date from time */}
              {(() => {
                // Expected format: "Sun, Apr 13, 3:10 PM"
                // Split after the day number (last comma) to isolate time
                const commaIdx = meta.lastIndexOf(',')
                if (commaIdx === -1) {
                  return (
                    <span
                      className={cn(
                        'text-[11.5px] font-semibold tracking-wide',
                        inverted ? 'text-[#b6c2bb]' : 'text-[#7b8499]'
                      )}
                    >
                      {meta}
                    </span>
                  )
                }
                const datePart = meta.slice(0, commaIdx)
                const timePart = meta.slice(commaIdx + 1).trim()
                return (
                  <>
                    <span
                      className={cn(
                        'text-[11.5px] font-semibold tracking-wide',
                        inverted ? 'text-[#b6c2bb]' : 'text-[#7b8499]'
                      )}
                    >
                      {datePart}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold',
                        inverted ? 'text-[#8bff62]/50' : 'text-[#4d6070]/80'
                      )}
                    >
                      ·
                    </span>
                    <span
                      className={cn(
                        'text-[11.5px] font-bold',
                        inverted ? 'text-[#8bff62]' : 'text-[#5a7a90]'
                      )}
                    >
                      {timePart}
                    </span>
                  </>
                )
              })()}
            </div>
          </div>
        )}
        {subtitle && (
          <p
            className={cn(
              'mt-2 break-words text-[14.5px] leading-relaxed font-medium',
              inverted ? 'text-[#9ca8a1]' : 'text-[#7b8499]'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Profile Avatar Placeholder (matches mobile layout) */}
      <div className="mt-1 flex-shrink-0">
        <div className="relative size-10 rounded-full border-2 border-[#8bff62]/20 bg-[#131d17] p-0.5 overflow-hidden">
          {user?.imageUrl ? (
            <Image 
              src={user.imageUrl} 
              alt="Profile" 
              fill 
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#8bff62]/20 text-[11px] font-bold text-[#8bff62]">
              {user?.firstName?.[0] || 'P'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
