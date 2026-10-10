import React from 'react';
import { BarChart4, Download, FileText, Printer, CheckCircle2, TrendingUp } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const ReportsView: React.FC = () => {
  const { metrics, isConsolidated, activeProfile } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Relatórios & DRE Pessoal</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Demonstrativo de Resultado
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Demonstrativo financeiro estruturado com conciliação contábil, eliminação de transferências internas e margem líquida de poupança.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('Download do relatório em PDF iniciado.')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => alert('Download em planilha Excel (.xlsx) iniciado.')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* DRE Pessoal Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              DRE — Demonstrativo do Resultado do Exercício (Outubro 2026)
            </h3>
            <span className="text-xs text-slate-400">
              {isConsolidated ? 'Consolidado — Todos os perfis' : `Perfil: ${activeProfile?.name}`}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Valores em BRL (R$)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
                <th className="py-2.5 px-3">Linha DRE</th>
                <th className="py-2.5 px-3 text-right">Valor Nominal</th>
                <th className="py-2.5 px-3 text-right">% da Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="bg-emerald-50/50 font-bold text-emerald-900">
                <td className="py-3 px-3">(+) Receita Bruta Realizada</td>
                <td className="py-3 px-3 text-right">
                  {FinancialEngine.formatCurrency(metrics.totalIncome)}
                </td>
                <td className="py-3 px-3 text-right">100,0%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Salários, Pró-labores & Honorários</td>
                <td className="py-2.5 px-3 text-right">R$ 22.300,00</td>
                <td className="py-2.5 px-3 text-right">72,9%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Rendimentos Imobiliários & Financeiros</td>
                <td className="py-2.5 px-3 text-right">R$ 3.800,00</td>
                <td className="py-2.5 px-3 text-right">12,4%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Aporte Orçamento Familiar Compartilhado</td>
                <td className="py-2.5 px-3 text-right">R$ 4.500,00</td>
                <td className="py-2.5 px-3 text-right">14,7%</td>
              </tr>

              <tr className="bg-rose-50/50 font-bold text-rose-900">
                <td className="py-3 px-3">(-) Despesas e Custos Operacionais</td>
                <td className="py-3 px-3 text-right">
                  - {FinancialEngine.formatCurrency(metrics.totalExpense)}
                </td>
                <td className="py-3 px-3 text-right">{metrics.commitmentRate.toFixed(1)}%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Moradia, Condomínio & IPTU</td>
                <td className="py-2.5 px-3 text-right">- R$ 5.000,00</td>
                <td className="py-2.5 px-3 text-right">16,3%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Alimentação & Mercado</td>
                <td className="py-2.5 px-3 text-right">- R$ 3.250,00</td>
                <td className="py-2.5 px-3 text-right">10,6%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Cartões de Crédito & Compras</td>
                <td className="py-2.5 px-3 text-right">- R$ 3.950,00</td>
                <td className="py-2.5 px-3 text-right">12,9%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Transporte & Saúde</td>
                <td className="py-2.5 px-3 text-right">- R$ 2.100,00</td>
                <td className="py-2.5 px-3 text-right">6,9%</td>
              </tr>
              <tr className="text-slate-700">
                <td className="py-2.5 px-3 pl-6">↳ Outros Custos & Software</td>
                <td className="py-2.5 px-3 text-right">- R$ 1.650,00</td>
                <td className="py-2.5 px-3 text-right">5,4%</td>
              </tr>

              <tr className="bg-slate-900 text-white font-extrabold text-sm">
                <td className="py-3.5 px-3">(=) RESULTADO LÍQUIDO OPERACIONAL (SUPERÁVIT)</td>
                <td className="py-3.5 px-3 text-right text-emerald-400">
                  + {FinancialEngine.formatCurrency(metrics.monthBalance)}
                </td>
                <td className="py-3.5 px-3 text-right text-emerald-400">
                  {(100 - metrics.commitmentRate).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
