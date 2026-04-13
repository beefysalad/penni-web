'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAccount, deleteAccount, listAccounts, updateAccount, type CreateAccountInput, type UpdateAccountInput } from '@/api/finance/accounts.api'
import { useAuthenticatedRequest, useFinanceAuthState } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'
import type { Account } from '@/lib/finance.types'

export function useAccountsQuery() {
  const authenticatedRequest = useAuthenticatedRequest()
  const { isAuthReady } = useFinanceAuthState()

  return useQuery({
    queryKey: financeQueryKeys.accounts,
    queryFn: () => authenticatedRequest((token) => listAccounts(token)),
    enabled: isAuthReady,
  })
}

export function useCreateAccountMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      authenticatedRequest((token) => createAccount(token, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts })
    },
  })
}

export function useUpdateAccountMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      authenticatedRequest((token) => updateAccount(token, id, input)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts })
    },
  })
}

export function useDeleteAccountMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authenticatedRequest((token) => deleteAccount(token, id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: financeQueryKeys.accounts })

      const previousAccounts = queryClient.getQueryData<Account[]>(financeQueryKeys.accounts)

      queryClient.setQueryData<Account[]>(financeQueryKeys.accounts, (current = []) =>
        current.filter((account) => account.id !== id)
      )

      return { previousAccounts }
    },
    onError: (_error, _id, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(financeQueryKeys.accounts, context.previousAccounts)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts })
    },
  })
}
