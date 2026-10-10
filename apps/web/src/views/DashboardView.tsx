import React from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ProfileBreakdownCard } from '../components/dashboard/ProfileBreakdownCard';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';
import {
  CreditCard as CardIcon,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { creditCards, accounts, isConsolidated, activeProfile } = useFinance();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Visão Financeira Consolidada
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Outubro 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {isConsolidated
              ? 'Painel Consolidado de Todos os Perfis'
              : `Painel Financeiro — ${activeProfile?.name}`}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Visão unificada de liquidez, obrigações em cartões de crédito e capacidade de poupança sem duplicidade contábil.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
            <span className="text-[10px] font-semibold text-slate-300 block">Status Operacional</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-end">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Auditoria em Dia
            </span>
          </div>
        </div>
      </div>

      {/* 1. Core Financial Metrics */}
      <MetricCards />

      {/* 2. Profile Breakdown (Multiperfis) */}
      <ProfileBreakdownCard />

      {/* 3. Charts & Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Distribution Chart (2 cols) */}
        <div className="lg:col-span-2">
          <ExpenseChart />
        </div>

        {/* Credit Cards & Invoices Widget (1 col) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cartões & Faturas</h3>
                <p className="text-xs text-slate-500">Limites e vencimentos do mês</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CardIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {creditCards.map((card) => {
                const usedPercentage =
                  ((card.creditLimit - card.availableLimit) / card.creditLimit) * 100;
                return (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: card.color }}
                        />
                        <span className="text-xs font-bold text-slate-900">{card.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Final {card.lastFourDigits}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Fatura Atual:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {FinancialEngine.formatCurrency(card.currentInvoiceAmount)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.min(100, usedPercentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Fecha dia {card.closingDay}</span>
                      <span>Vence dia {card.dueDay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-indigo-700 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Regra ativa: O pagamento de fatura não duplica despesas já lançadas.</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions Table */}
      <RecentTransactionsTable />
    </div>
  );
};
