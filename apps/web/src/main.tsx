import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{LayoutDashboard,Users,Wallet,ReceiptText,Landmark,ArrowLeftRight,LogOut,Plus,Menu,ChartNoAxesCombined,ShieldCheck,CreditCard,CheckCircle2,Clock,RotateCcw,Target,Calendar,Bot,FileSpreadsheet,Sparkles,TrendingUp,AlertTriangle,ArrowDownRight,ArrowUpRight,DollarSign,PieChart}from'lucide-react';
import './style.css';

type Profile={id:string,name:string,role:string};
type Account={id:string,name:string,openingBalance:string};
type Entry={id:string,type:string,status:string,amount:string,description:string,occurredAt:string,reconciled?:boolean,account:{name:string}};
type Card={id:string,name:string,limit:string,closingDay:number,dueDay:number,color?:string,availableLimit:string,currentInvoice?:{id:string,referenceMonth:string,totalAmount:string,status:string}};
type Commitment={id:string,type:'PAYABLE'|'RECEIVABLE',status:'PENDING'|'PAID',description:string,amount:string,dueDate:string,entityName?:string,category?:string,paidAt?:string};
type Goal={id:string,name:string,targetAmount:string,currentAmount:string,progress:number,targetDate?:string,status:string,color?:string};
type Budget={id:string,categoryName:string,plannedAmount:string,spentAmount:string,percentageUsed:number};
type CashflowItem={month:string,income:string,expense:string,obligations:string,net:string};
type AdvisorData={score:number,status:string,safeMonthlySpend:string,threeMonthSurplus:string,diagnosis:string,actionPlan:string[],aiGenerated:boolean};
type Dash={income:string,expense:string,result:string,balance:string,projectedBalance?:string,scheduledIncome?:string,scheduledExpense?:string,profileCount:number,accountCount:number};

const money=(value:string|number)=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const API_BASE=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')+'/api';
const api=async<T,>(path:string,token:string,body?:unknown,method?:string):Promise<T>=>{
  const response=await fetch(API_BASE+path,{
    method:method||(body?'POST':'GET'),
    headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
    body:body?JSON.stringify(body):undefined
  });
  const data=await response.json();
  if(!response.ok)throw new Error(Array.isArray(data.message)?data.message.join(', '):data.message||'Falha na requisição');
  return data as T;
};

function App(){
  const [token,setToken]=useState(sessionStorage.getItem('boma_token')||'');
  const [user,setUser]=useState(sessionStorage.getItem('boma_name')||'');
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

  const current=profiles.find(p=>p.id===selected);
  const load=()=>setRefresh(v=>v+1);

  useEffect(()=>{
    if(!token)return;
    api<Profile[]>('/profiles',token).then(setProfiles).catch(e=>setError(e.message));
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

  const exportCsv=async()=>{
    try{
      const data=await api<{csv:string,totalRecords:number}>('/reports/export'+(selected==='all'?'':'?profileId='+selected),token);
      const blob=new Blob([data.csv],{type:'text/csv;charset=utf-8;'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;
      link.setAttribute('download',`boma-finance-extrato-${new Date().toISOString().slice(0,10)}.csv`);
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
        sessionStorage.setItem('boma_token',r.token);
        sessionStorage.setItem('boma_name',r.user.name);
        setToken(r.token);
        setUser(r.user.name);
      }else if(modal==='profile'){
        await api('/profiles',token,{name:v('name')});
      }else if(modal==='account'){
        await api(`/profiles/${selected}/accounts`,token,{name:v('name'),openingBalance:v('balance')});
      }else if(modal==='card'){
        await api(`/profiles/${selected}/cards`,token,{name:v('name'),limit:v('limit'),closingDay:Number(v('closingDay')),dueDay:Number(v('dueDay')),color:v('color')||'#13a99b'});
      }else if(modal==='purchase'){
        await api(`/cards/${v('cardId')}/purchases`,token,{description:v('description'),totalAmount:v('amount'),totalInstallments:Number(v('installments')||1),purchaseDate:new Date(v('date')+'T12:00:00').toISOString()});
      }else if(modal==='pay_invoice'){
        await api(`/cards/invoices/${v('invoiceId')}/pay`,token,{accountId:v('accountId')});
      }else if(modal==='entry'){
        await api('/entries',token,{profileId:selected,accountId:v('accountId'),type:v('type'),status:v('status')||'POSTED',amount:v('amount'),description:v('description'),occurredAt:new Date(v('date')+'T12:00:00').toISOString()});
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

  if(!token){
    return (
      <div className="login-card">
        <h1>BOMA Finance</h1>
        <p>Gestão Financeira Pessoal, Familiar e Multiperfis</p>
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          <button className={modal==='login'?'primary':'secondary'} style={{flex:1}} onClick={()=>setModal('login')}>Entrar</button>
          <button className={modal==='register'?'primary':'secondary'} style={{flex:1}} onClick={()=>setModal('register')}>Cadastre-se</button>
        </div>
        <form onSubmit={submit}>
          {modal==='register'&&<label>Seu nome completo<input name="name" required placeholder="Ex.: Vinícius"/></label>}
          <label>E-mail<input name="email" type="email" required placeholder="seu@email.com"/></label>
          <label>Senha de acesso (mínimo 12 caracteres)<input name="password" type="password" minLength={12} required placeholder="••••••••••••"/></label>
          {error&&<div className="error">{error}</div>}
          <button className="primary" style={{width:'100%',marginTop:'12px'}} type="submit" disabled={busy}>{busy?'Autenticando...':modal==='login'?'Acessar BOMA Finance':'Criar minha conta'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className={`sidebar ${collapsed?'collapsed':''}`}>
        <div className="brand">
          <div className="brand-icon">B</div>
          {!collapsed&&<div><h1>BOMA Finance</h1><span>v1.2 · Operacional</span></div>}
        </div>

        <nav>
          <button className={tab==='dashboard'?'active':''} onClick={()=>setTab('dashboard')} title="Dashboard Executivo"><LayoutDashboard size={18}/>{!collapsed&&<span>Dashboard</span>}</button>
          <button className={tab==='entries'?'active':''} onClick={()=>setTab('entries')} title="Central de Lançamentos"><ReceiptText size={18}/>{!collapsed&&<span>Lançamentos</span>}</button>
          <button className={tab==='accounts'?'active':''} onClick={()=>setTab('accounts')} title="Contas Bancárias"><Landmark size={18}/>{!collapsed&&<span>Contas Bancárias</span>}</button>
          <button className={tab==='cards'?'active':''} onClick={()=>setTab('cards')} title="Cartões de Crédito"><CreditCard size={18}/>{!collapsed&&<span>Cartões de Crédito</span>}</button>
          <button className={tab==='commitments'?'active':''} onClick={()=>setTab('commitments')} title="Contas a Pagar & Receber"><Calendar size={18}/>{!collapsed&&<span>Compromissos</span>}</button>
          <button className={tab==='goals'?'active':''} onClick={()=>setTab('goals')} title="Metas Financeiras"><Target size={18}/>{!collapsed&&<span>Metas Financeiras</span>}</button>
          <button className={tab==='budgets'?'active':''} onClick={()=>setTab('budgets')} title="Orçamentos"><PieChart size={18}/>{!collapsed&&<span>Orçamentos</span>}</button>
          <button className={tab==='reports'?'active':''} onClick={()=>setTab('reports')} title="Fluxo de Caixa & Relatórios"><TrendingUp size={18}/>{!collapsed&&<span>Fluxo & Relatórios</span>}</button>
          <button className={tab==='advisor'?'active':''} onClick={()=>setTab('advisor')} title="BOMA Inteligente (IA)"><Sparkles size={18}/>{!collapsed&&<span>BOMA Inteligente (IA)</span>}</button>
          <button className={tab==='transfers'?'active':''} onClick={()=>setTab('transfers')} title="Transferências Internas"><ArrowLeftRight size={18}/>{!collapsed&&<span>Transferências</span>}</button>
          <button className={tab==='profiles'?'active':''} onClick={()=>setTab('profiles')} title="Gestão de Perfis"><Users size={18}/>{!collapsed&&<span>Perfis</span>}</button>
        </nav>

        <div className="user-box">
          <div className="user-avatar">{user.charAt(0).toUpperCase()}</div>
          {!collapsed&&<div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:'13px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user}</div><div style={{fontSize:'11px',color:'#7c889a'}}>{current?current.name:'Consolidado'}</div></div>}
          <button className="icon-button" onClick={logout} title="Sair do sistema"><LogOut size={16}/></button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button className="icon-button" onClick={()=>setCollapsed(!collapsed)}><Menu size={18}/></button>
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

          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <button className="secondary" onClick={exportCsv} title="Exportar Extrato em CSV"><FileSpreadsheet size={16}/> {!collapsed&&<span>Exportar CSV</span>}</button>
            <button className="primary" onClick={()=>setModal('entry')} disabled={!current||!accounts.length}><Plus size={16}/> Novo Lançamento</button>
          </div>
        </header>

        {error&&<div className="error" style={{margin:'16px 24px 0'}}>{error}</div>}

        <div className="page">
          {tab==='dashboard'&&dash&&<>
            <div className="metrics">
              <div className="metric">
                <span className="metric-label">Saldo Real em Contas</span>
                <span className="metric-val">{money(dash.balance)}</span>
                <span className="metric-sub">Liquidez disponível imediata</span>
              </div>
              <div className="metric">
                <span className="metric-label">Saldo Projetado</span>
                <span className="metric-val" style={{color:'#137e77'}}>{money(dash.projectedBalance||dash.balance)}</span>
                <span className="metric-sub">Incorporando agendamentos</span>
              </div>
              <div className="metric">
                <span className="metric-label">Receitas do Mês</span>
                <span className="metric-val" style={{color:'#13a294'}}>{money(dash.income)}</span>
                {dash.scheduledIncome&&Number(dash.scheduledIncome)>0&&<span className="metric-sub" style={{color:'#137e77'}}>+{money(dash.scheduledIncome)} a receber</span>}
              </div>
              <div className="metric">
                <span className="metric-label">Despesas do Mês</span>
                <span className="metric-val" style={{color:'#be6a55'}}>{money(dash.expense)}</span>
                {dash.scheduledExpense&&Number(dash.scheduledExpense)>0&&<span className="metric-sub" style={{color:'#df8c36'}}>+{money(dash.scheduledExpense)} previstas</span>}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginTop:'16px'}}>
              <section className="panel">
                <div className="panel-title">
                  <h2>Resumo da Consolidação</h2>
                  <span className="pill">{selected==='all'?'Consolidado':'Individual'}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                    <span>Resultado Operacional (Receitas − Despesas):</span>
                    <b style={{color:Number(dash.result)>=0?'#13a294':'#be6a55'}}>{money(dash.result)}</b>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                    <span>Perfis Autorizados na Visão:</span>
                    <b>{dash.profileCount} perfil(is)</b>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                    <span>Contas Bancárias Ativas:</span>
                    <b>{dash.accountCount} conta(s)</b>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <h2>BOMA Inteligente · Diagnóstico Rápido</h2>
                  <button className="secondary" style={{fontSize:'12px',padding:'4px 8px'}} onClick={()=>setTab('advisor')}>Abrir Consultor</button>
                </div>
                <div style={{padding:'12px',background:'#f0fbf9',borderRadius:'8px',border:'1px solid #c2ece5'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',fontWeight:700,color:'#11756f',marginBottom:'6px'}}>
                    <Sparkles size={16}/><span>Análise com IA Pronta</span>
                  </div>
                  <p style={{fontSize:'12px',color:'#233649',margin:0,lineHeight:1.5}}>
                    Seu sistema monitora em tempo real a margem segura de gastos, faturas de cartão e compromissos dos próximos 90 dias.
                  </p>
                </div>
              </section>
            </div>
          </>}

          {tab==='commitments'&&<section className="panel">
            <div className="panel-title">
              <h2>Contas a Pagar & Receber (Compromissos)</h2>
              <button className="secondary" disabled={!current} onClick={()=>setModal('commitment')}>+ Novo compromisso</button>
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
              <button className="secondary" disabled={!current} onClick={()=>setModal('goal')}>+ Nova Meta</button>
            </div>
            {!current?<Empty text="Selecione um perfil para gerenciar metas financeiras."/>:goals.length===0?<Empty text="Nenhuma meta cadastrada."/>:(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px',marginTop:'16px'}}>
                {goals.map(g=>(
                  <div key={g.id} style={{background:'#ffffff',border:'1px solid #e1e7f0',borderRadius:'12px',padding:'16px',boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <h3 style={{fontSize:'15px',fontWeight:700,margin:0}}>{g.name}</h3>
                      <span className="pill" style={{background:g.status==='COMPLETED'?'#def3ef':'#f6f8fb',color:g.status==='COMPLETED'?'#11756f':'#556578'}}>{g.status==='COMPLETED'?'Concluída':`${g.progress}%`}</span>
                    </div>
                    <div style={{margin:'14px 0 8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px'}}>
                        <span style={{color:'#7c889a'}}>Poupado: <b>{money(g.currentAmount)}</b></span>
                        <span style={{color:'#233649'}}>Alvo: <b>{money(g.targetAmount)}</b></span>
                      </div>
                      <div style={{width:'100%',height:'8px',background:'#f1f4f8',borderRadius:'4px',overflow:'hidden'}}>
                        <div style={{width:`${Math.min(100,g.progress)}%`,height:'100%',background:g.color||'#10B981',transition:'width 0.4s ease'}}/>
                      </div>
                    </div>
                    <div style={{marginTop:'12px',display:'flex',justifyContent:'flex-end'}}>
                      <button className="secondary" style={{fontSize:'11px',padding:'5px 10px'}} onClick={()=>{setSelectedItem(g);setModal('deposit_goal');}}>+ Fazer Aporte</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>}

          {tab==='budgets'&&<section className="panel">
            <div className="panel-title">
              <h2>Planejamento Orçamentário por Categoria</h2>
              <button className="secondary" disabled={!current} onClick={()=>setModal('budget')}>+ Novo Orçamento</button>
            </div>
            {!current?<Empty text="Selecione um perfil para definir orçamentos por categoria."/>:budgets.length===0?<Empty text="Nenhum orçamento cadastrado para o mês vigente."/>:(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px',marginTop:'16px'}}>
                {budgets.map(b=>(
                  <div key={b.id} style={{background:'#ffffff',border:'1px solid #e1e7f0',borderRadius:'12px',padding:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                      <b style={{fontSize:'14px'}}>{b.categoryName}</b>
                      <span className="pill" style={{background:b.percentageUsed>100?'#fff0ee':b.percentageUsed>80?'#fff0df':'#def3ef',color:b.percentageUsed>100?'#be6a55':b.percentageUsed>80?'#df8c36':'#11756f'}}>{b.percentageUsed}%</span>
                    </div>
                    <div style={{margin:'12px 0 6px',fontSize:'12px',color:'#7c889a'}}>
                      Gasto: <b style={{color:b.percentageUsed>100?'#be6a55':'#233649'}}>{money(b.spentAmount)}</b> de {money(b.plannedAmount)}
                    </div>
                    <div style={{width:'100%',height:'6px',background:'#f1f4f8',borderRadius:'3px',overflow:'hidden'}}>
                      <div style={{width:`${Math.min(100,b.percentageUsed)}%`,height:'100%',background:b.percentageUsed>100?'#be6a55':b.percentageUsed>80?'#df8c36':'#10B981'}}/>
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
              <h2>Consultor Financeiro Inteligente (IA Gemini)</h2>
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
                  <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'8px',display:'flex',alignItems:'center',gap:'6px'}}><Sparkles size={16} color="#13a294"/> Diagnóstico do Consultor</h3>
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
              <button className="secondary" disabled={!current} onClick={()=>setModal('account')}>+ Nova conta</button>
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
              <h2>Cartões de crédito e faturas</h2>
              <div style={{display:'flex',gap:'8px'}}>
                <button className="secondary" disabled={!current||!cards.length} onClick={()=>setModal('purchase')}>+ Comprar no Cartão</button>
                <button className="secondary" disabled={!current} onClick={()=>setModal('card')}>+ Novo cartão</button>
              </div>
            </div>
            {!current?<Empty text="Selecione um perfil para consultar os cartões."/>:cards.length===0?<Empty text="Nenhum cartão cadastrado."/>:(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px',marginTop:'16px'}}>
                {cards.map(c=>(
                  <div key={c.id} style={{background:'#ffffff',border:'1px solid #e1e7f0',borderRadius:'12px',padding:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <h3 style={{fontSize:'16px',fontWeight:700,margin:0}}>{c.name}</h3>
                      <span className="pill" style={{fontSize:'10px'}}>Fecha dia {c.closingDay} · Vence dia {c.dueDay}</span>
                    </div>
                    <div style={{marginTop:'8px',width:'100%'}}>
                      <div style={{fontSize:'11px',color:'#7c889a'}}>Limite Total: <b>{money(c.limit)}</b></div>
                      <div style={{fontSize:'12px',color:'#13a294',fontWeight:700,marginTop:'3px'}}>Limite Disponível: {money(c.availableLimit)}</div>
                      {c.currentInvoice&&(
                        <div style={{marginTop:'12px',padding:'10px',background:'#f6f8fb',borderRadius:'8px'}}>
                          <div style={{fontSize:'11px',color:'#556578'}}>Fatura Atual ({c.currentInvoice.referenceMonth})</div>
                          <div style={{fontSize:'15px',fontWeight:800,color:'#be6a55'}}>{money(c.currentInvoice.totalAmount)}</div>
                          {Number(c.currentInvoice.totalAmount)>0&&(
                            <button className="secondary" style={{marginTop:'6px',fontSize:'11px',padding:'5px 10px'}} onClick={()=>setModal('pay_invoice')}>Pagar fatura</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>}

          {tab==='entries'&&<section className="panel">
            <div className="panel-title">
              <h2>Movimentações financeiras</h2>
              <button className="secondary" disabled={!current||!accounts.length} onClick={()=>setModal('entry')}>+ Novo lançamento</button>
            </div>
            {!current?<Empty text="Selecione um perfil individual para consultar seus lançamentos."/>:entries.length===0?<Empty text="Nenhuma movimentação registrada."/>:(
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Data</th><th>Descrição</th><th>Conta</th><th>Tipo</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
                  <tbody>
                    {entries.map(e=>(
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
                            {e.status==='SCHEDULED'&&<button className="icon-button" title="Liquidar lançamento" onClick={()=>updateStatus(e.id,'POSTED')}><CheckCircle2 size={16} color="#137e77"/></button>}
                            {e.status==='POSTED'&&!e.reconciled&&<button className="icon-button" title="Conciliar" onClick={()=>reconcile(e.id)}><Clock size={16} color="#347bc7"/></button>}
                            {e.status!=='VOID'&&<button className="icon-button" title="Estornar" onClick={()=>updateStatus(e.id,'VOID')}><RotateCcw size={16} color="#be6a55"/></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              entry:'Registrar movimentação',
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
              <label>Tipo<select name="type"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option></select></label>
              <label>Status<select name="status"><option value="POSTED">Realizado (Efetivado)</option><option value="SCHEDULED">Previsto (Agendado)</option></select></label>
              <label>Conta<select name="accountId" required>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
              <label>Descrição<input name="description" required placeholder="Descrição do lançamento"/></label>
              <label>Valor (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
              <label>Data<input name="date" required type="date" defaultValue={new Date().toLocaleDateString('en-CA')}/></label>
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
