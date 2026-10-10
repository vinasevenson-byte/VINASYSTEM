import React from 'react';
import { Landmark, TrendingUp, Plus, Building, PieChart, ShieldCheck } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const InvestmentsView: React.FC = () => {
  const assets = [
    { name: 'Tesouro Selic 2029', type: 'Renda Fixa', broker: 'XP Investimentos', amount: 45000, yield: '100% CDI' },
    { name: 'HGLG11 - CSHG Logística', type: 'FIIs', broker: 'XP Investimentos', amount: 32000, yield: '0.85% a.m.' },
    { name: 'KNCR11 - Kinea Rendimentos', type: 'FIIs', broker: 'XP Investimentos', amount: 28000, yield: '0.92% a.m.' },
    { name: 'Studio Centro Residencial', type: 'Imóvel Físico', broker: 'Patrimônio', amount: 280000, yield: 'Aluguel Ativo' },
    { name: 'Carteira de Ações Dividendos', type: 'Ações BR', broker: 'BTG Pactual', amount: 42000, yield: 'Dividend Yield 8.2%' },
  ];

  const totalPatrimony = assets.reduce((sum, a) => sum + a.amount, 0) + 96600; // Assets + Cash in bank

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Investimentos & Patrimônio Líquido</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {FinancialEngine.formatCurrency(totalPatrimony)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Acompanhe a alocação de ativos, evolução do patrimônio líquido, bens imóveis e rendimentos passivos.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para novo ativo ou investimento.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ativo</span>
        </button>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {asset.type}
              </span>
              <span className="text-xs font-semibold text-purple-600">{asset.broker}</span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{asset.name}</h3>
              <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                {FinancialEngine.formatCurrency(asset.amount)}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Rentabilidade:</span>
              <span className="font-bold text-emerald-600">{asset.yield}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
