'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDebt, deleteDebt, listDebts, type CreateDebtInput } from '@/api/finance/debts.api'
import { useAuthenticatedRequest, useFinanceAuthState } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'

export function useDebtsQuery() {
  const authenticatedRequest = useAuthenticatedRequest()
  const { isAuthReady } = useFinanceAuthState()

  return useQuery({
    queryKey: financeQueryKeys.debts,
    queryFn: () => authenticatedRequest((token) => listDebts(token)),
    enabled: isAuthReady,
  })
}

export function useCreateDebtMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDebtInput) =>
      authenticatedRequest((token) => createDebt(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.debts })
    },
  })
}

export function useDeleteDebtMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteDebt(token, id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.debts })
    },
  })
}
