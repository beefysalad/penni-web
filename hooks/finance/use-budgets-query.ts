'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBudget, deleteBudget, listBudgets, updateBudget, type CreateBudgetInput, type UpdateBudgetInput } from '@/api/finance/budgets.api'
import { useAuthenticatedRequest } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'

export function useBudgetsQuery() {
  const authenticatedRequest = useAuthenticatedRequest()

  return useQuery({
    queryKey: financeQueryKeys.budgets,
    queryFn: () => authenticatedRequest((token) => listBudgets(token)),
  })
}

export function useCreateBudgetMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      authenticatedRequest((token) => createBudget(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.budgets })
    },
  })
}

export function useUpdateBudgetMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) =>
      authenticatedRequest((token) => updateBudget(token, id, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.budgets })
    },
  })
}

export function useDeleteBudgetMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteBudget(token, id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.budgets })
    },
  })
}
