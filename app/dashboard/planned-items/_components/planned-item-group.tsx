'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FinanceEmptyState, PlannedItemRow } from '@/components/finance/management-components'
import type { CategoryType } from '@/lib/finance.types'
import type { PlannedItemWithRecurringState } from '@/lib/recurring'
import { Trash2, type LucideIcon } from 'lucide-react'
import {
  getCompletedSectionLabel,
  getCompletionActionLabel,
  getPlannedItemGroups,
  getPlannedItemHelperText,
  getPlannedItemStatusLabel,
  getPlannedItemStatusTone,
} from '../_lib/planned-items-page.helpers'

type PlannedItemGroupProps = {
  title: string
  items: PlannedItemWithRecurringState[]
  isLoading: boolean
  emptyState: {
    icon: LucideIcon
    title: string
    description: string
  }
  accentClassName: string
  onComplete: (item: PlannedItemWithRecurringState) => void
  onDelete: (item: PlannedItemWithRecurringState['item']) => void
  isCompleting: boolean
}

export function PlannedItemGroup({
  title,
  items,
  isLoading,
  emptyState,
  accentClassName,
  onComplete,
  onDelete,
  isCompleting,
}: PlannedItemGroupProps) {
  const { sections } = getPlannedItemGroups(items)

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[26px] font-bold tracking-tight text-[#f4f7f5]">
            {title}
          </h3>
          <p className="mt-1 text-[14px] font-medium text-[#7f8c86]">
            {title === 'Recurring expenses'
              ? 'Bills stay expected until you confirm the payment.'
              : 'Recurring income stays projected until the money actually lands.'}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold',
            accentClassName
          )}
        >
          {items.length} items
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-[24px] border border-[#17211c] bg-[#111916]" />
            <div className="h-16 animate-pulse rounded-[24px] border border-[#17211c] bg-[#111916]" />
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="px-1 text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
                  {section.title}
                </p>
                <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
                  {section.items.map((entry, index) => (
                    <PlannedItemRow
                      key={entry.item.id}
                      item={entry.item}
                      scheduledFor={entry.scheduledFor}
                      statusLabel={getPlannedItemStatusLabel(entry.status)}
                      statusTone={getPlannedItemStatusTone(entry.status)}
                      helperText={getPlannedItemHelperText(entry)}
                      isLast={index === section.items.length - 1}
                      action={
                        <div className="flex items-center gap-2">
                          {entry.status !== 'COMPLETE' ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => onComplete(entry)}
                              disabled={isCompleting}
                              className="h-8 rounded-full px-3"
                            >
                              {getCompletionActionLabel(entry.item.type as CategoryType)}
                            </Button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => onDelete(entry.item)}
                            className={cn(
                              'flex size-8 items-center justify-center rounded-full transition',
                              entry.item.type === 'EXPENSE'
                                ? 'bg-[#241719] hover:bg-[#311d22]'
                                : 'bg-[#16211b] hover:bg-[#1d2a20]'
                            )}
                            aria-label={`Delete ${entry.item.title}`}
                          >
                            <Trash2
                              className={cn(
                                'size-4',
                                entry.item.type === 'EXPENSE'
                                  ? 'text-[#ff8a94]'
                                  : 'text-[#41d6b2]'
                              )}
                            />
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <FinanceEmptyState
            icon={emptyState.icon}
            title={emptyState.title}
            description={emptyState.description}
          />
        )}
      </div>
    </div>
  )
}
