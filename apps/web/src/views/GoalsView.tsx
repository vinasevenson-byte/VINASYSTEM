import React from 'react';
import { Target, Plus, ShieldCheck, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const GoalsView: React.FC = () => {
  const { goals } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Metas Financeiras & Reservas</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Planejamento
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Acompanhe a formação da reserva de emergência, conquistas patrimoniais e metas de curto, médio e longo prazo.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para criar nova meta financeira.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((g) => {
          const pct = (g.currentAmount / g.targetAmount) * 100;
          return (
            <div
              key={g.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {g.category}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 font-mono">
                  {pct.toFixed(1)}%
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{g.name}</h3>
                <div className="mt-2 flex items-baseline justify-between font-mono">
                  <span className="text-xl font-extrabold text-slate-900">
                    {FinancialEngine.formatCurrency(g.currentAmount)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Meta: {FinancialEngine.formatCurrency(g.targetAmount)}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Prazo: {g.targetDate}
                </span>
                <button
                  onClick={() => alert(`Aporte na meta: ${g.name}`)}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  + Aportar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
