'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import {
  TransactionRow,
  AccountSkeletonCard,
} from '@/components/finance/finance-components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/ui/mobile-sheet'
import { Pill } from '@/components/ui/pill'
import FormErrorMessage from '@/components/ui/form-error-message'
import { cn } from '@/lib/utils'
import {
  useTransactionsQuery,
  useCreateTransactionMutation,
  useCreateTransferMutation,
  useDeleteTransactionMutation,
} from '@/hooks/finance/use-transactions-query'
import { useAccountsQuery } from '@/hooks/finance/use-accounts-query'
import { useCategoriesQuery } from '@/hooks/finance/use-categories-query'
import { groupTransactionsIntoSections } from '@/lib/selectors'
import { TYPE_FILTERS, type TypeFilter } from '@/lib/constants'
import {
  getAccountAvailableCredit,
  type CategoryType,
} from '@/lib/finance.types'
import Link from 'next/link'
import {
  ReceiptText,
  Search,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  WalletCards,
  Calendar,
} from 'lucide-react'

type TransactionForm = {
  mode: 'EXPENSE' | 'INCOME' | 'TRANSFER'
  title: string
  amount: string
  accountId: string
  toAccountId: string
  categoryId: string
  transactionAt: string
  notes: string
}

const DEFAULT_FORM: TransactionForm = {
  mode: 'EXPENSE',
  title: '',
  amount: '',
  accountId: '',
  toAccountId: '',
  categoryId: '',
  transactionAt: new Date().toISOString().slice(0, 10),
  notes: '',
}

const transactionFormSchema = z
  .object({
    mode: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
    title: z.string(),
    amount: z
      .string()
      .trim()
      .min(1, 'Enter a valid amount.')
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        'Enter a valid amount.'
      ),
    accountId: z.string(),
    toAccountId: z.string(),
    categoryId: z.string(),
    transactionAt: z.string().min(1, 'Choose a date.'),
    notes: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'TRANSFER') {
      if (!value.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountId'],
          message: 'Choose a source account.',
        })
      }

      if (!value.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['toAccountId'],
          message: 'Choose a destination account.',
        })
      }

      if (
        value.accountId &&
        value.toAccountId &&
        value.accountId === value.toAccountId
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['toAccountId'],
          message: 'Pick two different accounts for this transfer.',
        })
      }

      return
    }

    if (!value.title.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['title'],
        message: 'Transaction title is required.',
      })
    }
  })

function toIsoDate(dateValue: string) {
  return new Date(`${dateValue}T12:00:00`).toISOString()
}

export default function ActivityPage() {
  const searchParams = useSearchParams()
  const transactionsQuery = useTransactionsQuery()
  const accountsQuery = useAccountsQuery()
  const expenseCategoriesQuery = useCategoriesQuery('EXPENSE')
  const incomeCategoriesQuery = useCategoriesQuery('INCOME')
  const createTransactionMutation = useCreateTransactionMutation()
  const createTransferMutation = useCreateTransferMutation()
  const deleteTransactionMutation = useDeleteTransactionMutation()

  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: DEFAULT_FORM,
  })

  const mode = useWatch({ control, name: 'mode' })
  const accountId = useWatch({ control, name: 'accountId' })
  const toAccountId = useWatch({ control, name: 'toAccountId' })
  const categoryId = useWatch({ control, name: 'categoryId' })
  const paymentIntent = searchParams.get('intent') === 'card-payment'
  const isCardPayment = mode === 'TRANSFER' && paymentIntent

  const allTransactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data]
  )
  const accounts = accountsQuery.data ?? []
  const transferSourceAccounts = useMemo(
    () => accounts.filter((account) => account.type !== 'CREDIT_CARD'),
    [accounts]
  )
  const categories =
    mode === 'INCOME'
      ? (incomeCategoriesQuery.data ?? [])
      : (expenseCategoriesQuery.data ?? [])
  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const account of accounts) {
      map.set(account.id, account.name)
    }
    return map
  }, [accounts])
  const accountTypeMap = useMemo(() => {
    const map = new Map<string, (typeof accounts)[number]['type']>()
    for (const account of accounts) {
      map.set(account.id, account.type)
    }
    return map
  }, [accounts])
  const cashFlowTransactions = useMemo(
    () =>
      allTransactions.filter(
        (transaction) => transaction.source !== 'TRANSFER'
      ),
    [allTransactions]
  )

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

  const sections = useMemo(
    () => groupTransactionsIntoSections(filteredTransactions),
    [filteredTransactions]
  )
  const totalIncome = useMemo(
    () =>
      cashFlowTransactions
        .filter((transaction) => transaction.type === 'INCOME')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [cashFlowTransactions]
  )
  const totalExpense = useMemo(
    () =>
      cashFlowTransactions
        .filter((transaction) => transaction.type === 'EXPENSE')
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
    [cashFlowTransactions]
  )
  const netCashFlow = totalIncome - totalExpense

  useEffect(() => {
    if (mode !== 'TRANSFER') {
      return
    }

    if (
      accountId &&
      !transferSourceAccounts.some((account) => account.id === accountId)
    ) {
      setValue('accountId', '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
  }, [mode, accountId, setValue, transferSourceAccounts])

  useEffect(() => {
    const requestedMode = searchParams.get('mode')
    const requestedToAccountId = searchParams.get('toAccountId')

    if (requestedMode !== 'TRANSFER') {
      return
    }

    setShowComposer(true)
    setValue('mode', 'TRANSFER', { shouldDirty: true })
    setValue('toAccountId', requestedToAccountId ?? '', { shouldDirty: true })

    if (!accountId) {
      const fallbackSourceAccount =
        transferSourceAccounts.find(
          (account) => account.id !== requestedToAccountId
        ) ?? transferSourceAccounts[0]

      if (fallbackSourceAccount) {
        setValue('accountId', fallbackSourceAccount.id, { shouldDirty: true })
      }
    }

    clearErrors(['title', 'amount', 'accountId', 'toAccountId', 'categoryId'])
  }, [
    accountId,
    clearErrors,
    searchParams,
    setValue,
    transferSourceAccounts,
  ])

  const handleCreateTransaction = (values: TransactionForm) => {
    const title = values.title.trim()
    const amount = Number(values.amount)
    const selectedAccount =
      accounts.find((account) => account.id === values.accountId) ?? null

    if (
      values.mode === 'EXPENSE' &&
      selectedAccount?.type === 'CREDIT_CARD' &&
      amount > Number(getAccountAvailableCredit(selectedAccount) ?? 0)
    ) {
      setError('amount', {
        type: 'manual',
        message: "Charge exceeds the card's available credit.",
      })
      return
    }

    if (
      values.mode === 'EXPENSE' &&
      selectedAccount &&
      selectedAccount.type !== 'CREDIT_CARD' &&
      amount > Number(selectedAccount.balance ?? 0)
    ) {
      setError('amount', {
        type: 'manual',
        message: "Amount exceeds the account's available balance.",
      })
      return
    }

    clearErrors('amount')

    if (values.mode === 'TRANSFER') {
      const fromAccount =
        accounts.find((account) => account.id === values.accountId) ?? null
      const toAccount =
        accounts.find((account) => account.id === values.toAccountId) ?? null

      if (
        fromAccount &&
        fromAccount.type !== 'CREDIT_CARD' &&
        amount > Number(fromAccount.balance ?? 0)
      ) {
        setError('amount', {
          type: 'manual',
          message: "Transfer amount exceeds the account's available balance.",
        })
        return
      }

      if (
        toAccount?.type === 'CREDIT_CARD' &&
        amount > Math.max(0, Number(toAccount.balance ?? 0))
      ) {
        setError('amount', {
          type: 'manual',
          message: "Payment exceeds the card's outstanding balance.",
        })
        return
      }

      createTransferMutation.mutate(
        {
          fromAccountId: values.accountId,
          toAccountId: values.toAccountId,
          title: title || undefined,
          notes: values.notes.trim() || undefined,
          amount: amount.toFixed(2),
          transactionAt: toIsoDate(values.transactionAt),
        },
        {
          onSuccess: () => {
            toast.success(isCardPayment ? 'Card payment recorded.' : 'Transfer recorded.')
            reset({
              ...DEFAULT_FORM,
              mode: values.mode,
              transactionAt: values.transactionAt,
            })
            setShowComposer(false)
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : isCardPayment
                  ? 'Could not record payment.'
                  : 'Could not create transfer.'
            )
          },
        }
      )
      return
    }

    createTransactionMutation.mutate(
      {
        accountId: values.accountId || undefined,
        categoryId: values.categoryId || undefined,
        type: values.mode as CategoryType,
        title,
        notes: values.notes.trim() || undefined,
        amount: amount.toFixed(2),
        currency: 'PHP',
        transactionAt: toIsoDate(values.transactionAt),
      },
      {
        onSuccess: () => {
          toast.success(`${title} added to activity.`)
          reset({
            ...DEFAULT_FORM,
            mode: values.mode,
            transactionAt: values.transactionAt,
          })
          setShowComposer(false)
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Could not create transaction.'
          )
        },
      }
    )
  }

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleCreateTransaction)}
      className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="flex items-start justify-between gap-4 max-lg:hidden">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            Quick capture
          </p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
            {isCardPayment ? 'Pay card' : 'Add a transaction'}
          </h2>
        </div>
        <div className="rounded-full bg-[#18221d] px-3 py-1 text-[11px] font-bold text-[#8bff62]">
          Live
        </div>
      </div>

      <div className="mt-6 grid gap-4 max-lg:mt-0 xl:grid-cols-2">
        <div className="space-y-2 lg:hidden">
          <Label>Type</Label>
          <div className="flex rounded-[20px] bg-[#0d1411] p-1.5">
            {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((item) => {
              const selected = mode === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={async () => {
                    const nextAccountId =
                      item === 'TRANSFER' &&
                      !transferSourceAccounts.some((a) => a.id === accountId)
                        ? ''
                        : accountId
                    setValue('mode', item, { shouldDirty: true })
                    setValue('categoryId', '', { shouldDirty: true })
                    setValue('accountId', nextAccountId, { shouldDirty: true })
                    setValue('toAccountId', '', { shouldDirty: true })
                    clearErrors([
                      'title',
                      'amount',
                      'accountId',
                      'toAccountId',
                      'categoryId',
                    ])
                  }}
                  className={cn(
                    'flex-1 rounded-[16px] px-4 py-3 text-[15px] font-semibold transition',
                    selected ? 'bg-[#8bff62] text-[#07110a]' : 'text-[#97a49c]'
                  )}
                >
                  {item === 'EXPENSE'
                    ? 'Expense'
                    : item === 'INCOME'
                      ? 'Income'
                      : isCardPayment
                        ? 'Payment'
                        : 'Transfer'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="hidden space-y-2 lg:block">
          <Label htmlFor="transaction-type">Type</Label>
          <select
            id="transaction-type"
            value={mode}
            onChange={async (e) => {
              const newMode = e.target.value as TransactionForm['mode']
              const nextAccountId =
                newMode === 'TRANSFER' &&
                !transferSourceAccounts.some((a) => a.id === accountId)
                  ? ''
                  : accountId
              setValue('mode', newMode, { shouldDirty: true })
              setValue('categoryId', '', { shouldDirty: true })
              setValue('accountId', nextAccountId, { shouldDirty: true })
              setValue('toAccountId', '', { shouldDirty: true })
              clearErrors([
                'title',
                'amount',
                'accountId',
                'toAccountId',
                'categoryId',
              ])
            }}
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">{isCardPayment ? 'Payment' : 'Transfer'}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-date">Date</Label>
          <Input
            id="transaction-date"
            type="date"
            {...register('transactionAt')}
          />
          <FormErrorMessage message={errors.transactionAt?.message} />
        </div>

        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="transaction-title">
            {mode === 'TRANSFER' ? (isCardPayment ? 'Payment note' : 'Label') : 'Title'}
          </Label>
          <Input
            id="transaction-title"
            {...register('title')}
            placeholder={
              mode === 'TRANSFER'
                ? isCardPayment
                  ? 'e.g. Partial payment, Paid from payroll'
                  : 'e.g. ATM withdrawal, Move to savings'
                : 'e.g. Groceries, Salary, Internet bill'
            }
          />
          <FormErrorMessage message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-amount">{isCardPayment ? 'Payment amount' : 'Amount'}</Label>
          <Input
            id="transaction-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            {...register('amount')}
            placeholder="0.00"
          />
          <FormErrorMessage message={errors.amount?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-account">
            {mode === 'TRANSFER' ? (isCardPayment ? 'Pay from' : 'From account') : 'Account'}
          </Label>
          <select
            id="transaction-account"
            value={accountId}
            onChange={(e) =>
              setValue('accountId', e.target.value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            <option value="">
              {mode === 'TRANSFER'
                ? 'Choose source account'
                : 'Optional account'}
            </option>
            {(mode === 'TRANSFER' ? transferSourceAccounts : accounts).map(
              (account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              )
            )}
          </select>
          <FormErrorMessage message={errors.accountId?.message} />
        </div>

        {mode === 'TRANSFER' ? (
          <div className="space-y-2">
            <Label htmlFor="transaction-to-account">{isCardPayment ? 'Card' : 'To account'}</Label>
            <select
              id="transaction-to-account"
              value={toAccountId}
              onChange={(e) =>
                setValue('toAccountId', e.target.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
            >
              <option value="">{isCardPayment ? 'Choose card to pay' : 'Choose destination account'}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <FormErrorMessage message={errors.toAccountId?.message} />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="transaction-category">Category</Label>
            <select
              id="transaction-category"
              value={categoryId}
              onChange={(e) =>
                setValue('categoryId', e.target.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] transition outline-none focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
            >
              <option value="">Optional category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="transaction-notes">Notes</Label>
          <Input
            id="transaction-notes"
            {...register('notes')}
            placeholder="Optional note"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          disabled={
            createTransactionMutation.isPending ||
            createTransferMutation.isPending
          }
        >
          {createTransactionMutation.isPending ||
          createTransferMutation.isPending
            ? 'Saving...'
            : mode === 'TRANSFER'
              ? isCardPayment
                ? 'Save payment'
                : 'Save transfer'
              : 'Save transaction'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            reset(DEFAULT_FORM)
            setShowComposer(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Transaction history"
          title="Activity"
          subtitle="Review recent money movement, scan categories, and add a new entry fast."
          inverted
        />
      </DashboardHeaderShell>

      <div className="animate-in fade-in flex flex-col gap-5 px-4 pt-6 pb-28 duration-500 md:px-6 lg:px-8">
        {transactionsQuery.isLoading ? (
          <div className="h-48 w-full animate-pulse rounded-[30px] bg-[#111916]" />
        ) : (
          <div className="rounded-[30px] border border-[#1b2a21] bg-[#111916] p-5 shadow-xl shadow-black/20">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[#73827a]">
                  Net cash flow
                </p>
                <h2
                  className={cn(
                    'mt-2 text-[38px] leading-none font-bold tracking-tight',
                    netCashFlow < 0 ? 'text-[#ff8a94]' : 'text-[#41d6b2]'
                  )}
                >
                  {netCashFlow < 0 ? '-' : '+'}₱
                  {Math.abs(netCashFlow).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
                <ArrowUpRight className="size-5 text-[#41d6b2]" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="flex-1 rounded-[24px] bg-[#18221d] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#1f3325]">
                  <ArrowUpRight className="size-5 text-[#41d6b2]" />
                </div>
                <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#93a19a] uppercase">
                  Income
                </p>
                <p className="mt-2 text-[17px] leading-tight font-bold text-[#41d6b2]">
                  ₱
                  {totalIncome.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex-1 rounded-[24px] bg-[#1d1518] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#2a1b20]">
                  <ArrowDownLeft className="size-5 text-[#ff8a94]" />
                </div>
                <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#93a19a] uppercase">
                  Expenses
                </p>
                <p className="mt-2 text-[17px] leading-tight font-bold text-[#ff8a94]">
                  ₱
                  {totalExpense.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex-1 rounded-[24px] bg-[#1f1b0f] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#2a2412]">
                  <ArrowRightLeft className="size-5 text-[#ffd66b]" />
                </div>
                <p className="mt-4 text-[10px] font-bold tracking-[1.8px] text-[#c7b27a] uppercase">
                  Transfers
                </p>
                <p className="mt-2 text-[17px] leading-tight font-bold text-[#f5deb3]">
                  Balance moves only
                </p>
              </div>
            </div>

            <div className="no-scrollbar mt-5 flex flex-row gap-2.5 overflow-x-auto pb-1">
              <Link
                href="/dashboard/accounts"
                className="flex flex-row items-center gap-2 rounded-full bg-[#18221d] px-4 py-2 whitespace-nowrap transition-colors hover:bg-[#202c26]"
              >
                <WalletCards className="size-3.5 text-[#8bff62]" />
                <span className="text-[11px] font-bold text-[#93a19a]">
                  Accounts
                </span>
              </Link>
              <Link
                href="/dashboard/planned-items"
                className="flex flex-row items-center gap-2 rounded-full bg-[#18221d] px-4 py-2 whitespace-nowrap transition-colors hover:bg-[#202c26]"
              >
                <Calendar className="size-3.5 text-[#41d6b2]" />
                <span className="text-[11px] font-bold text-[#93a19a]">
                  Plan ahead
                </span>
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#4a5650]" />
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[#17211c] bg-[#131b17] py-3.5 pr-4 pl-11 text-[15px] text-[#f4f7f5] placeholder:text-[#4a5650] focus:border-[#2a3a31] focus:ring-1 focus:ring-[#2a3a31] focus:outline-none"
                />
              </div>

              <Button
                onClick={() => setShowComposer((current) => !current)}
                className="lg:self-stretch"
              >
                <Plus className="size-4" />
                {showComposer ? 'Close composer' : 'New transaction'}
              </Button>
            </div>

            <div className="no-scrollbar flex flex-row items-center gap-2 overflow-x-auto pb-1">
              {TYPE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveTypeFilter(filter as TypeFilter)}
                  className="focus:outline-none"
                >
                  <Pill
                    label={filter}
                    variant={
                      activeTypeFilter === filter ? 'selected' : 'default'
                    }
                    className="cursor-pointer transition-all active:scale-95"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {showComposer ? (
          <div className="hidden lg:block">{composerContent}</div>
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
                <h4 className="px-1 text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
                  {section.title}
                </h4>
                <div className="overflow-hidden rounded-[24px] border border-[#17211c] bg-[#111916]">
                  {section.data.map((transaction, index) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      accountLabel={
                        transaction.accountId
                          ? (accountNameMap.get(transaction.accountId) ?? null)
                          : null
                      }
                      accountType={
                        transaction.accountId
                          ? (accountTypeMap.get(transaction.accountId) ?? null)
                          : null
                      }
                      isLast={index === section.data.length - 1}
                      action={
                        <button
                          type="button"
                          onClick={() =>
                            deleteTransactionMutation.mutate(transaction.id, {
                              onSuccess: () =>
                                toast.success(`${transaction.title} deleted.`),
                              onError: (error) =>
                                toast.error(
                                  error instanceof Error
                                    ? error.message
                                    : 'Could not delete transaction.'
                                ),
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
            <div className="flex flex-col items-center justify-center rounded-[30px] border border-[#17211c] bg-[#0f1512] px-6 py-20 text-center">
              <div className="mb-5 flex size-16 items-center justify-center rounded-full border border-[#213227] bg-[#16211b] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <ReceiptText
                  className="size-8 text-[#8bff62]"
                  strokeWidth={2.2}
                />
              </div>
              <h4 className="text-[18px] font-bold text-[#f4f7f5]">
                No history found
              </h4>
              <p className="mt-2 max-w-[240px] text-[14px] leading-relaxed font-medium text-[#7f8c86]">
                {searchQuery
                  ? `No matches for "${searchQuery}"`
                  : "You haven't logged any transactions yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      <MobileSheet
        open={showComposer}
        onClose={() => setShowComposer(false)}
        eyebrow={isCardPayment ? 'Credit card' : 'Quick capture'}
        title={
          isCardPayment
            ? 'Pay card'
            : `New ${mode === 'INCOME' ? 'income' : mode === 'TRANSFER' ? 'transfer' : 'expense'}`
        }
      >
        {composerContent}
      </MobileSheet>
    </>
  )
}
