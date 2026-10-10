import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Scale,
  Percent,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const MetricCards: React.FC = () => {
  const { metrics, isConsolidated, activeProfile } = useFinance();

  const isPositiveBalance = metrics.monthBalance >= 0;
  const savingsRate = Math.max(0, 100 - metrics.commitmentRate);

  return (
    <div className="space-y-4">
      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Receita Mensal */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Receita Mensal
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums font-mono">
              {FinancialEngine.formatCurrency(metrics.totalIncome)}
            </h3>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>100% de entradas confirmadas</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Card 2: Despesas Totais / Mensais */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Despesas Mensais
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums font-mono">
              {FinancialEngine.formatCurrency(metrics.totalExpense)}
            </h3>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-slate-500">
              <span className="text-rose-500 font-bold">{metrics.commitmentRate.toFixed(1)}%</span>
              <span>da renda mensal</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-400" />
        </div>

        {/* Card 3: Resultado do Mês */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resultado do Mês
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              isPositiveBalance ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums font-mono ${
              isPositiveBalance ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {isPositiveBalance ? '+ ' : ''}
              {FinancialEngine.formatCurrency(metrics.monthBalance)}
            </h3>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/70 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Superávit operacional
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
        </div>

        {/* Card 4: Saldo das Contas */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saldo das Contas
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums font-mono">
              {FinancialEngine.formatCurrency(metrics.accountsTotalBalance)}
            </h3>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-500">
              <span>Disponível em 5 contas bancárias</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        </div>
      </div>

      {/* Card 5: Comprometimento da Renda & Capacidade de Poupança (Exatamente como na especificação) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Comprometimento da Renda
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {metrics.commitmentRate.toFixed(1)}% Comprometido
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Neste exemplo, <strong className="text-slate-900 font-semibold">{metrics.commitmentRate.toFixed(1)}%</strong> da renda está comprometida com custos operacionais e <strong className="text-emerald-700 font-semibold">{savingsRate.toFixed(1)}%</strong> permanece disponível para poupança, investimentos e metas patrimoniais.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400">Capacidade de Poupança</div>
              <div className="text-xl font-extrabold text-emerald-600 font-mono">
                {FinancialEngine.formatCurrency(metrics.monthBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.commitmentRate)}%` }}
              title={`Comprometido: ${metrics.commitmentRate.toFixed(1)}%`}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - metrics.commitmentRate)}%` }}
              title={`Disponível: ${savingsRate.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
              Despesas e Compromissos ({metrics.commitmentRate.toFixed(1)}%)
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              Disponível / Poupança ({savingsRate.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
