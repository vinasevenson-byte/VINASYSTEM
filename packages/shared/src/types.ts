export type UserRole = 'ADMIN' | 'PROFILE_MANAGER' | 'OPERATOR' | 'VIEWER' | 'AUDITOR';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH' | 'PAYMENT_WALLET';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RECONCILED';

export type StatementStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';

export type InvestmentType = 'FIXED_INCOME' | 'STOCKS' | 'REAL_ESTATE_FUNDS' | 'CRYPTO' | 'MUTUAL_FUNDS' | 'PENSION' | 'INTERNATIONAL';

export interface FinancialProfile {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  color: string;
  currency: string;
  archived: boolean;
  isDefault?: boolean;
}

export interface BankAccount {
  id: string;
  profileId: string;
  name: string;
  bankName?: string;
  accountType: AccountType;
  accountNumber?: string;
  agency?: string;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon?: string;
  archived?: boolean;
}

export interface Category {
  id: string;
  profileId?: string; // null means global/system
  parentId?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color: string;
  systemCategory?: boolean;
}

export interface Transaction {
  id: string;
  profileId: string;
  accountId?: string;
  categoryId?: string;
  cardPurchaseId?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  dueDate?: string; // YYYY-MM-DD
  effectiveDate: string; // YYYY-MM-DD
  description: string;
  notes?: string;
  isInternalTransfer?: boolean;
  transferId?: string;
  invoiceId?: string;
  paymentMethod?: 'ACCOUNT' | 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'CASH';
  installmentInfo?: {
    current: number;
    total: number;
    groupId: string;
  };
}

export interface CreditCard {
  id: string;
  profileId: string;
  name: string;
  brand?: string;
  creditLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  defaultAccountId?: string;
  color: string;
  lastFourDigits?: string;
  currentInvoiceAmount: number;
}

export interface CardStatement {
  id: string;
  cardId: string;
  referenceMonth: number;
  referenceYear: number;
  closingDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: StatementStatus;
}

export interface Transfer {
  id: string;
  sourceProfileId: string;
  destinationProfileId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  fee?: number;
  transferDate: string;
  description?: string;
  isCrossProfile: boolean;
}

export interface BudgetLimit {
  id: string;
  budgetId: string;
  categoryId: string;
  limitAmount: number;
  spentAmount: number;
}

export interface Budget {
  id: string;
  profileId: string;
  referenceMonth: number;
  referenceYear: number;
  totalPlanned: number;
  limits: BudgetLimit[];
}

export interface FinancialGoal {
  id: string;
  profileId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';
  color: string;
  category?: string;
}

export interface InvestmentItem {
  id: string;
  profileId: string;
  name: string;
  type: InvestmentType;
  institution?: string;
  investedAmount: number;
  currentValue: number;
  yieldRate?: number;
  dueDate?: string;
}

export interface DashboardMetrics {
  totalIncome: number;
  totalExpense: number;
  monthBalance: number;
  accountsTotalBalance: number;
  projectedBalance: number;
  commitmentRate: number; // percentage (0-100)
  netWorth: number;
  profileBreakdown: Array<{
    profileId: string;
    profileName: string;
    profileColor: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}
