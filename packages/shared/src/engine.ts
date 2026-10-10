import {
  FinancialProfile,
  BankAccount,
  Transaction,
  CreditCard,
  Transfer,
  DashboardMetrics,
} from './types';

export class FinancialEngine {
  /**
   * Calculates dashboard metrics dynamically adhering to the strict anti-duplication rules:
   * 1. In consolidated mode, transfers between profiles in the group are netted out (R$ 0,00 impact on net balance).
   * 2. Internal transfers between accounts never generate income or expense.
   * 3. Credit card invoice payments are liability transfers and do not create duplicate expenses.
   * 4. Calculates exact breakdown by profile.
   */
  static calculateMetrics(params: {
    activeProfileId: string | 'CONSOLIDATED';
    profiles: FinancialProfile[];
    transactions: Transaction[];
    accounts: BankAccount[];
    creditCards: CreditCard[];
    transfers: Transfer[];
    referenceMonth: number;
    referenceYear: number;
  }): DashboardMetrics {
    const {
      activeProfileId,
      profiles,
      transactions,
      accounts,
      transfers,
      referenceMonth,
      referenceYear,
    } = params;

    const isConsolidated = activeProfileId === 'CONSOLIDATED';

    // 1. Filter accounts relevant to active scope
    const targetAccounts = isConsolidated
      ? accounts
      : accounts.filter((a) => a.profileId === activeProfileId);

    const accountsTotalBalance = targetAccounts.reduce(
      (sum, acc) => sum + Number(acc.currentBalance || 0),
      0
    );

    // 2. Filter transactions by date competence (month/year) and profile scope
    const periodTransactions = transactions.filter((t) => {
      if (!t.effectiveDate) return false;
      const [yearStr, monthStr] = t.effectiveDate.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      if (y !== referenceYear || m !== referenceMonth) return false;

      if (!isConsolidated && t.profileId !== activeProfileId) {
        return false;
      }
      return true;
    });

    // 3. Calculate Income and Expenses strictly excluding internal transfers and invoice settlement double-counting
    let totalIncome = 0;
    let totalExpense = 0;
    let pendingInflows = 0;
    let pendingOutflows = 0;

    for (const tx of periodTransactions) {
      // Rule 1 & 2: Ignore internal transfers in income/expense calculations
      if (tx.isInternalTransfer || tx.type === 'TRANSFER') {
        continue;
      }

      // Rule 3: Invoice payments tagged as liability transfer/repayment do not duplicate expense
      if (tx.notes?.includes('[FATURA_PAGAMENTO]') || tx.description.toLowerCase().includes('pagamento de fatura')) {
        continue;
      }

      const amount = Number(tx.amount || 0);

      if (tx.type === 'INCOME') {
        if (tx.status === 'COMPLETED') {
          totalIncome += amount;
        } else if (tx.status === 'PENDING') {
          pendingInflows += amount;
        }
      } else if (tx.type === 'EXPENSE') {
        if (tx.status === 'COMPLETED') {
          totalExpense += amount;
        } else if (tx.status === 'PENDING') {
          pendingOutflows += amount;
        }
      }
    }

    const monthBalance = totalIncome - totalExpense;

    // Projected balance = current cash + pending inflows - pending outflows
    const projectedBalance = accountsTotalBalance + pendingInflows - pendingOutflows;

    // Commitment rate = (despesas / receitas) * 100
    const commitmentRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    // 4. Calculate Profile Breakdown (for multi-profile cards)
    const profileBreakdown = profiles.map((p) => {
      const pTx = transactions.filter((t) => {
        if (!t.effectiveDate) return false;
        const [yearStr, monthStr] = t.effectiveDate.split('-');
        return (
          parseInt(yearStr, 10) === referenceYear &&
          parseInt(monthStr, 10) === referenceMonth &&
          t.profileId === p.id &&
          !t.isInternalTransfer &&
          t.type !== 'TRANSFER' &&
          !t.notes?.includes('[FATURA_PAGAMENTO]') &&
          !t.description.toLowerCase().includes('pagamento de fatura')
        );
      });

      const pIncome = pTx
        .filter((t) => t.type === 'INCOME' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const pExpense = pTx
        .filter((t) => t.type === 'EXPENSE' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return {
        profileId: p.id,
        profileName: p.name,
        profileColor: p.color,
        income: pIncome,
        expense: pExpense,
        balance: pIncome - pExpense,
      };
    });

    return {
      totalIncome,
      totalExpense,
      monthBalance,
      accountsTotalBalance,
      projectedBalance,
      commitmentRate,
      netWorth: accountsTotalBalance, // In advanced view, will sum investments + assets - liabilities
      profileBreakdown,
    };
  }

  /**
   * Formats currency as Brazilian Real (R$ 1.234,56)
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Formats percentage (52,1%)
   */
  static formatPercent(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }
}
