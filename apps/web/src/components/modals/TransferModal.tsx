import React, { useState } from 'react';
import { X, ArrowRightLeft, ShieldCheck, Info } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { profiles, accounts, addTransfer } = useFinance();

  const [sourceProfileId, setSourceProfileId] = useState<string>(profiles[0]?.id || 'p-pessoal');
  const [destProfileId, setDestProfileId] = useState<string>(profiles[1]?.id || 'p-familiar');
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [destAccountId, setDestAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('1000,00');
  const [description, setDescription] = useState<string>('Aporte Fundo Familiar');

  if (!isOpen) return null;

  const sourceAccounts = accounts.filter((a) => a.profileId === sourceProfileId);
  const destAccounts = accounts.filter((a) => a.profileId === destProfileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    const sAcc = sourceAccountId || sourceAccounts[0]?.id;
    const dAcc = destAccountId || destAccounts[0]?.id;

    if (!sAcc || !dAcc) {
      alert('Selecione as contas de origem e destino.');
      return;
    }

    if (sAcc === dAcc) {
      alert('A conta de destino não pode ser a mesma conta de origem.');
      return;
    }

    addTransfer({
      sourceProfileId,
      destProfileId,
      sourceAccountId: sAcc,
      destAccountId: dAcc,
      amount: numAmount,
      description,
    });

    onClose();
  };

  const isCrossProfile = sourceProfileId !== destProfileId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Transferência Financeira</h3>
              <p className="text-xs text-slate-500">Entre contas próprias ou entre perfis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Origem (Débito)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Perfil de Origem
                </label>
                <select
                  value={sourceProfileId}
                  onChange={(e) => setSourceProfileId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Conta de Origem
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  {sourceAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({FinancialEngine.formatCurrency(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Destination Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Destino (Crédito)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Perfil de Destino
                </label>
                <select
                  value={destProfileId}
                  onChange={(e) => setDestProfileId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Conta de Destino
                </label>
                <select
                  value={destAccountId}
                  onChange={(e) => setDestAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  {destAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({FinancialEngine.formatCurrency(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valor da Transferência (R$)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          {/* Rule Reminder */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start space-x-2 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              {isCrossProfile ? (
                <span>
                  <strong>Transferência entre Perfis:</strong> O saldo individual do perfil de origem diminui e o de destino aumenta, mas o <strong>resultado consolidado mantém variação de R$ 0,00</strong>, eliminando duplicidade contábil.
                </span>
              ) : (
                <span>
                  <strong>Transferência Interna:</strong> Movimentação entre contas do mesmo perfil. Não afeta receitas nem despesas.
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
            >
              Executar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
