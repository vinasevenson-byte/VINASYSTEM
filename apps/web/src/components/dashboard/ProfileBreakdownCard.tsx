import React from 'react';
import { Users, ArrowRight, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const ProfileBreakdownCard: React.FC = () => {
  const { metrics, setActiveProfileId, activeProfileId, isConsolidated } = useFinance();

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Resultado por Perfil</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Multiperfis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Soma dos dados autorizados com eliminação de transferências internas
          </p>
        </div>

        {isConsolidated ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Visão Consolidada Ativa
          </span>
        ) : (
          <button
            onClick={() => setActiveProfileId('CONSOLIDATED')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Ver consolidado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Profile rows */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.profileBreakdown.map((item) => {
          const isSelected = activeProfileId === item.profileId;
          const isPositive = item.balance >= 0;

          return (
            <div
              key={item.profileId}
              onClick={() => setActiveProfileId(item.profileId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.profileColor }}
                  />
                  <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.profileName}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-400">Resultado Líquido</div>
                <div
                  className={`text-lg font-extrabold font-mono tabular-nums ${
                    isPositive ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? '+ ' : ''}
                  {FinancialEngine.formatCurrency(item.balance)}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex justify-between text-[11px] text-slate-500">
                <span>Rec: {FinancialEngine.formatCurrency(item.income)}</span>
                <span>Desp: {FinancialEngine.formatCurrency(item.expense)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Transfer Deduplication Note */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start space-x-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-800 font-semibold">Regra de Eliminação de Duplicidades:</strong> Transferências entre perfis do mesmo grupo (como o aporte de <strong className="font-mono font-bold text-slate-900">R$ 1.000,00</strong> de Pessoal para Familiar) são movimentações internas de custódia e <em>não afetam o resultado consolidado do patrimônio</em>.
        </p>
      </div>
    </div>
  );
};
