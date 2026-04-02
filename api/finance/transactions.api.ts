import api from '@/lib/axios'
import type { CategoryType, Transaction, TransactionSource } from '@/lib/finance.types'

export type CreateTransactionInput = {
  accountId?: string
  categoryId?: string
  plannedItemId?: string
  type: CategoryType
  source?: TransactionSource
  title: string
  notes?: string
  amount: string
  currency: string
  transactionAt: string
}

export async function listTransactions(token: string) {
  const response = await api.get<{ data: Transaction[] }>('/transactions', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data.data
}

export async function createTransaction(token: string, input: CreateTransactionInput) {
  const response = await api.post<Transaction>('/transactions', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function deleteTransaction(token: string, id: string) {
  const response = await api.delete<Transaction>(`/transactions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
