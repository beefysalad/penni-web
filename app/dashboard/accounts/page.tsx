'use client'

import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { AccountCard, AccountSkeletonCard, NetWorthCard } from '@/components/finance/finance-components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pill } from '@/components/ui/pill'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/ui/mobile-sheet'
import FormErrorMessage from '@/components/ui/form-error-message'
import { cn } from '@/lib/utils'
import {
  useAccountsQuery,
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useUpdateAccountMutation,
} from '@/hooks/finance/use-accounts-query'
import { getNetWorth, getTypeBreakdown } from '@/lib/selectors'
import {
  ACCOUNT_CURRENCY_OPTIONS,
  ACCOUNT_FILTERS,
  ACCOUNT_TYPE_OPTIONS,
  type AccountFilter,
} from '@/lib/constants'
import type { Account, AccountType } from '@/lib/finance.types'
import { Pencil, Plus, Trash2, WalletCards } from 'lucide-react'

type AccountForm = {
  name: string
  type: AccountType
  currency: string
  balance: string
  institutionName: string
  creditLimit: string
  availableCredit: string
  dueDayOfMonth: string
}

const DEFAULT_FORM: AccountForm = {
  name: '',
  type: 'BANK_ACCOUNT',
  currency: 'PHP',
  balance: '',
  institutionName: '',
  creditLimit: '',
  availableCredit: '',
  dueDayOfMonth: '',
}

function mapAccountToForm(account: Account): AccountForm {
  return {
    name: account.name,
    type: account.type,
    currency: account.currency,
    balance: String(account.balance ?? ''),
    institutionName: account.institutionName ?? '',
    creditLimit: account.creditLimit ? String(account.creditLimit) : '',
    availableCredit: account.availableCredit ? String(account.availableCredit) : '',
    dueDayOfMonth: account.dueDayOfMonth ? String(account.dueDayOfMonth) : '',
  }
}

export default function AccountsPage() {
  const router = useRouter()
  const accountsQuery = useAccountsQuery()
  const createAccountMutation = useCreateAccountMutation()
  const updateAccountMutation = useUpdateAccountMutation()
  const deleteAccountMutation = useDeleteAccountMutation()

  const [activeFilter, setActiveFilter] = useState<AccountFilter>('All')
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm<AccountForm>({
    defaultValues: DEFAULT_FORM,
  })

  const type = useWatch({ control, name: 'type' })
  const currency = useWatch({ control, name: 'currency' })
  const creditLimit = useWatch({ control, name: 'creditLimit' })

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const totalBalance = useMemo(() => getNetWorth(accounts), [accounts])
  const typeBreakdown = useMemo(() => getTypeBreakdown(accounts), [accounts])
  const isCreditCard = type === 'CREDIT_CARD'

  const filteredAccounts = useMemo(() => {
    if (activeFilter === 'All') return accounts
    return accounts.filter((account) => {
      if (activeFilter === 'Debit') return account.type === 'BANK_ACCOUNT'
      if (activeFilter === 'Credit') return account.type === 'CREDIT_CARD'
      if (activeFilter === 'Cash') return account.type === 'CASH'
      if (activeFilter === 'E-wallet') return account.type === 'E_WALLET'
      if (activeFilter === 'Other') return account.type === 'OTHER'
      return true
    })
  }, [accounts, activeFilter])

  const resetForm = () => {
    setEditingAccountId(null)
    reset(DEFAULT_FORM)
    setShowComposer(false)
  }

  const handleEdit = (account: Account) => {
    setEditingAccountId(account.id)
    reset(mapAccountToForm(account))
    setShowComposer(true)
  }
  const handleAccountSubmit = (values: AccountForm) => {
    const name = values.name.trim()
    const balance = Number(values.balance || 0)
    const creditLimit = Number(values.creditLimit)
    const availableCredit = Number(values.availableCredit)
    const dueDayOfMonth = Number(values.dueDayOfMonth)

    const payload = {
      name,
      type: values.type,
      currency: values.currency,
      balance: isCreditCard
        ? String((creditLimit - availableCredit).toFixed(2))
        : String(balance.toFixed(2)),
      institutionName: values.institutionName.trim() || undefined,
      creditLimit: isCreditCard ? String(creditLimit.toFixed(2)) : undefined,
      availableCredit: isCreditCard ? String(availableCredit.toFixed(2)) : undefined,
      dueDayOfMonth: isCreditCard ? dueDayOfMonth : undefined,
    }

    if (editingAccountId) {
      updateAccountMutation.mutate(
        { id: editingAccountId, input: payload },
        {
          onSuccess: () => {
            toast.success(`${name} updated.`)
            resetForm()
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Could not update account.')
          },
        }
      )
      return
    }

    createAccountMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`${name} added to your accounts.`)
        resetForm()
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Could not create account.')
      },
    })
  }

  const composerContent = (
    <form
      onSubmit={handleSubmit(handleAccountSubmit)}
      className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="flex items-start justify-between gap-4 max-lg:hidden">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#4a5650]">
            {editingAccountId ? 'Edit account' : 'Add account'}
          </p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
            {editingAccountId ? 'Update this wallet' : 'Create a new wallet'}
          </h2>
          <p className="mt-2 text-[14px] font-medium leading-relaxed text-[#7f8c86]">
            Credit cards keep their limit fields here too, like in mobile.
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <WalletCards className="size-5 text-[#8bff62]" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2 max-lg:mt-0">
        <div className="space-y-2 xl:col-span-2 lg:hidden">
          <Label>Type</Label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_TYPE_OPTIONS.map((option) => {
              const selected = type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={async () => {
                    setValue('type', option.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                    await trigger(['type', 'creditLimit', 'availableCredit', 'dueDayOfMonth', 'balance'])
                  }}
                  className={cn(
                    'rounded-full border px-4 py-2.5 text-[14px] font-semibold transition',
                    selected
                      ? 'border-[#8bff62] bg-[#132117] text-[#8bff62]'
                      : 'border-[#17211c] bg-[#0d1411] text-[#dce2de]'
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="account-name">Account name</Label>
          <Input
            id="account-name"
            {...register('name', {
              required: 'Account name is required.',
              validate: (value) => value.trim().length > 0 || 'Account name is required.',
            })}
            placeholder="e.g. BDO Savings, GCash, Maya"
          />
          <FormErrorMessage message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-type" className="hidden lg:block">
            Type
          </Label>
          <select
            id="account-type"
            value={type}
            onChange={async (e) => {
              setValue('type', e.target.value as AccountType, {
                shouldDirty: true,
                shouldTouch: true,
              })
              await trigger(['type', 'creditLimit', 'availableCredit', 'dueDayOfMonth', 'balance'])
            }}
            className="hidden h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30 lg:block"
          >
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-currency">Currency</Label>
          <select
            id="account-currency"
            value={currency}
            onChange={(e) =>
              setValue('currency', e.target.value, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
          >
            {ACCOUNT_CURRENCY_OPTIONS.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="account-institution">Institution</Label>
          <Input
            id="account-institution"
            {...register('institutionName')}
            placeholder="e.g. BDO, UnionBank, Maya"
          />
        </div>

        {isCreditCard ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="account-limit">Credit limit</Label>
              <Input
                id="account-limit"
                type="number"
                {...register('creditLimit', {
                  validate: (value) => {
                    if (type !== 'CREDIT_CARD') return true
                    if (!value.trim()) return 'Credit limit is required for credit cards.'

                    const parsed = Number(value)
                    return Number.isFinite(parsed) && parsed >= 0
                      ? true
                      : 'Enter a valid credit limit.'
                  },
                })}
                placeholder="20000.00"
              />
              <FormErrorMessage message={errors.creditLimit?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-available">Available credit</Label>
              <Input
                id="account-available"
                type="number"
                {...register('availableCredit', {
                  validate: (value) => {
                    if (type !== 'CREDIT_CARD') return true
                    if (!value.trim()) return 'Available credit is required for credit cards.'

                    const parsed = Number(value)
                    const limit = Number(creditLimit)

                    if (!Number.isFinite(parsed) || parsed < 0) {
                      return 'Enter a valid available credit amount.'
                    }

                    if (Number.isFinite(limit) && parsed > limit) {
                      return 'Available credit cannot be higher than the total limit.'
                    }

                    return true
                  },
                })}
                placeholder="16900.00"
              />
              <FormErrorMessage message={errors.availableCredit?.message} />
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="account-due">Due day</Label>
              <Input
                id="account-due"
                type="number"
                min="1"
                max="31"
                {...register('dueDayOfMonth', {
                  validate: (value) => {
                    if (type !== 'CREDIT_CARD') return true
                    if (!value.trim()) return 'Due day is required for credit cards.'

                    const parsed = Number(value)
                    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 31
                      ? true
                      : 'Due day must be between 1 and 31.'
                  },
                })}
                placeholder="16"
              />
              <FormErrorMessage message={errors.dueDayOfMonth?.message} />
            </div>
          </>
        ) : (
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="account-balance">Starting balance</Label>
            <Input
              id="account-balance"
              type="number"
              {...register('balance', {
                validate: (value) =>
                  Number.isFinite(Number(value || 0))
                    ? true
                    : 'Enter a valid starting balance.',
              })}
              placeholder="25000.00"
            />
            <FormErrorMessage message={errors.balance?.message} />
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
        >
          {editingAccountId ? 'Save changes' : 'Add account'}
        </Button>
        <Button type="button" variant="secondary" onClick={resetForm}>
          Cancel
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Wallets and balances"
          title="Accounts"
          subtitle="See all your money in one place. Track cash, bank balances, and limits."
          inverted
        />
      </DashboardHeaderShell>

      <div className="flex flex-col gap-6 px-4 pt-6 pb-20 md:px-6 lg:px-8 animate-in fade-in duration-500">
        {accountsQuery.isLoading ? (
          <div className="h-40 w-full rounded-[30px] bg-[#111916] animate-pulse" />
        ) : (
          <NetWorthCard totalBalance={totalBalance} typeBreakdown={typeBreakdown} />
        )}

        <div className="rounded-[24px] border border-[#17211c] bg-[#111916] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">
                Wallet manager
              </p>
              <p className="mt-1 text-[14px] font-medium text-[#93a19a]">
                Keep the page focused on your accounts. Open the composer only when you need it.
              </p>
            </div>
            <Button onClick={() => setShowComposer((current) => !current)} className="lg:self-stretch">
              <Plus className="size-4" />
              {showComposer ? 'Close composer' : 'New account'}
            </Button>
          </div>
        </div>

        {showComposer ? <div className="hidden lg:block">{composerContent}</div> : null}

        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {ACCOUNT_FILTERS.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter as AccountFilter)} className="focus:outline-none">
                <Pill
                  label={filter}
                  variant={activeFilter === filter ? 'selected' : 'default'}
                  className="cursor-pointer transition-all active:scale-95"
                />
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {accountsQuery.isLoading ? (
              <>
                <AccountSkeletonCard />
                <AccountSkeletonCard />
                <AccountSkeletonCard />
              </>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
                  action={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleEdit(account)
                        }}
                        className="flex size-9 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#213129]"
                        aria-label={`Edit ${account.name}`}
                      >
                        <Pencil className="size-4 text-[#8bff62]" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteAccountMutation.mutate(account.id, {
                            onSuccess: () => toast.success(`${account.name} deleted.`),
                            onError: (error) =>
                              toast.error(error instanceof Error ? error.message : 'Could not delete account.'),
                          })
                        }}
                        className="flex size-9 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
                        aria-label={`Delete ${account.name}`}
                      >
                        <Trash2 className="size-4 text-[#ff8a94]" />
                      </button>
                    </div>
                  }
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[30px] bg-[#0f1512] py-20 px-6 text-center border border-[#17211c]">
                <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-[#18221d]">
                  <WalletCards className="size-8 text-[#1b2a21]" />
                </div>
                <h4 className="text-[18px] font-bold text-[#f4f7f5]">No accounts found</h4>
                <p className="mt-2 max-w-[240px] text-[14px] font-medium leading-relaxed text-[#7f8c86]">
                  {activeFilter === 'All'
                    ? "You haven't added any accounts yet."
                    : `No ${activeFilter.toLowerCase()} accounts found.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileSheet
        open={showComposer}
        onClose={resetForm}
        eyebrow="Accounts"
        title={editingAccountId ? 'Edit account' : 'Add account'}
      >
        {composerContent}
      </MobileSheet>
    </>
  )
}
