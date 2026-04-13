import { z } from 'zod'
import type { Budget } from '@/lib/finance.types'

export type BudgetForm = {
  name: string
  amount: string
  categoryId: string
  alertThreshold: string
  periodStart: string
  periodEnd: string
}

export type BudgetTimingStatus = 'CURRENT' | 'UPCOMING' | 'PAST'

const now = new Date()
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  .toISOString()
  .slice(0, 10)
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  .toISOString()
  .slice(0, 10)

export const DEFAULT_BUDGET_FORM: BudgetForm = {
  name: '',
  amount: '',
  categoryId: '',
  alertThreshold: '80',
  periodStart: startOfMonth,
  periodEnd: endOfMonth,
}

export const budgetFormSchema = z
  .object({
    name: z.string(),
    amount: z
      .string()
      .trim()
      .min(1, 'Enter a budget amount.')
      .refine(
        (v) => Number.isFinite(Number(v)) && Number(v) > 0,
        'Enter a valid budget amount.'
      ),
    categoryId: z.string(),
    alertThreshold: z
      .string()
      .trim()
      .min(1, 'Enter an alert threshold.')
      .refine(
        (v) =>
          Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 100,
        'Alert threshold must be between 1 and 100.'
      ),
    periodStart: z.string().min(1, 'Choose a start date.'),
    periodEnd: z.string().min(1, 'Choose an end date.'),
  })
  .superRefine((v, ctx) => {
    if (!v.periodStart || !v.periodEnd) return
    if (new Date(v.periodEnd).getTime() < new Date(v.periodStart).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['periodEnd'],
        message: 'Period end must be on or after the start date.',
      })
    }
  })

export function toBudgetIsoDate(dateValue: string, endOfDay = false) {
  return new Date(
    `${dateValue}T${endOfDay ? '23:59:59' : '00:00:00'}`
  ).toISOString()
}

export function mapBudgetToForm(budget: Budget): BudgetForm {
  return {
    name: budget.name ?? '',
    amount: String(budget.amount),
    categoryId: budget.categoryId ?? '',
    alertThreshold: String(budget.alertThreshold),
    periodStart: budget.periodStart.slice(0, 10),
    periodEnd: budget.periodEnd.slice(0, 10),
  }
}

export function getBudgetTimingStatus(
  budget: Budget,
  today: Date
): BudgetTimingStatus {
  const start = new Date(budget.periodStart)
  const end = new Date(budget.periodEnd)
  if (today < start) return 'UPCOMING'
  if (today > end) return 'PAST'
  return 'CURRENT'
}

export function getBudgetProgressState(
  spent: number,
  limit: number,
  alertThreshold: number
) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
  const isOver = spent > limit
  const isReached = !isOver && limit > 0 && spent >= limit
  const isWarning = pct >= alertThreshold

  return {
    pct,
    isOver,
    label: isOver
      ? 'Over budget'
      : isReached
        ? 'Budget reached'
        : isWarning
          ? 'Approaching'
          : 'On track',
    labelColor: isOver
      ? '#ff8a94'
      : isReached || isWarning
        ? '#ffc857'
        : '#4a5650',
    barColor: isOver
      ? '#ff8a94'
      : isReached || isWarning
        ? '#ffc857'
        : '#8bff62',
  }
}
