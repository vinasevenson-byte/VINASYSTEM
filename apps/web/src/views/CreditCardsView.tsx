import React, { useState } from 'react';
import {
  CreditCard as CardIcon,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const CreditCardsView: React.FC = () => {
  const { creditCards, accounts, addTransaction, isConsolidated, activeProfileId } = useFinance();
  const [selectedCardId, setSelectedCardId] = useState<string>(creditCards[0]?.id || '');
  const [payingCardId, setPayingCardId] = useState<string | null>(null);

  const targetCards = isConsolidated
    ? creditCards
    : creditCards.filter((c) => c.profileId === activeProfileId);

  const selectedCard = targetCards.find((c) => c.id === selectedCardId) || targetCards[0];

  const handlePayInvoice = (card: typeof creditCards[0]) => {
    const acc = accounts.find((a) => a.id === card.defaultAccountId) || accounts[0];
    if (!acc) {
      alert('Nenhuma conta bancária disponível para quitação.');
      return;
    }

    if (acc.currentBalance < card.currentInvoiceAmount) {
      alert(`Saldo insuficiente na conta ${acc.name} para quitar a fatura.`);
      return;
    }

    // Register invoice payment as a liability settlement / transfer
    addTransaction({
      profileId: card.profileId,
      accountId: acc.id,
      amount: card.currentInvoiceAmount,
      currency: 'BRL',
      type: 'TRANSFER',
      status: 'COMPLETED',
      effectiveDate: '2026-10-25',
      description: `Pagamento de Fatura — ${card.name}`,
      notes: '[FATURA_PAGAMENTO] Quitação de obrigação de cartão sem duplicidade de despesa.',
    });

    alert(
      `Fatura do ${card.name} de ${FinancialEngine.formatCurrency(
        card.currentInvoiceAmount
      )} paga com sucesso via ${acc.name}!\n\nConforme a Regra de Ouro, nenhuma despesa adicional foi gerada no fluxo de caixa.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Gestão de Cartões de Crédito</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Anti-Duplicidade Ativa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Acompanhe limites, faturas abertas e fechadas, parcelamentos futuros e a regra anti-duplicidade no pagamento da fatura bancária.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para adicionar novo cartão de crédito.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Golden Rule Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-start space-x-3.5 shadow-md">
        <ShieldCheck className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-extrabold text-sm text-indigo-300 block">
            Regra Fundamental: Proteção Contra Dupla Contagem de Fatura
          </span>
          <p className="text-slate-200 leading-relaxed">
            Uma compra no cartão é contabilizada como despesa no ato da compra e alocada na respectiva fatura. No momento em que você quita a fatura no banco, o sistema debita a conta bancária e amortiza o passivo do cartão como uma <strong>transferência / liquidação de passivo</strong>, <em>nunca gerando uma segunda despesa</em> nos relatórios mensais e DRE.
          </p>
        </div>
      </div>

      {/* Cards List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Card Selection Carousel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Seus Cartões ({targetCards.length})
          </h3>

          <div className="space-y-3">
            {targetCards.map((card) => {
              const isSelected = card.id === selectedCard?.id;
              const usedLimit = card.creditLimit - card.availableLimit;
              const usedPct = (usedLimit / card.creditLimit) * 100;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                        {card.brand}
                      </span>
                      <h4 className="text-base font-extrabold">{card.name}</h4>
                    </div>
                    <CardIcon className="w-6 h-6 opacity-80" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-sm tracking-widest opacity-80">
                      •••• •••• •••• {card.lastFourDigits}
                    </span>
                    <span className="text-xs font-bold font-mono">
                      Vence dia {card.dueDay}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-end text-xs">
                    <div>
                      <div className="text-[10px] opacity-70">Fatura Atual</div>
                      <div className="text-base font-extrabold font-mono">
                        {FinancialEngine.formatCurrency(card.currentInvoiceAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] opacity-70">Limite Livre</div>
                      <div className="font-bold font-mono">
                        {FinancialEngine.formatCurrency(card.availableLimit)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Card Invoice Detail */}
        {selectedCard && (
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Fatura de Outubro 2026
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedCard.name}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePayInvoice(selectedCard)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pagar Fatura (Sem Duplicar)</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block">Total da Fatura</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {FinancialEngine.formatCurrency(selectedCard.currentInvoiceAmount)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block">Limite Total</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {FinancialEngine.formatCurrency(selectedCard.creditLimit)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block">Fechamento</span>
                <span className="text-base font-bold text-indigo-600">
                  Dia {selectedCard.closingDay}/10
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block">Vencimento</span>
                <span className="text-base font-bold text-rose-600">
                  Dia {selectedCard.dueDay}/11
                </span>
              </div>
            </div>

            {/* Simulated Installments and Competence Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Lançamentos e Compras Parceladas na Fatura
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Estabelecimento / Item</th>
                      <th className="py-2 px-3">Parcela</th>
                      <th className="py-2 px-3 text-right">Valor da Parcela</th>
                      <th className="py-2 px-3 text-right">Saldo Futuro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">2026-10-12</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        Apple Store — MacBook Pro M4
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-mono">
                          02/10
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        R$ 1.250,00
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        R$ 10.000,00
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">2026-10-18</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        Passagens Aéreas Latam
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-mono">
                          04/06
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        R$ 450,00
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        R$ 900,00
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-500">2026-10-22</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        Restaurante & Experiência
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold font-mono">
                          À vista
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        R$ 450,00
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        R$ 0,00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
