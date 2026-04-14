import { z } from 'zod'

export type TransactionForm = {
  mode: 'EXPENSE' | 'INCOME' | 'TRANSFER'
  title: string
  amount: string
  accountId: string
  toAccountId: string
  categoryId: string
  transactionAt: string
  notes: string
}

export const DEFAULT_TRANSACTION_FORM: TransactionForm = {
  mode: 'EXPENSE',
  title: '',
  amount: '',
  accountId: '',
  toAccountId: '',
  categoryId: '',
  transactionAt: new Date().toISOString().slice(0, 10),
  notes: '',
}

export const transactionFormSchema = z
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

export function toTransactionIsoDate(dateValue: string) {
  return new Date(`${dateValue}T12:00:00`).toISOString()
}
