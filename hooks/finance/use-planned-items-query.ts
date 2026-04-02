'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPlannedItem,
  deletePlannedItem,
  listPlannedItems,
  type CreatePlannedItemInput,
  type ListPlannedItemsParams,
} from '@/api/finance/planned-items.api'
import { useAuthenticatedRequest } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'
import type { PlannedItem } from '@/lib/finance.types'

export function usePlannedItemsQuery(params?: ListPlannedItemsParams) {
  const authenticatedRequest = useAuthenticatedRequest()

  return useQuery({
    queryKey: financeQueryKeys.plannedItems(params),
    queryFn: () => authenticatedRequest((token) => listPlannedItems(token, params)),
  })
}

export function useCreatePlannedItemMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePlannedItemInput) =>
      authenticatedRequest((token) => createPlannedItem(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['planned-items'] })
    },
  })
}

export function useDeletePlannedItemMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deletePlannedItem(token, id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['planned-items'] })

      const snapshots = queryClient
        .getQueriesData<PlannedItem[]>({ queryKey: ['planned-items'] })
        .map(([queryKey, data]) => [queryKey, data] as const)

      snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData<PlannedItem[]>(queryKey, (data ?? []).filter((item) => item.id !== id))
      })

      return { snapshots }
    },
    onError: (_error, _id, context) => {
      context?.snapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['planned-items'] })
    },
  })
}
