import type { CategoryType } from '@/lib/finance.types'
import type { ListPlannedItemsParams } from '@/api/finance/planned-items.api'

export const financeQueryKeys = {
  accounts: ['accounts'] as const,
  transactions: ['transactions'] as const,
  budgets: ['budgets'] as const,
  categories: (type?: CategoryType) => ['categories', type ?? 'all'] as const,
  plannedItems: (params?: ListPlannedItemsParams) => ['planned-items', params ?? {}] as const,
}
