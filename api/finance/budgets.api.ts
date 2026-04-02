import api from '@/lib/axios'
import type { Budget } from '@/lib/finance.types'

export async function listBudgets(token: string) {
  const response = await api.get<Budget[]>('/budgets', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export type CreateBudgetInput = {
  categoryId?: string
  name?: string
  amount: string
  currency: string
  alertThreshold?: number
  periodStart: string
  periodEnd: string
}

export type UpdateBudgetInput = Partial<CreateBudgetInput>

export async function createBudget(token: string, input: CreateBudgetInput) {
  const response = await api.post<Budget>('/budgets', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function updateBudget(token: string, id: string, input: UpdateBudgetInput) {
  const response = await api.patch<Budget>(`/budgets/${id}`, input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function deleteBudget(token: string, id: string) {
  const response = await api.delete<Budget>(`/budgets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
