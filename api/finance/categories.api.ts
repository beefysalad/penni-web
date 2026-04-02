import api from '@/lib/axios'
import type { Category, CategoryType } from '@/lib/finance.types'

export type ListCategoriesParams = {
  type?: CategoryType
}

export type CreateCategoryInput = {
  name: string
  slug: string
  type: CategoryType
  icon?: string
  colorHex?: string
}

export async function listCategories(token: string, params?: ListCategoriesParams) {
  const response = await api.get<Category[]>('/categories', {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function createCategory(token: string, input: CreateCategoryInput) {
  const response = await api.post<Category>('/categories', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
