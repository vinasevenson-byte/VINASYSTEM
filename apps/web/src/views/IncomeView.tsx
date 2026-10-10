import React from 'react';
import { TrendingUp, Plus, CheckCircle2, Clock, Briefcase, Building, Home, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const IncomeView: React.FC = () => {
  const { transactions, metrics, isConsolidated, activeProfileId } = useFinance();

  const incomeTx = transactions.filter((t) => {
    if (t.type !== 'INCOME') return false;
    if (!isConsolidated && t.profileId !== activeProfileId) return false;
    return true;
  });

  const sources = [
    { title: 'Salário & Pró-labore', amount: 18000, type: 'Recorrente', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Renda Compartilhada Familiar', amount: 4500, type: 'Familiar', icon: Home, color: 'text-blue-600 bg-blue-50' },
    { title: 'Honorários de Consultoria', amount: 4300, type: 'Variável', icon: Building, color: 'text-amber-600 bg-amber-50' },
    { title: 'Rendimentos FIIs & Aluguéis', amount: 3800, type: 'Passiva', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Minha Renda & Receitas</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {FinancialEngine.formatCurrency(metrics.totalIncome)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Gestão de todas as fontes de renda ativas: salários, pró-labores, comissões, aluguéis, dividendos e honorários.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para cadastrar nova fonte de renda.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Fonte de Renda</span>
        </button>
      </div>

      {/* Income Source Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {s.type}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">{s.title}</span>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {FinancialEngine.formatCurrency(s.amount)}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center text-[11px] font-semibold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                <span>100% recebido no mês</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Income Transactions Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Lançamentos de Receita do Período ({incomeTx.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Origem / Fonte</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3 text-right">Valor Realizado</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomeTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-semibold text-slate-800">{tx.description}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{tx.effectiveDate}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                    + {FinancialEngine.formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Efetivado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
