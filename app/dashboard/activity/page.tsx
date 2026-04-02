'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { TransactionRow, AccountSkeletonCard } from '@/components/finance/finance-components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pill } from '@/components/ui/pill'
import { cn } from '@/lib/utils'
import { useTransactionsQuery, useCreateTransactionMutation, useDeleteTransactionMutation } from '@/hooks/finance/use-transactions-query'
import { useAccountsQuery } from '@/hooks/finance/use-accounts-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { groupTransactionsIntoSections } from '@/lib/selectors'
import { TYPE_FILTERS, type TypeFilter } from '@/lib/constants'
import type { CategoryType } from '@/lib/finance.types'
import Link from 'next/link'
import { ReceiptText, Search, Plus, Trash2, ArrowUpRight, ArrowDownLeft, WalletCards, Calendar } from 'lucide-react'

type TransactionForm = {
  type: CategoryType
  title: string
  amount: string
  accountId: string
  categoryId: string
  transactionAt: string
  notes: string
}

const DEFAULT_FORM: TransactionForm = {
  type: 'EXPENSE',
  title: '',
  amount: '',
  accountId: '',
  categoryId: '',
  transactionAt: new Date().toISOString().slice(0, 10),
  notes: '',
}

function toIsoDate(dateValue: string) {
  return new Date(`${dateValue}T12:00:00`).toISOString()
}

export default function ActivityPage() {
  const transactionsQuery = useTransactionsQuery()
  const accountsQuery = useAccountsQuery()
  const expenseCategoriesQuery = useCategoriesQuery('EXPENSE')
  const incomeCategoriesQuery = useCategoriesQuery('INCOME')
  const createTransactionMutation = useCreateTransactionMutation()
  const deleteTransactionMutation = useDeleteTransactionMutation()

  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [form, setForm] = useState<TransactionForm>(DEFAULT_FORM)

  const allTransactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data])
  const accounts = accountsQuery.data ?? []
  const categories = form.type === 'INCOME' ? incomeCategoriesQuery.data ?? [] : expenseCategoriesQuery.data ?? []

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesType =
        activeTypeFilter === 'All' ||
        (activeTypeFilter === 'Expenses' && t.type === 'EXPENSE') ||
        (activeTypeFilter === 'Income' && t.type === 'INCOME')
      return matchesSearch && matchesType
    })
  }, [allTransactions, searchQuery, activeTypeFilter])

  const sections = useMemo(() => groupTransactionsIntoSections(filteredTransactions), [filteredTransactions])
  const totalIncome = useMemo(
    () => allTransactions.filter((transaction) => transaction.type === 'INCOME').reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [allTransactions]
  )
  const totalExpense = useMemo(
    () => allTransactions.filter((transaction) => transaction.type === 'EXPENSE').reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [allTransactions]
  )
  const netCashFlow = totalIncome - totalExpense

  const handleCreateTransaction = () => {
    const title = form.title.trim()
    const amount = Number(form.amount)

    if (!title) {
      toast.error('Transaction title is required.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount.')
      return
    }

    createTransactionMutation.mutate(
      {
        accountId: form.accountId || undefined,
        categoryId: form.categoryId || undefined,
        type: form.type,
        title,
        notes: form.notes.trim() || undefined,
        amount: amount.toFixed(2),
        currency: 'PHP',
        transactionAt: toIsoDate(form.transactionAt),
      },
      {
        onSuccess: () => {
          toast.success(`${title} added to activity.`)
          setForm((current) => ({ ...DEFAULT_FORM, type: current.type, transactionAt: current.transactionAt }))
          setShowComposer(false)
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Could not create transaction.')
        },
      }
    )
  }

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Transaction history"
          title="Activity"
          subtitle="Review your income and expenses. Track where every penny goes."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-5 px-4 pt-6 pb-28 md:px-6 lg:px-8 animate-in fade-in duration-500">
        {transactionsQuery.isLoading ? (
          <div className="h-48 w-full rounded-[30px] bg-[#111916] animate-pulse" />
        ) : (
          <div className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5 shadow-xl shadow-black/20">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[#73827a]">Net cash flow</p>
                <h2
                  className={cn(
                    'mt-2 text-[38px] leading-none font-bold tracking-tight',
                    netCashFlow < 0 ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
                  )}
                >
                  {netCashFlow < 0 ? '-' : '+'}₱{Math.abs(netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
                <ArrowUpRight className="size-5 text-[#41d6b2]" />
              </div>
            </div>

            <div className="mt-6 flex flex-row gap-3">
              <div className="flex-1 rounded-[24px] bg-[#18221d] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#1f3325]">
                  <ArrowUpRight className="size-5 text-[#41d6b2]" />
                </div>
                <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#93a19a] uppercase">Income</p>
                <p className="mt-2 text-[17px] leading-tight font-bold text-[#41d6b2]">
                  ₱{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex-1 rounded-[24px] bg-[#1d1518] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#2a1b20]">
                  <ArrowDownLeft className="size-5 text-[#ff8a94]" />
                </div>
                <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#93a19a] uppercase">Expenses</p>
                <p className="mt-2 text-[17px] leading-tight font-bold text-[#ff8a94]">
                  ₱{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="no-scrollbar mt-5 flex flex-row gap-2.5 overflow-x-auto pb-1">
              <Link
                href="/dashboard/accounts"
                className="flex flex-row items-center gap-2 rounded-full bg-[#18221d] px-4 py-2 whitespace-nowrap transition-colors hover:bg-[#202c26]"
              >
                <WalletCards className="size-3.5 text-[#8bff62]" />
                <span className="text-[11px] font-bold text-[#93a19a]">Accounts</span>
              </Link>
              <Link
                href="/dashboard/planned-items"
                className="flex flex-row items-center gap-2 rounded-full bg-[#18221d] px-4 py-2 whitespace-nowrap transition-colors hover:bg-[#202c26]"
              >
                <Calendar className="size-3.5 text-[#41d6b2]" />
                <span className="text-[11px] font-bold text-[#93a19a]">Plan ahead</span>
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#4a5650]" />
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[#17211c] bg-[#131b17] py-3.5 pl-11 pr-4 text-[15px] text-[#f4f7f5] placeholder:text-[#4a5650] focus:border-[#2a3a31] focus:outline-none focus:ring-1 focus:ring-[#2a3a31]"
                />
              </div>

              <Button onClick={() => setShowComposer((current) => !current)} className="lg:self-stretch">
                <Plus className="size-4" />
                {showComposer ? 'Close composer' : 'New transaction'}
              </Button>
            </div>

            <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {TYPE_FILTERS.map((filter) => (
                <button key={filter} onClick={() => setActiveTypeFilter(filter as TypeFilter)} className="focus:outline-none">
                  <Pill
                    label={filter}
                    variant={activeTypeFilter === filter ? 'selected' : 'default'}
                    className="cursor-pointer transition-all active:scale-95"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {showComposer ? (
          <div className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">Quick capture</p>
                <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">Add a transaction</h2>
              </div>
              <div className="rounded-full bg-[#18221d] px-3 py-1 text-[11px] font-bold text-[#8bff62]">
                Live
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transaction-type">Type</Label>
                <select
                  id="transaction-type"
                  value={form.type}
                  onChange={(e) => setForm((current) => ({ ...current, type: e.target.value as CategoryType, categoryId: '' }))}
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-date">Date</Label>
                <Input id="transaction-date" type="date" value={form.transactionAt} onChange={(e) => setForm((current) => ({ ...current, transactionAt: e.target.value }))} />
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="transaction-title">Title</Label>
                <Input id="transaction-title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="e.g. Groceries, Salary, Internet bill" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-amount">Amount</Label>
                <Input id="transaction-amount" type="number" value={form.amount} onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))} placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-account">Account</Label>
                <select
                  id="transaction-account"
                  value={form.accountId}
                  onChange={(e) => setForm((current) => ({ ...current, accountId: e.target.value }))}
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
                >
                  <option value="">Optional account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-category">Category</Label>
                <select
                  id="transaction-category"
                  value={form.categoryId}
                  onChange={(e) => setForm((current) => ({ ...current, categoryId: e.target.value }))}
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
                >
                  <option value="">Optional category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="transaction-notes">Notes</Label>
                <Input id="transaction-notes" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Optional note" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleCreateTransaction} disabled={createTransactionMutation.isPending}>
                {createTransactionMutation.isPending ? 'Saving...' : 'Save transaction'}
              </Button>
              <Button variant="secondary" onClick={() => setShowComposer(false)}>Cancel</Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-6">
          {transactionsQuery.isLoading ? (
            <div className="space-y-4">
              <AccountSkeletonCard />
              <AccountSkeletonCard />
              <AccountSkeletonCard />
            </div>
          ) : sections.length > 0 ? (
            sections.map((section) => (
              <div key={section.title} className="flex flex-col gap-2.5">
                <h4 className="px-1 text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">{section.title}</h4>
                <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
                  {section.data.map((transaction, index) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      isLast={index === section.data.length - 1}
                      action={
                        <button
                          type="button"
                          onClick={() =>
                            deleteTransactionMutation.mutate(transaction.id, {
                              onSuccess: () => toast.success(`${transaction.title} deleted.`),
                              onError: (error) =>
                                toast.error(error instanceof Error ? error.message : 'Could not delete transaction.'),
                            })
                          }
                          className="flex size-8 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
                          aria-label={`Delete ${transaction.title}`}
                        >
                          <Trash2 className="size-4 text-[#ff8a94]" />
                        </button>
                      }
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#0f1512] py-20 px-6 text-center border border-[#17211c]">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#18221d] mb-5">
                <ReceiptText className="size-8 text-[#1b2a21]" />
              </div>
              <h4 className="text-[18px] font-bold text-[#f4f7f5]">No history found</h4>
              <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86] max-w-[240px]">
                {searchQuery ? `No matches for "${searchQuery}"` : "You haven't logged any transactions yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
