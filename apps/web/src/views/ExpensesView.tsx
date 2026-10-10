import React from 'react';
import { Receipt, Plus, Filter, TrendingDown, ArrowDownRight, Tag } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';

export const ExpensesView: React.FC = () => {
  const { metrics, isConsolidated, activeProfile } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Despesas & Gastos Detalhados</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {FinancialEngine.formatCurrency(metrics.totalExpense)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Lançamentos categorizados por tipo, forma de pagamento, comprovantes anexados e controle de custos fixos vs variáveis.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para nova despesa.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Despesa</span>
        </button>
      </div>

      {/* Transactions filtered for expenses */}
      <RecentTransactionsTable />
    </div>
  );
};
