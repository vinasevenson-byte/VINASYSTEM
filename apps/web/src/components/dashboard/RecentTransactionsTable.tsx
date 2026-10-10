import React, { useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  CreditCard,
  Building2,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const RecentTransactionsTable: React.FC = () => {
  const {
    transactions,
    profiles,
    categories,
    accounts,
    deleteTransaction,
    activeProfileId,
    isConsolidated,
    referenceMonth,
    referenceYear,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');

  const filteredTransactions = transactions.filter((t) => {
    // Scope filter
    if (!isConsolidated && t.profileId !== activeProfileId) return false;

    // Date filter (active month)
    if (t.effectiveDate) {
      const [y, m] = t.effectiveDate.split('-').map(Number);
      if (y !== referenceYear || m !== referenceMonth) return false;
    }

    // Type filter
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const descMatch = t.description.toLowerCase().includes(term);
      const category = categories.find((c) => c.id === t.categoryId);
      const catMatch = category ? category.name.toLowerCase().includes(term) : false;
      return descMatch || catMatch;
    }

    return true;
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Movimentações Recentes</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamentos consolidados com status e rastreabilidade
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-44"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
            <option value="TRANSFER">Transferências</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Lançamento</th>
              <th className="py-2.5 px-3">Perfil</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3 text-right">Valor</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const profile = profiles.find((p) => p.id === tx.profileId);
                const category = categories.find((c) => c.id === tx.categoryId);
                const account = accounts.find((a) => a.id === tx.accountId);

                const isIncome = tx.type === 'INCOME';
                const isExpense = tx.type === 'EXPENSE';
                const isTransfer = tx.type === 'TRANSFER';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Description */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600'
                              : isExpense
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {isIncome && <ArrowUpRight className="w-4 h-4" />}
                          {isExpense && <ArrowDownRight className="w-4 h-4" />}
                          {isTransfer && <ArrowRightLeft className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {tx.description}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                            {tx.paymentMethod === 'CREDIT_CARD' ? (
                              <span className="flex items-center text-indigo-600 font-medium">
                                <CreditCard className="w-3 h-3 mr-0.5" /> Cartão de Crédito
                              </span>
                            ) : account ? (
                              <span className="flex items-center">
                                <Building2 className="w-3 h-3 mr-0.5" /> {account.name}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Profile */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {profile && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold"
                          style={{
                            backgroundColor: `${profile.color}15`,
                            color: profile.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: profile.color }}
                          />
                          {profile.name}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {category ? (
                        <span className="text-slate-700 font-medium">{category.name}</span>
                      ) : isTransfer ? (
                        <span className="text-blue-600 font-medium">Transferência Interna</span>
                      ) : (
                        <span className="text-slate-400">Sem categoria</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500">
                      {tx.effectiveDate}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-bold font-mono tabular-nums ${
                          isIncome
                            ? 'text-emerald-600'
                            : isExpense
                            ? 'text-slate-900'
                            : 'text-blue-600'
                        }`}
                      >
                        {isIncome ? '+ ' : isExpense ? '- ' : ''}
                        {FinancialEngine.formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {tx.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Concluído
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" /> Pendente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        title="Excluir lançamento"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
