import {
  getAccountAvailableCredit,
  getAccountCreditLimit,
  getAccountDueDayOfMonth,
  type Account,
  type AccountType,
} from '@/lib/finance.types'

export type AccountForm = {
  name: string
  type: AccountType
  currency: string
  balance: string
  institutionName: string
  creditLimit: string
  availableCredit: string
  dueDayOfMonth: string
  statementDayOfMonth: string
}

export const DEFAULT_ACCOUNT_FORM: AccountForm = {
  name: '',
  type: 'BANK_ACCOUNT',
  currency: 'PHP',
  balance: '',
  institutionName: '',
  creditLimit: '',
  availableCredit: '',
  dueDayOfMonth: '',
  statementDayOfMonth: '',
}

export function mapAccountToForm(account: Account): AccountForm {
  return {
    name: account.name,
    type: account.type,
    currency: account.currency,
    balance: String(account.balance ?? ''),
    institutionName: account.institutionName ?? '',
    creditLimit:
      getAccountCreditLimit(account) !== null
        ? String(getAccountCreditLimit(account))
        : '',
    availableCredit:
      getAccountAvailableCredit(account) !== null
        ? String(getAccountAvailableCredit(account))
        : '',
    dueDayOfMonth: getAccountDueDayOfMonth(account)
      ? String(getAccountDueDayOfMonth(account))
      : '',
    statementDayOfMonth: account.creditCard?.statementDayOfMonth
      ? String(account.creditCard.statementDayOfMonth)
      : '',
  }
}
