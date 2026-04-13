'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory, listCategories, type CreateCategoryInput, type ListCategoriesParams } from '@/api/finance/categories.api'
import { useAuthenticatedRequest, useFinanceAuthState } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'
import type { CategoryType } from '@/lib/finance.types'

export function useCategoriesQuery(type?: CategoryType) {
  const authenticatedRequest = useAuthenticatedRequest()
  const { isAuthReady } = useFinanceAuthState()
  const params: ListCategoriesParams | undefined = type ? { type } : undefined

  return useQuery({
    queryKey: financeQueryKeys.categories(type),
    queryFn: () => authenticatedRequest((token) => listCategories(token, params)),
    enabled: isAuthReady,
  })
}

export function useCreateCategoryMutation() {
  const authenticatedRequest = useAuthenticatedRequest()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      authenticatedRequest((token) => createCategory(token, input)),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: financeQueryKeys.categories(variables.type) }),
      ])
    },
  })
}
