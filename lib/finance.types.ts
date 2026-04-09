export type AccountType = 'CASH' | 'BANK_ACCOUNT' | 'E_WALLET' | 'CREDIT_CARD' | 'OTHER';
export type CategoryType = 'EXPENSE' | 'INCOME';
export type TransactionSource = 'MANUAL' | 'RECURRING' | 'IMPORTED' | 'TRANSFER';
export type RecurrenceFrequency = 'WEEKLY' | 'MONTHLY' | 'SEMI_MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type DebtDirection = 'I_OWE' | 'OWED_TO_ME';
export type DebtStatus = 'OPEN' | 'SETTLED';

export type CreditCardDetails = {
  creditLimit: string;
  availableCredit: string;
  dueDayOfMonth: number;
  statementDayOfMonth: number | null;
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: string | number;
  creditCard: CreditCardDetails | null;
  institutionName: string | null | undefined;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  icon: string | null;
  colorHex: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  accountId: string | null;
  categoryId: string | null;
  plannedItemId: string | null;
  type: CategoryType;
  source: TransactionSource;
  title: string;
  notes: string | null | undefined;
  amount: string | number;
  currency: string;
  transactionAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PlannedItem = {
  id: string;
  accountId: string | null;
  categoryId: string | null;
  type: CategoryType;
  title: string;
  notes: string | null | undefined;
  amount: string | number;
  currency: string;
  startDate: string;
  recurrence: RecurrenceFrequency;
  semiMonthlyDays: number[];
  isActive: boolean;
  nextOccurrenceAt: string | null | undefined;
  createdAt: string;
  updatedAt: string;
};

export type Budget = {
  id: string;
  categoryId: string | null;
  name: string | null;
  amount: string | number;
  currency: string;
  alertThreshold: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
};

export type Debt = {
  id: string;
  clientId: string | null;
  userId: string;
  direction: DebtDirection;
  status: DebtStatus;
  title: string;
  counterpartyName: string;
  notes: string | null;
  originalAmount: string | number;
  currentBalance: string | number;
  currency: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  clientUpdatedAt: string | null;
};

export function getAccountCreditLimit(account: Account) {
  return account.creditCard ? Number(account.creditCard.creditLimit) : null;
}

export function getAccountAvailableCredit(account: Account) {
  return account.creditCard ? Number(account.creditCard.availableCredit) : null;
}

export function getAccountDueDayOfMonth(account: Account) {
  return account.creditCard?.dueDayOfMonth ?? null;
}

export function getAccountStatementDayOfMonth(account: Account) {
  return account.creditCard?.statementDayOfMonth ?? null;
}
