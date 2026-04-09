'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowDownLeft, ArrowUpRight, HandCoins, Plus, Trash2 } from 'lucide-react'
import { AppPageHeader } from '@/components/navigation/app-page-header'
import { DashboardHeaderShell } from '@/components/navigation/dashboard-header-shell'
import { FinanceEmptyState } from '@/components/finance/management-components'
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
import type { Debt, DebtDirection } from '@/lib/finance.types'
import { formatCurrency, formatShortDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

// ─── Schema ────────────────────────────────────────────────────────────────────

const debtFormSchema = z.object({
  direction: z.enum(['I_OWE', 'OWED_TO_ME']),
  title: z.string().trim().min(1, 'Add a debt title.').max(120),
  counterpartyName: z.string().trim().min(1, 'Add a person or counterparty.').max(120),
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

// ─── Debt row ──────────────────────────────────────────────────────────────────

function DebtRow({ debt, onDelete }: { debt: Debt; onDelete: () => void }) {
  const progress =
    Number(debt.originalAmount) > 0
      ? Math.min((Number(debt.currentBalance) / Number(debt.originalAmount)) * 100, 100)
      : 0

  const isOwedToMe = debt.direction === 'OWED_TO_ME'
  const isSettled = debt.status === 'SETTLED'
  const accentColor = isSettled ? '#93a19a' : isOwedToMe ? '#8bff62' : '#ff8a94'
  const pillBg = isSettled ? '#18221d' : isOwedToMe ? '#1a2c1f' : '#2b1719'
  const pillLabel = isSettled ? 'Settled' : isOwedToMe ? 'Owed to me' : 'I owe'

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-[#17211c] bg-[#0f1512] p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[15px] font-bold text-[#f4f7f5]">{debt.title}</p>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1.2px]"
              style={{ color: accentColor, backgroundColor: pillBg }}
            >
              {pillLabel}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-[#4a5650]">
            {debt.counterpartyName}
            {debt.dueDate ? (
              <span className="ml-2 text-[#7f8c86]">· Due {formatShortDate(debt.dueDate)}</span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#241719] transition hover:bg-[#311d22]"
          aria-label={`Delete ${debt.title}`}
        >
          <Trash2 className="size-3.5 text-[#ff8a94]" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-[#1a2c1f]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold" style={{ color: accentColor }}>
          {formatCurrency(debt.currentBalance, debt.currency)}
          <span className="ml-1 font-normal text-[#4a5650]">
            remaining of {formatCurrency(debt.originalAmount, debt.currency)}
          </span>
        </p>
      </div>

      {debt.notes ? (
        <p className="text-[12px] leading-5 text-[#7f8c86]">{debt.notes}</p>
      ) : null}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
  const debts = debtsQuery.data ?? []

  const iOweDebts = useMemo(
    () => debts.filter((d) => d.direction === 'I_OWE' && d.status !== 'SETTLED'),
    [debts]
  )
  const owedToMeDebts = useMemo(
    () => debts.filter((d) => d.direction === 'OWED_TO_ME' && d.status !== 'SETTLED'),
    [debts]
  )
  const settledDebts = useMemo(() => debts.filter((d) => d.status === 'SETTLED'), [debts])

  const iOweTotalBalance = useMemo(
    () => iOweDebts.reduce((sum, d) => sum + Number(d.currentBalance), 0),
    [iOweDebts]
  )
  const owedToMeTotalBalance = useMemo(
    () => owedToMeDebts.reduce((sum, d) => sum + Number(d.currentBalance), 0),
    [owedToMeDebts]
  )

  const activeDebts = activeTab === 'I_OWE' ? iOweDebts : owedToMeDebts
  const isEmpty = iOweDebts.length === 0 && owedToMeDebts.length === 0 && settledDebts.length === 0

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
        ...(values.dueDate ? { dueDate: new Date(`${values.dueDate}T00:00:00`).toISOString() } : {}),
        ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
      })
      toast.success('Debt saved.')
      handleClose()
    } catch (error) {
      setError('root', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Could not save debt.',
      })
    }
  })

  // ── Composer ─────────────────────────────────────────────────────────────────

  const composer = (
    <form
      onSubmit={onSubmit}
      className="rounded-[24px] border border-[#17211c] bg-[#111916] p-5"
    >
      <div className="hidden lg:block">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#4a5650]">
          {direction === 'I_OWE' ? 'Track outgoing debt' : 'Track incoming debt'}
        </p>
        <h2 className="mt-1.5 text-[20px] font-bold tracking-tight text-[#f4f7f5]">
          Add a {direction === 'I_OWE' ? 'debt' : 'receivable'}
        </h2>
      </div>

      <input type="hidden" {...register('direction')} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 max-lg:mt-0">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Title</Label>
          <Input {...register('title')} placeholder="Laptop advance, salary loan…" />
          <FormErrorMessage message={errors.title?.message} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">
            {direction === 'I_OWE' ? 'I owe to' : 'Owed by'}
          </Label>
          <Input {...register('counterpartyName')} placeholder="John, Sarah, Office coop" />
          <FormErrorMessage message={errors.counterpartyName?.message} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Original amount</Label>
          <Input {...register('originalAmount')} inputMode="decimal" placeholder="10000.00" />
          <FormErrorMessage message={errors.originalAmount?.message} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Currency</Label>
          <Input {...register('currency')} placeholder="PHP" maxLength={3} />
          <FormErrorMessage message={errors.currency?.message} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Due date</Label>
          <Input {...register('dueDate')} type="date" />
          <FormErrorMessage message={errors.dueDate?.message} />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#4a5650]">Notes</Label>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <textarea
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              rows={3}
              className="min-h-[90px] w-full rounded-[18px] border border-[#17211c] bg-[#131b17] px-4 py-3 text-[14px] font-medium text-[#f4f7f5] outline-none placeholder:text-[#536159] focus:border-[#8bff62]/35 transition"
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

      <div className="mt-5 flex gap-2.5">
        <Button
          type="submit"
          className="flex-1 rounded-full"
          disabled={createDebtMutation.isPending || isSubmitting}
        >
          <Plus className="size-4" />
          {direction === 'I_OWE' ? 'Save debt' : 'Save receivable'}
        </Button>
        <Button type="button" variant="secondary" className="rounded-full" onClick={handleClose}>
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

      <div className="flex flex-col gap-5 px-4 pb-28 pt-6 md:px-6 lg:px-8">

        {/* ── Summary chips + tab switcher ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {/* I owe chip */}
            <button
              type="button"
              onClick={() => { setActiveTab('I_OWE'); setValue('direction', 'I_OWE') }}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 transition',
                activeTab === 'I_OWE'
                  ? 'border-[#ff8a94]/30 bg-[#2b1719]'
                  : 'border-[#17211c] bg-[#111916] hover:bg-[#18221d]'
              )}
            >
              <ArrowUpRight className="size-3.5 text-[#ff8a94]" />
              <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">I owe</span>
              <span className="text-[14px] font-bold text-[#ff8a94]">{formatCurrency(iOweTotalBalance)}</span>
            </button>

            {/* Owed to me chip */}
            <button
              type="button"
              onClick={() => { setActiveTab('OWED_TO_ME'); setValue('direction', 'OWED_TO_ME') }}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 transition',
                activeTab === 'OWED_TO_ME'
                  ? 'border-[#8bff62]/20 bg-[#16211b]'
                  : 'border-[#17211c] bg-[#111916] hover:bg-[#18221d]'
              )}
            >
              <ArrowDownLeft className="size-3.5 text-[#8bff62]" />
              <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-[#4a5650]">Owed to me</span>
              <span className="text-[14px] font-bold text-[#8bff62]">{formatCurrency(owedToMeTotalBalance)}</span>
            </button>
          </div>

          <Button
            className="rounded-full px-5"
            onClick={() => {
              setValue('direction', activeTab)
              setShowComposer(true)
            }}
          >
            <Plus className="size-4" />
            {activeTab === 'I_OWE' ? 'Add debt' : 'Add receivable'}
          </Button>
        </div>

        {/* ── Desktop composer ── */}
        {showComposer ? <div className="hidden lg:block">{composer}</div> : null}

        {/* ── Empty state ── */}
        {isEmpty ? (
          <FinanceEmptyState
            icon={HandCoins}
            title="No debts yet"
            description="Add your first debt so Penni can track what is still outstanding on both sides."
          />
        ) : null}

        {/* ── Active tab list ── */}
        {activeDebts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">
                {activeTab === 'I_OWE' ? 'Outstanding' : 'Incoming'}
              </h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{
                  color: activeTab === 'I_OWE' ? '#ff8a94' : '#8bff62',
                  backgroundColor: activeTab === 'I_OWE' ? '#2b1719' : '#16211b',
                }}
              >
                {activeDebts.length} open
              </span>
            </div>
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
            title={activeTab === 'I_OWE' ? 'No outstanding debt' : 'No incoming debt'}
            description={
              activeTab === 'I_OWE'
                ? 'Nothing marked as money you still owe.'
                : 'Nothing marked as money owed back to you.'
            }
          />
        ) : null}

        {/* ── Settled list ── */}
        {settledDebts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#4a5650]">Settled</h3>
              <span className="rounded-full bg-[#18221d] px-2.5 py-0.5 text-[10px] font-bold text-[#93a19a]">
                {settledDebts.length} archived
              </span>
            </div>
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

      {/* ── Mobile sheet ── */}
      <MobileSheet open={showComposer} onClose={handleClose} title="New debt">
        {composer}
      </MobileSheet>
    </>
  )
}
