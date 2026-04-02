'use client'

import { useAuth } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Account, Transaction, PlannedItem, Budget, Category } from '@/lib/finance.types'
import { useCallback } from 'react'

// --- Auth Helper ---

export function useAuthenticatedRequest() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  return useCallback(
    async <T>(request: (token: string) => Promise<T>) => {
      if (!isLoaded || !isSignedIn) {
        throw new Error('You must be signed in to make this request.')
      }

      const token = await getToken()

      if (!token) {
        throw new Error('Unable to get Clerk token.')
      }

      return request(token)
    },
    [getToken, isLoaded, isSignedIn]
  )
}

// --- Query Keys ---

export const QUERY_KEYS = {
  accounts: ['accounts'],
  transactions: ['transactions'],
  plannedItems: ['planned-items'],
  budgets: ['budgets'],
  categories: ['categories'],
} as const

// --- API Functions ---

const fetchAccounts = (token: string) => 
  api.get<Account[]>('/account', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data)

const fetchTransactions = (token: string) => 
  api.get<{ data: Transaction[] }>('/transaction', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.data)

const fetchPlannedItems = (token: string, isActive = true) => 
  api.get<PlannedItem[]>('/planned-item', { 
    headers: { Authorization: `Bearer ${token}` },
    params: { isActive }
  }).then(res => res.data)

const fetchBudgets = (token: string) => 
  api.get<Budget[]>('/budget', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data)

const fetchCategories = (token: string, type?: string) => 
  api.get<Category[]>('/category', { 
    headers: { Authorization: `Bearer ${token}` },
    params: { type }
  }).then(res => res.data)

// --- Hooks ---

export function useAccountsQuery() {
  const req = useAuthenticatedRequest()
  return useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: () => req(fetchAccounts)
  })
}

export function useTransactionsQuery() {
  const req = useAuthenticatedRequest()
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: () => req(fetchTransactions)
  })
}

export function usePlannedItemsQuery(isActive = true) {
  const req = useAuthenticatedRequest()
  return useQuery({
    queryKey: QUERY_KEYS.plannedItems,
    queryFn: () => req(token => fetchPlannedItems(token, isActive))
  })
}

export function useBudgetsQuery() {
  const req = useAuthenticatedRequest()
  return useQuery({
    queryKey: QUERY_KEYS.budgets,
    queryFn: () => req(fetchBudgets)
  })
}

export function useCategoriesQuery(type?: string) {
  const req = useAuthenticatedRequest()
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => req(token => fetchCategories(token, type))
  })
}
