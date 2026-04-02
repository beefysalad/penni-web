'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { AccountCard, AccountSkeletonCard, NetWorthCard } from '@/components/finance/finance-components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pill } from '@/components/ui/pill'
import { Label } from '@/components/ui/label'
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
  const accountsQuery = useAccountsQuery()
  const createAccountMutation = useCreateAccountMutation()
  const updateAccountMutation = useUpdateAccountMutation()
  const deleteAccountMutation = useDeleteAccountMutation()

  const [activeFilter, setActiveFilter] = useState<AccountFilter>('All')
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [form, setForm] = useState<AccountForm>(DEFAULT_FORM)

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const totalBalance = useMemo(() => getNetWorth(accounts), [accounts])
  const typeBreakdown = useMemo(() => getTypeBreakdown(accounts), [accounts])
  const isCreditCard = form.type === 'CREDIT_CARD'

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
    setForm(DEFAULT_FORM)
    setShowComposer(false)
  }

  const handleEdit = (account: Account) => {
    setEditingAccountId(account.id)
    setForm(mapAccountToForm(account))
    setShowComposer(true)
  }

  const handleSubmit = () => {
    const name = form.name.trim()
    if (!name) {
      toast.error('Account name is required.')
      return
    }

    const payload = {
      name,
      type: form.type,
      currency: form.currency,
      balance: isCreditCard
        ? String((Number(form.creditLimit || 0) - Number(form.availableCredit || 0)).toFixed(2))
        : String(Number(form.balance || 0).toFixed(2)),
      institutionName: form.institutionName.trim() || undefined,
      creditLimit: isCreditCard ? String(Number(form.creditLimit || 0).toFixed(2)) : undefined,
      availableCredit: isCreditCard ? String(Number(form.availableCredit || 0).toFixed(2)) : undefined,
      dueDayOfMonth: isCreditCard && form.dueDayOfMonth ? Number(form.dueDayOfMonth) : undefined,
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

        {showComposer ? (
          <div className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5">
            <div className="flex items-start justify-between gap-4">
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

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="account-name">Account name</Label>
                <Input
                  id="account-name"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="e.g. BDO Savings, GCash, Maya"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-type">Type</Label>
                <select
                  id="account-type"
                  value={form.type}
                  onChange={(e) => setForm((c) => ({ ...c, type: e.target.value as AccountType }))}
                  className="h-12 w-full rounded-[1.2rem] border border-[#17211c] bg-[#131b17] px-4 text-[15px] font-medium text-[#f4f7f5] outline-none transition focus:border-[#2a3a31] focus:ring-2 focus:ring-[#2a3a31]/30"
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
                  value={form.currency}
                  onChange={(e) => setForm((c) => ({ ...c, currency: e.target.value }))}
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
                  value={form.institutionName}
                  onChange={(e) => setForm((c) => ({ ...c, institutionName: e.target.value }))}
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
                      value={form.creditLimit}
                      onChange={(e) => setForm((c) => ({ ...c, creditLimit: e.target.value }))}
                      placeholder="20000.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-available">Available credit</Label>
                    <Input
                      id="account-available"
                      type="number"
                      value={form.availableCredit}
                      onChange={(e) => setForm((c) => ({ ...c, availableCredit: e.target.value }))}
                      placeholder="16900.00"
                    />
                  </div>
                  <div className="space-y-2 xl:col-span-2">
                    <Label htmlFor="account-due">Due day</Label>
                    <Input
                      id="account-due"
                      type="number"
                      min="1"
                      max="31"
                      value={form.dueDayOfMonth}
                      onChange={(e) => setForm((c) => ({ ...c, dueDayOfMonth: e.target.value }))}
                      placeholder="16"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2 xl:col-span-2">
                  <Label htmlFor="account-balance">Starting balance</Label>
                  <Input
                    id="account-balance"
                    type="number"
                    value={form.balance}
                    onChange={(e) => setForm((c) => ({ ...c, balance: e.target.value }))}
                    placeholder="25000.00"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
              >
                {editingAccountId ? 'Save changes' : 'Add account'}
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

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
                  action={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(account)}
                        className="flex size-9 items-center justify-center rounded-full bg-[#18221d] transition hover:bg-[#213129]"
                        aria-label={`Edit ${account.name}`}
                      >
                        <Pencil className="size-4 text-[#8bff62]" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteAccountMutation.mutate(account.id, {
                            onSuccess: () => toast.success(`${account.name} deleted.`),
                            onError: (error) =>
                              toast.error(error instanceof Error ? error.message : 'Could not delete account.'),
                          })
                        }
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
    </>
  )
}
