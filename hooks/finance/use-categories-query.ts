'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory, listCategories, type CreateCategoryInput, type ListCategoriesParams } from '@/api/finance/categories.api'
import { useAuthenticatedRequest } from '@/hooks/use-authenticated-request'
import { financeQueryKeys } from '@/hooks/finance/query-keys'
import type { CategoryType } from '@/lib/finance.types'

export function useCategoriesQuery(type?: CategoryType) {
  const authenticatedRequest = useAuthenticatedRequest()
  const params: ListCategoriesParams | undefined = type ? { type } : undefined

  return useQuery({
    queryKey: financeQueryKeys.categories(type),
    queryFn: () => authenticatedRequest((token) => listCategories(token, params)),
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
