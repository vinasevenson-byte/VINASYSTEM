import React,{useEffect,useMemo,useState} from 'react';
import {Wallet,ShoppingCart,Fuel,Plus,CalendarDays,TrendingUp,AlertCircle} from 'lucide-react';

type WalletType={id:string,name:string,kind:string,openingBalance:string,balance:string,movements:{id:string,type:string,amount:string,description:string,occurredAt:string}[]};
type Schedule={id:string,name:string,amount:string,dayOfMonth:number,accountId:string};
type Point={date:string,expense:string,count:number};
type Summary={points:Point[],highest:Point|null,lowest:Point|null,hasHistory:boolean};
type Account={id:string,name:string,openingBalance:string};
type Entry={id:string,accountId:string,type:string,status:string,amount:string,occurredAt:string};
type Commitment={type:string,status:string,amount:string,dueDate:string};
type Request=<T,>(path:string,body?:unknown,method?:string)=>Promise<T>;
const money=(n:number|string)=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dateIso=()=>new Date().toISOString().slice(0,10);
const amountOk=(n:string)=>/^\d{1,16}(\.\d{1,2})?$/.test(n)&&Number(n)>0;
const fmtDate=(s:string)=>s.split('-').reverse().join('/');
export default function DailyFinance({profileId,accounts,entries,commitments,request,onNewAccount,onIncome,onExpense}:{profileId:string|null,accounts:Account[],entries:Entry[],commitments:Commitment[],request:Request,onNewAccount:()=>void,onIncome:()=>void,onExpense:()=>void}){
 const [wallets,setWallets]=useState<WalletType[]>([]);
 const [schedules,setSchedules]=useState<Schedule[]>([]);
 const [summary,setSummary]=useState<Summary|null>(null);
 const [days,setDays]=useState(30);
 const [action,setAction]=useState<'wallet'|'movement'|'salary'|null>(null);
 const [walletId,setWalletId]=useState('');
 const [kind,setKind]=useState('MARKET');
 const [movementType,setMovementType]=useState('PURCHASE');
 const [name,setName]=useState('');const [amount,setAmount]=useState('');const [date,setDate]=useState(dateIso());const [day,setDay]=useState(5);const [accountId,setAccountId]=useState('');
 const [referenceMonth,setReferenceMonth]=useState(dateIso().slice(0,7));
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [revision,setRevision]=useState(0);
 useEffect(()=>{setWallets([]);setSchedules([]);setSummary(null);setError('');},[profileId]);
 useEffect(()=>{if(!profileId)return;let live=true;
  Promise.all([request<WalletType[]>(`/profiles/${profileId}/benefits`),request<Schedule[]>(`/profiles/${profileId}/income-schedules`),request<Summary>(`/profiles/${profileId}/daily-summary?days=${days}`)])
  .then(([w,s,d])=>{if(live){setWallets(w);setSchedules(s);setSummary(d);}}).catch(e=>{if(live)setError(e.message)});
  return()=>{live=false};
 },[profileId,revision,days]);
 const bankBalance=useMemo(()=>accounts.reduce((sum,a)=>sum+Number(a.openingBalance)+entries.filter(e=>e.accountId===a.id&&e.status==='POSTED').reduce((v,e)=>v+(e.type==='INCOME'||e.type==='TRANSFER_IN'?1:-1)*Number(e.amount),0),0),[accounts,entries]);
 const benefitBalance=wallets.reduce((sum,w)=>sum+Number(w.balance),0);
 const month=dateIso().slice(0,7);
 const income=entries.filter(e=>e.type==='INCOME'&&e.status==='POSTED'&&e.occurredAt.startsWith(month)).reduce((v,e)=>v+Number(e.amount),0);
 const expense=entries.filter(e=>e.type==='EXPENSE'&&e.status==='POSTED'&&e.occurredAt.startsWith(month)).reduce((v,e)=>v+Number(e.amount),0);
 const upcoming=useMemo(()=>{const now=new Date();const result:{date:string,label:string,delta:number}[]=[];
  for(let i=0;i<=90;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);const dstr=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
   for(const s of schedules){const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();if(d.getDate()===Math.min(s.dayOfMonth,last))result.push({date:dstr,label:s.name,delta:Number(s.amount)});}
  }
  for(const c of commitments){if(c.status==='PENDING'&&c.dueDate.slice(0,10)>=dateIso()&&c.dueDate.slice(0,10)<=new Date(now.getTime()+90*86400000).toISOString().slice(0,10))result.push({date:c.dueDate.slice(0,10),label:'Compromisso',delta:(c.type==='RECEIVABLE'?1:-1)*Number(c.amount)});}
  for(const e of entries){if(e.status==='SCHEDULED'&&e.occurredAt.slice(0,10)>=dateIso()&&e.occurredAt.slice(0,10)<=new Date(now.getTime()+90*86400000).toISOString().slice(0,10))result.push({date:e.occurredAt.slice(0,10),label:'Lançamento previsto',delta:(e.type==='INCOME'?1:-1)*Number(e.amount)});}
  return result.sort((a,b)=>a.date.localeCompare(b.date));
 },[schedules,commitments,entries]);
 const projection=(d:number)=>bankBalance+upcoming.filter(x=>x.date<=new Date(Date.now()+d*86400000).toISOString().slice(0,10)).reduce((v,x)=>v+x.delta,0);
 const commit=async(e:React.FormEvent)=>{e.preventDefault();if(!profileId)return;setError('');setBusy(true);
  try{if(action==='wallet')await request(`/profiles/${profileId}/benefits`,{name,kind,openingBalance:amount||'0'});
   if(action==='movement'){if(!amountOk(amount)||!walletId)throw new Error('Informe benefício e valor positivo');await request(`/benefits/${walletId}/movements`,{type:movementType,amount,description:name,occurredAt:new Date(`${date}T12:00:00`).toISOString(),...(movementType==='RECHARGE'?{referenceMonth}: {})});}
   if(action==='salary'){if(!amountOk(amount)||!accountId)throw new Error('Informe uma conta e o valor do salário');await request(`/profiles/${profileId}/income-schedules`,{name,amount,dayOfMonth:day,accountId});}
   setAction(null);setName('');setAmount('');setRevision(v=>v+1);
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 };
 if(!profileId)return <section className="daily-panel"><h2>Meu Financeiro Diário</h2><p>Selecione um perfil pessoal para começar. A visão consolidada é somente para consulta.</p></section>;
 return <section className="daily-panel">
  <div className="daily-heading"><div><h2>Meu Financeiro Diário</h2><p>Seu dinheiro, benefícios e próximos compromissos.</p></div><span className="daily-pill">Dados reais</span></div>
  {error&&<div className="daily-error" role="alert">{error}</div>}
  <div className="daily-balance"><span>Saldo em contas e dinheiro</span><strong>{money(bankBalance)}</strong><small>Não inclui vales, cartões ou recebimentos futuros</small></div>
  <div className="daily-grid"><div className="daily-stat"><Wallet size={18}/><small>Entradas do mês</small><b>{money(income)}</b></div><div className="daily-stat"><TrendingUp size={18}/><small>Saídas bancárias do mês</small><b>{money(expense)}</b></div><div className="daily-stat"><ShoppingCart size={18}/><small>Total em benefícios</small><b>{money(benefitBalance)}</b></div><div className="daily-stat"><CalendarDays size={18}/><small>Compromissos pendentes</small><b>{money(commitments.filter(x=>x.status==='PENDING'&&x.type==='PAYABLE').reduce((t,x)=>t+Number(x.amount),0))}</b></div></div>
  <div className="daily-actions"><button onClick={onIncome}>+ Entrada</button><button onClick={onExpense}>− Despesa</button><button onClick={onNewAccount}>+ Conta</button><button onClick={()=>setAction('movement')}>+ Movimento do vale</button></div>
  <div className="daily-box"><div className="daily-section-title"><h3>Vales com saldo acumulativo</h3><button onClick={()=>setAction('wallet')}><Plus size={15}/> Criar vale</button></div>
   {wallets.length===0?<p className="daily-empty">Nenhum benefício cadastrado. Cadastre seu vale-mercado ou vale-combustível, começando com R$ 0,00.</p>:<div className="daily-grid">{wallets.map(w=><div className="daily-stat" key={w.id}>{w.kind==='FUEL'?<Fuel size={19}/>:<ShoppingCart size={19}/>}<small>{w.name}</small><b>{money(w.balance)}</b><button onClick={()=>{setWalletId(w.id);setAction('movement')}}>Registrar movimento</button></div>)}</div>}
  </div>
  <div className="daily-box"><div className="daily-section-title"><h3>Salário programado</h3><button onClick={()=>setAction('salary')}><Plus size={15}/> Programar</button></div>
  {schedules.length===0?<p className="daily-empty">Nenhuma renda recorrente cadastrada. A programação não credita dinheiro automaticamente: confirme o recebimento em Entrada.</p>:schedules.map(s=><div className="daily-line" key={s.id}><span>{s.name} — dia {s.dayOfMonth}</span><strong>{money(s.amount)}</strong></div>)}
  </div>
  <div className="daily-box"><div className="daily-section-title"><h3>Gastos por dia (caixa e vales)</h3><select value={days} onChange={e=>setDays(Number(e.target.value))}><option value="7">7 dias</option><option value="15">15 dias</option><option value="30">30 dias</option><option value="90">90 dias</option></select></div>
   {!summary?.hasHistory?<p className="daily-empty">Ainda não há despesas registradas neste período. O gráfico será preenchido com seus dados reais.</p>:<><div className="daily-bars">{summary.points.map(p=><div key={p.date} className="daily-bar-col" title={`${fmtDate(p.date)} — ${money(p.expense)}`}><div className="daily-bar" style={{height:`${Math.max(2,100*Number(p.expense)/Math.max(1,...summary.points.map(x=>Number(x.expense))))}%`}}/><small>{p.date.slice(-2)}</small></div>)}</div><div className="daily-grid"><div className="daily-stat"><small>Maior gasto registrado</small><b>{money(summary.highest?.expense||0)}</b><small>{summary.highest?fmtDate(summary.highest.date):''}</small></div><div className="daily-stat"><small>Menor gasto registrado</small><b>{money(summary.lowest?.expense||0)}</b><small>{summary.lowest?fmtDate(summary.lowest.date):''}</small></div></div></>}
  </div>
  <div className="daily-box"><h3>Previsão de saldo bancário</h3><p className="daily-hint">Apenas recebimentos programados e compromissos cadastrados. Não inclui uma estimativa de gastos variáveis.</p><div className="daily-grid">{[7,15,30,60,90].map(d=><div key={d} className="daily-stat"><small>Em {d} dias</small><b>{money(projection(d))}</b></div>)}</div>{upcoming.length===0&&<p className="daily-empty">Sem compromissos futuros registrados. A projeção permanece igual ao saldo atual.</p>}{upcoming.slice(0,8).map((x,i)=><div className="daily-line" key={i}><span>{fmtDate(x.date)} · {x.label}</span><strong>{x.delta>=0?'+ ': '− '}{money(Math.abs(x.delta))}</strong></div>)}
  </div>
  {action&&<div className="daily-overlay"><form className="daily-modal" onSubmit={commit}><h3>{action==='wallet'?'Cadastrar benefício':action==='salary'?'Programar salário':'Movimentar benefício'}</h3>
   {action==='wallet'&&<label>Tipo de vale<select value={kind} onChange={e=>setKind(e.target.value)}><option value="MARKET">Vale-mercado</option><option value="FUEL">Vale-combustível</option><option value="OTHER">Outro benefício</option></select></label>}
   {action==='movement'&&<><label>Benefício<select required value={walletId} onChange={e=>setWalletId(e.target.value)}><option value="">Selecione</option>{wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label><label>Operação<select value={movementType} onChange={e=>setMovementType(e.target.value)}><option value="PURCHASE">Compra / Saída</option><option value="RECHARGE">Recarga / Entrada</option></select></label><label>Data<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label>{movementType==='RECHARGE'&&<label>Mês da recarga (evita duplicidade)<input type="month" value={referenceMonth} required onChange={e=>setReferenceMonth(e.target.value)}/></label>}</>}
   {action==='salary'&&<><label>Dia mensal do recebimento<input type="number" min="1" max="31" value={day} onChange={e=>setDay(Number(e.target.value))}/></label><label>Conta bancária<select required value={accountId} onChange={e=>setAccountId(e.target.value)}><option value="">Selecione</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label></>}
   <label>{action==='wallet'?'Nome do benefício':action==='salary'?'Nome da renda':'Descrição'}<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Informe a descrição"/></label><label>{action==='wallet'?'Saldo inicial real (R$)':action==='salary'?'Salário líquido esperado (R$)':'Valor (R$)'}<input required type="number" min={action==='wallet'?'0':'0.01'} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00"/></label>
   {error&&<p className="daily-error">{error}</p>}
   <div className="daily-actions"><button type="button" onClick={()=>{setAction(null);setError('')}}>Cancelar</button><button disabled={busy} type="submit">{busy?'Salvando…':'Salvar na API'}</button></div></form></div>}
  <p className="daily-hint"><AlertCircle size={14}/> Os dados são consultados e gravados na API real. Sem API e PostgreSQL funcionando, o salvamento mostra erro.</p>
 </section>;
}
