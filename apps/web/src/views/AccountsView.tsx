import React from 'react';
import { Building2, Plus, ArrowRightLeft, Upload, CheckCircle2, Wallet, Landmark } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const AccountsView: React.FC = () => {
  const { accounts, isConsolidated, activeProfileId, profiles } = useFinance();

  const targetAccounts = isConsolidated
    ? accounts
    : accounts.filter((a) => a.profileId === activeProfileId);

  const totalBalance = targetAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Contas Bancárias & Liquidez</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {FinancialEngine.formatCurrency(totalBalance)} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Saldos em conta corrente, investimentos e carteiras. Suporte a conciliação manual e importação de extratos OFX/CSV.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('Importação OFX / CSV iniciada.')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Extrato OFX/CSV</span>
          </button>
          <button
            onClick={() => alert('Modal para adicionar nova conta bancária.')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {targetAccounts.map((acc) => {
          const profile = profiles.find((p) => p.id === acc.profileId);
          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{acc.name}</h3>
                    <span className="text-[11px] text-slate-400">{acc.bankName}</span>
                  </div>
                </div>

                {profile && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${profile.color}15`, color: profile.color }}
                  >
                    {profile.name}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400">Saldo Disponível</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {FinancialEngine.formatCurrency(acc.currentBalance)}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize">{acc.accountType.toLowerCase().replace('_', ' ')}</span>
                <button
                  onClick={() => alert(`Extrato da conta: ${acc.name}`)}
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Ver Extrato
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
