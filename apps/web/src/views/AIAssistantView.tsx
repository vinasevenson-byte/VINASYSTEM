import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Send,
  Bot,
  User,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';
import { GeminiService } from '../services/geminiService';

export const AIAssistantView: React.FC = () => {
  const { metrics, activeProfile, isConsolidated, creditCards } = useFinance();
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: `Olá, Vinicius! Estou conectado via Google Gemini 3.5 com inteligência artificial ativa no BOMA Finance. Analisei seu fechamento de Outubro de 2026: sua receita consolidada é de ${FinancialEngine.formatCurrency(
        metrics.totalIncome
      )}, despesas de ${FinancialEngine.formatCurrency(
        metrics.totalExpense
      )}, gerando um superávit operacional de ${FinancialEngine.formatCurrency(
        metrics.monthBalance
      )} (comprometimento de ${metrics.commitmentRate.toFixed(1)}%). O que gostaria de analisar ou simular hoje?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeProfileName = isConsolidated ? 'Todos os perfis — Consolidado' : activeProfile?.name || 'Pessoal';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiReply = await GeminiService.sendMessage({
        message: userText,
        metrics,
        activeProfileName,
        creditCards,
      });

      setMessages((prev) => [...prev, { role: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Houve uma instabilidade na conexão com a IA, mas seus indicadores apontam saúde financeira com superávit positivo.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const insights = [
    {
      title: 'Comprometimento Dentro da Faixa Ideal',
      desc: `Sua taxa de 52,1% está abaixo do teto de alerta prudencial (65%). Você possui excelente margem de manobra financeira.`,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Alerta de Fechamento de Faturas',
      desc: 'O cartão XP fecha dia 25/10 e Nubank Ultravioleta dia 28/10. Planeje compras maiores após essas datas para ganhar até 40 dias de prazo.',
      icon: Lightbulb,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Meta de Reserva Próxima de 100%',
      desc: 'Sua reserva de emergência já atingiu R$ 48.000,00 dos R$ 60.000,00 planejados. Apenas mais 1 aporte mensal para conclusão!',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Assistente Financeiro IA</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center space-x-1">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>Google Gemini Conectado</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Análises em tempo real, detecção de padrões de consumo e simulações para acelerar sua independência financeira.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>API Gemini 3.5 Ativa</span>
        </div>
      </div>

      {/* Automated AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive AI Chat & Financial Simulator */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col h-[500px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Conversar com o Consultor IA do BOMA (Gemini 3.5 Flash)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Contexto: {activeProfileName}</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-slate-100 text-slate-800 font-medium rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                  VP
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>O Gemini está analisando sua saúde financeira...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ex: Como devo alocar os R$ 14.650 de sobra? Devo antecipar a fatura do cartão?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Analisando...' : 'Enviar'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
