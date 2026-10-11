import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{LayoutDashboard,Users,Wallet,ReceiptText,Landmark,ArrowLeftRight,LogOut,Plus,Menu,ChartNoAxesCombined,ShieldCheck,CreditCard,CheckCircle2,Clock,RotateCcw,Target,Calendar,Bot,FileSpreadsheet,Sparkles,TrendingUp,AlertTriangle,ArrowDownRight,ArrowUpRight,DollarSign,PieChart,Pencil,Trash2,Search,Filter,Sun,Moon,FolderTree,PiggyBank,Layers}from'lucide-react';
import './style.css';

type Profile={id:string,name:string,role:string};
type Account={id:string,name:string,openingBalance:string,profileId?:string};
type Entry={id:string,type:string,status:string,amount:string,description:string,occurredAt:string,reconciled?:boolean,accountId?:string,category?:string,paymentMethod?:string,account:{name:string}};
type Card={id:string,name:string,limit:string,closingDay:number,dueDay:number,color?:string,availableLimit:string,currentInvoice?:{id:string,referenceMonth:string,totalAmount:string,status:string}};
type Commitment={id:string,type:'PAYABLE'|'RECEIVABLE',status:'PENDING'|'PAID',description:string,amount:string,dueDate:string,entityName?:string,category?:string,paidAt?:string};
type Goal={id:string,name:string,targetAmount:string,currentAmount:string,progress:number,targetDate?:string,status:string,color?:string};
type Budget={id:string,categoryName:string,plannedAmount:string,spentAmount:string,percentageUsed:number};
type Category={id:string,name:string,type:'INCOME'|'EXPENSE'};
type Investment={id:string,name:string,type:string,initialAmount:string,currentAmount:string,institution?:string,yieldRate?:string};
type CashflowItem={month:string,income:string,expense:string,obligations:string,net:string};
type AdvisorData={score:number,status:string,safeMonthlySpend:string,threeMonthSurplus:string,diagnosis:string,actionPlan:string[],aiGenerated:boolean};
type Dash={income:string,expense:string,result:string,balance:string,projectedBalance?:string,scheduledIncome?:string,scheduledExpense?:string,profileCount:number,accountCount:number};

const money=(value:string|number)=>{
  const num=Number(value||0);
  if(isNaN(num)) return 'R$ 0,00';
  const formatted=Math.abs(num).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  return num<0?`- ${formatted}`:formatted;
};
const API_BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')+'/api';
const CATEGORY_COLORS = ['#10b981', '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b', '#06b6d4'];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-salario', name: 'Salário', type: 'INCOME' },
  { id: 'cat-freelance', name: 'Freelance & Serviços', type: 'INCOME' },
  { id: 'cat-rendimentos', name: 'Rendimentos & Dividendos', type: 'INCOME' },
  { id: 'cat-outras-rec', name: 'Outras Receitas', type: 'INCOME' },
  { id: 'cat-alimentacao', name: 'Alimentação & Mercado', type: 'EXPENSE' },
  { id: 'cat-moradia', name: 'Moradia & Contas Fixas', type: 'EXPENSE' },
  { id: 'cat-transporte', name: 'Transporte & Combustível', type: 'EXPENSE' },
  { id: 'cat-saude', name: 'Saúde & Farmácia', type: 'EXPENSE' },
  { id: 'cat-lazer', name: 'Lazer & Entretenimento', type: 'EXPENSE' },
  { id: 'cat-educacao', name: 'Educação & Cursos', type: 'EXPENSE' },
  { id: 'cat-assinaturas', name: 'Assinaturas & Serviços', type: 'EXPENSE' },
  { id: 'cat-outras-desp', name: 'Outras Despesas', type: 'EXPENSE' }
];

const DEFAULT_INVESTMENTS: Investment[] = [];

const DEMO_PROFILES: Profile[] = [
  { id: 'p-pessoal', name: 'Pessoal', role: 'OWNER' },
  { id: 'p-familiar', name: 'Familiar', role: 'OWNER' }
];
const DEMO_ACCOUNTS: Account[] = [];
const DEMO_CARDS: Card[] = [];
const DEMO_ENTRIES: Entry[] = [];
const DEMO_COMMITMENTS: Commitment[] = [];
const DEMO_GOALS: Goal[] = [];
const DEMO_BUDGETS: Budget[] = [];
const DEMO_CASHFLOW: CashflowItem[] = [];
const DEMO_ADVISOR: AdvisorData = {
  score: 100,
  status: 'INICIAL',
  safeMonthlySpend: '0.00',
  threeMonthSurplus: '0.00',
  diagnosis: 'Diagnóstico VINA Inteligente:\n\nSistema iniciado com valores zerados. Comece cadastrando suas contas bancárias, cartões e primeiros lançamentos para gerar análises financeiras em tempo real.',
  actionPlan: [
    'Cadastre sua conta bancária no menu Contas.',
    'Registre suas receitas e despesas no menu Lançamentos.',
    'Defina suas metas financeiras para acompanhar seu patrimônio.'
  ],
  aiGenerated: false
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
    return { income:'0.00',expense:'0.00',result:'0.00',balance:'0.00',projectedBalance:'0.00',scheduledIncome:'0.00',scheduledExpense:'0.00',profileCount:2,accountCount:0 } as unknown as T;
  }
  if(path.startsWith('/reports/cashflow')) return DEMO_CASHFLOW as unknown as T;
  if(path.endsWith('/categories')) return DEFAULT_CATEGORIES as unknown as T;
  if(path.endsWith('/investments')) return DEFAULT_INVESTMENTS as unknown as T;
  if(path.startsWith('/reports/export')) {
    const csv='ID,Data,Perfil,Conta,Tipo,Status,Descricao,Valor(R$),Conciliado\n';
    return {csv,totalRecords:0} as unknown as T;
  }
  if(path.startsWith('/ai/advisor')) return DEMO_ADVISOR as unknown as T;
  return {status:'ok',id:'zero-'+Date.now()} as unknown as T;
}

interface LocalState {
  profiles: Profile[];
  accounts: (Account & { profileId: string })[];
  cards: (Card & { profileId: string })[];
  entries: (Entry & { profileId: string; accountId: string; category?: string; paymentMethod?: string })[];
  commitments: (Commitment & { profileId: string })[];
  goals: (Goal & { profileId: string })[];
  budgets: (Budget & { profileId: string })[];
  categories: Category[];
  investments: (Investment & { profileId: string })[];
}

function getLocalState(): LocalState {
  sessionStorage.removeItem('vina_store_state');
  const raw = sessionStorage.getItem('vina_store_state_v2');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.categories || !parsed.categories.length) parsed.categories = DEFAULT_CATEGORIES;
      if (!parsed.investments) parsed.investments = [];
      return parsed;
    } catch {
      // ignore
    }
  }
  const initial: LocalState = {
    profiles: [
      { id: 'p-pessoal', name: 'Pessoal', role: 'OWNER' },
      { id: 'p-familiar', name: 'Familiar', role: 'OWNER' }
    ],
    accounts: [],
    cards: [],
    entries: [],
    commitments: [],
    goals: [],
    budgets: [],
    categories: DEFAULT_CATEGORIES,
    investments: []
  };
  sessionStorage.setItem('vina_store_state_v2', JSON.stringify(initial));
  return initial;
}

function saveLocalState(st: LocalState) {
  sessionStorage.setItem('vina_store_state_v2', JSON.stringify(st));
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
    const created: Entry & { profileId: string; accountId: string; category?: string; paymentMethod?: string } = {
      id: 'e-' + Date.now(),
      profileId: b.profileId || (acc ? acc.profileId : 'p-pessoal'),
      accountId: b.accountId || (acc ? acc.id : 'acc-1'),
      type: b.type,
      status: b.status || 'POSTED',
      amount: String(b.amount),
      description: b.description,
      category: b.category,
      paymentMethod: b.paymentMethod,
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
    if (method === 'PUT' || method === 'PATCH') {
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

  const catMatch = path.match(/^\/profiles\/([^/]+)\/categories/) || path === '/categories';
  if (catMatch) {
    if (b?.name) {
      const created: Category = { id: 'cat-' + Date.now(), name: b.name, type: b.type || 'EXPENSE' };
      state.categories.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.categories as unknown as T;
  }

  const invMatch = path.match(/^\/profiles\/([^/]+)\/investments/);
  if (invMatch) {
    const pid = invMatch[1];
    if (b?.name) {
      const created: Investment & { profileId: string } = {
        id: 'inv-' + Date.now(),
        profileId: pid,
        name: b.name,
        type: b.type || 'Renda Fixa',
        initialAmount: String(b.initialAmount || '0.00'),
        currentAmount: String(b.currentAmount || b.initialAmount || '0.00'),
        institution: b.institution,
        yieldRate: b.yieldRate
      };
      state.investments.push(created);
      saveLocalState(state);
      return created as unknown as T;
    }
    return state.investments.filter(i => pid === 'all' || i.profileId === pid) as unknown as T;
  }

  const delInvMatch = path.match(/^\/investments\/([^/]+)$/);
  if (delInvMatch && method === 'DELETE') {
    state.investments = state.investments.filter(i => i.id !== delInvMatch[1]);
    saveLocalState(state);
    return { success: true } as unknown as T;
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
  const [theme,setTheme]=useState<'light'|'dark'>(()=>(sessionStorage.getItem('vina_theme') as 'light'|'dark')||'light');
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [selected,setSelected]=useState('all');
  const [tab,setTab]=useState('cash');
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [cards,setCards]=useState<Card[]>([]);
  const [entries,setEntries]=useState<Entry[]>([]);
  const [commitments,setCommitments]=useState<Commitment[]>([]);
  const [goals,setGoals]=useState<Goal[]>([]);
  const [budgets,setBudgets]=useState<Budget[]>([]);
  const [categories,setCategories]=useState<Category[]>(DEFAULT_CATEGORIES);
  const [investments,setInvestments]=useState<Investment[]>(DEFAULT_INVESTMENTS);
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
  const [destinationAccounts,setDestinationAccounts]=useState<Account[]>([]);
  const [transferDestination,setTransferDestination]=useState('');
  const [notice,setNotice]=useState('');
  const [entryKind,setEntryKind]=useState<'INCOME'|'EXPENSE'>('EXPENSE');
  const [daysRange,setDaysRange]=useState<number>(14);
  const [lateFeeInvoice,setLateFeeInvoice]=useState<any|null>(null);
  const [lateFeeManualAmount,setLateFeeManualAmount]=useState<string>('4000.00');
  const [lateFeeDueDate,setLateFeeDueDate]=useState<string>(new Date(Date.now()-10*86400000).toLocaleDateString('en-CA'));
  const [lateFeePayDate,setLateFeePayDate]=useState<string>(new Date().toLocaleDateString('en-CA'));
  const [lateFeeRevolvingRate,setLateFeeRevolvingRate]=useState<number>(12.0);

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme);
    sessionStorage.setItem('vina_theme',theme);
  },[theme]);

  useEffect(()=>{
    let live=true;
    if(modal!=='transfer'||!token||!transferDestination){setDestinationAccounts([]);return;}
    api<Account[]>(`/profiles/${transferDestination}/accounts`,token).then(data=>{if(live)setDestinationAccounts(data);}).catch(e=>{if(live){setDestinationAccounts([]);setError(e.message);}});
    return ()=>{live=false;};
  },[modal,transferDestination,token]);

  useEffect(()=>{
    fetch('/api/welcome').then(r=>r.json()).then(d=>{
      if(d?.greeting && d?.greeting!=='Bem-vindo ao VINA FINACE!') setCloudGreeting(d.greeting);
    }).catch(()=>{});
  },[]);

  const current=profiles.find(p=>p.id===selected);
  const load=()=>setRefresh(v=>v+1);

  const accountBalance=(account:Account)=>{
    let total=Number(account.openingBalance||0);
    for(const e of entries){
      if(e.accountId!==account.id||e.status!=='POSTED')continue;
      total+=(e.type==='INCOME'||e.type==='TRANSFER_IN'?1:-1)*Number(e.amount);
    }
    return total;
  };

  const isMarketBenefit = (acc: Account) => /vale[- ]?mercado|refei[çc][ãa]o|alimenta[çc][ãa]o|alelo|sodexo|vr/i.test(acc.name);
  const isFuelBenefit = (acc: Account) => /vale[- ]?combust[íi]vel|combust[íi]vel|mobilidade|ticket log/i.test(acc.name);
  const isBenefit = (acc: Account) => isMarketBenefit(acc) || isFuelBenefit(acc);
  const isBankOrCash = (acc: Account) => !isBenefit(acc);

  const bankAccounts = accounts.filter(isBankOrCash);
  const marketAccounts = accounts.filter(isMarketBenefit);
  const fuelAccounts = accounts.filter(isFuelBenefit);

  const bankBalance = bankAccounts.reduce((sum, a) => sum + accountBalance(a), 0);
  const marketBalance = marketAccounts.reduce((sum, a) => sum + accountBalance(a), 0);
  const fuelBalance = fuelAccounts.reduce((sum, a) => sum + accountBalance(a), 0);
  const totalAvailableResources = bankBalance + marketBalance + fuelBalance;

  const totalOpeningBalance = accounts.reduce((sum, a) => sum + Number(a.openingBalance || 0), 0);
  const totalRealizedIncome = entries.filter(e => e.status === 'POSTED' && (e.type === 'INCOME' || e.type === 'TRANSFER_IN')).reduce((sum, e) => sum + Number(e.amount), 0);
  const totalRealizedExpense = entries.filter(e => e.status === 'POSTED' && (e.type === 'EXPENSE' || e.type === 'TRANSFER_OUT')).reduce((sum, e) => sum + Number(e.amount), 0);

  const dailyExpenses = Array.from({ length: daysRange }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysRange - 1 - i));
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dayMonth = `${dayStr}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const weekDay = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
    const dateIso = d.toISOString().slice(0, 10);
    const daySpent = entries
      .filter(e => e.status === 'POSTED' && e.type === 'EXPENSE' && (e.occurredAt || '').slice(0, 10) === dateIso)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      day: dayStr,
      dayMonth,
      weekDay,
      date: dateIso,
      amount: daySpent
    };
  });

  const sortedBySpend = [...dailyExpenses].filter(d => d.amount > 0).sort((a, b) => b.amount - a.amount);
  const maxSpendDay = sortedBySpend[0] || (dailyExpenses[0] ? { ...dailyExpenses[0], amount: 0, weekDay: '—' } : { amount: 0, dayMonth: '--', weekDay: '—' });
  const minSpendDay = [...sortedBySpend].reverse()[0] || (dailyExpenses[0] ? { ...dailyExpenses[0], amount: 0, weekDay: '—' } : { amount: 0, dayMonth: '--', weekDay: '—' });
  const maxDailyValue = Math.max(1, ...dailyExpenses.map(d => d.amount));
  const totalDailySpent = dailyExpenses.reduce((s, d) => s + d.amount, 0);
  const avgDailySpent = (totalDailySpent / daysRange) || 0;

  const pendingReceivables = commitments.filter(c => c.type === 'RECEIVABLE' && c.status === 'PENDING').reduce((s, c) => s + Number(c.amount), 0)
    + entries.filter(e => e.status === 'SCHEDULED' && e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);
  const pendingPayables = commitments.filter(c => c.type === 'PAYABLE' && c.status === 'PENDING').reduce((s, c) => s + Number(c.amount), 0)
    + entries.filter(e => e.status === 'SCHEDULED' && e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0);
  const projectedBank = bankBalance + pendingReceivables - pendingPayables;

  const getHorizonForecast = (daysAhead: number) => {
    const horizonDate = new Date();
    horizonDate.setDate(horizonDate.getDate() + daysAhead);
    const horizonIso = horizonDate.toISOString().slice(0, 10);

    const rec = commitments
      .filter(c => c.type === 'RECEIVABLE' && c.status === 'PENDING' && (c.dueDate || '').slice(0, 10) <= horizonIso)
      .reduce((s, c) => s + Number(c.amount), 0)
      + entries
      .filter(e => e.status === 'SCHEDULED' && (e.type === 'INCOME' || e.type === 'TRANSFER_IN') && (e.occurredAt || '').slice(0, 10) <= horizonIso)
      .reduce((s, e) => s + Number(e.amount), 0);

    const pay = commitments
      .filter(c => c.type === 'PAYABLE' && c.status === 'PENDING' && (c.dueDate || '').slice(0, 10) <= horizonIso)
      .reduce((s, c) => s + Number(c.amount), 0)
      + entries
      .filter(e => e.status === 'SCHEDULED' && (e.type === 'EXPENSE' || e.type === 'TRANSFER_OUT') && (e.occurredAt || '').slice(0, 10) <= horizonIso)
      .reduce((s, e) => s + Number(e.amount), 0);

    const projected = bankBalance + rec - pay;
    return {
      days: daysAhead,
      label: daysAhead === 0 ? 'Hoje' : `${daysAhead} dias`,
      rec,
      pay,
      projected
    };
  };

  const forecastHorizons = [
    getHorizonForecast(0),
    getHorizonForecast(7),
    getHorizonForecast(15),
    getHorizonForecast(30),
    getHorizonForecast(60),
    getHorizonForecast(90),
  ];
  const negativeHorizon = forecastHorizons.find(h => h.projected < 0 && h.days > 0);

  const calculateLateFees = () => {
    const origAmount = Number(lateFeeInvoice?.totalAmount || lateFeeManualAmount || 0);
    const due = new Date(lateFeeInvoice?.dueDate || lateFeeDueDate);
    const pay = new Date(lateFeePayDate);
    const diffDays = Math.max(0, Math.ceil((pay.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

    if (diffDays <= 0 || origAmount <= 0) {
      return {
        daysLate: 0,
        fine: 0,
        mora: 0,
        rotativo: 0,
        iof: 0,
        totalFees: 0,
        totalDue: origAmount
      };
    }

    const fine = origAmount * 0.02;
    const mora = origAmount * (0.01 / 30) * diffDays;
    const rotativo = origAmount * ((lateFeeRevolvingRate / 100) / 30) * diffDays;
    const iof = (origAmount * 0.0038) + (origAmount * 0.000082 * diffDays);
    const totalFees = fine + mora + rotativo + iof;
    const totalDue = origAmount + totalFees;

    return {
      daysLate: diffDays,
      fine,
      mora,
      rotativo,
      iof,
      totalFees,
      totalDue
    };
  };

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
    api<Category[]>('/categories',token).then(setCategories).catch(()=>{});

    if(selected==='all'){
      if(profiles.length>0){
        Promise.all(profiles.map(p=>api<Account[]>(`/profiles/${p.id}/accounts`,token).catch(()=>[]))).then(lists=>setAccounts(lists.flat())).catch(()=>{});
        Promise.all(profiles.map(p=>api<Entry[]>(`/profiles/${p.id}/entries`,token).catch(()=>[]))).then(lists=>setEntries(lists.flat())).catch(()=>{});
        Promise.all(profiles.map(p=>api<Card[]>(`/profiles/${p.id}/cards`,token).catch(()=>[]))).then(lists=>setCards(lists.flat())).catch(()=>{});
        Promise.all(profiles.map(p=>api<Commitment[]>(`/profiles/${p.id}/commitments`,token).catch(()=>[]))).then(lists=>setCommitments(lists.flat())).catch(()=>{});
        Promise.all(profiles.map(p=>api<Goal[]>(`/profiles/${p.id}/goals`,token).catch(()=>[]))).then(lists=>setGoals(lists.flat())).catch(()=>{});
        Promise.all(profiles.map(p=>api<Budget[]>(`/profiles/${p.id}/budgets`,token).catch(()=>[]))).then(lists=>setBudgets(lists.flat())).catch(()=>{});
        setInvestments(DEFAULT_INVESTMENTS);
      }else{
        setAccounts([]);
        setCards([]);
        setEntries([]);
        setCommitments([]);
        setGoals([]);
        setBudgets([]);
        setInvestments(DEFAULT_INVESTMENTS);
      }
    }else{
      api<Account[]>(`/profiles/${selected}/accounts`,token).then(setAccounts).catch(e=>setError(e.message));
      api<Card[]>(`/profiles/${selected}/cards`,token).then(setCards).catch(e=>setError(e.message));
      api<Entry[]>(`/profiles/${selected}/entries`,token).then(setEntries).catch(e=>setError(e.message));
      api<Commitment[]>(`/profiles/${selected}/commitments`,token).then(setCommitments).catch(()=>{});
      api<Goal[]>(`/profiles/${selected}/goals`,token).then(setGoals).catch(()=>{});
      api<Budget[]>(`/profiles/${selected}/budgets`,token).then(setBudgets).catch(()=>{});
      api<Investment[]>(`/profiles/${selected}/investments`,token).then(setInvestments).catch(()=>{});
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
    setNotice('');
    if(!profiles||profiles.length===0){
      setNotice('Cadastre seu primeiro perfil financeiro antes de realizar um lançamento.');
      setModal('profile');
      return;
    }
    if(selected==='all'&&profiles.length>0){
      setSelected(profiles[0].id);
    }
    if(!accounts||accounts.length===0){
      setNotice('Antes do lançamento, cadastre uma conta bancária ou benefício com seu saldo atual.');
      setModal('account');
      return;
    }
    setEntryKind('EXPENSE');
    setSelectedItem(null);
    setModal('entry');
  };

  const openCashEntry=(kind:'INCOME'|'EXPENSE')=>{
    setError('');
    setNotice('');
    if(!profiles||profiles.length===0){
      setNotice('Cadastre seu primeiro perfil antes de movimentar o caixa.');
      setModal('profile');
      return;
    }
    if(selected==='all'&&profiles.length>0){
      setSelected(profiles[0].id);
    }
    if(!accounts||accounts.length===0){
      setNotice('Antes do lançamento, cadastre sua conta bancária ou benefício com seu saldo inicial.');
      setModal('account');
      return;
    }
    setEntryKind(kind);
    setSelectedItem(null);
    setModal('entry');
  };

  const handleSalaryEntry=()=>{
    setError('');
    setNotice('');
    if(!profiles||profiles.length===0){
      setNotice('Cadastre seu primeiro perfil antes de registrar o salário.');
      setModal('profile');
      return;
    }
    if(selected==='all'&&profiles.length>0){
      setSelected(profiles[0].id);
    }
    if(!accounts||accounts.length===0){
      setNotice('Cadastre uma conta bancária para receber o salário.');
      setModal('account');
      return;
    }
    setModal('salary');
  };

  const handleRechargeBenefit=()=>{
    setError('');
    setNotice('');
    if(!profiles||profiles.length===0){
      setNotice('Cadastre seu primeiro perfil antes de recarregar benefícios.');
      setModal('profile');
      return;
    }
    if(selected==='all'&&profiles.length>0){
      setSelected(profiles[0].id);
    }
    setModal('recharge_benefit');
  };

  const handleLateFeesSim=(inv?:any)=>{
    setError('');
    const defaultInv = inv || (cards.find(c => c.currentInvoice)?.currentInvoice || null);
    if(defaultInv) {
      setLateFeeInvoice(defaultInv);
      setLateFeeManualAmount(String(defaultInv.totalAmount || '4000.00'));
      setLateFeeDueDate(defaultInv.dueDate ? new Date(defaultInv.dueDate).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'));
    } else {
      setLateFeeInvoice(null);
      setLateFeeManualAmount('4000.00');
      setLateFeeDueDate(new Date(Date.now() - 10 * 86400000).toLocaleDateString('en-CA'));
    }
    setLateFeePayDate(new Date().toLocaleDateString('en-CA'));
    setLateFeeRevolvingRate(12.0);
    setModal('late_fees');
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
    setNotice('');
    if(!profiles||profiles.length===0){
      setNotice('Cadastre seu primeiro perfil antes de cadastrar contas bancárias e benefícios.');
      setModal('profile');
      return;
    }
    if(selected==='all'&&profiles.length>0){
      setSelected(profiles[0].id);
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

  const handleNewCategory=()=>{
    setError('');
    setModal('category');
  };

  const handleNewInvestment=()=>{
    setError('');
    if(!profiles||profiles.length===0){
      setError('Cadastre seu primeiro perfil antes de adicionar investimentos.');
      setModal('profile');
      return;
    }
    if(selected==='all'){
      setError('Selecione um perfil individual no topo da página para vincular o investimento.');
      return;
    }
    setModal('investment');
  };

  const handleDeleteInvestment=async(id:string)=>{
    if(!window.confirm('Deseja excluir este investimento da carteira?')) return;
    try{
      await api(`/investments/${id}`,token,{},'DELETE');
      load();
    }catch(ex){
      setError((ex as Error).message);
    }
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
    setError('');
    if(e.reconciled){
      setError('Lançamentos já conciliados não podem ser alterados.');
      return;
    }
    if(e.type==='TRANSFER_IN'||e.type==='TRANSFER_OUT'||(e as any).transferId){
      setError('Transferências não podem ser editadas isoladamente.');
      return;
    }
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
        const targetProfileId = (selected === 'all' || !selected) ? (profiles[0]?.id) : selected;
        if(!targetProfileId) throw new Error('Crie um perfil antes de cadastrar uma conta.');
        await api(`/profiles/${targetProfileId}/accounts`,token,{name:v('name'),openingBalance:v('balance')});
      }else if(modal==='card'){
        const targetProfileId = (selected === 'all' || !selected) ? (profiles[0]?.id) : selected;
        if(!targetProfileId) throw new Error('Selecione um perfil individual para vincular o cartão.');
        await api(`/profiles/${targetProfileId}/cards`,token,{name:v('name'),limit:v('limit'),closingDay:Number(v('closingDay')),dueDay:Number(v('dueDay')),color:v('color')||'#13a99b'});
      }else if(modal==='purchase'){
        await api(`/cards/${v('cardId')}/purchases`,token,{description:v('description'),totalAmount:v('amount'),totalInstallments:Number(v('installments')||1),purchaseDate:new Date(v('date')+'T12:00:00').toISOString()});
      }else if(modal==='pay_invoice'){
        await api(`/cards/invoices/${v('invoiceId')}/pay`,token,{accountId:v('accountId')});
      }else if(modal==='salary'){
        const amt=Number(v('amount'));
        if(isNaN(amt)||amt<=0) throw new Error('O valor do salário deve ser maior que zero (R$ 0,01).');
        if(!v('accountId')) throw new Error('Selecione uma conta bancária para receber o salário.');
        const targetAccount = accounts.find(a => a.id === v('accountId'));
        const targetProfileId = targetAccount?.profileId || (selected === 'all' ? profiles[0]?.id : selected);
        if(!targetProfileId) throw new Error('Perfil não encontrado para o recebimento.');
        await api('/entries',token,{
          profileId:targetProfileId,
          accountId:v('accountId'),
          type:'INCOME',
          status:v('status')||'POSTED',
          amount:amt.toFixed(2),
          description:v('description').trim() || 'Salário Mensal',
          category:'Salário',
          paymentMethod:'Transferência Bancária',
          occurredAt:new Date(v('date')+'T12:00:00').toISOString()
        });
      }else if(modal==='recharge_benefit'){
        const amt=Number(v('amount'));
        if(isNaN(amt)||amt<=0) throw new Error('O valor da recarga deve ser maior que zero (R$ 0,01).');
        if(!v('accountId')) throw new Error('Selecione a carteira do benefício para recarga.');
        const targetAccount = accounts.find(a => a.id === v('accountId'));
        const targetProfileId = targetAccount?.profileId || (selected === 'all' ? profiles[0]?.id : selected);
        if(!targetProfileId) throw new Error('Perfil não encontrado para o benefício.');
        await api('/entries',token,{
          profileId:targetProfileId,
          accountId:v('accountId'),
          type:'INCOME',
          status:'POSTED',
          amount:amt.toFixed(2),
          description:v('description').trim() || 'Recarga Mensal de Benefício',
          category:'Benefícios',
          paymentMethod:'Crédito em Benefício',
          occurredAt:new Date(v('date')+'T12:00:00').toISOString()
        });
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
        const targetAccount = accounts.find(a => a.id === v('accountId'));
        const targetProfileId = targetAccount?.profileId || (selected === 'all' ? profiles[0]?.id : selected);
        if(!targetProfileId) throw new Error('Perfil não encontrado para o lançamento.');
        const notes=v('notes')?.trim();
        const cat=v('category')?.trim();
        const method=v('paymentMethod')?.trim();
        let desc=v('description').trim();
        if(cat) desc += ` [${cat}]`;
        if(method) desc += ` (${method})`;
        if(notes) desc += ` — ${notes}`;
        await api('/entries',token,{
          profileId:targetProfileId,
          accountId:v('accountId'),
          type:v('type') as 'INCOME'|'EXPENSE',
          status:v('status')||'POSTED',
          amount:amt.toFixed(2),
          description:desc,
          category:cat,
          paymentMethod:method,
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
        },'PATCH');
        setEditingEntry(null);
      }else if(modal==='transfer'){
        if(!destinationAccounts.some(a=>a.id===v('toAccount')))throw new Error('Selecione uma conta de destino válida.');
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
      }else if(modal==='category'){
        await api(`/profiles/${selected}/categories`,token,{name:v('name'),type:v('type')||'EXPENSE'});
      }else if(modal==='investment'){
        await api(`/profiles/${selected}/investments`,token,{
          name:v('name'),
          type:v('type'),
          initialAmount:v('initialAmount'),
          currentAmount:v('currentAmount')||v('initialAmount'),
          institution:v('institution'),
          yieldRate:v('yieldRate')
        });
      }
      setNotice('Operação confirmada pela API. Dados atualizados.');
      setModal('');
      setSelectedItem(null);
      setTransferDestination('');
      setDestinationAccounts([]);
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

  const expenseEntries = entries.filter(e => e.type === 'EXPENSE' && e.status !== 'VOID');
  const totalExpenseEntries = expenseEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const categorySpendingMap: Record<string, number> = {};
  if (expenseEntries.length > 0 && totalExpenseEntries > 0) {
    for (const e of expenseEntries) {
      let catName = 'Outros';
      const desc = e.description || '';
      const match = desc.match(/\[(.*?)\]/);
      if (match && match[1]) {
        catName = match[1];
      } else if (e.category) {
        catName = e.category;
      } else if (/mercado|supermercado|restaurante|almoço|lanche|comida/i.test(desc)) {
        catName = 'Alimentação';
      } else if (/aluguel|condom[íi]nio|luz|energia|cemig|copel|sabesp|água|internet|iptu/i.test(desc)) {
        catName = 'Moradia';
      } else if (/uber|combust[íi]vel|gasolina|posto|estacionamento|carro|auto/i.test(desc)) {
        catName = 'Transporte';
      } else if (/farm[áa]cia|m[ée]dico|consulta|sa[úu]de|exame|hospital/i.test(desc)) {
        catName = 'Saúde';
      } else if (/netflix|cinema|viagem|spotify|lazer|jogo/i.test(desc)) {
        catName = 'Lazer';
      }
      categorySpendingMap[catName] = (categorySpendingMap[catName] || 0) + Number(e.amount || 0);
    }
  }
  let calculatedCategories = Object.entries(categorySpendingMap).map(([name, val]) => ({
    name,
    amount: val,
    percentage: Math.round((val / totalExpenseEntries) * 100)
  })).sort((a, b) => b.amount - a.amount);
  if (calculatedCategories.length === 0) {
    calculatedCategories = [
      { name: 'Alimentação', amount: 1250, percentage: 28 },
      { name: 'Moradia', amount: 980, percentage: 22 },
      { name: 'Transporte', amount: 670, percentage: 15 },
      { name: 'Saúde', amount: 535, percentage: 12 },
      { name: 'Lazer', amount: 445, percentage: 10 },
      { name: 'Outros', amount: 580, percentage: 13 }
    ];
  }

  const upcomingPayables = commitments.filter(c => c.type === 'PAYABLE' && c.status === 'PENDING').slice(0, 4);

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
      {notice&&<div role="status" className="operation-notice" onClick={()=>setNotice('')}><CheckCircle2 size={18}/>{notice}<button type="button" aria-label="Fechar aviso">×</button></div>}
      <aside className={`sidebar ${collapsed?'collapsed':''}`}>
        <div className="brand">
          <div className="brand-icon">V</div>
          {!collapsed&&<div><h1>VINA FINACE</h1><span>v2.5 · Financeiro Diário</span></div>}
        </div>

        <div className="sidebar-scroll">
          {!collapsed&&<div className="nav-section-title">Operação & Caixa</div>}
          <button className={`nav-item ${tab==='cash'?'active':''}`} onClick={()=>setTab('cash')} title="Meu Financeiro Diário"><Wallet size={18}/>{!collapsed&&<span>Meu Financeiro Diário</span>}</button>
          <button className={`nav-item ${tab==='dashboard'?'active':''}`} onClick={()=>setTab('dashboard')} title="Dashboard Executivo"><LayoutDashboard size={18}/>{!collapsed&&<span>Dashboard</span>}</button>
          <button className={`nav-item ${tab==='entries'?'active':''}`} onClick={()=>setTab('entries')} title="Central de Lançamentos"><ReceiptText size={18}/>{!collapsed&&<span>Lançamentos</span>}</button>
          <button className={`nav-item ${tab==='accounts'?'active':''}`} onClick={()=>setTab('accounts')} title="Contas Bancárias & Vales"><Landmark size={18}/>{!collapsed&&<span>Contas & Vales</span>}</button>
          <button className={`nav-item ${tab==='cards'?'active':''}`} onClick={()=>setTab('cards')} title="Cartões de Crédito"><CreditCard size={18}/>{!collapsed&&<span>Cartões de Crédito</span>}</button>
          <button className={`nav-item ${tab==='commitments'?'active':''}`} onClick={()=>setTab('commitments')} title="Contas a Pagar & Receber"><Calendar size={18}/>{!collapsed&&<span>Compromissos</span>}</button>
          <button className={`nav-item ${tab==='categories'?'active':''}`} onClick={()=>setTab('categories')} title="Categorias Financeiras"><FolderTree size={18}/>{!collapsed&&<span>Categorias</span>}</button>

          {!collapsed&&<div className="nav-section-title">Planejamento & IA</div>}
          <button className={`nav-item ${tab==='goals'?'active':''}`} onClick={()=>setTab('goals')} title="Metas Financeiras"><Target size={18}/>{!collapsed&&<span>Metas Financeiras</span>}</button>
          <button className={`nav-item ${tab==='investments'?'active':''}`} onClick={()=>setTab('investments')} title="Investimentos & Patrimônio"><PiggyBank size={18}/>{!collapsed&&<span>Investimentos</span>}</button>
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
            <button className="icon-button" onClick={()=>setTheme(t=>t==='light'?'dark':'light')} title={theme==='light'?'Ativar Modo Escuro':'Ativar Modo Claro'}>
              {theme==='light'?<Moon size={18}/>:<Sun size={18} color="#f59e0b"/>}
            </button>
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
          {tab==='cash'&&(
            <section className="panel" style={{display:'flex',flexDirection:'column',gap:'20px'}}>
              <div className="panel-title">
                <div>
                  <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <Wallet size={22} color="#0d9488"/> Meu Financeiro Diário
                  </h2>
                  <span style={{fontSize:'13px',color:'var(--text-muted)'}}>
                    VINA FINACE • {current ? current.name : 'Perfil Pessoal'} — Salário, Caixa, Benefícios e Previsões
                  </span>
                </div>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <button className="primary" onClick={handleSalaryEntry} title="Registrar salário recebido na conta">
                    <ArrowDownRight size={16}/> Receber salário
                  </button>
                  <button className="secondary" onClick={()=>openCashEntry('EXPENSE')} title="Registrar despesa no caixa ou vale">
                    <ArrowUpRight size={16}/> Registrar gasto
                  </button>
                  <button className="secondary" onClick={handleRechargeBenefit} title="Recarregar benefício corporativo (acumulativo)">
                    <Sparkles size={16}/> Recarregar vale
                  </button>
                  <button className="secondary" onClick={handleNewAccount} title="Cadastrar conta corrente, carteira ou benefício">
                    <Plus size={16}/> Nova conta
                  </button>
                  <button className="secondary" onClick={()=>handleLateFeesSim()} title="Simular encargos de atraso de cartão de crédito">
                    <CreditCard size={16}/> Taxa de Atraso Cartão
                  </button>
                </div>
              </div>

              {!current ? (
                <div className="cash-onboarding">
                  <h3>Comece pelo seu perfil pessoal</h3>
                  <p>Selecione um perfil financeiro individual no topo da tela para administrar seu dinheiro e benefícios.</p>
                  <button className="primary" onClick={()=>{if(profiles.length)setSelected(profiles[0].id);else setModal('profile');}}>
                    {profiles.length?'Usar perfil '+profiles[0].name:'Criar perfil pessoal'}
                  </button>
                </div>
              ) : accounts.length === 0 ? (
                <div className="cash-onboarding">
                  <h3>Você ainda não possui contas ou benefícios cadastrados</h3>
                  <p>Cadastre sua conta bancária corrente (com seu saldo atual), carteira de dinheiro e seus benefícios (Vale-Mercado, Vale-Combustível).</p>
                  <button className="primary" onClick={handleNewAccount}>
                    + Cadastrar primeira conta e saldo
                  </button>
                </div>
              ) : (
                <>
                  {/* Top 8 KPI summary of personal resources */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'12px'}}>
                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Dinheiro nas Contas</span>
                        <div className="metric-icon-badge" style={{background:bankBalance<0?'#fef2f2':'#eff6ff',color:bankBalance<0?'#dc2626':'#2563eb'}}>
                          <Landmark size={16}/>
                        </div>
                      </div>
                      <div>
                        <div className={`metric-val ${bankBalance<0?'negative-balance':''}`} style={{fontSize:'22px',color:bankBalance<0?'#dc2626':'#2563eb'}}>
                          {money(bankBalance)}
                        </div>
                        <div className="metric-sub">
                          {bankBalance<0 ? <span className="badge-negative">⚠️ Cheque especial / Devedor</span> : 'Saldos bancários e dinheiro'}
                        </div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Vale-Mercado</span>
                        <div className="metric-icon-badge" style={{background:'#fefce8',color:'#ca8a04'}}>🛒</div>
                      </div>
                      <div>
                        <div className="metric-val" style={{fontSize:'22px',color:'#ca8a04'}}>{money(marketBalance)}</div>
                        <div className="metric-sub">Saldo acumulado</div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Vale-Combustível</span>
                        <div className="metric-icon-badge" style={{background:'#fdf4ff',color:'#c026d3'}}>⛽</div>
                      </div>
                      <div>
                        <div className="metric-val" style={{fontSize:'22px',color:'#c026d3'}}>{money(fuelBalance)}</div>
                        <div className="metric-sub">Saldo acumulado</div>
                      </div>
                    </div>

                    <div className="metric" style={{background:'linear-gradient(135deg, #0d9488 0%, #047857 100%)',color:'#ffffff'}}>
                      <div className="metric-header">
                        <span className="metric-label" style={{color:'#ccfbf1'}}>Recursos Disponíveis</span>
                        <div className="metric-icon-badge" style={{background:'rgba(255,255,255,0.2)',color:'#ffffff'}}>✨</div>
                      </div>
                      <div>
                        <div className="metric-val" style={{fontSize:'24px',color:'#ffffff'}}>{money(totalAvailableResources)}</div>
                        <div className="metric-sub" style={{color:'#ccfbf1'}}>Bancos + Vales acumulados</div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Recebido no Mês</span>
                        <div className="metric-icon-badge" style={{background:'#f0fdf4',color:'#16a34a'}}>+</div>
                      </div>
                      <div>
                        <div className="metric-val positive" style={{fontSize:'22px'}}>{money(totalRealizedIncome)}</div>
                        <div className="metric-sub" style={{color:'#16a34a'}}>Entradas confirmadas</div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Gasto no Mês</span>
                        <div className="metric-icon-badge" style={{background:'#fef2f2',color:'#dc2626'}}>−</div>
                      </div>
                      <div>
                        <div className="metric-val negative" style={{fontSize:'22px'}}>{money(totalRealizedExpense)}</div>
                        <div className="metric-sub" style={{color:'#dc2626'}}>Despesas efetivadas</div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">A Pagar</span>
                        <div className="metric-icon-badge" style={{background:'#fff7ed',color:'#ea580c'}}><Calendar size={16}/></div>
                      </div>
                      <div>
                        <div className="metric-val" style={{fontSize:'22px',color:'#ea580c'}}>{money(pendingPayables)}</div>
                        <div className="metric-sub">Compromissos pendentes</div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span className="metric-label">Saldo Previsto</span>
                        <div className="metric-icon-badge" style={{background:'#eff6ff',color:projectedBank>=0?'#0d9488':'#dc2626'}}><TrendingUp size={16}/></div>
                      </div>
                      <div>
                        <div className={`metric-val ${projectedBank<0?'negative-balance':''}`} style={{fontSize:'22px',color:projectedBank>=0?'#0d9488':'#dc2626'}}>
                          {money(projectedBank)}
                        </div>
                        <div className="metric-sub">Projeção no mês</div>
                      </div>
                    </div>
                  </div>

                  {/* 2 Columns: Daily Spending Chart & Multi-horizon Forecast */}
                  <div className="dashboard-grid-2col" style={{marginTop:'4px'}}>
                    {/* Column 1: Daily Spending */}
                    <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'20px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',flexWrap:'wrap',gap:'8px'}}>
                        <div>
                          <h3 style={{fontSize:'16px',fontWeight:700,margin:0}}>Gastos Diários</h3>
                          <span style={{fontSize:'12px',color:'var(--text-muted)'}}>Despesas registradas por dia no calendário</span>
                        </div>
                        <div style={{display:'flex',gap:'4px',background:'var(--bg-app)',padding:'3px',borderRadius:'8px',border:'1px solid var(--border)'}}>
                          {[7, 14, 15, 30].map(r => (
                            <button
                              key={r}
                              type="button"
                              className={daysRange === r ? 'primary' : 'secondary'}
                              style={{padding:'4px 8px',fontSize:'11px',borderRadius:'6px'}}
                              onClick={()=>setDaysRange(r)}
                            >
                              {r} dias
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="daily-spending-chart">
                        {dailyExpenses.map(d => {
                          const heightPct = Math.max(8, Math.round((d.amount / maxDailyValue) * 100));
                          const isMax = d.amount > 0 && d.amount === maxSpendDay.amount;
                          return (
                            <div key={d.date} className="day-bar-group" title={`${d.weekDay}, ${d.dayMonth}: ${money(d.amount)}`}>
                              <div
                                className={`day-bar-fill ${isMax ? 'highlight' : ''}`}
                                style={{height:`${heightPct}%`}}
                              />
                              <span className="day-bar-label" style={{fontSize:'10px'}}>{d.weekDay}</span>
                              <span className="day-bar-label" style={{fontSize:'9px',color:'var(--text-muted)'}}>{d.day}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginTop:'14px'}}>
                        <div style={{padding:'10px 12px',borderRadius:'8px',background:'var(--bg-app)',border:'1px solid var(--border)'}}>
                          <div style={{fontSize:'11px',color:'var(--text-muted)'}}>Maior Gasto:</div>
                          <div style={{fontSize:'15px',fontWeight:800,color:'#f59e0b'}}>{money(maxSpendDay.amount)}</div>
                          <div style={{fontSize:'11px',color:'var(--text-secondary)'}}>{maxSpendDay.weekDay} · {maxSpendDay.dayMonth}</div>
                        </div>
                        <div style={{padding:'10px 12px',borderRadius:'8px',background:'var(--bg-app)',border:'1px solid var(--border)'}}>
                          <div style={{fontSize:'11px',color:'var(--text-muted)'}}>Menor Gasto:</div>
                          <div style={{fontSize:'15px',fontWeight:800,color:'#10b981'}}>{money(minSpendDay.amount)}</div>
                          <div style={{fontSize:'11px',color:'var(--text-secondary)'}}>{minSpendDay.weekDay} · {minSpendDay.dayMonth}</div>
                        </div>
                        <div style={{padding:'10px 12px',borderRadius:'8px',background:'var(--bg-app)',border:'1px solid var(--border)'}}>
                          <div style={{fontSize:'11px',color:'var(--text-muted)'}}>Média Diária:</div>
                          <div style={{fontSize:'15px',fontWeight:800,color:'var(--text-main)'}}>{money(avgDailySpent)}</div>
                          <div style={{fontSize:'11px',color:'var(--text-secondary)'}}>por dia ({daysRange}d)</div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Cash Forecast & Multi-horizon Projections */}
                    <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'20px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
                          <TrendingUp size={18} color="#0d9488"/>
                          <h3 style={{fontSize:'16px',fontWeight:700,margin:0}}>Previsões Futuras do Dinheiro</h3>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                          <div className="forecast-row">
                            <span style={{color:'var(--text-muted)'}}>Saldo bancário atual</span>
                            <span style={{fontWeight:700,color:bankBalance<0?'#dc2626':'inherit'}}>{money(bankBalance)}</span>
                          </div>
                          <div className="forecast-row">
                            <span style={{color:'#16a34a'}}>Recebimentos previstos</span>
                            <span style={{fontWeight:700,color:'#16a34a'}}>+ {money(pendingReceivables)}</span>
                          </div>
                          <div className="forecast-row">
                            <span style={{color:'#dc2626'}}>Despesas previstas</span>
                            <span style={{fontWeight:700,color:'#dc2626'}}>− {money(pendingPayables)}</span>
                          </div>
                          <div style={{borderTop:'1px dashed var(--border)',margin:'4px 0'}}/>
                          <div className="forecast-row" style={{fontSize:'14px'}}>
                            <span style={{fontWeight:700}}>Saldo projetado imediato</span>
                            <span style={{fontWeight:800,color:projectedBank>=0?'#0d9488':'#dc2626',fontSize:'16px'}}>
                              {money(projectedBank)}
                            </span>
                          </div>
                        </div>

                        {/* Multi-horizon Cards */}
                        <div style={{marginTop:'14px'}}>
                          <div style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px'}}>
                            Projeções por Horizonte Temporal:
                          </div>
                          <div className="forecast-horizons">
                            {forecastHorizons.map(h => (
                              <div key={h.days} className="horizon-card">
                                <span className="horizon-label">{h.label}</span>
                                <span className={`horizon-val ${h.projected < 0 ? 'negative-balance' : ''}`} style={{color: h.projected < 0 ? '#dc2626' : 'var(--text-main)', fontSize:'14px'}}>
                                  {money(h.projected)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {negativeHorizon&&(
                          <div className="warning-alert-banner">
                            <AlertTriangle size={18} color="#b45309" style={{flexShrink:0}}/>
                            <div>
                              <b>Alerta de Caixa:</b> Projeção de saldo insuficiente nos <b>{negativeHorizon.label}</b> ({money(negativeHorizon.projected)}). Providencie receitas ou postergue despesas.
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{background:'#f0fdfa',border:'1px solid #99f6e4',padding:'10px 12px',borderRadius:'10px',marginTop:'14px',fontSize:'12px',color:'#0f766e',lineHeight:1.4}}>
                        <b>💡 Saldo Acumulativo:</b> O saldo não utilizado dos seus vales acumula para os meses seguintes, enquanto compras com vales não reduzem o caixa bancário.
                      </div>
                    </div>
                  </div>

                  {/* Accounts & Benefit Balances Table */}
                  <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <h3 style={{fontSize:'16px',fontWeight:700,margin:0}}>Saldos por Conta & Benefício</h3>
                      <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={handleNewAccount}>
                        + Nova Conta ou Vale
                      </button>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Nome da Conta / Benefício</th>
                            <th>Tipo de Recurso</th>
                            <th>Saldo Inicial (Abertura)</th>
                            <th>Saldo Atual Calculado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map(a => {
                            const bal = accountBalance(a);
                            const label = isMarketBenefit(a) ? 'Vale-Mercado (Alimentação)' : isFuelBenefit(a) ? 'Vale-Combustível (Mobilidade)' : 'Conta Bancária / Dinheiro';
                            const badgeColor = isMarketBenefit(a) ? {bg:'#fefce8',fg:'#ca8a04'} : isFuelBenefit(a) ? {bg:'#fdf4ff',fg:'#c026d3'} : {bg:'#eff6ff',fg:'#2563eb'};
                            return (
                              <tr key={a.id}>
                                <td>
                                  <b>{a.name}</b>
                                  {bal < 0 && <span className="badge-negative" style={{marginLeft:'8px'}}>Cheque Especial</span>}
                                </td>
                                <td>
                                  <span className="pill" style={{fontSize:'11px',background:badgeColor.bg,color:badgeColor.fg,fontWeight:700}}>
                                    {label}
                                  </span>
                                </td>
                                <td>{money(a.openingBalance)}</td>
                                <td className={bal >= 0 ? 'positive' : 'negative-balance'} style={{fontWeight:800,fontSize:'14px'}}>
                                  {money(bal)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Cash Operations */}
                  <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-lg)',border:'1px solid var(--border)',padding:'20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <h3 style={{fontSize:'16px',fontWeight:700,margin:0}}>Movimentações Recentes do Caixa</h3>
                      <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setTab('entries')}>
                        Ver Todos os Lançamentos →
                      </button>
                    </div>
                    {entries.length === 0 ? (
                      <Empty text="Nenhuma movimentação registrada no caixa."/>
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Descrição</th>
                              <th>Conta / Benefício</th>
                              <th>Tipo</th>
                              <th>Valor</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.slice(0, 10).map(e => (
                              <tr key={e.id}>
                                <td>{new Date(e.occurredAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                <td>{e.description}</td>
                                <td><span className="pill" style={{fontSize:'11px'}}>{e.account?.name || 'Conta'}</span></td>
                                <td>
                                  <span className="pill" style={{
                                    fontSize:'10px',
                                    background:['INCOME','TRANSFER_IN'].includes(e.type)?'#dcfce7':'#fee2e2',
                                    color:['INCOME','TRANSFER_IN'].includes(e.type)?'#166534':'#991b1b',
                                    fontWeight:700
                                  }}>
                                    {e.type==='INCOME'?'Entrada':e.type==='EXPENSE'?'Saída':'Transferência'}
                                  </span>
                                </td>
                                <td className={['INCOME','TRANSFER_IN'].includes(e.type)?'positive':'negative'} style={{fontWeight:700}}>
                                  {['INCOME','TRANSFER_IN'].includes(e.type)?'+':'−'} {money(e.amount)}
                                </td>
                                <td>
                                  <button className="icon-button" title="Editar Lançamento" onClick={()=>handleEditEntry(e)}>
                                    <Pencil size={15} color="#0d9488"/>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {tab==='dashboard'&&dash&&<>
            {/* 1. TOP METRICS: Saldo Total, Receitas, Despesas, Resultado */}
            <div className="metrics">
              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Saldo Total</span>
                  <div className="metric-icon-badge" style={{background:'#ecfdf5',color:'#059669'}}><Wallet size={18}/></div>
                </div>
                <div>
                  <div className="metric-val">{money(dash.balance)}</div>
                  <div className="metric-sub">Liquidez disponível imediata</div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Receitas</span>
                  <div className="metric-icon-badge" style={{background:'#ecfdf5',color:'#10b981'}}><ArrowUpRight size={18}/></div>
                </div>
                <div>
                  <div className="metric-val" style={{color:'#10b981'}}>{money(dash.income)}</div>
                  <div className="metric-sub" style={{color:dash.scheduledIncome&&Number(dash.scheduledIncome)>0?'#059669':'inherit'}}>
                    {dash.scheduledIncome&&Number(dash.scheduledIncome)>0?`+${money(dash.scheduledIncome)} a receber`:'Entradas realizadas do mês'}
                  </div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Despesas</span>
                  <div className="metric-icon-badge" style={{background:'#fef2f2',color:'#ef4444'}}><ArrowDownRight size={18}/></div>
                </div>
                <div>
                  <div className="metric-val" style={{color:'#ef4444'}}>{money(dash.expense)}</div>
                  <div className="metric-sub" style={{color:dash.scheduledExpense&&Number(dash.scheduledExpense)>0?'#d97706':'inherit'}}>
                    {dash.scheduledExpense&&Number(dash.scheduledExpense)>0?`+${money(dash.scheduledExpense)} previstas`:'Saídas realizadas do mês'}
                  </div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Resultado</span>
                  <div className="metric-icon-badge" style={{background:Number(dash.result)>=0?'#ecfdf5':'#fef2f2',color:Number(dash.result)>=0?'#059669':'#ef4444'}}>
                    <TrendingUp size={18}/>
                  </div>
                </div>
                <div>
                  <div className="metric-val" style={{color:Number(dash.result)>=0?'#10b981':'#ef4444'}}>
                    {Number(dash.result)>=0?'+ ':'− '}{money(Math.abs(Number(dash.result)))}
                  </div>
                  <div className="metric-sub">
                    <span className="pill" style={{background:Number(dash.result)>=0?'#ecfdf5':'#fef2f2',color:Number(dash.result)>=0?'#059669':'#ef4444',fontSize:'10px',padding:'2px 8px'}}>
                      {Number(dash.result)>=0?'Superávit Mensal':'Déficit Mensal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE 2-COLUMN GRID: Fluxo de Caixa (gráfico) + Despesas por Categoria */}
            <div className="dashboard-grid-2col">
              <section className="panel">
                <div className="panel-title">
                  <h2>Fluxo de Caixa (Evolução Mensal)</h2>
                  <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setTab('reports')}>Ver Relatório</button>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px',fontSize:'12px',color:'var(--text-secondary)'}}>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span style={{display:'flex',alignItems:'center',gap:'4px'}}><span style={{width:'10px',height:'10px',borderRadius:'2px',background:'#10b981',display:'inline-block'}}/> Receitas</span>
                    <span style={{display:'flex',alignItems:'center',gap:'4px'}}><span style={{width:'10px',height:'10px',borderRadius:'2px',background:'#ef4444',display:'inline-block'}}/> Despesas</span>
                  </div>
                  <span>Últimos meses</span>
                </div>
                <div className="cashflow-chart-wrap">
                  {cashflow.length === 0 ? (
                    <div style={{padding:'28px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px',width:'100%'}}>
                      Nenhuma movimentação registrada no fluxo de caixa.
                    </div>
                  ) : (
                    cashflow.slice(-4).map(cf => {
                      const inc = Number(cf.income);
                      const exp = Number(cf.expense);
                      const maxV = Math.max(...cashflow.slice(-4).map(c => Math.max(Number(c.income), Number(c.expense))), 1000);
                      const incH = Math.max(8, Math.round((inc / maxV) * 100));
                      const expH = Math.max(8, Math.round((exp / maxV) * 100));
                      const net = Number(cf.net);
                      return (
                        <div key={cf.month} className="cashflow-bar-group">
                          <div className="cashflow-bars">
                            <div className="cashflow-bar" style={{height:`${incH}%`,background:'#10b981'}} title={`Receita: ${money(cf.income)}`}/>
                            <div className="cashflow-bar" style={{height:`${expH}%`,background:'#ef4444'}} title={`Despesa: ${money(cf.expense)}`}/>
                          </div>
                          <span style={{fontSize:'11px',fontWeight:700,color:'var(--text-main)'}}>{cf.month.slice(5)}/{cf.month.slice(2,4)}</span>
                          <span style={{fontSize:'10px',fontWeight:700,color:net>=0?'#10b981':'#ef4444'}}>{net>=0?'+':'−'}{money(Math.abs(net))}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <h2>Despesas por Categoria</h2>
                  <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={()=>setTab('budgets')}>Orçamentos</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {calculatedCategories.slice(0,5).map((cat, idx) => (
                    <div key={cat.name} className="category-bar-item">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <span style={{width:'10px',height:'10px',borderRadius:'2px',background:CATEGORY_COLORS[idx%CATEGORY_COLORS.length],display:'inline-block'}}/>
                          <b style={{color:'var(--text-main)'}}>{cat.name}</b>
                        </div>
                        <div>
                          <span style={{fontWeight:700,color:'var(--text-main)',marginRight:'8px'}}>{cat.percentage}%</span>
                          <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>{money(cat.amount)}</span>
                        </div>
                      </div>
                      <div className="progress-track" style={{height:'7px'}}>
                        <div className="progress-bar" style={{width:`${cat.percentage}%`,background:CATEGORY_COLORS[idx%CATEGORY_COLORS.length]}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 3. LOWER 2-COLUMN GRID: Contas a Pagar (próximos) + Cartões de Crédito */}
            <div className="dashboard-grid-2col">
              <section className="panel">
                <div className="panel-title">
                  <h2>Contas a Pagar (Próximos Vencimentos)</h2>
                  <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={handleNewCommitment}>+ Compromisso</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {upcomingPayables.length === 0 ? (
                    <div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px'}}>Nenhuma conta a pagar pendente no período.</div>
                  ) : (
                    upcomingPayables.map(c => (
                      <div key={c.id} className="payable-quick-item">
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#ef4444'}}/>
                          <div>
                            <div style={{fontSize:'13px',fontWeight:700,color:'var(--text-main)'}}>{c.description}</div>
                            <div style={{fontSize:'11px',color:'var(--text-muted)'}}>
                              {c.entityName ? `${c.entityName} · ` : ''}Vencimento: {new Date(c.dueDate).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',timeZone:'UTC'})}
                            </div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <b style={{fontSize:'14px',color:'#ef4444'}}>{money(c.amount)}</b>
                          <button
                            className="secondary"
                            style={{fontSize:'11px',padding:'4px 10px',background:'#ecfdf5',borderColor:'#a7f3d0',color:'#059669',fontWeight:700}}
                            onClick={() => { setSelectedItem(c); setModal('settle_commitment'); }}
                          >
                            Liquidar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <h2>Cartões de Crédito</h2>
                  <div style={{display:'flex',gap:'6px'}}>
                    <button className="secondary" style={{fontSize:'11px',padding:'5px 10px'}} onClick={handleNewPurchase}><CreditCard size={13}/> Compra</button>
                    <button className="secondary" style={{fontSize:'11px',padding:'5px 10px'}} onClick={()=>setTab('cards')}>Ver Todos</button>
                  </div>
                </div>
                <div className="card-summary-row">
                  {cards.length === 0 ? (
                    <div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px',width:'100%'}}>
                      Nenhum cartão cadastrado no perfil atual.
                    </div>
                  ) : (
                    cards.map(card => {
                      const limit = Number(card.limit);
                      const avail = Number(card.availableLimit);
                      const used = Math.max(0, limit - avail);
                      const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                      return (
                        <div key={card.id} className="card-summary-card">
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                              <div style={{width:'10px',height:'10px',borderRadius:'50%',background:card.color||'#0d9488'}}/>
                              <b style={{fontSize:'13px',color:'var(--text-main)'}}>{card.name}</b>
                            </div>
                            <span style={{fontSize:'12px',fontWeight:700,color:pct>80?'#ef4444':'#0d9488'}}>
                              {card.currentInvoice ? money(card.currentInvoice.totalAmount) : money(used)}
                            </span>
                          </div>
                          <div className="progress-track" style={{height:'6px'}}>
                            <div className="progress-bar" style={{width:`${pct}%`,background:pct>80?'#ef4444':pct>50?'#f59e0b':'#10b981'}}/>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'var(--text-muted)'}}>
                            <span>Disponível: <b style={{color:'var(--text-secondary)'}}>{money(card.availableLimit)}</b></span>
                            <span>Limite: <b>{money(card.limit)}</b></span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {cards.length > 0 && (
                    <div style={{background:'#f8fafc',padding:'10px 14px',borderRadius:'8px',border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px'}}>
                      <span style={{color:'var(--text-secondary)'}}>Limite Total Contratado:</span>
                      <b style={{color:'var(--text-main)',fontSize:'14px'}}>
                        {money(cards.reduce((s, c) => s + Number(c.limit || 0), 0))}
                      </b>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* 4. BOTTOM PANEL: Metas Financeiras (Full Width) */}
            <section className="panel">
              <div className="panel-title">
                <h2>Metas Financeiras & Objetivos</h2>
                <button className="secondary" style={{fontSize:'12px',padding:'6px 12px'}} onClick={handleNewGoal}><Plus size={14}/> Nova Meta</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'16px'}}>
                {goals.length === 0 ? (
                  <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px',width:'100%'}}>
                    Nenhuma meta cadastrada no perfil atual. Clique em "Nova Meta" para começar seu planejamento.
                  </div>
                ) : (
                  goals.map(g => (
                    <div key={g.id} className="goal-card" style={{margin:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <div style={{width:'28px',height:'28px',borderRadius:'8px',background:`${g.color||'#10b981'}20`,color:g.color||'#10b981',display:'grid',placeItems:'center'}}>
                            <Target size={15}/>
                          </div>
                          <b style={{fontSize:'13px',color:'var(--text-main)'}}>{g.name}</b>
                        </div>
                        <span className="pill" style={{background:'#ecfdf5',color:'#059669',fontWeight:700}}>{g.progress}%</span>
                      </div>
                      <div className="progress-track" style={{height:'8px',margin:'8px 0'}}>
                        <div className="progress-bar" style={{width:`${Math.min(100,g.progress)}%`,background:g.color||'#10B981'}}/>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px'}}>
                        <span style={{color:'var(--text-secondary)'}}>
                          {money(g.currentAmount)} <span style={{color:'var(--text-muted)'}}>/ {money(g.targetAmount)}</span>
                        </span>
                        <button
                          className="secondary"
                          style={{fontSize:'11px',padding:'4px 10px',background:'#f0fdfa',borderColor:'#99f6e4',color:'#0f766e',fontWeight:700}}
                          onClick={() => { setSelectedItem(g); setModal('deposit_goal'); }}
                        >
                          + Aporte
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* 5. OPERATIONAL OVERVIEW & VINA IA DIAGNOSIS */}
            <div className="dashboard-grid">
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

          {tab==='categories'&&(
            <section className="panel">
              <div className="panel-title">
                <h2>Categorias Financeiras Operacionais</h2>
                <button className="secondary" onClick={handleNewCategory}><Plus size={15}/> Nova Categoria</button>
              </div>
              <p className="muted">Organize suas receitas e despesas por categorias para acompanhamento orçamentário detalhado.</p>
              <div className="grid-cards">
                <div className="budget-card" style={{gridColumn:'1 / -1'}}>
                  <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'12px',color:'#10b981'}}>Receitas</h3>
                  <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                    {categories.filter(c=>c.type==='INCOME').map(c=>(
                      <span key={c.id} className="pill" style={{background:'#ecfdf5',color:'#059669',padding:'8px 14px',fontSize:'13px',borderRadius:'8px'}}>
                        • {c.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="budget-card" style={{gridColumn:'1 / -1'}}>
                  <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'12px',color:'#ef4444'}}>Despesas</h3>
                  <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                    {categories.filter(c=>c.type==='EXPENSE').map(c=>(
                      <span key={c.id} className="pill" style={{background:'#fef2f2',color:'#dc2626',padding:'8px 14px',fontSize:'13px',borderRadius:'8px'}}>
                        • {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

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

          {tab==='investments'&&(
            <section className="panel">
              <div className="panel-title">
                <h2>Carteira de Investimentos & Patrimônio</h2>
                <button className="secondary" onClick={handleNewInvestment}><Plus size={15}/> Novo Ativo</button>
              </div>
              <p className="muted">Acompanhe seus ativos de renda fixa, ações, fundos imobiliários e patrimônio líquido em evolução.</p>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'24px'}}>
                <div style={{background:'#f0fdfa',padding:'16px',borderRadius:'12px',border:'1px solid #99f6e4'}}>
                  <div style={{fontSize:'12px',color:'#0f766e',fontWeight:600}}>Patrimônio em Investimentos</div>
                  <div style={{fontSize:'24px',fontWeight:800,color:'#0f766e',marginTop:'4px'}}>
                    {money(investments.reduce((sum,i)=>sum+Number(i.currentAmount||0),0))}
                  </div>
                </div>
                <div style={{background:'#f8fafc',padding:'16px',borderRadius:'12px',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:'12px',color:'var(--text-secondary)',fontWeight:600}}>Total Aportado Original</div>
                  <div style={{fontSize:'24px',fontWeight:800,color:'var(--text-main)',marginTop:'4px'}}>
                    {money(investments.reduce((sum,i)=>sum+Number(i.initialAmount||0),0))}
                  </div>
                </div>
                <div style={{background:'#ecfdf5',padding:'16px',borderRadius:'12px',border:'1px solid #a7f3d0'}}>
                  <div style={{fontSize:'12px',color:'#065f46',fontWeight:600}}>Rentabilidade Global Estimada</div>
                  <div style={{fontSize:'24px',fontWeight:800,color:'#059669',marginTop:'4px'}}>
                    {(() => {
                      const init = investments.reduce((sum,i)=>sum+Number(i.initialAmount||0),0);
                      const curr = investments.reduce((sum,i)=>sum+Number(i.currentAmount||0),0);
                      if (init <= 0) return '0.0%';
                      const yieldPct = ((curr - init) / init) * 100;
                      return `+${yieldPct.toFixed(1)}% (${money(curr - init)})`;
                    })()}
                  </div>
                </div>
              </div>

              {investments.length === 0 ? <Empty text="Nenhum investimento cadastrado."/> : (
                <div className="grid-cards">
                  {investments.map(inv => (
                    <div key={inv.id} className="goal-card">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                        <div>
                          <span className="pill" style={{fontSize:'11px',marginBottom:'6px'}}>{inv.type}</span>
                          <h3 style={{fontSize:'16px',fontWeight:800,margin:'4px 0'}}>{inv.name}</h3>
                          <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{inv.institution || 'Custodiado'}</div>
                        </div>
                        <span className="pill" style={{background:'#ecfdf5',color:'#059669',fontWeight:700}}>
                          {inv.yieldRate || 'Ativo'}
                        </span>
                      </div>
                      <div style={{marginTop:'12px',borderTop:'1px solid var(--border-light)',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                        <div>
                          <div style={{fontSize:'11px',color:'var(--text-muted)'}}>Posição Atual:</div>
                          <div style={{fontSize:'18px',fontWeight:800,color:'var(--text-main)'}}>{money(inv.currentAmount)}</div>
                        </div>
                        <button className="icon-button" title="Excluir Ativo" onClick={()=>handleDeleteInvestment(inv.id)}>
                          <Trash2 size={15} color="#ef4444"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

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
                <button className="secondary" onClick={()=>handleLateFeesSim()}><AlertTriangle size={15}/> Taxa de Atraso (CDC)</button>
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
                          <div style={{display:'flex',gap:'6px'}}>
                            <button className="secondary" style={{fontSize:'11px',padding:'6px 10px',background:'rgba(255,255,255,0.1)',color:'#fff',borderColor:'rgba(255,255,255,0.2)'}} onClick={()=>handleLateFeesSim({ ...c.currentInvoice, cardName: c.name })}>
                              Simular Atraso
                            </button>
                            {Number(c.currentInvoice.totalAmount)>0&&(
                              <button className="primary" style={{fontSize:'11px',padding:'6px 12px',background:'#0d9488',borderColor:'#0d9488'}} onClick={()=>setModal('pay_invoice')}>Pagar Fatura</button>
                            )}
                          </div>
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
              <div style={{display:'flex',gap:'8px'}}>
                <button className="secondary" onClick={()=>setModal('category')}>+ Nova categoria</button>
                <button className="secondary" onClick={handleNewEntry}>+ Novo lançamento</button>
              </div>
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
              account:'Nova conta ou benefício financeiro',
              card:'Novo cartão de crédito',
              purchase:'Nova compra no cartão',
              pay_invoice:'Pagar fatura de cartão',
              salary:'Receber Salário / Pró-labore',
              recharge_benefit:'Recarregar Benefício (Saldo Acumulativo)',
              late_fees:'Calculadora de Atraso de Cartão (CDC / BACEN)',
              entry:'Novo Lançamento Financeiro',
              edit_entry:'Editar Lançamento Financeiro',
              transfer:'Nova transferência',
              commitment:'Novo compromisso financeiro',
              settle_commitment:'Liquidar compromisso',
              goal:'Nova meta financeira',
              deposit_goal:'Fazer aporte na meta',
              budget:'Novo orçamento por categoria',
              category:'Nova categoria financeira',
              investment:'Novo investimento'
            } as Record<string,string>)[modal]||'Dados'}</h2>
            <button className="close" onClick={()=>{setModal('');setError('');}}>×</button>
          </div>
          <form onSubmit={submit}>
            {modal==='profile'&&<label>Nome do perfil<input name="name" required placeholder="Ex.: Pessoal, Família, Patrimônio"/></label>}
            {modal==='account'&&<>
              <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                Perfil Vinculado: <b>{current?.name || (profiles[0] ? profiles[0].name : 'Individual')}</b>
              </div>
              <label>Tipo de Recurso Financeiro
                <select id="resource-type-select" defaultValue="BANK" onChange={(e)=>{
                  const inp = document.getElementById('account-name-input') as HTMLInputElement;
                  if(inp){
                    if(e.target.value === 'BENEFIT_MARKET') inp.value = 'Vale-Mercado';
                    else if(e.target.value === 'BENEFIT_FUEL') inp.value = 'Vale-Combustível';
                    else if(e.target.value === 'CASH') inp.value = 'Dinheiro em Espécie';
                    else if(e.target.value === 'SAVINGS') inp.value = 'Poupança';
                  }
                }}>
                  <option value="BANK">Conta Corrente / Bancária (Nubank, Itaú, Inter, etc.)</option>
                  <option value="BENEFIT_MARKET">Benefício Vale-Mercado / Alimentação (Alelo, VR, Sodexo)</option>
                  <option value="BENEFIT_FUEL">Benefício Vale-Combustível / Mobilidade (Ticket Log, etc.)</option>
                  <option value="CASH">Dinheiro em Espécie / Carteira Física</option>
                  <option value="SAVINGS">Poupança / Reserva Bancária</option>
                </select>
              </label>
              <label>Nome da Conta ou Benefício
                <input id="account-name-input" name="name" required placeholder="Ex.: Nubank Principal, Vale-Mercado Alelo, Itaú"/>
              </label>
              <label>Saldo Inicial (R$)
                <span style={{fontSize:'11px',color:'var(--text-muted)',display:'block',marginTop:'2px'}}>
                  Informe quanto você possui atualmente (aceita valores negativos se houver saldo devedor/cheque especial).
                </span>
                <input name="balance" required type="number" step="0.01" defaultValue="0.00" placeholder="0.00" style={{marginTop:'6px'}}/>
              </label>
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
            {modal==='salary'&&<>
              <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                Perfil Destino: <b>{current?.name || (profiles[0] ? profiles[0].name : 'Individual')}</b>
              </div>
              <label>Conta Bancária para Depósito
                <select name="accountId" required>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.name} (Saldo Atual: {money(accountBalance(a))})</option>)}
                </select>
              </label>
              <label>Descrição do Recebimento
                <input name="description" required defaultValue="Salário Mensal" placeholder="Ex.: Salário Empresa ABC, Pró-labore"/>
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Valor Líquido (R$)
                  <input name="amount" required type="number" min="0.01" step="0.01" placeholder="Ex.: 5200.00"/>
                </label>
                <label>Data de Crédito
                  <input name="date" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/>
                </label>
              </div>
              <label>Status do Salário
                <select name="status">
                  <option value="POSTED">Realizado (Já creditado na conta)</option>
                  <option value="SCHEDULED">Previsto (A receber nos próximos dias)</option>
                </select>
              </label>
            </>}
            {modal==='recharge_benefit'&&<>
              <div style={{fontSize:'12px',color:'#0284c7',background:'#f0f9ff',border:'1px solid #bae6fd',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                💡 <b>Regra do Benefício (Saldo Acumulativo):</b> O saldo de vales acumula mês a mês e não debita sua conta bancária.
              </div>
              <label>Carteira / Cartão de Benefício
                <select name="accountId" required>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.name} (Saldo Acumulado: {money(accountBalance(a))})</option>)}
                </select>
              </label>
              <label>Identificação da Recarga
                <input name="description" required defaultValue="Recarga Mensal de Benefício" placeholder="Ex.: Recarga Vale-Mercado Alelo, Vale-Combustível"/>
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Valor da Recarga (R$)
                  <input name="amount" required type="number" min="0.01" step="0.01" placeholder="Ex.: 780.00"/>
                </label>
                <label>Data do Crédito
                  <input name="date" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/>
                </label>
              </div>
            </>}
            {modal==='late_fees'&&(() => {
              const fees = calculateLateFees();
              return (
                <div>
                  <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                    Simulador Oficial de Encargos por Atraso de Cartão conforme regulamentação CDC e BACEN.
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                    <label>Valor da Fatura Vencida (R$)
                      <input type="number" step="0.01" min="0.01" value={lateFeeManualAmount} onChange={e=>setLateFeeManualAmount(e.target.value)} required/>
                    </label>
                    <label>Taxa de Juros Rotativo (% a.m.)
                      <input type="number" step="0.1" min="0" value={lateFeeRevolvingRate} onChange={e=>setLateFeeRevolvingRate(Number(e.target.value))} required/>
                    </label>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                    <label>Data de Vencimento Original
                      <input type="date" value={lateFeeDueDate} onChange={e=>setLateFeeDueDate(e.target.value)} required/>
                    </label>
                    <label>Data Prevista de Quitação
                      <input type="date" value={lateFeePayDate} onChange={e=>setLateFeePayDate(e.target.value)} required/>
                    </label>
                  </div>
                  <div className="late-fees-breakdown" style={{marginTop:'14px'}}>
                    <h4 style={{margin:'0 0 10px',fontSize:'13px',color:'var(--text-main)'}}>
                      Demonstrativo dos Encargos ({fees.daysLate} {fees.daysLate === 1 ? 'dia' : 'dias'} de atraso):
                    </h4>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'4px 0'}}>
                      <span style={{color:'var(--text-secondary)'}}>Multa Moratória (2% fixo - CDC Art. 52):</span>
                      <b style={{color:'var(--danger)'}}>+ {money(fees.fine)}</b>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'4px 0'}}>
                      <span style={{color:'var(--text-secondary)'}}>Juros de Mora (1% a.m. pro-rata die):</span>
                      <b style={{color:'var(--danger)'}}>+ {money(fees.mora)}</b>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'4px 0'}}>
                      <span style={{color:'var(--text-secondary)'}}>Juros Crédito Rotativo ({lateFeeRevolvingRate}% a.m. pro-rata):</span>
                      <b style={{color:'var(--danger)'}}>+ {money(fees.rotativo)}</b>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',padding:'4px 0'}}>
                      <span style={{color:'var(--text-secondary)'}}>IOF (0,38% fixo + 0,0082%/dia BACEN):</span>
                      <b style={{color:'var(--danger)'}}>+ {money(fees.iof)}</b>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'8px 0',borderTop:'1px solid var(--border)',marginTop:'6px',fontWeight:700}}>
                      <span>Total de Encargos de Atraso:</span>
                      <span style={{color:'var(--danger)'}}>+ {money(fees.totalFees)}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'15px',padding:'10px 0 0',borderTop:'2px solid var(--border)',marginTop:'6px',fontWeight:800}}>
                      <span style={{color:'var(--text-main)'}}>Total Atualizado a Pagar:</span>
                      <span style={{color:'var(--danger)'}}>{money(fees.totalDue)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            {modal==='entry'&&<>
              <div style={{fontSize:'12px',color:'#0f766e',background:'#f0fdfa',border:'1px solid #99f6e4',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>
                Perfil Vinculado: <b>{current?.name || (profiles[0] ? profiles[0].name : 'Individual')}</b>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Tipo de Movimentação
                  <select name="type" defaultValue={entryKind}>
                    <option value="EXPENSE">Despesa (Saída)</option>
                    <option value="INCOME">Receita (Entrada)</option>
                  </select>
                </label>
                <label>Status
                  <select name="status">
                    <option value="POSTED">Realizado (Efetivado)</option>
                    <option value="SCHEDULED">Previsto (Agendado)</option>
                  </select>
                </label>
              </div>
              <label>Conta Bancária / Financeira / Benefício
                <select name="accountId" required>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.name} (Saldo Atual: {money(accountBalance(a))})</option>)}
                </select>
              </label>
              <label>Descrição
                <input name="description" required placeholder="Ex.: Supermercado Mensal, Salário, Conta de Luz..."/>
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Valor em Reais (R$)
                  <input name="amount" required type="number" min="0.01" step="0.01" placeholder="0.00"/>
                </label>
                <label>Data da Movimentação
                  <input name="date" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/>
                </label>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Categoria
                  <select name="category">
                    <option value="">Selecione a categoria...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name} ({c.type === 'INCOME' ? 'Receita' : 'Despesa'})</option>)}
                  </select>
                </label>
                <label>Forma de Pagamento
                  <select name="paymentMethod">
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência">Transferência Bancária</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                  </select>
                </label>
              </div>
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
            {modal==='category'&&<>
              <label>Nome da Categoria<input name="name" required placeholder="Ex.: Alimentação, Educação, Salário, Investimentos"/></label>
              <label>Tipo de Categoria
                <select name="type">
                  <option value="EXPENSE">Despesa (-)</option>
                  <option value="INCOME">Receita (+)</option>
                </select>
              </label>
            </>}
            {modal==='investment'&&<>
              <label>Nome do Investimento / Ativo<input name="name" required placeholder="Ex.: Tesouro Selic 2029, CDB 120% CDI, BBAS3, MXRF11"/></label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Tipo de Ativo
                  <select name="type">
                    <option value="Renda Fixa">Renda Fixa (CDB/Tesouro)</option>
                    <option value="Ações">Ações & ETFs</option>
                    <option value="FIIs">Fundos Imobiliários (FIIs)</option>
                    <option value="Cripto">Criptomoedas</option>
                    <option value="Previdência">Previdência Privada</option>
                    <option value="Outros">Outros Ativos</option>
                  </select>
                </label>
                <label>Instituição / Corretora
                  <input name="institution" placeholder="Ex.: XP, NuInvest, BTG"/>
                </label>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <label>Valor Inicial Aplicado (R$)
                  <input name="initialAmount" required type="number" min="0.01" step="0.01" placeholder="1000.00"/>
                </label>
                <label>Valor Atual / Saldo (R$)
                  <input name="currentAmount" required type="number" min="0.01" step="0.01" placeholder="1050.00"/>
                </label>
              </div>
              <label>Rentabilidade / Indexador (opcional)
                <input name="yieldRate" placeholder="Ex.: 100% CDI, IPCA + 6,5% a.a."/>
              </label>
            </>}
            {modal==='transfer'&&<>
              <label>Conta de origem<select name="fromAccount" required>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
              <label>Perfil de destino<select name="toProfile" required value={transferDestination} onChange={e=>setTransferDestination(e.target.value)}><option value="">Selecione o perfil de destino</option>{profiles.filter(p=>p.id!==selected).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label>Conta de destino<select name="toAccount" required disabled={!destinationAccounts.length}><option value="">{transferDestination?(destinationAccounts.length?'Selecione a conta':'Nenhuma conta cadastrada no perfil de destino'):'Selecione primeiro o perfil'}</option>{destinationAccounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
              <label>Descrição<input name="description" required defaultValue="Transferência entre perfis"/></label>
              <label>Valor (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
            </>}
            {error&&<div className="error">{error}</div>}
            {modal==='late_fees' ? (
              <button className="secondary" type="button" onClick={()=>{setModal('');setError('');}} style={{width:'100%',padding:'10px'}}>
                Fechar Simulador
              </button>
            ) : (
              <button className="primary" type="submit" disabled={busy}>{busy?'Processando...':'Salvar'}</button>
            )}
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
