'use client'

import { FinanceEmptyState } from '@/components/finance/management-components'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { Button } from '@/components/ui/button'
import FormErrorMessage from '@/components/ui/form-error-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MobileSheet } from '@/components/ui/mobile-sheet'
import {
  useCreateDebtMutation,
  useDebtsQuery,
  useDeleteDebtMutation,
} from '@/hooks/finance/use-debts-query'
import type { DebtDirection } from '@/lib/finance.types'
import { formatCurrency } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownLeft, ArrowUpRight, HandCoins, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DebtRow } from './_components/debt-row'

const debtFormSchema = z.object({
  direction: z.enum(['I_OWE', 'OWED_TO_ME']),
  title: z.string().trim().min(1, 'Add a debt title.').max(120),
  counterpartyName: z
    .string()
    .trim()
    .min(1, 'Add a person or counterparty.')
    .max(120),
  originalAmount: z
    .string()
    .trim()
    .min(1, 'Add the original amount.')
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) > 0,
      'Enter a valid original amount.'
    ),
  currency: z.string().trim().min(3).max(3),
  dueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

type DebtForm = z.infer<typeof debtFormSchema>

const DEFAULT_VALUES: DebtForm = {
  direction: 'I_OWE',
  title: '',
  counterpartyName: '',
  originalAmount: '',
  currency: 'PHP',
  dueDate: '',
  notes: '',
}

export default function DebtsPage() {
  const debtsQuery = useDebtsQuery()
  const createDebtMutation = useCreateDebtMutation()
  const deleteDebtMutation = useDeleteDebtMutation()
  const [showComposer, setShowComposer] = useState(false)
  const [activeTab, setActiveTab] = useState<DebtDirection>('I_OWE')

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DebtForm>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const direction = useWatch({ control, name: 'direction' })
  const debts = useMemo(() => debtsQuery.data ?? [], [debtsQuery.data])

  const iOweDebts = useMemo(
    () =>
      debts.filter((d) => d.direction === 'I_OWE' && d.status !== 'SETTLED'),
    [debts]
  )
  const owedToMeDebts = useMemo(
    () =>
      debts.filter(
        (d) => d.direction === 'OWED_TO_ME' && d.status !== 'SETTLED'
      ),
    [debts]
  )
  const settledDebts = useMemo(
    () => debts.filter((d) => d.status === 'SETTLED'),
    [debts]
  )

  const iOweTotalBalance = useMemo(
    () => iOweDebts.reduce((sum, d) => sum + Number(d.currentBalance), 0),
    [iOweDebts]
  )
  const owedToMeTotalBalance = useMemo(
    () => owedToMeDebts.reduce((sum, d) => sum + Number(d.currentBalance), 0),
    [owedToMeDebts]
  )

  const activeDebts = activeTab === 'I_OWE' ? iOweDebts : owedToMeDebts
  const isEmpty =
    iOweDebts.length === 0 &&
    owedToMeDebts.length === 0 &&
    settledDebts.length === 0

  const handleClose = () => {
    reset(DEFAULT_VALUES)
    setShowComposer(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createDebtMutation.mutateAsync({
        direction: values.direction,
        title: values.title.trim(),
        counterpartyName: values.counterpartyName.trim(),
        originalAmount: Number(values.originalAmount).toFixed(2),
        currency: values.currency.trim().toUpperCase(),
        ...(values.dueDate
          ? { dueDate: new Date(`${values.dueDate}T00:00:00`).toISOString() }
          : {}),
        ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
      })
      toast.success('Debt saved.')
      handleClose()
    } catch (error) {
      setError('root', {
        type: 'server',
        message:
          error instanceof Error ? error.message : 'Could not save debt.',
      })
    }
  })

  const composer = (
    <form
      onSubmit={onSubmit}
      className="rounded-[30px] border border-[#17211c] bg-[#111916] p-5"
    >
      <input type="hidden" {...register('direction')} />

      <div className="flex items-start justify-between gap-4 max-lg:hidden">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-[#4a5650] uppercase">
            {direction === 'I_OWE' ? 'Outstanding debt' : 'Incoming receivable'}
          </p>
          <h2 className="mt-2 text-[24px] font-bold tracking-tight text-[#f4f7f5]">
            {direction === 'I_OWE'
              ? 'Track what I owe'
              : 'Track what comes back'}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed font-medium text-[#7f8c86]">
            {direction === 'I_OWE'
              ? 'Capture money you still need to settle.'
              : 'Capture money that other people still owe you.'}
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#18221d]">
          <HandCoins className="size-5 text-[#8bff62]" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 max-lg:mt-0 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            setValue('direction', 'I_OWE', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          className={cn(
            'rounded-[20px] border p-4 text-left transition',
            direction === 'I_OWE'
              ? 'border-[#ff8a94]/30 bg-[#2b1719]'
              : 'border-[#17211c] bg-[#131b17]'
          )}
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight className="size-4 text-[#ff8a94]" />
            <p className="text-[14px] font-semibold text-[#f4f7f5]">
              Outstanding debt
            </p>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-[#6d786f]">
            Money I still need to pay back.
          </p>
        </button>
        <button
          type="button"
          onClick={() =>
            setValue('direction', 'OWED_TO_ME', {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          className={cn(
            'rounded-[20px] border p-4 text-left transition',
            direction === 'OWED_TO_ME'
              ? 'border-[#8bff62]/20 bg-[#16211b]'
              : 'border-[#17211c] bg-[#131b17]'
          )}
        >
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="size-4 text-[#8bff62]" />
            <p className="text-[14px] font-semibold text-[#f4f7f5]">
              Incoming receivable
            </p>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-[#6d786f]">
            Money that should still come back.
          </p>
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debt-title">Title</Label>
          <Input
            id="debt-title"
            {...register('title')}
            placeholder="Laptop advance, Borrowed cash"
          />
          <FormErrorMessage message={errors.title?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-counterparty">
            {direction === 'I_OWE' ? 'I owe to' : 'Owed by'}
          </Label>
          <Input
            id="debt-counterparty"
            {...register('counterpartyName')}
            placeholder="John, Sarah, Cooperative"
          />
          <FormErrorMessage message={errors.counterpartyName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-amount">Amount</Label>
          <Input
            id="debt-amount"
            {...register('originalAmount')}
            inputMode="decimal"
            placeholder="10000.00"
          />
          <FormErrorMessage message={errors.originalAmount?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-currency">Currency</Label>
          <Input
            id="debt-currency"
            {...register('currency')}
            placeholder="PHP"
            maxLength={3}
          />
          <FormErrorMessage message={errors.currency?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-due">Due date</Label>
          <Input id="debt-due" {...register('dueDate')} type="date" />
          <FormErrorMessage message={errors.dueDate?.message} />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="debt-notes">Notes</Label>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <textarea
              id="debt-notes"
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              rows={3}
              className="min-h-[90px] w-full rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 py-3 text-[14px] font-medium text-[#f4f7f5] transition outline-none placeholder:text-[#536159] focus:border-[#8bff62]/35"
              placeholder="Optional reminders, payment notes…"
            />
          )}
        />
        <FormErrorMessage message={errors.notes?.message} />
      </div>

      {errors.root?.message ? (
        <div className="mt-4 rounded-[16px] border border-[#4d232a] bg-[#241719] px-4 py-3 text-[13px] font-medium text-[#ff8a94]">
          {errors.root.message}
        </div>
      ) : null}

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={createDebtMutation.isPending || isSubmitting}
        >
          {direction === 'I_OWE' ? 'Save debt' : 'Save receivable'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <DashboardHeaderShell>
        <AppPageHeader
          eyebrow="Money between people"
          title="Debts"
          subtitle="Track what you owe and what needs to come back to you."
          inverted
        />
      </DashboardHeaderShell>

      <div className="animate-in fade-in flex flex-col gap-5 px-4 pt-6 pb-28 duration-500 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('I_OWE')
                setValue('direction', 'I_OWE')
              }}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 transition',
                activeTab === 'I_OWE'
                  ? 'border-[#ff8a94]/30 bg-[#2b1719]'
                  : 'border-[#17211c] bg-[#111916] hover:bg-[#18221d]'
              )}
            >
              <ArrowUpRight className="size-3.5 text-[#ff8a94]" />
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">
                I owe
              </span>
              <span className="text-[14px] font-bold text-[#ff8a94]">
                {formatCurrency(iOweTotalBalance)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('OWED_TO_ME')
                setValue('direction', 'OWED_TO_ME')
              }}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 transition',
                activeTab === 'OWED_TO_ME'
                  ? 'border-[#8bff62]/20 bg-[#16211b]'
                  : 'border-[#17211c] bg-[#111916] hover:bg-[#18221d]'
              )}
            >
              <ArrowDownLeft className="size-3.5 text-[#8bff62]" />
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#4a5650] uppercase">
                Owed to me
              </span>
              <span className="text-[14px] font-bold text-[#8bff62]">
                {formatCurrency(owedToMeTotalBalance)}
              </span>
            </button>
          </div>

          <Button
            className="rounded-full px-5"
            onClick={() => {
              setValue('direction', activeTab)
              setShowComposer((c) => !c)
            }}
          >
            <Plus className="size-4" />
            {showComposer
              ? 'Close'
              : activeTab === 'I_OWE'
                ? 'Add debt'
                : 'Add receivable'}
          </Button>
        </div>

        {showComposer ? (
          <div className="hidden lg:block">{composer}</div>
        ) : null}

        {isEmpty ? (
          <FinanceEmptyState
            icon={HandCoins}
            title="No debts yet"
            description="Add your first debt so Penni can track what is still outstanding on both sides."
          />
        ) : null}

        {activeDebts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeDebts.map((debt) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                onDelete={() => deleteDebtMutation.mutate(debt.id)}
              />
            ))}
          </div>
        ) : debts.length > 0 ? (
          <FinanceEmptyState
            icon={HandCoins}
            title={
              activeTab === 'I_OWE' ? 'No outstanding debt' : 'No incoming debt'
            }
            description={
              activeTab === 'I_OWE'
                ? 'Nothing marked as money you still owe.'
                : 'Nothing marked as money owed back to you.'
            }
          />
        ) : null}

        {settledDebts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {settledDebts.map((debt) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                onDelete={() => deleteDebtMutation.mutate(debt.id)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <MobileSheet open={showComposer} onClose={handleClose} title="New debt">
        {composer}
      </MobileSheet>
    </>
  )
}
