import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { TransactionType } from '@boma/shared';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose }) => {
  const { profiles, accounts, creditCards, categories, addTransaction, activeProfileId, isConsolidated } = useFinance();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [profileId, setProfileId] = useState<string>(
    isConsolidated ? profiles[0]?.id || 'p-pessoal' : activeProfileId
  );
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ACCOUNT' | 'CREDIT_CARD' | 'PIX' | 'BOLETO'>('ACCOUNT');
  const [effectiveDate, setEffectiveDate] = useState('2026-10-15');

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => {
    if (type === 'INCOME') return c.type === 'INCOME';
    return c.type === 'EXPENSE';
  });

  const availableAccounts = accounts.filter((a) => a.profileId === profileId);
  const availableCards = creditCards.filter((c) => c.profileId === profileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      alert('Informe a descrição do lançamento.');
      return;
    }

    addTransaction({
      profileId,
      accountId: paymentMethod === 'CREDIT_CARD' ? undefined : accountId || availableAccounts[0]?.id,
      categoryId: categoryId || filteredCategories[0]?.id,
      amount: numAmount,
      currency: 'BRL',
      type,
      status: 'COMPLETED',
      effectiveDate,
      description,
      paymentMethod,
    });

    onClose();
    // Reset form
    setDescription('');
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900">Novo Lançamento</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Operacional
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setPaymentMethod('ACCOUNT');
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'EXPENSE'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setPaymentMethod('ACCOUNT');
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'INCOME'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Receita</span>
            </button>
          </div>

          {/* Profile & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Perfil Financeiro
              </label>
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data de Competência
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Description & Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Supermercado, Salário, Internet"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Selecione a categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method (for expenses) */}
          {type === 'EXPENSE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ACCOUNT')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    paymentMethod === 'ACCOUNT'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Conta Bancária
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cartão de Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BOLETO')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    paymentMethod === 'BOLETO'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Boleto / Pix
                </button>
              </div>
            </div>
          )}

          {/* Account or Card Selection */}
          {paymentMethod === 'CREDIT_CARD' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cartão Utilizado
              </label>
              <select
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {availableCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Fecha dia {c.closingDay})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 text-indigo-500 mr-1" />
                Alocado na fatura do cartão. Não duplicará despesa no pagamento bancário.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Conta Bancária
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {availableAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
