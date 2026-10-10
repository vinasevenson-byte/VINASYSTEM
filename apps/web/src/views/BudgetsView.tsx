import React from 'react';
import { PieChart, Plus, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const BudgetsView: React.FC = () => {
  const { budgets, categories } = useFinance();
  const currentBudget = budgets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Orçamento & Limites por Categoria</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Outubro 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Defina tetos de gastos para cada categoria e receba alertas automáticos ao atingir 80% e 100% do teto planejado.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para ajustar tetos orçamentários.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajustar Tetos</span>
        </button>
      </div>

      {/* Budget Category Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentBudget?.limits.map((limit) => {
          const category = categories.find((c) => c.id === limit.categoryId);
          const percent = (limit.spentAmount / limit.limitAmount) * 100;
          const isWarning = percent >= 80 && percent < 100;
          const isDanger = percent >= 100;

          return (
            <div
              key={limit.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: category?.color || '#3B82F6' }}
                  />
                  <h4 className="font-bold text-slate-900 text-sm">{category?.name}</h4>
                </div>
                {isDanger ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Estourado
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Alerta 80%
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Controlado
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">
                    Gasto: <strong>{FinancialEngine.formatCurrency(limit.spentAmount)}</strong>
                  </span>
                  <span className="text-slate-700">
                    Teto: <strong>{FinancialEngine.formatCurrency(limit.limitAmount)}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                <span>{percent.toFixed(1)}% utilizado</span>
                <span>
                  Disponível: {FinancialEngine.formatCurrency(limit.limitAmount - limit.spentAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
