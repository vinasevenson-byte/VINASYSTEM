import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';
import { PieChart as PieIcon } from 'lucide-react';

export const ExpenseChart: React.FC = () => {
  const { transactions, categories, activeProfileId, isConsolidated, referenceMonth, referenceYear } = useFinance();

  // Aggregate expenses by category for current period and active profile
  const expenseData = React.useMemo(() => {
    const expenses = transactions.filter((t) => {
      if (t.type !== 'EXPENSE' || t.status !== 'COMPLETED') return false;
      if (t.isInternalTransfer) return false;
      if (!t.effectiveDate) return false;
      const [y, m] = t.effectiveDate.split('-').map(Number);
      if (y !== referenceYear || m !== referenceMonth) return false;
      if (!isConsolidated && t.profileId !== activeProfileId) return false;
      return true;
    });

    const categoryTotals: { [key: string]: number } = {};
    for (const exp of expenses) {
      const catId = exp.categoryId || 'cat-outros';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + exp.amount;
    }

    const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

    return Object.entries(categoryTotals)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Outros',
          value: amount,
          color: cat?.color || '#94A3B8',
          percentage: total > 0 ? (amount / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, activeProfileId, isConsolidated, referenceMonth, referenceYear]);

  const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Distribuição das Despesas</h3>
          <p className="text-xs text-slate-500 mt-0.5">Gastos consolidados por categoria</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
          <PieIcon className="w-4 h-4" />
        </div>
      </div>

      {expenseData.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Nenhuma despesa registrada para o período.
        </div>
      ) : (
        <div className="mt-4 flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="w-full lg:w-1/2 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseData.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [FinancialEngine.formatCurrency(val), 'Valor']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {FinancialEngine.formatCurrency(totalExpense)}
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="w-full lg:w-1/2 space-y-2.5">
            {expenseData.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700 font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 pl-2">
                  <span className="text-slate-400 font-medium">{item.percentage.toFixed(1)}%</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {FinancialEngine.formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
