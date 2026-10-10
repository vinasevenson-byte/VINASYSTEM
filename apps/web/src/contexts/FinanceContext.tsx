import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  FinancialProfile,
  BankAccount,
  Transaction,
  CreditCard,
  Transfer,
  Category,
  Budget,
  FinancialGoal,
  DashboardMetrics,
} from '@boma/shared';
import { FinancialEngine } from '@boma/shared';

// Initial Profiles
export const INITIAL_PROFILES: FinancialProfile[] = [
  {
    id: 'p-pessoal',
    name: 'Pessoal',
    description: 'Renda e despesas próprias do titular',
    color: '#059669', // Emerald
    currency: 'BRL',
    archived: false,
    isDefault: true,
  },
  {
    id: 'p-familiar',
    name: 'Familiar',
    description: 'Despesas compartilhadas da casa e dependentes',
    color: '#3B82F6', // Blue
    currency: 'BRL',
    archived: false,
  },
  {
    id: 'p-patrimonio',
    name: 'Patrimônio',
    description: 'Bens, imóveis, ativos e obrigações patrimoniais',
    color: '#8B5CF6', // Purple
    currency: 'BRL',
    archived: false,
  },
  {
    id: 'p-adicional',
    name: 'Perfil adicional',
    description: 'Outra estrutura financeira ou projetos paralelos',
    color: '#F59E0B', // Amber
    currency: 'BRL',
    archived: false,
  },
];

// Initial Categories
export const INITIAL_CATEGORIES: Category[] = [
  // Income
  { id: 'cat-salario', name: 'Salário & Pró-labore', type: 'INCOME', color: '#10B981', icon: 'Briefcase' },
  { id: 'cat-invest-renda', name: 'Rendimentos & Dividendos', type: 'INCOME', color: '#059669', icon: 'TrendingUp' },
  { id: 'cat-aluguel-rec', name: 'Aluguéis Recebidos', type: 'INCOME', color: '#14B8A6', icon: 'Home' },
  { id: 'cat-outras-rec', name: 'Outras Receitas', type: 'INCOME', color: '#64748B', icon: 'PlusCircle' },

  // Expenses
  { id: 'cat-moradia', name: 'Moradia & Contas', type: 'EXPENSE', color: '#6366F1', icon: 'Home' },
  { id: 'cat-alimentacao', name: 'Alimentação & Mercado', type: 'EXPENSE', color: '#EC4899', icon: 'Utensils' },
  { id: 'cat-transporte', name: 'Transporte & Veículo', type: 'EXPENSE', color: '#F97316', icon: 'Car' },
  { id: 'cat-saude', name: 'Saúde & Farmácia', type: 'EXPENSE', color: '#EF4444', icon: 'HeartPulse' },
  { id: 'cat-lazer', name: 'Lazer & Viagens', type: 'EXPENSE', color: '#8B5CF6', icon: 'Compass' },
  { id: 'cat-cartao-compras', name: 'Cartões & Compras', type: 'EXPENSE', color: '#3B82F6', icon: 'CreditCard' },
  { id: 'cat-outros', name: 'Outros Gastos', type: 'EXPENSE', color: '#94A3B8', icon: 'MoreHorizontal' },
];

// Initial Accounts totaling R$ 96.600,00
export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-nubank',
    profileId: 'p-pessoal',
    name: 'Nubank Conta Principal',
    bankName: 'Nubank',
    accountType: 'CHECKING',
    initialBalance: 15400,
    currentBalance: 24500,
    color: '#820AD1',
    icon: 'Smartphone',
  },
  {
    id: 'acc-itau',
    profileId: 'p-pessoal',
    name: 'Itaú Personalité',
    bankName: 'Itaú Unibanco',
    accountType: 'CHECKING',
    initialBalance: 12000,
    currentBalance: 18200,
    color: '#EC7000',
    icon: 'Building2',
  },
  {
    id: 'acc-familiar-inter',
    profileId: 'p-familiar',
    name: 'Inter Casa & Família',
    bankName: 'Banco Inter',
    accountType: 'CHECKING',
    initialBalance: 6000,
    currentBalance: 11400,
    color: '#FF7A00',
    icon: 'Home',
  },
  {
    id: 'acc-xp-patrimonio',
    profileId: 'p-patrimonio',
    name: 'XP Investimentos',
    bankName: 'XP Investimentos',
    accountType: 'INVESTMENT',
    initialBalance: 30000,
    currentBalance: 34500,
    color: '#000000',
    icon: 'BarChart3',
  },
  {
    id: 'acc-btg-adicional',
    profileId: 'p-adicional',
    name: 'BTG Pactual Projetos',
    bankName: 'BTG Pactual',
    accountType: 'CHECKING',
    initialBalance: 5000,
    currentBalance: 8000,
    color: '#002C6C',
    icon: 'Briefcase',
  },
];

// Initial Credit Cards
export const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'card-ultra',
    profileId: 'p-pessoal',
    name: 'Nubank Ultravioleta',
    brand: 'Mastercard Black',
    creditLimit: 35000,
    availableLimit: 29850,
    closingDay: 28,
    dueDay: 5,
    defaultAccountId: 'acc-nubank',
    color: '#820AD1',
    lastFourDigits: '9412',
    currentInvoiceAmount: 5150,
  },
  {
    id: 'card-xp',
    profileId: 'p-patrimonio',
    name: 'XP Visa Infinite',
    brand: 'Visa Infinite',
    creditLimit: 50000,
    availableLimit: 46200,
    closingDay: 25,
    dueDay: 10,
    defaultAccountId: 'acc-xp-patrimonio',
    color: '#1E293B',
    lastFourDigits: '3301',
    currentInvoiceAmount: 3800,
  },
  {
    id: 'card-inter',
    profileId: 'p-familiar',
    name: 'Inter Casa Mastercard',
    brand: 'Mastercard Gold',
    creditLimit: 15000,
    availableLimit: 12100,
    closingDay: 20,
    dueDay: 1,
    defaultAccountId: 'acc-familiar-inter',
    color: '#FF7A00',
    lastFourDigits: '7721',
    currentInvoiceAmount: 2900,
  },
];

// Seeded Transactions for Outubro 2026:
// Total Income: R$ 30.600,00
// - Pessoal: R$ 18.000,00 (Salário e Bônus)
// - Familiar: R$ 4.500,00 (Pensão / Renda Compartilhada)
// - Patrimônio: R$ 3.800,00 (Rendimentos XP / Aluguel)
// - Perfil Adicional: R$ 4.300,00 (Consultoria / Projetos)
// Sum = 18000 + 4500 + 3800 + 4300 = R$ 30.600,00!
//
// Total Expenses: R$ 15.950,00
// - Pessoal: R$ 9.900,00 (Resultado = +R$ 8.100,00)
// - Familiar: R$ 2.400,00 (Resultado = +R$ 2.100,00)
// - Patrimônio: R$ 1.850,00 (Resultado = +R$ 1.950,00)
// - Perfil Adicional: R$ 1.800,00 (Resultado = +R$ 2.500,00)
// Sum Expenses = 9900 + 2400 + 1850 + 1800 = R$ 15.950,00!
// Total Balance = 30.600 - 15.950 = + R$ 14.650,00!
// Comprometimento = 15.950 / 30.600 = 52.1%!
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // --- INCOMES ---
  {
    id: 'tx-inc-1',
    profileId: 'p-pessoal',
    accountId: 'acc-nubank',
    categoryId: 'cat-salario',
    amount: 15000,
    currency: 'BRL',
    type: 'INCOME',
    status: 'COMPLETED',
    effectiveDate: '2026-10-05',
    description: 'Salário Mensal Executivo',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-inc-2',
    profileId: 'p-pessoal',
    accountId: 'acc-itau',
    categoryId: 'cat-salario',
    amount: 3000,
    currency: 'BRL',
    type: 'INCOME',
    status: 'COMPLETED',
    effectiveDate: '2026-10-15',
    description: 'Pró-labore Complementar',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-inc-3',
    profileId: 'p-familiar',
    accountId: 'acc-familiar-inter',
    categoryId: 'cat-salario',
    amount: 4500,
    currency: 'BRL',
    type: 'INCOME',
    status: 'COMPLETED',
    effectiveDate: '2026-10-06',
    description: 'Aporte Orçamento Familiar',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-inc-4',
    profileId: 'p-patrimonio',
    accountId: 'acc-xp-patrimonio',
    categoryId: 'cat-invest-renda',
    amount: 2200,
    currency: 'BRL',
    type: 'INCOME',
    status: 'COMPLETED',
    effectiveDate: '2026-10-10',
    description: 'Dividendos e Rendimentos FIIs XP',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-inc-5',
    profileId: 'p-patrimonio',
    accountId: 'acc-xp-patrimonio',
    categoryId: 'cat-aluguel-rec',
    amount: 1600,
    currency: 'BRL',
    type: 'INCOME',
    status: 'COMPLETED',
    effectiveDate: '2026-10-08',
    description: 'Aluguel Imóvel Studio Centro',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-inc-6',
    profileId: 'p-adicional',
    accountId: 'acc-btg-adicional',
    categoryId: 'cat-outras-rec',
    amount: 4300,
    currency: 'BRL',
    type: 'INCOME',
    status: 'COMPLETED',
    effectiveDate: '2026-10-12',
    description: 'Honorários de Consultoria Estratégica',
    paymentMethod: 'ACCOUNT',
  },

  // --- EXPENSES (PESSOAL - Total 9.900) ---
  {
    id: 'tx-exp-1',
    profileId: 'p-pessoal',
    accountId: 'acc-nubank',
    categoryId: 'cat-moradia',
    amount: 3800,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-05',
    description: 'Condomínio e Aluguel Residencial',
    paymentMethod: 'BOLETO',
  },
  {
    id: 'tx-exp-2',
    profileId: 'p-pessoal',
    categoryId: 'cat-cartao-compras',
    amount: 2150,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-12',
    description: 'Compras e Eletrônicos (Cartão Ultravioleta)',
    paymentMethod: 'CREDIT_CARD',
  },
  {
    id: 'tx-exp-3',
    profileId: 'p-pessoal',
    categoryId: 'cat-alimentacao',
    amount: 1850,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-18',
    description: 'Supermercado e Feira Pessoal',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-exp-4',
    profileId: 'p-pessoal',
    categoryId: 'cat-transporte',
    amount: 1100,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-14',
    description: 'Combustível e Estacionamentos',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-exp-5',
    profileId: 'p-pessoal',
    categoryId: 'cat-lazer',
    amount: 1000,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-22',
    description: 'Restaurantes e Experiências',
    paymentMethod: 'CREDIT_CARD',
  },

  // --- EXPENSES (FAMILIAR - Total 2.400) ---
  {
    id: 'tx-exp-6',
    profileId: 'p-familiar',
    accountId: 'acc-familiar-inter',
    categoryId: 'cat-alimentacao',
    amount: 1400,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-09',
    description: 'Compras Mercado Familiar Semanal',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-exp-7',
    profileId: 'p-familiar',
    accountId: 'acc-familiar-inter',
    categoryId: 'cat-saude',
    amount: 1000,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-16',
    description: 'Plano de Saúde e Farmácia Família',
    paymentMethod: 'BOLETO',
  },

  // --- EXPENSES (PATRIMÔNIO - Total 1.850) ---
  {
    id: 'tx-exp-8',
    profileId: 'p-patrimonio',
    accountId: 'acc-xp-patrimonio',
    categoryId: 'cat-moradia',
    amount: 1200,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-11',
    description: 'IPTU e Manutenção do Imóvel Centro',
    paymentMethod: 'ACCOUNT',
  },
  {
    id: 'tx-exp-9',
    profileId: 'p-patrimonio',
    accountId: 'acc-xp-patrimonio',
    categoryId: 'cat-outros',
    amount: 650,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-20',
    description: 'Taxa de Custódia e Administração Ativos',
    paymentMethod: 'ACCOUNT',
  },

  // --- EXPENSES (PERFIL ADICIONAL - Total 1.800) ---
  {
    id: 'tx-exp-10',
    profileId: 'p-adicional',
    accountId: 'acc-btg-adicional',
    categoryId: 'cat-outros',
    amount: 1800,
    currency: 'BRL',
    type: 'EXPENSE',
    status: 'COMPLETED',
    effectiveDate: '2026-10-15',
    description: 'Serviços em Nuvem e Softwares do Projeto',
    paymentMethod: 'CREDIT_CARD',
  },

  // --- TRANSFERÊNCIA ENTRE PERFIS DEMONSTRATIVA (Pessoal -> Familiar R$ 1.000) ---
  // Não cria receita nem despesa no Consolidado!
  {
    id: 'tx-transf-pessoal',
    profileId: 'p-pessoal',
    accountId: 'acc-nubank',
    amount: 1000,
    currency: 'BRL',
    type: 'TRANSFER',
    status: 'COMPLETED',
    effectiveDate: '2026-10-10',
    description: 'Transferência para Fundo Familiar',
    isInternalTransfer: true,
    transferId: 'tr-1',
  },
  {
    id: 'tx-transf-familiar',
    profileId: 'p-familiar',
    accountId: 'acc-familiar-inter',
    amount: 1000,
    currency: 'BRL',
    type: 'TRANSFER',
    status: 'COMPLETED',
    effectiveDate: '2026-10-10',
    description: 'Transferência recebida de Pessoal',
    isInternalTransfer: true,
    transferId: 'tr-1',
  },
];

// Initial Budgets for October 2026
export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-oct-2026',
    profileId: 'p-pessoal',
    referenceMonth: 10,
    referenceYear: 2026,
    totalPlanned: 12000,
    limits: [
      { id: 'bl-1', budgetId: 'b-oct-2026', categoryId: 'cat-moradia', limitAmount: 4500, spentAmount: 3800 },
      { id: 'bl-2', budgetId: 'b-oct-2026', categoryId: 'cat-alimentacao', limitAmount: 2200, spentAmount: 1850 },
      { id: 'bl-3', budgetId: 'b-oct-2026', categoryId: 'cat-transporte', limitAmount: 1500, spentAmount: 1100 },
      { id: 'bl-4', budgetId: 'b-oct-2026', categoryId: 'cat-cartao-compras', limitAmount: 2500, spentAmount: 2150 },
      { id: 'bl-5', budgetId: 'b-oct-2026', categoryId: 'cat-lazer', limitAmount: 1300, spentAmount: 1000 },
    ],
  },
];

// Initial Financial Goals
export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'g-1',
    profileId: 'p-pessoal',
    name: 'Reserva de Emergência (6 Meses)',
    targetAmount: 60000,
    currentAmount: 48000,
    targetDate: '2026-12-31',
    status: 'IN_PROGRESS',
    color: '#10B981',
    category: 'Segurança',
  },
  {
    id: 'g-2',
    profileId: 'p-familiar',
    name: 'Viagem em Família (Europa 2027)',
    targetAmount: 35000,
    currentAmount: 19500,
    targetDate: '2027-06-15',
    status: 'IN_PROGRESS',
    color: '#3B82F6',
    category: 'Lazer',
  },
  {
    id: 'g-3',
    profileId: 'p-patrimonio',
    name: 'Aporte Inicial Novo Imóvel',
    targetAmount: 150000,
    currentAmount: 72000,
    targetDate: '2028-01-01',
    status: 'IN_PROGRESS',
    color: '#8B5CF6',
    category: 'Patrimônio',
  },
];

interface FinanceContextType {
  profiles: FinancialProfile[];
  activeProfileId: string; // 'CONSOLIDATED' or profile.id
  setActiveProfileId: (id: string) => void;
  activeProfile: FinancialProfile | undefined;
  isConsolidated: boolean;
  
  accounts: BankAccount[];
  creditCards: CreditCard[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  
  // Date period
  referenceMonth: number;
  referenceYear: number;
  setPeriod: (month: number, year: number) => void;
  
  // Calculations
  metrics: DashboardMetrics;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addTransfer: (params: {
    sourceAccountId: string;
    destAccountId: string;
    sourceProfileId: string;
    destProfileId: string;
    amount: number;
    description: string;
  }) => void;
  addAccount: (acc: Omit<BankAccount, 'id'>) => void;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<FinancialProfile[]>(INITIAL_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('CONSOLIDATED');
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(INITIAL_CARDS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  
  const [referenceMonth, setReferenceMonth] = useState<number>(10);
  const [referenceYear, setReferenceYear] = useState<number>(2026);

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId);
  }, [profiles, activeProfileId]);

  const isConsolidated = activeProfileId === 'CONSOLIDATED';

  // Calculate metrics reacting immediately to state changes
  const metrics = useMemo(() => {
    return FinancialEngine.calculateMetrics({
      activeProfileId: isConsolidated ? 'CONSOLIDATED' : activeProfileId,
      profiles,
      transactions,
      accounts,
      creditCards,
      transfers: [],
      referenceMonth,
      referenceYear,
    });
  }, [activeProfileId, profiles, transactions, accounts, creditCards, referenceMonth, referenceYear, isConsolidated]);

  const setPeriod = (month: number, year: number) => {
    setReferenceMonth(month);
    setReferenceYear(year);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If transaction affects a bank account directly and is completed
    if (newTx.accountId && newTx.status === 'COMPLETED' && !newTx.isInternalTransfer) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newTx.accountId) {
            const delta = newTx.type === 'INCOME' ? newTx.amount : -newTx.amount;
            return { ...acc, currentBalance: acc.currentBalance + delta };
          }
          return acc;
        })
      );
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addTransfer = (params: {
    sourceAccountId: string;
    destAccountId: string;
    sourceProfileId: string;
    destProfileId: string;
    amount: number;
    description: string;
  }) => {
    const isCross = params.sourceProfileId !== params.destProfileId;
    const transferId = `tr-${Date.now()}`;
    const today = `${referenceYear}-${String(referenceMonth).padStart(2, '0')}-15`;

    // Deduct from source account
    const debitTx: Transaction = {
      id: `tx-deb-${Date.now()}`,
      profileId: params.sourceProfileId,
      accountId: params.sourceAccountId,
      amount: params.amount,
      currency: 'BRL',
      type: 'TRANSFER',
      status: 'COMPLETED',
      effectiveDate: today,
      description: `Transferência enviada: ${params.description}`,
      isInternalTransfer: true,
      transferId,
    };

    // Credit to destination account
    const creditTx: Transaction = {
      id: `tx-cred-${Date.now()}`,
      profileId: params.destProfileId,
      accountId: params.destAccountId,
      amount: params.amount,
      currency: 'BRL',
      type: 'TRANSFER',
      status: 'COMPLETED',
      effectiveDate: today,
      description: `Transferência recebida: ${params.description}`,
      isInternalTransfer: true,
      transferId,
    };

    setTransactions((prev) => [debitTx, creditTx, ...prev]);

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === params.sourceAccountId) {
          return { ...acc, currentBalance: acc.currentBalance - params.amount };
        }
        if (acc.id === params.destAccountId) {
          return { ...acc, currentBalance: acc.currentBalance + params.amount };
        }
        return acc;
      })
    );
  };

  const addAccount = (acc: Omit<BankAccount, 'id'>) => {
    const newAccount: BankAccount = {
      ...acc,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const addCreditCard = (card: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...card,
      id: `card-${Date.now()}`,
    };
    setCreditCards((prev) => [...prev, newCard]);
  };

  return (
    <FinanceContext.Provider
      value={{
        profiles,
        activeProfileId,
        setActiveProfileId,
        activeProfile,
        isConsolidated,
        accounts,
        creditCards,
        categories,
        transactions,
        budgets,
        goals,
        referenceMonth,
        referenceYear,
        setPeriod,
        metrics,
        addTransaction,
        deleteTransaction,
        addTransfer,
        addAccount,
        addCreditCard,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
