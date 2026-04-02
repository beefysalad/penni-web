import api from '@/lib/axios'
import type { Account, AccountType } from '@/lib/finance.types'

export type CreateAccountInput = {
  name: string
  type: AccountType
  currency: string
  balance: string
  institutionName?: string
  creditLimit?: string
  availableCredit?: string
  dueDayOfMonth?: number
}

export type UpdateAccountInput = Partial<CreateAccountInput>

export async function listAccounts(token: string) {
  const response = await api.get<Account[]>('/accounts', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function createAccount(token: string, input: CreateAccountInput) {
  const response = await api.post<Account>('/accounts', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function updateAccount(token: string, id: string, input: UpdateAccountInput) {
  const response = await api.patch<Account>(`/accounts/${id}`, input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

export async function deleteAccount(token: string, id: string) {
  const response = await api.delete<Account>(`/accounts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
