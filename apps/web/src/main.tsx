import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{LayoutDashboard,Users,Wallet,ReceiptText,Landmark,ArrowLeftRight,LogOut,Plus,Menu,ChartNoAxesCombined,ShieldCheck,CreditCard,CheckCircle2,Clock,RotateCcw}from'lucide-react';
import './style.css';

type Profile={id:string,name:string,role:string};
type Account={id:string,name:string,openingBalance:string};
type Entry={id:string,type:string,status:string,amount:string,description:string,occurredAt:string,reconciled?:boolean,account:{name:string}};
type Card={id:string,name:string,limit:string,closingDay:number,dueDay:number,color?:string,availableLimit:string,currentInvoice?:{id:string,referenceMonth:string,totalAmount:string,status:string}};
type Dash={income:string,expense:string,result:string,balance:string,projectedBalance?:string,scheduledIncome?:string,scheduledExpense?:string,profileCount:number,accountCount:number};

const money=(value:string|number)=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const api=async<T,>(path:string,token:string,body?:unknown,method?:string):Promise<T>=>{
  const response=await fetch('/api'+path,{
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
  const [dash,setDash]=useState<Dash|null>(null);
  const [error,setError]=useState('');
  const [modal,setModal]=useState('login');
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
    if(selected==='all'){
      setAccounts([]);
      setCards([]);
      setEntries([]);
    }else{
      api<Account[]>(`/profiles/${selected}/accounts`,token).then(setAccounts).catch(e=>setError(e.message));
      api<Card[]>(`/profiles/${selected}/cards`,token).then(setCards).catch(e=>setError(e.message));
      api<Entry[]>(`/profiles/${selected}/entries`,token).then(setEntries).catch(e=>setError(e.message));
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
      }
      setModal('');
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

  const navigation=[
    {id:'dashboard',name:'Painel Geral',icon:LayoutDashboard},
    {id:'profiles',name:'Perfis Financeiros',icon:Users},
    {id:'accounts',name:'Contas Bancárias',icon:Landmark},
    {id:'cards',name:'Cartões de Crédito',icon:CreditCard},
    {id:'entries',name:'Lançamentos',icon:ReceiptText},
    {id:'transfers',name:'Transferências',icon:ArrowLeftRight},
    {id:'planning',name:'Planejamento',icon:ChartNoAxesCombined}
  ];

  if(!token)return(
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <span className="brand-logo"><Wallet size={24}/></span>
          <div><b>BOMA</b><small>FINANCE</small></div>
        </div>
        <h1>Seu dinheiro, sob controle.</h1>
        <p>Organize seus perfis financeiros com segurança de nível bancário e clareza.</p>
        {error&&<div className="error">{error}</div>}
        <form onSubmit={submit}>
          {modal==='register'&&<label>Nome completo<input name="name" required minLength={2} placeholder="Como deseja ser chamado"/></label>}
          <label>E-mail<input name="email" type="email" required placeholder="voce@exemplo.com"/></label>
          <label>Senha<input name="password" type="password" required minLength={modal==='register'?12:1} placeholder="Sua senha"/></label>
          <button className="primary" type="submit" disabled={busy} onClick={()=>{if(!modal)setModal('login')}}>
            {busy?'Processando...':modal==='register'?'Criar conta':'Entrar na plataforma'}
          </button>
        </form>
        <button className="text-link" onClick={()=>{setModal(modal==='register'?'login':'register');setError('')}}>
          {modal==='register'?'Já tenho conta':'Criar minha conta'}
        </button>
      </div>
    </div>
  );

  return(
    <div className="shell">
      <aside className={collapsed?'sidebar collapsed':'sidebar'}>
        <div className="brand">
          <span className="brand-logo"><Wallet size={23}/></span>
          {!collapsed&&<div><b>BOMA</b><small>FINANCE</small></div>}
        </div>
        <div className="nav-label">{!collapsed?'ESPAÇO FINANCEIRO':'•'}</div>
        <nav>
          {navigation.map(n=>(
            <button key={n.id} title={n.name} className={tab===n.id?'nav-item active':'nav-item'} onClick={()=>setTab(n.id)}>
              <n.icon size={19}/>
              {!collapsed&&<span>{n.name}</span>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button className="nav-item" onClick={logout}><LogOut size={19}/>{!collapsed&&'Sair'}</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="left-head">
            <button className="icon-button" onClick={()=>setCollapsed(!collapsed)}><Menu size={21}/></button>
            <div className="breadcrumb">BOMA Finance <span>/</span> {navigation.find(n=>n.id===tab)?.name}</div>
          </div>
          <div className="header-right">
            <span className="secure"><ShieldCheck size={15}/> Ambiente Seguro</span>
            <div className="avatar">{user.slice(0,1).toUpperCase()}</div>
          </div>
        </header>

        <div className="content">
          <div className="heading">
            <div>
              <div className="eyebrow">CENTRAL FINANCEIRA</div>
              <h1>{navigation.find(n=>n.id===tab)?.name}</h1>
              <p>Olá, {user}. Acompanhe suas contas, cartões e patrimônio em tempo real.</p>
            </div>
            <div className="heading-actions">
              <select aria-label="Selecionar perfil financeiro" value={selected} onChange={e=>setSelected(e.target.value)}>
                <option value="all">Todos os perfis · Consolidado</option>
                {profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button className="primary" onClick={()=>setModal('profile')}><Plus size={17}/> Novo perfil</button>
            </div>
          </div>

          {error&&<div className="error" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}

          {tab==='dashboard'&&<>
            <div className="metrics">
              {[
                {label:'Receitas do mês',value:dash?.income,icon:'↙',cls:'green',hint:'Lançamentos realizados'},
                {label:'Despesas do mês',value:dash?.expense,icon:'↗',cls:'orange',hint:'Lançamentos realizados'},
                {label:'Saldo atual das contas',value:dash?.balance,icon:'▣',cls:'violet',hint:'Disponibilidade líquida'},
                {label:'Saldo projetado',value:dash?.projectedBalance||dash?.balance,icon:'◈',cls:'blue',hint:'Previsto para o mês'}
              ].map(k=>(
                <div className="metric" key={k.label}>
                  <div className={'metric-symbol '+k.cls}>{k.icon}</div>
                  <span>{k.label}</span>
                  <strong>{money(k.value||0)}</strong>
                  <small>{k.hint}</small>
                </div>
              ))}
            </div>

            <div className="two-col">
              <section className="panel">
                <div className="panel-title"><h2>Resumo financeiro</h2><span>Este mês</span></div>
                <div className="bar-row">
                  <div><span>Receitas</span><b>{money(dash?.income||0)}</b></div>
                  <div className="track"><div className="fill revenue" style={{width:'100%'}}/></div>
                </div>
                <div className="bar-row">
                  <div><span>Despesas</span><b>{money(dash?.expense||0)}</b></div>
                  <div className="track"><div className="fill cost" style={{width:(Math.min(100,Number(dash?.income)?Number(dash?.expense)/Number(dash?.income)*100:0))+'%'}}/></div>
                </div>
                <div className="info">Transferências internas entre perfis têm impacto R$ 0,00 no consolidado.</div>
              </section>

              <section className="panel">
                <div className="panel-title"><h2>Visão consolidada</h2><span>Perfis autorizados</span></div>
                <div className="mini-stats">
                  <div><span>Perfis integrados</span><strong>{dash?.profileCount||0}</strong></div>
                  <div><span>Contas ativas</span><strong>{dash?.accountCount||0}</strong></div>
                </div>
                <p className="muted">O motor multiperfis unifica cartões, patrimônio e fluxo de caixa eliminando duplicidades.</p>
                <button className="secondary" onClick={()=>setTab('profiles')}>Gerenciar perfis e membros →</button>
              </section>
            </div>
          </>}

          {tab==='profiles'&&<section className="panel">
            <div className="panel-title">
              <h2>Seus perfis financeiros</h2>
              <button className="secondary" onClick={()=>setModal('profile')}>+ Adicionar perfil</button>
            </div>
            {profiles.length===0?<Empty text="Crie seu primeiro perfil financeiro para começar."/>:(
              <div className="profile-grid">
                {profiles.map(p=>(
                  <button className="profile-tile" key={p.id} onClick={()=>{setSelected(p.id);setTab('dashboard');}}>
                    <span className="profile-icon"><Users size={21}/></span>
                    <strong>{p.name}</strong>
                    <small>{p.role==='OWNER'?'Proprietário':p.role==='MANAGER'?'Gestor':p.role==='EDITOR'?'Editor':'Visualizador'}</small>
                    <span className="link-arrow">Abrir perfil →</span>
                  </button>
                ))}
              </div>
            )}
          </section>}

          {tab==='accounts'&&<section className="panel">
            <div className="panel-title">
              <h2>Contas do perfil</h2>
              <button className="secondary" disabled={!current} onClick={()=>setModal('account')}>+ Nova conta</button>
            </div>
            {!current?<Empty text="Selecione um perfil individual no topo para gerenciar suas contas."/>:accounts.length===0?<Empty text="Nenhuma conta cadastrada neste perfil."/>:(
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
              <h2>Cartões de crédito</h2>
              <div style={{display:'flex',gap:'10px'}}>
                <button className="secondary" disabled={!current} onClick={()=>setModal('card')}>+ Novo cartão</button>
                <button className="primary" disabled={!current||!cards.length} onClick={()=>setModal('purchase')}>+ Nova compra</button>
              </div>
            </div>
            {!current?<Empty text="Selecione um perfil individual para gerenciar cartões."/>:cards.length===0?<Empty text="Nenhum cartão cadastrado neste perfil. Adicione seu cartão."/>:(
              <div className="profile-grid">
                {cards.map(c=>(
                  <div key={c.id} className="profile-tile" style={{borderLeft:`4px solid ${c.color||'#13a99b'}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',width:'100%',alignItems:'center'}}>
                      <strong>{c.name}</strong>
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

          {tab==='planning'&&<section className="panel">
            <div className="panel-title">
              <h2>Planejamento financeiro</h2>
              <span className="pill">Operacional</span>
            </div>
            <p className="muted">Controle orçamentário mensal e projeções baseadas em lançamentos previstos e faturas de cartão.</p>
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
              transfer:'Nova transferência'
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
            {modal==='transfer'&&<>
              <label>Conta de origem<select name="fromAccount" required>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
              <label>Perfil de destino<select name="toProfile" required>{profiles.filter(p=>p.id!==selected).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label>ID da conta de destino<input name="toAccount" required placeholder="UUID da conta"/></label>
              <label>Descrição<input name="description" required defaultValue="Transferência entre perfis"/></label>
              <label>Valor (R$)<input name="amount" required type="number" min="0.01" step="0.01"/></label>
            </>}
            {error&&<div className="error">{error}</div>}
            <button className="primary" type="submit" disabled={busy}>{busy?'Salvando...':'Salvar'}</button>
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
