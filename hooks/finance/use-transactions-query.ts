'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, deleteTransaction, listTransactions, type CreateTransactionInput } from '@/api/finance/transactions.api'
import { useAuthenticatedRequest } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'
import type { Transaction } from '@/lib/finance.types'

export function useTransactionsQuery() {
  const authenticatedRequest = useAuthenticatedRequest()

  return useQuery({
    queryKey: financeQueryKeys.transactions,
    queryFn: () => authenticatedRequest((token) => listTransactions(token)),
  })
}

export function useCreateTransactionMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      authenticatedRequest((token) => createTransaction(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransactionMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteTransaction(token, id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })
      const snapshots = queryClient
        .getQueriesData<Transaction[]>({ queryKey: ['transactions'] })
        .map(([queryKey, data]) => [queryKey, data] as const)

      snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData<Transaction[]>(queryKey, (data ?? []).filter((item) => item.id !== id))
      })

      return { snapshots }
    },
    onError: (_error, _id, context) => {
      context?.snapshots?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
