import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{LayoutDashboard,Users,Wallet,ReceiptText,Landmark,ArrowLeftRight,LogOut,Plus,Menu,ChartNoAxesCombined,ShieldCheck,CreditCard,CheckCircle2,Clock,RotateCcw,Target,Calendar,Bot,FileSpreadsheet,Sparkles,TrendingUp,AlertTriangle,ArrowDownRight,ArrowUpRight,DollarSign,PieChart,Pencil,Trash2,Search,Filter}from'lucide-react';
import './style.css';

type Profile={id:string,name:string,role:string};
type Account={id:string,name:string,openingBalance:string};
type Entry={id:string,type:string,status:string,amount:string,description:string,occurredAt:string,reconciled?:boolean,accountId?:string,account:{name:string}};
type Card={id:string,name:string,limit:string,closingDay:number,dueDay:number,color?:string,availableLimit:string,currentInvoice?:{id:string,referenceMonth:string,totalAmount:string,status:string}};
type Commitment={id:string,type:'PAYABLE'|'RECEIVABLE',status:'PENDING'|'PAID',description:string,amount:string,dueDate:string,entityName?:string,category?:string,paidAt?:string};
type Goal={id:string,name:string,targetAmount:string,currentAmount:string,progress:number,targetDate?:string,status:string,color?:string};
type Budget={id:string,categoryName:string,plannedAmount:string,spentAmount:string,percentageUsed:number};
type CashflowItem={month:string,income:string,expense:string,obligations:string,net:string};
type AdvisorData={score:number,status:string,safeMonthlySpend:string,threeMonthSurplus:string,diagnosis:string,actionPlan:string[],aiGenerated:boolean};
type Dash={income:string,expense:string,result:string,balance:string,projectedBalance?:string,scheduledIncome?:string,scheduledExpense?:string,profileCount:number,accountCount:number};

const money=(value:string|number)=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const API_BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')+'/api';
const DEMO_PROFILES: Profile[] = [
  { id: 'p-pessoal', name: 'Pessoal', role: 'OWNER' },
  { id: 'p-familiar', name: 'Familiar', role: 'MANAGER' },
  { id: 'p-patrimonio', name: 'Patrimônio & Investimentos', role: 'OWNER' }
];
const DEMO_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Nubank Principal', openingBalance: '15650.00' },
  { id: 'acc-2', name: 'Itaú Personalité', openingBalance: '28400.00' },
  { id: 'acc-3', name: 'XP Investimentos', openingBalance: '65200.00' }
];
const DEMO_CARDS: Card[] = [
  { id: 'card-1', name: 'Nubank Ultravioleta', limit: '20000.00', closingDay: 25, dueDay: 5, color: '#8a05be', availableLimit: '16000.00', currentInvoice: { id: 'inv-1', referenceMonth: '2026-10', totalAmount: '4000.00', status: 'OPEN' } }
];
const DEMO_ENTRIES: Entry[] = [
  { id: 'e-1', type: 'INCOME', status: 'POSTED', amount: '12500.00', description: 'Salário Executivo', occurredAt: new Date().toISOString(), account: { name: 'Nubank Principal' } },
  { id: 'e-2', type: 'EXPENSE', status: 'POSTED', amount: '2450.00', description: 'Aluguel Residencial', occurredAt: new Date().toISOString(), account: { name: 'Nubank Principal' } },
  { id: 'e-3', type: 'EXPENSE', status: 'POSTED', amount: '1250.00', description: 'Supermercado Mensal', occurredAt: new Date().toISOString(), account: { name: 'Nubank Principal' } },
  { id: 'e-4', type: 'INCOME', status: 'SCHEDULED', amount: '3500.00', description: 'Rendimento de Dividendos', occurredAt: new Date(Date.now()+5*86400000).toISOString(), account: { name: 'XP Investimentos' } },
  { id: 'e-5', type: 'EXPENSE', status: 'SCHEDULED', amount: '820.00', description: 'Seguro Auto', occurredAt: new Date(Date.now()+8*86400000).toISOString(), account: { name: 'Nubank Principal' } }
];
const DEMO_COMMITMENTS: Commitment[] = [
  { id: 'c-1', type: 'PAYABLE', status: 'PENDING', description: 'Energia Elétrica (Cemig)', amount: '385.50', dueDate: new Date(Date.now()+4*86400000).toISOString(), entityName: 'Cemig', category: 'Moradia' },
  { id: 'c-2', type: 'PAYABLE', status: 'PENDING', description: 'Condomínio Residencial', amount: '850.00', dueDate: new Date(Date.now()+9*86400000).toISOString(), entityName: 'Condomínio', category: 'Moradia' },
  { id: 'c-3', type: 'RECEIVABLE', status: 'PENDING', description: 'Consultoria Estratégica', amount: '4800.00', dueDate: new Date(Date.now()+15*86400000).toISOString(), entityName: 'Cliente Beta', category: 'Renda Extra' }
];
const DEMO_GOALS: Goal[] = [
  { id: 'g-1', name: 'Reserva de Emergência 6 Meses', targetAmount: '35000.00', currentAmount: '22000.00', progress: 62.9, status: 'IN_PROGRESS', color: '#10B981' },
  { id: 'g-2', name: 'Aporte Carteira de Dividendos', targetAmount: '100000.00', currentAmount: '65200.00', progress: 65.2, status: 'IN_PROGRESS', color: '#3B82F6' },
  { id: 'g-3', name: 'Viagem Internacional', targetAmount: '20000.00', currentAmount: '14500.00', progress: 72.5, status: 'IN_PROGRESS', color: '#F59E0B' }
];
const DEMO_BUDGETS: Budget[] = [
  { id: 'b-1', categoryName: 'Moradia', plannedAmount: '3000.00', spentAmount: '2450.00', percentageUsed: 81.7 },
  { id: 'b-2', categoryName: 'Alimentação & Mercado', plannedAmount: '2500.00', spentAmount: '1250.00', percentageUsed: 50.0 },
  { id: 'b-3', categoryName: 'Transporte & Combustível', plannedAmount: '1200.00', spentAmount: '680.00', percentageUsed: 56.7 }
];
const DEMO_CASHFLOW: CashflowItem[] = [
  { month: '2026-08', income: '12500.00', expense: '4200.00', obligations: '3200.00', net: '5100.00' },
  { month: '2026-09', income: '13200.00', expense: '4500.00', obligations: '3800.00', net: '4900.00' },
  { month: '2026-10', income: '16000.00', expense: '4820.00', obligations: '4000.00', net: '7180.00' },
  { month: '2026-11', income: '12500.00', expense: '4300.00', obligations: '2800.00', net: '5400.00' },
  { month: '2026-12', income: '24500.00', expense: '6200.00', obligations: '3500.00', net: '14800.00' },
  { month: '2027-01', income: '12500.00', expense: '4900.00', obligations: '3100.00', net: '4500.00' }
];
const DEMO_ADVISOR: AdvisorData = {
  score: 88,
  status: 'EXCELENTE',
  safeMonthlySpend: '8672.50',
  threeMonthSurplus: '17680.00',
  diagnosis: 'Diagnóstico VINA Inteligente:\n\nSua saúde financeira encontra-se em nível EXCELENTE (Score 88/100). Seu fluxo operacional apresenta margem líquida superior a 50% da renda mensal. Suas reservas cobrem com folga os compromissos dos próximos 90 dias, e os limites de cartão estão com utilização inferior a 25% do teto.',
  actionPlan: [
    'Margem de gasto discricionário seguro para este mês: R$ 8.672,50 sem comprometer nenhuma conta futura.',
    'Mantenha a programação dos aportes automáticos na meta de Reserva de Emergência.',
    'Compromissos dos próximos 90 dias já provisionados em contas de alta liquidez.'
  ],
  aiGenerated: true
};

function getDemoData<T>(path:string,body?:any):T{
  if(path.startsWith('/profiles')&&path.endsWith('/accounts')) return DEMO_ACCOUNTS as unknown as T;
  if(path.startsWith('/profiles')&&path.endsWith('/cards')) return DEMO_CARDS as unknown as T;
  if(path.startsWith('/profiles')&&path.endsWith('/entries')) return DEMO_ENTRIES as unknown as T;
  if(path.startsWith('/profiles')&&path.endsWith('/commitments')) return DEMO_COMMITMENTS as unknown as T;
  if(path.startsWith('/profiles')&&path.endsWith('/goals')) return DEMO_GOALS as unknown as T;
  if(path.startsWith('/profiles')&&path.endsWith('/budgets')) return DEMO_BUDGETS as unknown as T;
  if(path.startsWith('/profiles')) return DEMO_PROFILES as unknown as T;
  if(path.startsWith('/dashboard')) {
    return { income:'12500.00',expense:'4820.00',result:'7680.00',balance:'109250.00',projectedBalance:'111930.00',scheduledIncome:'3500.00',scheduledExpense:'820.00',profileCount:3,accountCount:3 } as unknown as T;
  }
  if(path.startsWith('/reports/cashflow')) return DEMO_CASHFLOW as unknown as T;
  if(path.startsWith('/reports/export')) {
    const csv='ID,Data,Perfil,Conta,Tipo,Status,Descricao,Valor(R$),Conciliado\n"demo-1","2026-10-10T12:00:00.000Z","Pessoal","Nubank Principal","INCOME","POSTED","Salário Executivo","12500.00","Sim"';
    return {csv,totalRecords:1} as unknown as T;
  }
  if(path.startsWith('/ai/advisor')) return DEMO_ADVISOR as unknown as T;
  return {status:'ok',id:'demo-'+Date.now()} as unknown as T;
}

interface LocalState {
  profiles: Profile[];
  accounts: (Account & { profileId: string })[];
  cards: (Card & { profileId: string })[];
  entries: (Entry & { profileId: string; accountId: string })[];
  commitments: (Commitment & { profileId: string })[];
  goals: (Goal & { profileId: string })[];
  budgets: (Budget & { profileId: string })[];
}

function getLocalState(): LocalState {
  const raw = sessionStorage.getItem('vina_store_state');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  const initial: LocalState = {
    profiles: [
      { id: 'p-pessoal', name: 'Pessoal', role: 'OWNER' },
      { id: 'p-familiar', name: 'Familiar', role: 'OWNER' }
    ],
    accounts: [
      { id: 'acc-1', profileId: 'p-pessoal', name: 'Nubank Principal', openingBalance: '15650.00' },
      { id: 'acc-2', profileId: 'p-familiar', name: 'Itaú Conjunto', openingBalance: '28400.00' }
    ],
    cards: [
      { id: 'card-1', profileId: 'p-pessoal', name: 'Nubank Ultravioleta', limit: '20000.00', closingDay: 25, dueDay: 5, color: '#8a05be', availableLimit: '16000.00', currentInvoice: { id: 'inv-1', referenceMonth: '2026-10', totalAmount: '4000.00', status: 'OPEN' } }
    ],
    entries: [
      { id: 'e-1', profileId: 'p-pessoal', accountId: 'acc-1', type: 'INCOME', status: 'POSTED', amount: '12500.00', description: 'Salário Executivo', occurredAt: new Date().toISOString(), account: { name: 'Nubank Principal' } },
      { id: 'e-2', profileId: 'p-pessoal', accountId: 'acc-1', type: 'EXPENSE', status: 'POSTED', amount: '2450.00', description: 'Aluguel Residencial', occurredAt: new Date().toISOString(), account: { name: 'Nubank Principal' } },
      { id: 'e-3', profileId: 'p-pessoal', accountId: 'acc-1', type: 'EXPENSE', status: 'POSTED', amount: '1250.00', description: 'Supermercado Mensal', occurredAt: new Date().toISOString(), account: { name: 'Nubank Principal' } },
      { id: 'e-4', profileId: 'p-pessoal', accountId: 'acc-1', type: 'EXPENSE', status: 'SCHEDULED', amount: '820.00', description: 'Seguro Auto', occurredAt: new Date(Date.now()+8*86400000).toISOString(), account: { name: 'Nubank Principal' } }
    ],
    commitments: [
      { id: 'c-1', profileId: 'p-pessoal', type: 'PAYABLE', status: 'PENDING', description: 'Energia Elétrica', amount: '385.50', dueDate: new Date(Date.now()+4*86400000).toISOString(), entityName: 'Cemig', category: 'Moradia' },
      { id: 'c-2', profileId: 'p-pessoal', type: 'PAYABLE', status: 'PENDING', description: 'Condomínio Residencial', amount: '850.00', dueDate: new Date(Date.now()+9*86400000).toISOString(), entityName: 'Condomínio', category: 'Moradia' }
    ],
    goals: [
      { id: 'g-1', profileId: 'p-pessoal', name: 'Reserva de Emergência', targetAmount: '35000.00', currentAmount: '22000.00', progress: 62.9, status: 'IN_PROGRESS', color: '#10B981' }
    ],
    budgets: [
      { id: 'b-1', profileId: 'p-pessoal', categoryName: 'Moradia', plannedAmount: '3000.00', spentAmount: '2450.00', percentageUsed: 81.7 }
    ]
  };
  sessionStorage.setItem('vina_store_state', JSON.stringify(initial));
  return initial;
}

function saveLocalState(st: LocalState) {
  sessionStorage.setItem('vina_store_state', JSON.stringify(st));
}

function executeLocalApi<T>(path: string, body?: unknown, method?: string): T {
  const b = body as any;
  const state = getLocalState();

  if (path === '/auth/login' || path === '/auth/register') {
    const rawName = b?.name || (b?.email ? b.email.split('@')[0] : 'VINICIUS');
    const displayName = rawName.toUpperCase() === 'VINICIUS' ? 'VINICIUS' : rawName;
    return {
      token: 'vina_local_session',
      user: { id: 'u-admin', name: displayName, email: b?.email || 'vinicius@vina.com' }
    } as unknown as T;
  }

  if (path === '/profiles') {
    if (b?.name) {
      const created: Profile = { id: 'p-' + Date.now(), name: b.name, role: 'OWNER' };
      state.profiles.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.profiles as unknown as T;
  }

  const accMatch = path.match(/^\/profiles\/([^/]+)\/accounts/);
  if (accMatch) {
    const pid = accMatch[1];
    if (b?.name) {
      const created = { id: 'acc-' + Date.now(), profileId: pid, name: b.name, openingBalance: String(b.openingBalance || '0.00') };
      state.accounts.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.accounts.filter(a => pid === 'all' || a.profileId === pid) as unknown as T;
  }

  const cardMatch = path.match(/^\/profiles\/([^/]+)\/cards/);
  if (cardMatch) {
    const pid = cardMatch[1];
    if (b?.name) {
      const created: Card & { profileId: string } = {
        id: 'card-' + Date.now(),
        profileId: pid,
        name: b.name,
        limit: String(b.limit || '5000.00'),
        closingDay: Number(b.closingDay || 25),
        dueDay: Number(b.dueDay || 5),
        availableLimit: String(b.limit || '5000.00'),
        color: b.color || '#13a99b',
        currentInvoice: { id: 'inv-' + Date.now(), referenceMonth: new Date().toISOString().slice(0, 7), totalAmount: '0.00', status: 'OPEN' }
      };
      state.cards.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.cards.filter(c => pid === 'all' || c.profileId === pid) as unknown as T;
  }

  const purchaseMatch = path.match(/^\/cards\/([^/]+)\/purchases/);
  if (purchaseMatch) {
    const cardId = purchaseMatch[1];
    const card = state.cards.find(c => c.id === cardId);
    if (card) {
      const amt = Number(b?.totalAmount || 0);
      const used = Number(card.currentInvoice?.totalAmount || 0) + amt;
      const limit = Number(card.limit);
      card.availableLimit = Math.max(0, limit - used).toFixed(2);
      if (card.currentInvoice) {
        card.currentInvoice.totalAmount = used.toFixed(2);
      }
      saveLocalState(state);
    }
    return { success: true } as unknown as T;
  }

  const payInvMatch = path.match(/^\/cards\/invoices\/([^/]+)\/pay/);
  if (payInvMatch) {
    const invId = payInvMatch[1];
    for (const card of state.cards) {
      if (card.currentInvoice && card.currentInvoice.id === invId) {
        const paidAmt = card.currentInvoice.totalAmount;
        card.currentInvoice.status = 'PAID';
        card.availableLimit = card.limit;
        const acc = state.accounts.find(a => a.id === b?.accountId) || state.accounts[0];
        if (acc) {
          state.entries.unshift({
            id: 'e-' + Date.now(),
            profileId: card.profileId,
            accountId: acc.id,
            type: 'EXPENSE',
            status: 'POSTED',
            amount: paidAmt,
            description: `Pagamento Fatura ${card.name}`,
            occurredAt: new Date().toISOString(),
            account: { name: acc.name }
          });
        }
        break;
      }
    }
    saveLocalState(state);
    return { success: true } as unknown as T;
  }

  const entriesMatch = path.match(/^\/profiles\/([^/]+)\/entries/);
  if (entriesMatch) {
    const pid = entriesMatch[1];
    return state.entries.filter(e => pid === 'all' || e.profileId === pid) as unknown as T;
  }

  if (path === '/entries') {
    const acc = state.accounts.find(a => a.id === b?.accountId) || state.accounts[0];
    const created: Entry & { profileId: string; accountId: string } = {
      id: 'e-' + Date.now(),
      profileId: b.profileId || (acc ? acc.profileId : 'p-pessoal'),
      accountId: b.accountId || (acc ? acc.id : 'acc-1'),
      type: b.type,
      status: b.status || 'POSTED',
      amount: String(b.amount),
      description: b.description,
      occurredAt: b.occurredAt || new Date().toISOString(),
      account: { name: acc ? acc.name : 'Conta Padrão' }
    };
    state.entries.unshift(created);
    saveLocalState(state);
    return created as unknown as T;
  }

  const statusMatch = path.match(/^\/entries\/([^/]+)\/status/);
  if (statusMatch) {
    const entry = state.entries.find(e => e.id === statusMatch[1]);
    if (entry && b?.status) {
      entry.status = b.status;
      saveLocalState(state);
    }
    return entry as unknown as T;
  }

  const reconcileMatch = path.match(/^\/entries\/([^/]+)\/reconcile/);
  if (reconcileMatch) {
    const entry = state.entries.find(e => e.id === reconcileMatch[1]);
    if (entry) {
      entry.reconciled = true;
      saveLocalState(state);
    }
    return entry as unknown as T;
  }

  const entryIdMatch = path.match(/^\/entries\/([^/]+)$/);
  if (entryIdMatch) {
    const id = entryIdMatch[1];
    if (method === 'DELETE') {
      state.entries = state.entries.filter(e => e.id !== id);
      saveLocalState(state);
      return { success: true, deletedId: id } as unknown as T;
    }
    if (method === 'PUT') {
      const idx = state.entries.findIndex(e => e.id === id);
      if (idx !== -1) {
        const acc = b?.accountId ? state.accounts.find(a => a.id === b.accountId) : undefined;
        state.entries[idx] = {
          ...state.entries[idx],
          ...b,
          account: acc ? { name: acc.name } : state.entries[idx].account
        };
        saveLocalState(state);
        return state.entries[idx] as unknown as T;
      }
    }
  }

  if (path === '/transfers') {
    const fromAcc = state.accounts.find(a => a.id === b?.fromAccountId);
    const toAcc = state.accounts.find(a => a.id === b?.toAccountId);
    const amount = String(b.amount);
    const now = new Date().toISOString();
    state.entries.unshift({
      id: 'e-t-out-' + Date.now(),
      profileId: b.fromProfileId,
      accountId: b.fromAccountId,
      type: 'TRANSFER_OUT',
      status: 'POSTED',
      amount,
      description: b.description || 'Transferência Interna',
      occurredAt: now,
      account: { name: fromAcc ? fromAcc.name : 'Origem' }
    });
    state.entries.unshift({
      id: 'e-t-in-' + (Date.now() + 1),
      profileId: b.toProfileId,
      accountId: b.toAccountId,
      type: 'TRANSFER_IN',
      status: 'POSTED',
      amount,
      description: b.description || 'Transferência Interna',
      occurredAt: now,
      account: { name: toAcc ? toAcc.name : 'Destino' }
    });
    saveLocalState(state);
    return { success: true } as unknown as T;
  }

  const commitMatch = path.match(/^\/profiles\/([^/]+)\/commitments/);
  if (commitMatch) {
    const pid = commitMatch[1];
    if (b?.description) {
      const created: Commitment & { profileId: string } = {
        id: 'c-' + Date.now(),
        profileId: pid,
        type: b.type,
        status: 'PENDING',
        description: b.description,
        amount: String(b.amount),
        dueDate: b.dueDate,
        entityName: b.entityName,
        category: b.category
      };
      state.commitments.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.commitments.filter(c => pid === 'all' || c.profileId === pid) as unknown as T;
  }

  const settleMatch = path.match(/^\/commitments\/([^/]+)\/settle/);
  if (settleMatch) {
    const comm = state.commitments.find(c => c.id === settleMatch[1]);
    if (comm) {
      comm.status = 'PAID';
      comm.paidAt = new Date().toISOString();
      const acc = state.accounts.find(a => a.id === b?.accountId) || state.accounts[0];
      if (acc) {
        state.entries.unshift({
          id: 'e-' + Date.now(),
          profileId: comm.profileId,
          accountId: acc.id,
          type: comm.type === 'PAYABLE' ? 'EXPENSE' : 'INCOME',
          status: 'POSTED',
          amount: comm.amount,
          description: `Liquidação: ${comm.description}`,
          occurredAt: new Date().toISOString(),
          account: { name: acc.name }
        });
      }
      saveLocalState(state);
    }
    return { success: true } as unknown as T;
  }

  const goalMatch = path.match(/^\/profiles\/([^/]+)\/goals/);
  if (goalMatch) {
    const pid = goalMatch[1];
    if (b?.name) {
      const created: Goal & { profileId: string } = {
        id: 'g-' + Date.now(),
        profileId: pid,
        name: b.name,
        targetAmount: String(b.targetAmount),
        currentAmount: '0.00',
        progress: 0,
        status: 'IN_PROGRESS',
        color: b.color || '#10B981',
        targetDate: b.targetDate
      };
      state.goals.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.goals.filter(g => pid === 'all' || g.profileId === pid) as unknown as T;
  }

  const depositGoalMatch = path.match(/^\/goals\/([^/]+)\/deposit/);
  if (depositGoalMatch) {
    const goal = state.goals.find(g => g.id === depositGoalMatch[1]);
    if (goal) {
      const newCurr = Number(goal.currentAmount) + Number(b?.amount || 0);
      goal.currentAmount = newCurr.toFixed(2);
      goal.progress = Math.min(100, Math.round((newCurr / Number(goal.targetAmount)) * 100));
      saveLocalState(state);
    }
    return { success: true } as unknown as T;
  }

  const budgetMatch = path.match(/^\/profiles\/([^/]+)\/budgets/);
  if (budgetMatch) {
    const pid = budgetMatch[1];
    if (b?.categoryName) {
      const created: Budget & { profileId: string } = {
        id: 'b-' + Date.now(),
        profileId: pid,
        categoryName: b.categoryName,
        plannedAmount: String(b.plannedAmount),
        spentAmount: '0.00',
        percentageUsed: 0
      };
      state.budgets.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.budgets.filter(bg => pid === 'all' || bg.profileId === pid) as unknown as T;
  }

  if (path.startsWith('/dashboard')) {
    const pidParam = new URLSearchParams(path.split('?')[1] || '').get('profileId');
    const filteredEntries = state.entries.filter(e => (!pidParam || pidParam === 'all') ? true : e.profileId === pidParam);
    const filteredAccounts = state.accounts.filter(a => (!pidParam || pidParam === 'all') ? true : a.profileId === pidParam);
    
    let income = 0;
    let expense = 0;
    let scheduledIncome = 0;
    let scheduledExpense = 0;
    let balance = filteredAccounts.reduce((acc, a) => acc + Number(a.openingBalance || 0), 0);
    
    for (const e of filteredEntries) {
      if (e.status === 'VOID') continue;
      const amt = Number(e.amount || 0);
      if (e.status === 'POSTED') {
        if (e.type === 'INCOME') {
          income += amt;
          balance += amt;
        } else if (e.type === 'EXPENSE') {
          expense += amt;
          balance -= amt;
        } else if (e.type === 'TRANSFER_IN') {
          balance += amt;
        } else if (e.type === 'TRANSFER_OUT') {
          balance -= amt;
        }
      } else if (e.status === 'SCHEDULED') {
        if (e.type === 'INCOME') scheduledIncome += amt;
        if (e.type === 'EXPENSE') scheduledExpense += amt;
      }
    }
    const result = income - expense;
    const projectedBalance = balance + scheduledIncome - scheduledExpense;

    return {
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      result: result.toFixed(2),
      balance: balance.toFixed(2),
      projectedBalance: projectedBalance.toFixed(2),
      scheduledIncome: scheduledIncome.toFixed(2),
      scheduledExpense: scheduledExpense.toFixed(2),
      profileCount: state.profiles.length,
      accountCount: filteredAccounts.length
    } as unknown as T;
  }

  if (path.startsWith('/reports/cashflow')) {
    return DEMO_CASHFLOW as unknown as T;
  }

  if (path.startsWith('/reports/export')) {
    const rows = ['ID,Data,Perfil,Conta,Tipo,Status,Descricao,Valor(R$),Conciliado'];
    state.entries.forEach(e => {
      rows.push(`"${e.id}","${e.occurredAt}","${e.profileId}","${e.account?.name || ''}","${e.type}","${e.status}","${e.description}","${e.amount}","${e.reconciled ? 'Sim' : 'Não'}"`);
    });
    return { csv: rows.join('\n'), totalRecords: state.entries.length } as unknown as T;
  }

  if (path.startsWith('/ai/advisor')) {
    return DEMO_ADVISOR as unknown as T;
  }

  return { status: 'ok' } as unknown as T;
}

const api=async<T,>(path:string,token:string,body?:unknown,method?:string):Promise<T>=>{
  if(token==='demo_token'){
    return getDemoData<T>(path,body);
  }
  if(token.startsWith('vina_local_')){
    return executeLocalApi<T>(path,body,method);
  }

  let response:Response;
  try{
    response=await fetch(API_BASE+path,{
      method:method||(body?'POST':'GET'),
      headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
      body:body?JSON.stringify(body):undefined
    });
  }catch(netErr:any){
    console.warn('[VINA API] Falha de rede com backend remoto. Ativando Motor Local VINA:', netErr?.message);
    return executeLocalApi<T>(path,body,method);
  }

  const text=await response.text();
  let data:any=null;
  try{
    data=JSON.parse(text);
  }catch{
    data=null;
  }

  if(text.startsWith('<!doctype')||text.startsWith('<html')||!text.trim()||!data){
    console.warn('[VINA API] Resposta HTML recebida da URL remota (Vercel SPA). Ativando Motor Local VINA.');
    return executeLocalApi<T>(path,body,method);
  }

  if(!response.ok){
    throw new Error((Array.isArray(data.message)?data.message.join(', '):data.message)||'Falha na requisição ao servidor');
  }
  return data as T;
};

function App(){
  const [token,setToken]=useState(sessionStorage.getItem('vina_token')||sessionStorage.getItem('boma_token')||'');
  const [user,setUser]=useState(sessionStorage.getItem('vina_name')||sessionStorage.getItem('boma_name')||'');
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [selected,setSelected]=useState('all');
  const [tab,setTab]=useState('dashboard');
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [cards,setCards]=useState<Card[]>([]);
  const [entries,setEntries]=useState<Entry[]>([]);
  const [commitments,setCommitments]=useState<Commitment[]>([]);
  const [goals,setGoals]=useState<Goal[]>([]);
  const [budgets,setBudgets]=useState<Budget[]>([]);
  const [cashflow,setCashflow]=useState<CashflowItem[]>([]);
  const [advisor,setAdvisor]=useState<AdvisorData|null>(null);
  const [advisorQuestion,setAdvisorQuestion]=useState('Quanto posso gastar este mês sem comprometer minhas contas dos próximos 3 meses?');
  const [advisorLoading,setAdvisorLoading]=useState(false);
  const [dash,setDash]=useState<Dash|null>(null);
  const [error,setError]=useState('');
  const [modal,setModal]=useState('login');
  const [selectedItem,setSelectedItem]=useState<any>(null);
  const [busy,setBusy]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const [refresh,setRefresh]=useState(0);
  const [cloudGreeting,setCloudGreeting]=useState('');
  const [editingEntry,setEditingEntry]=useState<Entry|null>(null);
  const [entrySearch,setEntrySearch]=useState('');
  const [entryTypeFilter,setEntryTypeFilter]=useState('ALL');
  const [entryStatusFilter,setEntryStatusFilter]=useState('ALL');

  useEffect(()=>{
    fetch('/api/welcome').then(r=>r.json()).then(d=>{
      if(d?.greeting && d?.greeting!=='Bem-vindo ao VINA FINACE!') setCloudGreeting(d.greeting);
    }).catch(()=>{});
  },[]);

  const current=profiles.find(p=>p.id===selected);
  const load=()=>setRefresh(v=>v+1);

  useEffect(()=>{
    if(!token)return;
    api<Profile[]>('/profiles',token).then(list=>{
      setProfiles(list);
      if(selected==='all'&&list.length>0&&!sessionStorage.getItem('vina_has_selected')){
        setSelected(list[0].id);
        sessionStorage.setItem('vina_has_selected','true');
      }
    }).catch(e=>setError(e.message));
  },[token,refresh]);

  useEffect(()=>{
    if(!token)return;
    api<Dash>('/dashboard'+(selected==='all'?'':'?profileId='+selected),token).then(setDash).catch(e=>setError(e.message));
    api<CashflowItem[]>('/reports/cashflow'+(selected==='all'?'':'?profileId='+selected),token).then(setCashflow).catch(()=>{});

    if(selected==='all'){
      setAccounts([]);
      setCards([]);
      setEntries([]);
      setCommitments([]);
      setGoals([]);
      setBudgets([]);
    }else{
      api<Account[]>(`/profiles/${selected}/accounts`,token).then(setAccounts).catch(e=>setError(e.message));
      api<Card[]>(`/profiles/${selected}/cards`,token).then(setCards).catch(e=>setError(e.message));
      api<Entry[]>(`/profiles/${selected}/entries`,token).then(setEntries).catch(e=>setError(e.message));
      api<Commitment[]>(`/profiles/${selected}/commitments`,token).then(setCommitments).catch(()=>{});
      api<Goal[]>(`/profiles/${selected}/goals`,token).then(setGoals).catch(()=>{});
      api<Budget[]>(`/profiles/${selected}/budgets`,token).then(setBudgets).catch(()=>{});
    }
  },[selected,token,refresh]);

  const logout=()=>{
    sessionStorage.removeItem('vina_token');
    sessionStorage.removeItem('vina_name');
    sessionStorage.removeItem('boma_token');
    sessionStorage.removeItem('boma_name');
    setToken('');
    setUser('');
    setProfiles([]);
    setModal('login');
  };

  const askAdvisor=async(q?:string)=>{
    if(!token)return;
    setAdvisorLoading(true);
    try{
      const res=await api<AdvisorData>('/ai/advisor',token,{
        profileId:selected==='all'?undefined:selected,
        question:q||advisorQuestion
      });
      setAdvisor(res);
    }catch(ex){
      setError((ex as Error).message);
    }finally{
      setAdvisorLoading(false);
    }
  };

  const handleNewEntry=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil financeiro antes de realizar um lançamento.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('A Visão Consolidada reúne múltiplos perfis. Selecione um perfil financeiro individual no seletor "Perfil Ativo" (no topo da tela) para vincular este lançamento.');
      return;
    }
    if(!accounts||accounts.length===0){
      setError(`O perfil "${current?.name||'selecionado'}" ainda não possui contas bancárias cadastradas. Cadastre a primeira conta para este perfil.`);
      setModal('account');
      return;
    }
    setModal('entry');
  };

  const handleNewCard=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil antes de adicionar cartões.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('Selecione um perfil financeiro individual no topo da página para vincular o novo cartão de crédito.');
      return;
    }
    setModal('card');
  };

  const handleNewPurchase=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil antes de lançar compras no cartão.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('Selecione um perfil financeiro individual no topo da página para compras no cartão.');
      return;
    }
    if(!cards||cards.length===0){
      setError('Nenhum cartão cadastrado neste perfil. Cadastre seu cartão primeiro.');
      setModal('card');
      return;
    }
    setModal('purchase');
  };

  const handleNewAccount=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil antes de cadastrar contas bancárias.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('Selecione um perfil individual no topo da página para adicionar uma conta bancária.');
      return;
    }
    setModal('account');
  };

  const handleNewCommitment=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil antes de adicionar compromissos a pagar ou receber.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('Selecione um perfil individual no topo da página para gerenciar compromissos.');
      return;
    }
    setModal('commitment');
  };

  const handleNewGoal=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil antes de criar metas financeiras.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('Selecione um perfil individual no topo da página para cadastrar metas.');
      return;
    }
    setModal('goal');
  };

  const handleDeleteEntry=async(id:string)=>{
    if(!window.confirm('Deseja realmente excluir permanentemente este lançamento financeiro?')) return;
    try{
      await api(`/entries/${id}`,token,{},'DELETE');
      load();
    }catch(ex){
      setError((ex as Error).message);
    }
  };

  const handleEditEntry=(e:Entry)=>{
    setEditingEntry(e);
    setModal('edit_entry');
  };

  const exportCsv=async()=>{
    try{
      const data=await api<{csv:string,totalRecords:number}>('/reports/export'+(selected==='all'?'':'?profileId='+selected),token);
      const blob=new Blob([data.csv],{type:'text/csv;charset=utf-8;'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;
      link.setAttribute('download',`vina-finace-extrato-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }catch(ex){
      setError((ex as Error).message);
    }
  };

  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setError('');
    setBusy(true);
    const f=new FormData(e.currentTarget);
    const v=(key:string)=>String(f.get(key)||'');
    try{
      if(modal==='login'||modal==='register'){
        const r=await api<{token:string,user:{name:string}}>('/auth/'+modal,'',modal==='login'?{email:v('email'),password:v('password')}:{email:v('email'),password:v('password'),name:v('name')});
        sessionStorage.setItem('vina_token',r.token);
        sessionStorage.setItem('vina_name',r.user.name);
        sessionStorage.removeItem('boma_token');
        sessionStorage.removeItem('boma_name');
        setToken(r.token);
        setUser(r.user.name);
      }else if(modal==='profile'){
        const created=await api<{id:string}>('/profiles',token,{name:v('name')});
        if(created?.id)setSelected(created.id);
      }else if(modal==='account'){
        await api(`/profiles/${selected}/accounts`,token,{name:v('name'),openingBalance:v('balance')});
      }else if(modal==='card'){
        await api(`/profiles/${selected}/cards`,token,{name:v('name'),limit:v('limit'),closingDay:Number(v('closingDay')),dueDay:Number(v('dueDay')),color:v('color')||'#13a99b'});
      }else if(modal==='purchase'){
        await api(`/cards/${v('cardId')}/purchases`,token,{description:v('description'),totalAmount:v('amount'),totalInstallments:Number(v('installments')||1),purchaseDate:new Date(v('date')+'T12:00:00').toISOString()});
      }else if(modal==='pay_invoice'){
        await api(`/cards/invoices/${v('invoiceId')}/pay`,token,{accountId:v('accountId')});
      }else if(modal==='entry'){
        const amt=Number(v('amount'));
        if(isNaN(amt)||amt<=0){
          throw new Error('O valor do lançamento deve ser maior que zero (R$ 0,01).');
        }
        if(!v('description').trim()){
          throw new Error('A descrição do lançamento é obrigatória.');
        }
        if(!v('accountId')){
          throw new Error('Selecione uma conta bancária para o lançamento.');
        }
        const notes=v('notes')?.trim();
        const cat=v('category')?.trim();
        let desc=v('description').trim();
        if(cat) desc += ` [${cat}]`;
        if(notes) desc += ` — ${notes}`;
        await api('/entries',token,{
          profileId:selected,
          accountId:v('accountId'),
          type:v('type') as 'INCOME'|'EXPENSE',
          status:v('status')||'POSTED',
          amount:amt.toFixed(2),
          description:desc,
          occurredAt:new Date(v('date')+'T12:00:00').toISOString()
        });
      }else if(modal==='edit_entry'&&editingEntry){
        const amt=Number(v('amount'));
        if(isNaN(amt)||amt<=0) throw new Error('O valor do lançamento deve ser maior que zero (R$ 0,01).');
        if(!v('description').trim()) throw new Error('A descrição do lançamento é obrigatória.');
        await api(`/entries/${editingEntry.id}`,token,{
          description:v('description').trim(),
          amount:amt.toFixed(2),
          type:v('type') as 'INCOME'|'EXPENSE',
          status:v('status')||editingEntry.status,
          accountId:v('accountId')||editingEntry.accountId,
          occurredAt:new Date(v('date')+'T12:00:00').toISOString()
        },'PUT');
        setEditingEntry(null);
      }else if(modal==='transfer'){
        await api('/transfers',token,{fromProfileId:selected,fromAccountId:v('fromAccount'),toProfileId:v('toProfile'),toAccountId:v('toAccount'),amount:v('amount'),description:v('description')});
      }else if(modal==='commitment'){
        await api(`/profiles/${selected}/commitments`,token,{type:v('type'),description:v('description'),amount:v('amount'),dueDate:new Date(v('dueDate')+'T12:00:00').toISOString(),entityName:v('entityName'),category:v('category'),isRecurring:v('isRecurring')==='true'});
      }else if(modal==='settle_commitment'){
        await api(`/commitments/${selectedItem?.id}/settle`,token,{accountId:v('accountId')});
      }else if(modal==='goal'){
        await api(`/profiles/${selected}/goals`,token,{name:v('name'),targetAmount:v('targetAmount'),targetDate:v('targetDate')?new Date(v('targetDate')+'T12:00:00').toISOString():undefined,color:v('color')||'#10B981'});
      }else if(modal==='deposit_goal'){
        await api(`/goals/${selectedItem?.id}/deposit`,token,{amount:v('amount'),accountId:v('accountId')||undefined});
      }else if(modal==='budget'){
        const now=new Date();
        const refMonth=`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`;
        await api(`/profiles/${selected}/budgets`,token,{referenceMonth:refMonth,categoryName:v('categoryName'),plannedAmount:v('plannedAmount')});
      }
      setModal('');
      setSelectedItem(null);
      load();
    }catch(ex){
      setError((ex as Error).message);
    }finally{
      setBusy(false);
    }
  };

  const updateStatus=async(id:string,status:string)=>{
    try{
      await api(`/entries/${id}/status`,token,{status},'PATCH');
      load();
    }catch(ex){setError((ex as Error).message);}
  };

  const reconcile=async(id:string)=>{
    try{
      await api(`/entries/${id}/reconcile`,token,{},'POST');
      load();
    }catch(ex){setError((ex as Error).message);}
  };

  const deleteCommitment=async(id:string)=>{
    try{
      await api(`/commitments/${id}`,token,{},'DELETE');
      load();
    }catch(ex){setError((ex as Error).message);}
  };

  const filteredEntries = entries.filter(e => {
    if (entryTypeFilter !== 'ALL' && e.type !== entryTypeFilter) return false;
    if (entryStatusFilter !== 'ALL' && e.status !== entryStatusFilter) return false;
    if (entrySearch.trim()) {
      const q = entrySearch.toLowerCase();
      const desc = (e.description || '').toLowerCase();
      const acc = (e.account?.name || '').toLowerCase();
      if (!desc.includes(q) && !acc.includes(q)) return false;
    }
    return true;
  });

  if(!token){
    return (
      <div className="auth-wrapper">
        <div className="login-card">
          <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}>
            <div className="brand-icon" style={{width:'48px',height:'48px',fontSize:'22px'}}>V</div>
          </div>
          <h1>VINA FINACE</h1>
          <p>ERP de Gestão Financeira Pessoal e Familiar</p>
          {cloudGreeting&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',padding:'6px 10px',fontSize:'12px',color:'#166534',marginBottom:'12px',textAlign:'center'}}>✨ {cloudGreeting}</div>}
          <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
            <button className={modal==='login'?'primary':'secondary'} style={{flex:1}} onClick={()=>setModal('login')}>Entrar</button>
            <button className={modal==='register'?'primary':'secondary'} style={{flex:1}} onClick={()=>setModal('register')}>Cadastre-se</button>
          </div>
          <form onSubmit={submit}>
            {modal==='register'&&<label>Seu nome completo<input name="name" required placeholder="Ex.: Vinícius"/></label>}
            <label>Usuário ou E-mail<input name="email" type="text" defaultValue={modal==='login'?'VINICIUS':''} required placeholder="VINICIUS ou seu@email.com"/></label>
            <label>Senha de acesso<input name="password" type="password" minLength={6} defaultValue={modal==='login'?'VINA123':''} required placeholder="••••••••••••"/></label>
            <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
              <strong>🔑 Acesso Padrão:</strong> Usuário <code>VINICIUS</code> · Senha <code>VINA123</code>
            </div>
            {error&&<div className="error">{error}</div>}
            <button className="primary" style={{width:'100%',marginTop:'8px',padding:'12px'}} type="submit" disabled={busy}>{busy?'Autenticando...':modal==='login'?'Acessar VINA FINACE':'Criar minha conta'}</button>
            <button
              type="button"
              className="secondary"
              style={{width:'100%',marginTop:'10px',background:'#def3ef',color:'#11756f',borderColor:'#a2dec9',fontWeight:700,fontSize:'13px',padding:'11px'}}
              onClick={()=>{
                sessionStorage.setItem('vina_token','demo_token');
                sessionStorage.setItem('vina_name','Vinicius VINA');
                setToken('demo_token');
                setUser('Vinicius VINA');
              }}
            >
              ✨ Acessar Modo Demonstração (VINA Preview)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed?'collapsed':''}`}>
        <div className="brand">
          <div className="brand-icon">V</div>
          {!collapsed&&<div><h1>VINA FINACE</h1><span>ERP Pessoal & Familiar</span></div>}
        </div>

        <div className="sidebar-scroll">
          {!collapsed&&<div className="nav-section-title">Menu Principal</div>}
          <button className={`nav-item ${tab==='dashboard'?'active':''}`} onClick={()=>setTab('dashboard')} title="Dashboard Executivo"><LayoutDashboard size={18}/>{!collapsed&&<span>Dashboard</span>}</button>
          <button className={`nav-item ${tab==='entries'?'active':''}`} onClick={()=>setTab('entries')} title="Central de Lançamentos"><ReceiptText size={18}/>{!collapsed&&<span>Lançamentos</span>}</button>
          <button className={`nav-item ${tab==='accounts'?'active':''}`} onClick={()=>setTab('accounts')} title="Contas Bancárias"><Landmark size={18}/>{!collapsed&&<span>Contas Bancárias</span>}</button>
          <button className={`nav-item ${tab==='cards'?'active':''}`} onClick={()=>setTab('cards')} title="Cartões de Crédito"><CreditCard size={18}/>{!collapsed&&<span>Cartões de Crédito</span>}</button>
          <button className={`nav-item ${tab==='commitments'?'active':''}`} onClick={()=>setTab('commitments')} title="Contas a Pagar & Receber"><Calendar size={18}/>{!collapsed&&<span>Compromissos</span>}</button>

          {!collapsed&&<div className="nav-section-title">Planejamento & IA</div>}
          <button className={`nav-item ${tab==='goals'?'active':''}`} onClick={()=>setTab('goals')} title="Metas Financeiras"><Target size={18}/>{!collapsed&&<span>Metas Financeiras</span>}</button>
          <button className={`nav-item ${tab==='budgets'?'active':''}`} onClick={()=>setTab('budgets')} title="Orçamentos"><PieChart size={18}/>{!collapsed&&<span>Orçamentos</span>}</button>
          <button className={`nav-item ${tab==='reports'?'active':''}`} onClick={()=>setTab('reports')} title="Fluxo de Caixa & Relatórios"><TrendingUp size={18}/>{!collapsed&&<span>Fluxo & Relatórios</span>}</button>
          <button className={`nav-item ${tab==='advisor'?'active':''}`} onClick={()=>setTab('advisor')} title="VINA Inteligente (IA)"><Sparkles size={18}/>{!collapsed&&<span>VINA Inteligente (IA)</span>}</button>

          {!collapsed&&<div className="nav-section-title">Gestão & Sistema</div>}
          <button className={`nav-item ${tab==='transfers'?'active':''}`} onClick={()=>setTab('transfers')} title="Transferências Internas"><ArrowLeftRight size={18}/>{!collapsed&&<span>Transferências</span>}</button>
          <button className={`nav-item ${tab==='profiles'?'active':''}`} onClick={()=>setTab('profiles')} title="Gestão de Perfis"><Users size={18}/>{!collapsed&&<span>Perfis</span>}</button>
        </div>

        <div className="user-box">
          <div className="user-avatar">{user.charAt(0).toUpperCase()}</div>
          {!collapsed&&<div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:'13px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user}</div><div style={{fontSize:'11px',color:'#7c889a'}}>{current?current.name:'Consolidado'}</div></div>}
          <button className="icon-button" onClick={logout} title="Sair do sistema"><LogOut size={16} color="#94a3b8"/></button>
        </div>
      </aside>

      <main className="content">
        {token==='demo_token'&&(
          <div className="demo-banner">
            <span>⚠️ <b>Aviso de Demonstração (Vercel Preview):</b> O backend Node.js e banco PostgreSQL não estão conectados online neste endereço. Registros adicionados aqui não são salvos em banco persistente. Conecte a API real para persistência.</span>
            <button onClick={logout}>Sair da Demonstração</button>
          </div>
        )}
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button" onClick={()=>setCollapsed(!collapsed)} title="Recolher/Expandir menu"><Menu size={18}/></button>
            <div className="profile-selector">
              <label>Perfil Ativo:</label>
              <select value={selected} onChange={e=>setSelected(e.target.value)}>
                <option value="all">🌐 Visão Consolidada (Todos os Perfis)</option>
                {profiles.map(p=>(
                  <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="topbar-right">
            {token==='demo_token'?(
              <span className="pill" style={{background:'#fef3c7',color:'#92400e'}}><Sparkles size={12}/> Demonstração</span>
            ):token.startsWith('vina_local_')?(
              <span className="pill" style={{background:'#e0f2fe',color:'#0369a1'}} title="Modo Operacional Local: dados persistidos nesta sessão"><Sparkles size={12}/> Motor VINA Local</span>
            ):(
              <span className="pill" style={{background:'#dcfce7',color:'#166534'}} title="Conectado ao PostgreSQL"><CheckCircle2 size={12}/> PostgreSQL Ativo</span>
            )}
            <button className="secondary" onClick={exportCsv} title="Exportar Extrato em CSV"><FileSpreadsheet size={16}/> {!collapsed&&<span>Exportar CSV</span>}</button>
            <button className="primary" onClick={handleNewEntry} title="Novo Lançamento Financeiro"><Plus size={16}/> Novo Lançamento</button>
          </div>
        </header>

        {error&&<div className="error" style={{margin:'16px 32px 0'}}>{error}</div>}
        {cloudGreeting&&<div style={{margin:'16px 32px 0',padding:'10px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',color:'#15803d',display:'flex',alignItems:'center',gap:'8px',fontSize:'13px'}}><Sparkles size={16}/><span><strong>Vercel Global Config:</strong> {cloudGreeting}</span></div>}

        <div className="page">
          {tab==='dashboard'&&dash&&<>
            <div className="metrics">
              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Saldo Real em Contas</span>
                  <div className="metric-icon-badge" style={{background:'#ecfdf5',color:'#059669'}}><Wallet size={18}/></div>
                </div>
                <div>
                  <div className="metric-val">{money(dash.balance)}</div>
                  <div className="metric-sub">Liquidez disponível imediata</div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Saldo Projetado</span>
                  <div className="metric-icon-badge" style={{background:'#f0fdfa',color:'#0d9488'}}><TrendingUp size={18}/></div>
                </div>
                <div>
                  <div className="metric-val" style={{color:'#0d9488'}}>{money(dash.projectedBalance||dash.balance)}</div>
                  <div className="metric-sub">Considerando faturas e agendamentos</div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Receitas do Mês</span>
                  <div className="metric-icon-badge" style={{background:'#ecfdf5',color:'#10b981'}}><ArrowUpRight size={18}/></div>
                </div>
                <div>
                  <div className="metric-val" style={{color:'#10b981'}}>{money(dash.income)}</div>
                  <div className="metric-sub" style={{color:dash.scheduledIncome&&Number(dash.scheduledIncome)>0?'#059669':'inherit'}}>
                    {dash.scheduledIncome&&Number(dash.scheduledIncome)>0?`+${money(dash.scheduledIncome)} a receber`:'Total realizado no período'}
                  </div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Despesas do Mês</span>
                  <div className="metric-icon-badge" style={{background:'#fef2f2',color:'#ef4444'}}><ArrowDownRight size={18}/></div>
                </div>
                <div>
                  <div className="metric-val" style={{color:'#ef4444'}}>{money(dash.expense)}</div>
                  <div className="metric-sub" style={{color:dash.scheduledExpense&&Number(dash.scheduledExpense)>0?'#d97706':'inherit'}}>
                    {dash.scheduledExpense&&Number(dash.scheduledExpense)>0?`+${money(dash.scheduledExpense)} previstas`:'Total realizado no período'}
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div style={{display:'flex',flexDirection:'column',gap:'22px'}}>
                <section className="panel">
                  <div className="panel-title">
                    <h2>Resumo Operacional & Performance</h2>
                    <span className="pill" style={{background:Number(dash.result)>=0?'#ecfdf5':'#fef2f2',color:Number(dash.result)>=0?'#059669':'#ef4444'}}>
                      {Number(dash.result)>=0?'Superávit Operacional':'Déficit Operacional'}
                    </span>
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'16px',marginTop:'8px',marginBottom:'20px'}}>
                    <div style={{background:'#f8fafc',padding:'16px',borderRadius:'12px',border:'1px solid var(--border)'}}>
                      <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>Resultado Líquido</div>
                      <div style={{fontSize:'22px',fontWeight:800,color:Number(dash.result)>=0?'#10b981':'#ef4444',marginTop:'4px'}}>{money(dash.result)}</div>
                    </div>
                    <div style={{background:'#f8fafc',padding:'16px',borderRadius:'12px',border:'1px solid var(--border)'}}>
                      <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>Perfis no Consolidado</div>
                      <div style={{fontSize:'22px',fontWeight:800,color:'var(--text-main)',marginTop:'4px'}}>{dash.profileCount} perfis</div>
                    </div>
                    <div style={{background:'#f8fafc',padding:'16px',borderRadius:'12px',border:'1px solid var(--border)'}}>
                      <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>Contas Conectadas</div>
                      <div style={{fontSize:'22px',fontWeight:800,color:'var(--text-main)',marginTop:'4px'}}>{dash.accountCount} contas</div>
                    </div>
                  </div>

                  <div style={{marginTop:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'6px'}}>
                      <span style={{fontWeight:600,color:'var(--text-main)'}}>Eficiência Orçamentária</span>
                      <span style={{fontWeight:700,color:'#0d9488'}}>
                        {Number(dash.income)>0?`${Math.max(0,Math.round(((Number(dash.income)-Number(dash.expense))/Number(dash.income))*100))}% poupado`:'0%'}
                      </span>
                    </div>
                    <div className="progress-track" style={{height:'10px'}}>
                      <div className="progress-bar" style={{
                        width:`${Number(dash.income)>0?Math.min(100,Math.max(0,Math.round(((Number(dash.income)-Number(dash.expense))/Number(dash.income))*100))):0}%`,
                        background:'linear-gradient(90deg,#0d9488,#10b981)'
                      }}/>
                    </div>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-title">
                    <h2>Últimas Movimentações Financeiras</h2>
                    <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setTab('entries')}>Ver todas</button>
                  </div>
                  {entries.length===0?<Empty text="Nenhuma movimentação registrada no perfil."/>:(
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Data</th><th>Descrição</th><th>Conta</th><th>Status</th><th>Valor</th></tr></thead>
                        <tbody>
                          {entries.slice(0,5).map(e=>(
                            <tr key={e.id}>
                              <td>{new Date(e.occurredAt).toLocaleDateString('pt-BR',{timeZone:'UTC'})}</td>
                              <td><b>{e.description}</b></td>
                              <td>{e.account.name}</td>
                              <td>
                                <span className="pill" style={{
                                  background:e.status==='POSTED'?'#ecfdf5':e.status==='SCHEDULED'?'#fffbeb':'#fef2f2',
                                  color:e.status==='POSTED'?'#059669':e.status==='SCHEDULED'?'#d97706':'#ef4444'
                                }}>
                                  {e.status==='POSTED'?'Realizado':e.status==='SCHEDULED'?'Previsto':'Estornado'}
                                </span>
                              </td>
                              <td className={['INCOME','TRANSFER_IN'].includes(e.type)?'positive':'negative'}>
                                {['INCOME','TRANSFER_IN'].includes(e.type)?'+':'−'} {money(e.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'22px'}}>
                <section className="panel" style={{borderLeft:'4px solid #0d9488'}}>
                  <div className="panel-title" style={{marginBottom:'12px'}}>
                    <h2>VINA IA · Diagnóstico</h2>
                    <button className="secondary" style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setTab('advisor')}>Abrir</button>
                  </div>
                  <div style={{background:'#f0fdfa',padding:'16px',borderRadius:'12px',border:'1px solid #99f6e4',marginBottom:'12px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',fontWeight:700,color:'#0f766e',marginBottom:'6px'}}>
                      <Sparkles size={16}/><span>Consultor Ativo</span>
                    </div>
                    <p style={{fontSize:'12px',color:'#134e4a',lineHeight:1.5,margin:0}}>
                      Seu fluxo operacional monitora receitas, faturas de cartão e compromissos dos próximos 90 dias com projeção segura de gastos.
                    </p>
                  </div>
                  <button className="primary" style={{width:'100%',padding:'10px',fontSize:'12px'}} onClick={()=>setTab('advisor')}>
                    <Sparkles size={14}/> Fazer Pergunta ao Consultor
                  </button>
                </section>

                {cards.length>0&&(
                  <section className="panel">
                    <div className="panel-title" style={{marginBottom:'12px'}}>
                      <h2>Cartão Principal</h2>
                      <button className="secondary" style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setTab('cards')}>Ver todos</button>
                    </div>
                    <div className="credit-card-ui" style={{minHeight:'170px',padding:'18px'}}>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                          <div className="card-chip"/>
                          <span style={{fontSize:'10px',letterSpacing:'0.08em',color:'#94a3b8',fontWeight:700}}>CARTÃO DIGITAL</span>
                        </div>
                        <h4 style={{fontSize:'15px',fontWeight:800,margin:'0 0 4px'}}>{cards[0].name}</h4>
                        <div style={{fontSize:'11px',color:'#cbd5e1'}}>Disponível: <b style={{color:'#2dd4bf'}}>{money(cards[0].availableLimit)}</b></div>
                      </div>
                      {cards[0].currentInvoice&&(
                        <div style={{marginTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'8px'}}>
                          <span style={{fontSize:'11px',color:'#94a3b8'}}>Fatura {cards[0].currentInvoice.referenceMonth}</span>
                          <b style={{fontSize:'14px',color:'#f87171'}}>{money(cards[0].currentInvoice.totalAmount)}</b>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {goals.length>0&&(
                  <section className="panel">
                    <div className="panel-title" style={{marginBottom:'12px'}}>
                      <h2>Metas em Foco</h2>
                      <button className="secondary" style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>setTab('goals')}>Ver metas</button>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                      {goals.slice(0,2).map(g=>(
                        <div key={g.id} style={{background:'#f8fafc',padding:'12px',borderRadius:'10px',border:'1px solid var(--border)'}}>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                            <b>{g.name}</b>
                            <span style={{fontWeight:700,color:'#0d9488'}}>{g.progress}%</span>
                          </div>
                          <div className="progress-track" style={{height:'6px'}}>
                            <div className="progress-bar" style={{width:`${Math.min(100,g.progress)}%`,background:g.color||'#10b981'}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>}

          {tab==='commitments'&&<section className="panel">
            <div className="panel-title">
              <h2>Contas a Pagar & Receber (Compromissos)</h2>
              <button className="secondary" onClick={handleNewCommitment}>+ Novo compromisso</button>
            </div>
            {!current?<Empty text="Selecione um perfil individual para gerenciar contas a pagar e receber."/>:commitments.length===0?<Empty text="Nenhum compromisso cadastrado para este perfil."/>:(
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Vencimento</th><th>Descrição</th><th>Credor / Pagador</th><th>Tipo</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
                  <tbody>
                    {commitments.map(c=>(
                      <tr key={c.id}>
                        <td>{new Date(c.dueDate).toLocaleDateString('pt-BR',{timeZone:'UTC'})}</td>
                        <td><b>{c.description}</b></td>
                        <td>{c.entityName||'—'}</td>
                        <td><span className="pill" style={{background:c.type==='PAYABLE'?'#fff0ee':'#def3ef',color:c.type==='PAYABLE'?'#be6a55':'#11756f'}}>{c.type==='PAYABLE'?'A Pagar':'A Receber'}</span></td>
                        <td><span className="pill" style={{background:c.status==='PAID'?'#def3ef':'#fff0df',color:c.status==='PAID'?'#11756f':'#df8c36'}}>{c.status==='PAID'?'Liquidado':'Pendente'}</span></td>
                        <td className={c.type==='RECEIVABLE'?'positive':'negative'}>{c.type==='RECEIVABLE'?'+':'−'} {money(c.amount)}</td>
                        <td>
                          <div style={{display:'flex',gap:'6px'}}>
                            {c.status==='PENDING'&&(
                              <button className="secondary" style={{fontSize:'11px',padding:'4px 8px'}} onClick={()=>{setSelectedItem(c);setModal('settle_commitment');}}>Liquidar</button>
                            )}
                            <button className="icon-button" title="Excluir" onClick={()=>deleteCommitment(c.id)}><RotateCcw size={15} color="#be6a55"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>}

          {tab==='goals'&&<section className="panel">
            <div className="panel-title">
              <h2>Metas Financeiras & Sonhos</h2>
              <button className="secondary" onClick={handleNewGoal}><Plus size={15}/> Nova Meta</button>
            </div>
            {!current?<Empty text="Selecione um perfil para gerenciar metas financeiras."/>:goals.length===0?<Empty text="Nenhuma meta cadastrada."/>:(
              <div className="grid-cards">
                {goals.map(g=>(
                  <div key={g.id} className="goal-card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{width:'36px',height:'36px',borderRadius:'10px',background:g.color?`${g.color}18`:'#10b98118',color:g.color||'#10b981',display:'grid',placeItems:'center'}}>
                          <Target size={18}/>
                        </div>
                        <div>
                          <h3 style={{fontSize:'15px',fontWeight:700,margin:0,color:'var(--text-main)'}}>{g.name}</h3>
                          <span style={{fontSize:'11px',color:'var(--text-muted)'}}>{g.targetDate?`Até ${new Date(g.targetDate).toLocaleDateString('pt-BR',{timeZone:'UTC'})}`:'Meta contínua'}</span>
                        </div>
                      </div>
                      <span className="pill" style={{background:g.status==='COMPLETED'?'#def3ef':'#f1f5f9',color:g.status==='COMPLETED'?'#11756f':'var(--text-secondary)'}}>
                        {g.status==='COMPLETED'?'Concluída':`${g.progress}%`}
                      </span>
                    </div>

                    <div style={{margin:'10px 0'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'6px'}}>
                        <span style={{color:'var(--text-secondary)'}}>Poupado: <b style={{color:'var(--text-main)'}}>{money(g.currentAmount)}</b></span>
                        <span style={{color:'var(--text-secondary)'}}>Alvo: <b style={{color:'var(--text-main)'}}>{money(g.targetAmount)}</b></span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-bar" style={{width:`${Math.min(100,g.progress)}%`,background:g.color||'#10B981'}}/>
                      </div>
                    </div>

                    <div style={{marginTop:'14px',display:'flex',justifyContent:'flex-end'}}>
                      <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>{setSelectedItem(g);setModal('deposit_goal');}}>
                        + Fazer Aporte
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>}

          {tab==='budgets'&&<section className="panel">
            <div className="panel-title">
              <h2>Planejamento Orçamentário por Categoria</h2>
              <button className="secondary" disabled={!current} onClick={()=>setModal('budget')}><Plus size={15}/> Novo Orçamento</button>
            </div>
            {!current?<Empty text="Selecione um perfil para definir orçamentos por categoria."/>:budgets.length===0?<Empty text="Nenhum orçamento cadastrado para o mês vigente."/>:(
              <div className="grid-cards">
                {budgets.map(b=>(
                  <div key={b.id} className="budget-card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'#eff6ff',color:'#3b82f6',display:'grid',placeItems:'center'}}>
                          <PieChart size={16}/>
                        </div>
                        <b style={{fontSize:'14px',color:'var(--text-main)'}}>{b.categoryName}</b>
                      </div>
                      <span className="pill" style={{
                        background:b.percentageUsed>100?'#fef2f2':b.percentageUsed>80?'#fffbeb':'#ecfdf5',
                        color:b.percentageUsed>100?'#ef4444':b.percentageUsed>80?'#d97706':'#059669'
                      }}>
                        {b.percentageUsed}%
                      </span>
                    </div>

                    <div style={{margin:'8px 0'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'6px'}}>
                        <span style={{color:'var(--text-secondary)'}}>Gasto: <b style={{color:b.percentageUsed>100?'#ef4444':'var(--text-main)'}}>{money(b.spentAmount)}</b></span>
                        <span style={{color:'var(--text-muted)'}}>Teto: <b>{money(b.plannedAmount)}</b></span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-bar" style={{
                          width:`${Math.min(100,b.percentageUsed)}%`,
                          background:b.percentageUsed>100?'#ef4444':b.percentageUsed>80?'#f59e0b':'#10b981'
                        }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>}

          {tab==='reports'&&<section className="panel">
            <div className="panel-title">
              <h2>Projeção de Fluxo de Caixa Mensal</h2>
              <button className="secondary" onClick={exportCsv}><FileSpreadsheet size={16}/> Exportar Dados (CSV)</button>
            </div>
            <p className="muted">Análise consolidada de receitas, despesas e compromissos futuros com horizonte de projeção.</p>
            {cashflow.length===0?<Empty text="Sem dados suficientes para projetar o fluxo."/>:(
              <div className="table-wrap" style={{marginTop:'12px'}}>
                <table>
                  <thead><tr><th>Mês de Referência</th><th>Receitas</th><th>Despesas</th><th>Obrigações / Faturas</th><th>Fluxo Líquido</th></tr></thead>
                  <tbody>
                    {cashflow.map(cf=>(
                      <tr key={cf.month}>
                        <td><b>{cf.month}</b></td>
                        <td className="positive">+ {money(cf.income)}</td>
                        <td className="negative">− {money(cf.expense)}</td>
                        <td style={{color:'#df8c36'}}>− {money(cf.obligations)}</td>
                        <td style={{fontWeight:700,color:Number(cf.net)>=0?'#13a294':'#be6a55'}}>{Number(cf.net)>=0?'+':'−'} {money(Math.abs(Number(cf.net)))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>}

          {tab==='advisor'&&<section className="panel">
            <div className="panel-title">
              <h2>VINA Inteligente · Consultor Financeiro (IA)</h2>
              <span className="pill" style={{background:'#def3ef',color:'#11756f'}}><Sparkles size={12}/> Gemini Ativo</span>
            </div>
            <p className="muted">Análise preditiva fundamentada em seus saldos reais, despesas, faturas de cartão e compromissos dos próximos 90 dias.</p>

            <div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
              <input style={{flex:1,padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1'}} value={advisorQuestion} onChange={e=>setAdvisorQuestion(e.target.value)} placeholder="Faça uma pergunta sobre sua vida financeira..."/>
              <button className="primary" onClick={()=>askAdvisor()} disabled={advisorLoading}>{advisorLoading?'Analisando...':'Consultar IA'}</button>
            </div>

            {advisor&&(
              <div style={{marginTop:'20px',display:'flex',flexDirection:'column',gap:'16px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px'}}>
                  <div style={{background:'#f6f8fb',padding:'14px',borderRadius:'10px'}}>
                    <div style={{fontSize:'12px',color:'#7c889a'}}>Score de Saúde Financeira</div>
                    <div style={{fontSize:'24px',fontWeight:800,color:advisor.score>70?'#13a294':advisor.score>50?'#df8c36':'#be6a55'}}>{advisor.score} / 100</div>
                    <span className="pill" style={{fontSize:'10px',marginTop:'4px'}}>{advisor.status}</span>
                  </div>
                  <div style={{background:'#f0fbf9',padding:'14px',borderRadius:'10px',border:'1px solid #c2ece5'}}>
                    <div style={{fontSize:'12px',color:'#11756f'}}>Gasto Seguro Recomendado (Mês)</div>
                    <div style={{fontSize:'22px',fontWeight:800,color:'#11756f'}}>{money(advisor.safeMonthlySpend)}</div>
                    <div style={{fontSize:'11px',color:'#556578',marginTop:'4px'}}>Preservando compromissos futuros</div>
                  </div>
                  <div style={{background:'#f6f8fb',padding:'14px',borderRadius:'10px'}}>
                    <div style={{fontSize:'12px',color:'#7c889a'}}>Superávit Projetado (90 Dias)</div>
                    <div style={{fontSize:'22px',fontWeight:800,color:Number(advisor.threeMonthSurplus)>=0?'#13a294':'#be6a55'}}>{money(advisor.threeMonthSurplus)}</div>
                    <div style={{fontSize:'11px',color:'#7c889a',marginTop:'4px'}}>Saldo após todas obrigações</div>
                  </div>
                </div>

                <div style={{background:'#ffffff',padding:'18px',borderRadius:'12px',border:'1px solid #e1e7f0',lineHeight:1.6}}>
                  <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}><Sparkles size={16} color="#13a294"/> Diagnóstico VINA Inteligente</h3>
                  <div style={{fontSize:'13px',color:'#233649',whiteSpace:'pre-wrap'}}>{advisor.diagnosis}</div>
                  <h4 style={{fontSize:'13px',fontWeight:700,marginTop:'14px',marginBottom:'6px'}}>Plano de Ação Sugerido:</h4>
                  <ul style={{fontSize:'12px',color:'#556578',paddingLeft:'20px',margin:0}}>
                    {advisor.actionPlan.map((item,i)=><li key={i} style={{marginBottom:'4px'}}>{item}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </section>}

          {tab==='accounts'&&<section className="panel">
            <div className="panel-title">
              <h2>Contas financeiras</h2>
              <button className="secondary" onClick={handleNewAccount}>+ Nova conta</button>
            </div>
            {!current?<Empty text="Selecione um perfil individual para gerenciar contas."/>:accounts.length===0?<Empty text="Nenhuma conta bancária cadastrada."/>:(
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nome da conta</th><th>Saldo inicial</th></tr></thead>
                  <tbody>{accounts.map(a=><tr key={a.id}><td>{a.name}</td><td>{money(a.openingBalance)}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </section>}

          {tab==='cards'&&<section className="panel">
            <div className="panel-title">
              <h2>Cartões de Crédito e Faturas</h2>
              <div style={{display:'flex',gap:'8px'}}>
                <button className="secondary" onClick={handleNewPurchase}><CreditCard size={15}/> Nova Compra</button>
                <button className="secondary" onClick={handleNewCard}><Plus size={15}/> Novo Cartão</button>
              </div>
            </div>
            {!current?<Empty text="Selecione um perfil para consultar os cartões."/>:cards.length===0?<Empty text="Nenhum cartão cadastrado."/>:(
              <div className="grid-cards">
                {cards.map(c=>{
                  const used = Math.max(0, Number(c.limit) - Number(c.availableLimit));
                  const pct = Math.min(100, Math.round((used / Number(c.limit)) * 100));
                  return (
                    <div key={c.id} className="credit-card-ui" style={{borderTop:`4px solid ${c.color||'#0d9488'}`}}>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <div className="card-chip"/>
                            <span style={{fontSize:'12px',letterSpacing:'0.1em',color:'#94a3b8',textTransform:'uppercase',fontWeight:700}}>Digital Card</span>
                          </div>
                          <span className="pill" style={{background:'rgba(255,255,255,0.12)',color:'#ffffff',fontSize:'10px',border:'1px solid rgba(255,255,255,0.15)'}}>
                            Fecha {c.closingDay} · Vence {c.dueDay}
                          </span>
                        </div>
                        <h3 style={{fontSize:'17px',fontWeight:800,letterSpacing:'-0.02em',margin:'0 0 6px'}}>{c.name}</h3>
                        <div style={{fontSize:'12px',color:'#cbd5e1'}}>Disponível: <b style={{color:'#2dd4bf',fontSize:'14px'}}>{money(c.availableLimit)}</b> de {money(c.limit)}</div>
                        <div className="progress-track" style={{background:'rgba(255,255,255,0.1)',marginTop:'8px',height:'6px'}}>
                          <div className="progress-bar" style={{width:`${pct}%`,background:pct>85?'#ef4444':pct>60?'#f59e0b':'#2dd4bf'}}/>
                        </div>
                      </div>

                      {c.currentInvoice&&(
                        <div style={{marginTop:'16px',padding:'12px 14px',background:'rgba(0,0,0,0.25)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.06em',color:'#94a3b8'}}>Fatura Atual ({c.currentInvoice.referenceMonth})</div>
                            <div style={{fontSize:'16px',fontWeight:800,color:'#f87171'}}>{money(c.currentInvoice.totalAmount)}</div>
                          </div>
                          {Number(c.currentInvoice.totalAmount)>0&&(
                            <button className="primary" style={{fontSize:'11px',padding:'6px 12px',background:'#0d9488',borderColor:'#0d9488'}} onClick={()=>setModal('pay_invoice')}>Pagar Fatura</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>}

          {tab==='entries'&&<section className="panel">
            <div className="panel-title">
              <h2>Movimentações financeiras</h2>
              <button className="secondary" onClick={handleNewEntry}>+ Novo lançamento</button>
            </div>
            {!current?<Empty text="Selecione um perfil individual para consultar seus lançamentos."/>:(
              <>
                <div style={{display:'flex',gap:'10px',marginBottom:'14px',flexWrap:'wrap',alignItems:'center'}}>
                  <div style={{position:'relative',flex:1,minWidth:'220px'}}>
                    <Search size={15} style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}/>
                    <input
                      type="text"
                      placeholder="Buscar por descrição ou conta..."
                      value={entrySearch}
                      onChange={e=>setEntrySearch(e.target.value)}
                      style={{width:'100%',padding:'8px 12px 8px 36px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px'}}
                    />
                  </div>
                  <select value={entryTypeFilter} onChange={e=>setEntryTypeFilter(e.target.value)} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px'}}>
                    <option value="ALL">Todos os Tipos</option>
                    <option value="INCOME">Receitas</option>
                    <option value="EXPENSE">Despesas</option>
                    <option value="TRANSFER_IN">Transf. Recebida</option>
                    <option value="TRANSFER_OUT">Transf. Enviada</option>
                  </select>
                  <select value={entryStatusFilter} onChange={e=>setEntryStatusFilter(e.target.value)} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px'}}>
                    <option value="ALL">Todos os Status</option>
                    <option value="POSTED">Realizados</option>
                    <option value="SCHEDULED">Previstos</option>
                    <option value="VOID">Estornados</option>
                  </select>
                </div>

                {entries.length===0?<Empty text="Nenhuma movimentação registrada."/>:filteredEntries.length===0?<Empty text="Nenhum lançamento encontrado para os filtros aplicados."/>:(
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Data</th><th>Descrição</th><th>Conta</th><th>Tipo</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
                      <tbody>
                        {filteredEntries.map(e=>(
                          <tr key={e.id}>
                            <td>{new Date(e.occurredAt).toLocaleDateString('pt-BR',{timeZone:'UTC'})}</td>
                            <td>{e.description}</td>
                            <td>{e.account.name}</td>
                            <td>{({INCOME:'Receita',EXPENSE:'Despesa',TRANSFER_IN:'Transferência recebida',TRANSFER_OUT:'Transferência enviada'} as Record<string,string>)[e.type]}</td>
                            <td>
                              <span className="pill" style={{
                                fontSize:'10px',
                                background:e.status==='POSTED'?'#def3ef':e.status==='SCHEDULED'?'#fff0df':'#fff0ee',
                                color:e.status==='POSTED'?'#11756f':e.status==='SCHEDULED'?'#df8c36':'#be6a55'
                              }}>
                                {e.status==='POSTED'?'Realizado':e.status==='SCHEDULED'?'Previsto':'Estornado'}
                              </span>
                            </td>
                            <td className={['INCOME','TRANSFER_IN'].includes(e.type)?'positive':'negative'}>
                              {['INCOME','TRANSFER_IN'].includes(e.type)?'+':'−'} {money(e.amount)}
                            </td>
                            <td>
                              <div style={{display:'flex',gap:'6px'}}>
                                <button className="icon-button" title="Editar Lançamento" onClick={()=>handleEditEntry(e)}><Pencil size={15} color="#0d9488"/></button>
                                {e.status==='SCHEDULED'&&<button className="icon-button" title="Liquidar lançamento" onClick={()=>updateStatus(e.id,'POSTED')}><CheckCircle2 size={16} color="#137e77"/></button>}
                                {e.status==='POSTED'&&!e.reconciled&&<button className="icon-button" title="Conciliar" onClick={()=>reconcile(e.id)}><Clock size={16} color="#347bc7"/></button>}
                                {e.status!=='VOID'&&<button className="icon-button" title="Estornar" onClick={()=>updateStatus(e.id,'VOID')}><RotateCcw size={16} color="#df8c36"/></button>}
                                <button className="icon-button" title="Excluir Lançamento" onClick={()=>handleDeleteEntry(e.id)}><Trash2 size={15} color="#ef4444"/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>}

          {tab==='transfers'&&<section className="panel">
            <div className="panel-title">
              <h2>Transferências entre perfis</h2>
              <button className="secondary" disabled={!current||!accounts.length||profiles.length<2} onClick={()=>setModal('transfer')}>+ Nova transferência</button>
            </div>
            <p className="muted">Uma transferência entre perfis movimenta saldos de forma atômica e possui impacto zero no painel consolidado.</p>
            <Empty text="Selecione o perfil de origem e registre uma transferência para outro perfil autorizado."/>
          </section>}

          {tab==='profiles'&&<section className="panel">
            <div className="panel-title">
              <h2>Perfis Financeiros Autorizados</h2>
              <button className="secondary" onClick={()=>setModal('profile')}>+ Novo perfil</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nome</th><th>Papel (RBAC)</th></tr></thead>
                <tbody>{profiles.map(p=><tr key={p.id}><td><b>{p.name}</b></td><td><span className="pill">{p.role}</span></td></tr>)}</tbody>
              </table>
            </div>
          </section>}
        </div>
      </main>

      {modal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget){setModal('');setError('');}}}>
        <div className="dialog">
          <div className="panel-title">
            <h2>{({
              profile:'Novo perfil financeiro',
              account:'Nova conta financeira',
              card:'Novo cartão de crédito',
              purchase:'Nova compra no cartão',
              pay_invoice:'Pagar fatura de cartão',
              entry:'Novo Lançamento Financeiro',
              edit_entry:'Editar Lançamento Financeiro',
              transfer:'Nova transferência',
              commitment:'Novo compromisso financeiro',
              settle_commitment:'Liquidar compromisso',
              goal:'Nova meta financeira',
              deposit_goal:'Fazer aporte na meta',
              budget:'Novo orçamento por categoria'
            } as Record<string,string>)[modal]||'Dados'}</h2>
            <button className="close" onClick={()=>{setModal('');setError('');}}>×</button>
          </div>
          <form onSubmit={submit}>
            {modal==='profile'&&<label>Nome do perfil<input name="name" required placeholder="Ex.: Pessoal, Família, Patrimônio"/></label>}
            {modal==='account'&&<>
              <label>Nome da conta<input name="name" required placeholder="Ex.: Nubank, Itaú, Bradesco"/></label>
              <label>Saldo inicial (R$)<input name="balance" required type="number" min="0" step="0.01" defaultValue="0.00"/></label>
            </>}
            {modal==='card'&&<>
              <label>Nome do cartão<input name="name" required placeholder="Ex.: Nubank Ultravioleta, XP Infinite"/></label>
              <label>Limite total (R$)<input name="limit" required type="number" min="0.01" step="0.01" placeholder="10000.00"/></label>
              <label>Dia do fechamento<input name="closingDay" required type="number" min="1" max="31" defaultValue="25"/></label>
              <label>Dia do vencimento<input name="dueDay" required type="number" min="1" max="31" defaultValue="5"/></label>
              <label>Cor de identificação<input name="color" type="color" defaultValue="#13a99b"/></label>
            </>}
            {modal==='purchase'&&<>
              <label>Cartão de crédito<select name="cardId" required>{cards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label>Descrição<input name="description" required placeholder="Ex.: Compra Notebook, Mercado"/></label>
              <label>Valor total (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
              <label>Número de parcelas<input name="installments" required type="number" min="1" max="48" defaultValue="1"/></label>
              <label>Data da compra<input name="date" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/></label>
            </>}
            {modal==='pay_invoice'&&<>
              <label>Fatura a pagar<select name="invoiceId" required>{cards.filter(c=>c.currentInvoice).map(c=><option key={c.currentInvoice!.id} value={c.currentInvoice!.id}>{c.name} - {c.currentInvoice!.referenceMonth} ({money(c.currentInvoice!.totalAmount)})</option>)}</select></label>
              <label>Conta de débito<select name="accountId" required>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            </>}
            {modal==='entry'&&<>
              <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                Perfil Vinculado: <b>{current?.name || 'Individual'}</b>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Tipo de Movimentação
                  <select name="type">
                    <option value="EXPENSE">Despesa (-)</option>
                    <option value="INCOME">Receita (+)</option>
                  </select>
                </label>
                <label>Status
                  <select name="status">
                    <option value="POSTED">Realizado (Efetivado)</option>
                    <option value="SCHEDULED">Previsto (Agendado)</option>
                  </select>
                </label>
              </div>
              <label>Conta Bancária / Financeira
                <select name="accountId" required>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.name} (Saldo: {money(a.openingBalance)})</option>)}
                </select>
              </label>
              <label>Descrição
                <input name="description" required placeholder="Ex.: Supermercado, Salário, Energia..."/>
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Valor em Reais (R$)
                  <input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00"/>
                </label>
                <label>Data da Movimentação
                  <input name="date" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/>
                </label>
              </div>
              <label>Categoria (opcional)
                <input name="category" placeholder="Ex.: Alimentação, Moradia, Transporte, Lazer..."/>
              </label>
              <label>Observações (opcional)
                <textarea name="notes" rows={2} placeholder="Anotações complementares..." style={{width:'100%',padding:'8px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px'}}/>
              </label>
            </>}
            {modal==='edit_entry'&&editingEntry&&<>
              <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                Alterando Lançamento: <b>{editingEntry.description}</b>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Tipo
                  <select name="type" defaultValue={editingEntry.type}>
                    <option value="EXPENSE">Despesa (Saída)</option>
                    <option value="INCOME">Receita (Entrada)</option>
                  </select>
                </label>
                <label>Status
                  <select name="status" defaultValue={editingEntry.status}>
                    <option value="POSTED">Realizado (Efetivado)</option>
                    <option value="SCHEDULED">Previsto (Agendado)</option>
                    <option value="VOID">Estornado</option>
                  </select>
                </label>
              </div>
              <label>Conta Bancária / Financeira
                <select name="accountId" defaultValue={editingEntry.accountId||accounts[0]?.id}>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label>Descrição
                <input name="description" required defaultValue={editingEntry.description}/>
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Valor em Reais (R$)
                  <input name="amount" required type="number" min="0.01" step="0.01" defaultValue={Number(editingEntry.amount).toFixed(2)}/>
                </label>
                <label>Data da Movimentação
                  <input name="date" required type="date" defaultValue={new Date(editingEntry.occurredAt).toLocaleDateString('en-CA')}/>
                </label>
              </div>
            </>}
            {modal==='commitment'&&<>
              <label>Tipo de compromisso<select name="type"><option value="PAYABLE">Conta a Pagar (Obrigação)</option><option value="RECEIVABLE">Conta a Receber (Crédito)</option></select></label>
              <label>Descrição<input name="description" required placeholder="Ex.: Aluguel, Cemig, Honorários"/></label>
              <label>Credor / Beneficiário<input name="entityName" placeholder="Ex.: Imobiliária X, Cemig"/></label>
              <label>Valor (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
              <label>Data de vencimento<input name="dueDate" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/></label>
              <label style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'6px'}}><input type="checkbox" name="isRecurring" value="true"/> Compromisso Recorrente Mensal</label>
            </>}
            {modal==='settle_commitment'&&<>
              <p style={{fontSize:'13px',marginBottom:'10px'}}>Liquidar: <b>{selectedItem?.description}</b> no valor de <b>{selectedItem?money(selectedItem.amount):''}</b></p>
              <label>Conta bancária para movimentação<select name="accountId" required>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            </>}
            {modal==='goal'&&<>
              <label>Nome da meta<input name="name" required placeholder="Ex.: Reserva de Emergência, Viagem Europa"/></label>
              <label>Valor alvo (R$)<input name="targetAmount" required type="number" min="1" step="0.01" placeholder="30000.00"/></label>
              <label>Data limite (opcional)<input name="targetDate" type="date"/></label>
              <label>Cor visual<input name="color" type="color" defaultValue="#10B981"/></label>
            </>}
            {modal==='deposit_goal'&&<>
              <p style={{fontSize:'13px',marginBottom:'10px'}}>Aporte na Meta: <b>{selectedItem?.name}</b></p>
              <label>Valor do aporte (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
              <label>Debitar da conta (opcional)<select name="accountId"><option value="">Não debitar de conta (apenas registrar)</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            </>}
            {modal==='budget'&&<>
              <label>Categoria de gastos<input name="categoryName" required placeholder="Ex.: Alimentação & Mercado, Transporte, Moradia"/></label>
              <label>Teto mensal planejado (R$)<input name="plannedAmount" required type="number" min="1" step="0.01" placeholder="2500.00"/></label>
            </>}
            {modal==='transfer'&&<>
              <label>Conta de origem<select name="fromAccount" required>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
              <label>Perfil de destino<select name="toProfile" required>{profiles.filter(p=>p.id!==selected).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label>ID da conta de destino<input name="toAccount" required placeholder="UUID da conta"/></label>
              <label>Descrição<input name="description" required defaultValue="Transferência entre perfis"/></label>
              <label>Valor (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
            </>}
            {error&&<div className="error">{error}</div>}
            <button className="primary" type="submit" disabled={busy}>{busy?'Processando...':'Salvar'}</button>
          </form>
        </div>
      </div>}
    </div>
  );
}

function Empty({text}:{text:string}){
  return <div className="empty"><Wallet size={28}/><p>{text}</p></div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
