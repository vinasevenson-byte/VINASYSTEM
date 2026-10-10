import express from 'express';
import cors from 'cors';
import { FinancialEngine } from '@boma/shared';
import {
  FinancialProfile,
  BankAccount,
  CreditCard,
  Transaction,
  Transfer,
} from '@boma/shared';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-Memory store initialized with seeded multi-profile data
let profiles: FinancialProfile[] = [
  { id: 'p-pessoal', name: 'Pessoal', description: 'Renda e despesas próprias', color: '#059669', currency: 'BRL', archived: false, isDefault: true },
  { id: 'p-familiar', name: 'Familiar', description: 'Despesas compartilhadas', color: '#3B82F6', currency: 'BRL', archived: false },
  { id: 'p-patrimonio', name: 'Patrimônio', description: 'Bens, ativos e obrigações', color: '#8B5CF6', currency: 'BRL', archived: false },
  { id: 'p-adicional', name: 'Perfil adicional', description: 'Outra estrutura financeira', color: '#F59E0B', currency: 'BRL', archived: false },
];

let accounts: BankAccount[] = [
  { id: 'acc-nubank', profileId: 'p-pessoal', name: 'Nubank Conta Principal', bankName: 'Nubank', accountType: 'CHECKING', initialBalance: 15400, currentBalance: 24500, color: '#820AD1' },
  { id: 'acc-itau', profileId: 'p-pessoal', name: 'Itaú Personalité', bankName: 'Itaú Unibanco', accountType: 'CHECKING', initialBalance: 12000, currentBalance: 18200, color: '#EC7000' },
  { id: 'acc-familiar-inter', profileId: 'p-familiar', name: 'Inter Casa & Família', bankName: 'Banco Inter', accountType: 'CHECKING', initialBalance: 6000, currentBalance: 11400, color: '#FF7A00' },
  { id: 'acc-xp-patrimonio', profileId: 'p-patrimonio', name: 'XP Investimentos', bankName: 'XP Investimentos', accountType: 'INVESTMENT', initialBalance: 30000, currentBalance: 34500, color: '#000000' },
  { id: 'acc-btg-adicional', profileId: 'p-adicional', name: 'BTG Pactual Projetos', bankName: 'BTG Pactual', accountType: 'CHECKING', initialBalance: 5000, currentBalance: 8000, color: '#002C6C' },
];

let creditCards: CreditCard[] = [
  { id: 'card-ultra', profileId: 'p-pessoal', name: 'Nubank Ultravioleta', brand: 'Mastercard Black', creditLimit: 35000, availableLimit: 29850, closingDay: 28, dueDay: 5, color: '#820AD1', lastFourDigits: '9412', currentInvoiceAmount: 5150 },
  { id: 'card-xp', profileId: 'p-patrimonio', name: 'XP Visa Infinite', brand: 'Visa Infinite', creditLimit: 50000, availableLimit: 46200, closingDay: 25, dueDay: 10, color: '#1E293B', lastFourDigits: '3301', currentInvoiceAmount: 3800 },
  { id: 'card-inter', profileId: 'p-familiar', name: 'Inter Casa Mastercard', brand: 'Mastercard Gold', creditLimit: 15000, availableLimit: 12100, closingDay: 20, dueDay: 1, color: '#FF7A00', lastFourDigits: '7721', currentInvoiceAmount: 2900 },
];

let transactions: Transaction[] = [
  // Receitas (Total R$ 30.600,00)
  { id: 'tx-1', profileId: 'p-pessoal', accountId: 'acc-nubank', amount: 15000, currency: 'BRL', type: 'INCOME', status: 'COMPLETED', effectiveDate: '2026-10-05', description: 'Salário Mensal Executivo' },
  { id: 'tx-2', profileId: 'p-pessoal', accountId: 'acc-itau', amount: 3000, currency: 'BRL', type: 'INCOME', status: 'COMPLETED', effectiveDate: '2026-10-15', description: 'Pró-labore Complementar' },
  { id: 'tx-3', profileId: 'p-familiar', accountId: 'acc-familiar-inter', amount: 4500, currency: 'BRL', type: 'INCOME', status: 'COMPLETED', effectiveDate: '2026-10-06', description: 'Aporte Orçamento Familiar' },
  { id: 'tx-4', profileId: 'p-patrimonio', accountId: 'acc-xp-patrimonio', amount: 2200, currency: 'BRL', type: 'INCOME', status: 'COMPLETED', effectiveDate: '2026-10-10', description: 'Dividendos FIIs XP' },
  { id: 'tx-5', profileId: 'p-patrimonio', accountId: 'acc-xp-patrimonio', amount: 1600, currency: 'BRL', type: 'INCOME', status: 'COMPLETED', effectiveDate: '2026-10-08', description: 'Aluguel Studio Centro' },
  { id: 'tx-6', profileId: 'p-adicional', accountId: 'acc-btg-adicional', amount: 4300, currency: 'BRL', type: 'INCOME', status: 'COMPLETED', effectiveDate: '2026-10-12', description: 'Honorários Consultoria' },
  // Despesas (Total R$ 15.950,00)
  { id: 'tx-7', profileId: 'p-pessoal', accountId: 'acc-nubank', amount: 3800, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-05', description: 'Moradia e Condomínio' },
  { id: 'tx-8', profileId: 'p-pessoal', amount: 2150, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-12', description: 'Cartão Nubank Ultravioleta' },
  { id: 'tx-9', profileId: 'p-pessoal', amount: 1850, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-18', description: 'Supermercado e Feira' },
  { id: 'tx-10', profileId: 'p-pessoal', amount: 1100, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-14', description: 'Transporte e Combustível' },
  { id: 'tx-11', profileId: 'p-pessoal', amount: 1000, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-22', description: 'Restaurantes e Lazer' },
  { id: 'tx-12', profileId: 'p-familiar', accountId: 'acc-familiar-inter', amount: 1400, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-09', description: 'Mercado Casa Familiar' },
  { id: 'tx-13', profileId: 'p-familiar', accountId: 'acc-familiar-inter', amount: 1000, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-16', description: 'Plano de Saúde' },
  { id: 'tx-14', profileId: 'p-patrimonio', accountId: 'acc-xp-patrimonio', amount: 1200, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-11', description: 'IPTU e Manutenção Imóvel' },
  { id: 'tx-15', profileId: 'p-patrimonio', accountId: 'acc-xp-patrimonio', amount: 650, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-20', description: 'Taxa Custódia XP' },
  { id: 'tx-16', profileId: 'p-adicional', accountId: 'acc-btg-adicional', amount: 1800, currency: 'BRL', type: 'EXPENSE', status: 'COMPLETED', effectiveDate: '2026-10-15', description: 'Serviços em Nuvem' },
  // Transferência interna eliminada no consolidado
  { id: 'tx-tr-1', profileId: 'p-pessoal', accountId: 'acc-nubank', amount: 1000, currency: 'BRL', type: 'TRANSFER', status: 'COMPLETED', effectiveDate: '2026-10-10', description: 'Transferência para Fundo Familiar', isInternalTransfer: true },
  { id: 'tx-tr-2', profileId: 'p-familiar', accountId: 'acc-familiar-inter', amount: 1000, currency: 'BRL', type: 'TRANSFER', status: 'COMPLETED', effectiveDate: '2026-10-10', description: 'Transferência recebida de Pessoal', isInternalTransfer: true },
];

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'BOMA Finance REST API', timestamp: new Date().toISOString() });
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    token: 'jwt-boma-demo-token',
    user: {
      id: 'usr-1',
      name: 'Vinicius P.',
      email: email || 'vinicius@bomafinance.com',
      role: 'ADMIN',
    },
  });
});

// Profiles API
app.get('/api/profiles', (req, res) => {
  res.json(profiles);
});

app.post('/api/profiles', (req, res) => {
  const newProfile: FinancialProfile = {
    id: `p-${Date.now()}`,
    name: req.body.name,
    description: req.body.description,
    color: req.body.color || '#10B981',
    currency: 'BRL',
    archived: false,
  };
  profiles.push(newProfile);
  res.status(201).json(newProfile);
});

// Dashboard API (with exact FinancialEngine calculation)
app.get('/api/dashboard', (req, res) => {
  const profileId = (req.query.profileId as string) || 'CONSOLIDATED';
  const month = parseInt((req.query.month as string) || '10', 10);
  const year = parseInt((req.query.year as string) || '2026', 10);

  const metrics = FinancialEngine.calculateMetrics({
    activeProfileId: profileId === 'CONSOLIDATED' ? 'CONSOLIDATED' : profileId,
    profiles,
    transactions,
    accounts,
    creditCards,
    transfers: [],
    referenceMonth: month,
    referenceYear: year,
  });

  res.json({
    metrics,
    accounts: profileId === 'CONSOLIDATED' ? accounts : accounts.filter((a) => a.profileId === profileId),
    creditCards: profileId === 'CONSOLIDATED' ? creditCards : creditCards.filter((c) => c.profileId === profileId),
  });
});

// Accounts API
app.get('/api/accounts', (req, res) => {
  const { profileId } = req.query;
  if (profileId && profileId !== 'CONSOLIDATED') {
    return res.json(accounts.filter((a) => a.profileId === profileId));
  }
  res.json(accounts);
});

// Transactions API
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const newTx: Transaction = {
    ...req.body,
    id: `tx-${Date.now()}`,
    currency: 'BRL',
    createdAt: new Date().toISOString(),
  };
  transactions.unshift(newTx);
  res.status(201).json(newTx);
});

// Transfers API (with anti-duplication rule)
app.post('/api/transfers', (req, res) => {
  const { sourceProfileId, destProfileId, sourceAccountId, destAccountId, amount, description } = req.body;
  const transferId = `tr-${Date.now()}`;
  const today = '2026-10-15';

  const debitTx: Transaction = {
    id: `tx-deb-${Date.now()}`,
    profileId: sourceProfileId,
    accountId: sourceAccountId,
    amount: Number(amount),
    currency: 'BRL',
    type: 'TRANSFER',
    status: 'COMPLETED',
    effectiveDate: today,
    description: `Transferência enviada: ${description}`,
    isInternalTransfer: true,
    transferId,
  };

  const creditTx: Transaction = {
    id: `tx-cred-${Date.now()}`,
    profileId: destProfileId,
    accountId: destAccountId,
    amount: Number(amount),
    currency: 'BRL',
    type: 'TRANSFER',
    status: 'COMPLETED',
    effectiveDate: today,
    description: `Transferência recebida: ${description}`,
    isInternalTransfer: true,
    transferId,
  };

  transactions.unshift(debitTx, creditTx);
  res.status(201).json({ success: true, transferId, eliminatedInConsolidated: true });
});

// Credit cards API
app.get('/api/credit-cards', (req, res) => {
  res.json(creditCards);
});

app.listen(PORT, () => {
  console.log(`[BOMA Finance API] Server running on http://localhost:${PORT}`);
});
