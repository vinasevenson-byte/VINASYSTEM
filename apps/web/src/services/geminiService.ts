import { DashboardMetrics, FinancialProfile, CreditCard } from '@boma/shared';
import { FinancialEngine } from '@boma/shared';

export interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export class GeminiService {
  private static apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  /**
   * Generates a contextualized AI financial analysis or conversational answer
   * using Google Gemini via the Interactions API (gemini-3.5-flash-lite / gemini-3.7-flash).
   */
  static async sendMessage(params: {
    message: string;
    metrics: DashboardMetrics;
    activeProfileName: string;
    creditCards: CreditCard[];
  }): Promise<string> {
    const { message, metrics, activeProfileName, creditCards } = params;

    const cardsSummary = creditCards
      .map((c) => `${c.name} (Fatura atual: ${FinancialEngine.formatCurrency(c.currentInvoiceAmount)}, Vence dia ${c.dueDay})`)
      .join('; ');

    const systemPrompt = `Você é o Consultor Especialista de Inteligência Financeira do BOMA Finance — Gestão Financeira Pessoal, Familiar e Multiperfis.
Perfil ativo em análise: ${activeProfileName} (Mês: Outubro/2026).
Dados consolidados reais do sistema:
- Receita Mensal Realizada: ${FinancialEngine.formatCurrency(metrics.totalIncome)}
- Despesas Mensais Realizadas: ${FinancialEngine.formatCurrency(metrics.totalExpense)}
- Resultado do Mês (Superávit): ${FinancialEngine.formatCurrency(metrics.monthBalance)}
- Saldo Líquido Total em Contas: ${FinancialEngine.formatCurrency(metrics.accountsTotalBalance)}
- Índice de Comprometimento da Renda: ${metrics.commitmentRate.toFixed(1)}% (Margem livre para poupança: ${(100 - metrics.commitmentRate).toFixed(1)}%)
- Cartões de Crédito: ${cardsSummary}

Diretrizes da resposta:
1. Responda em Português do Brasil com tom executivo, claro, empático e focado em tomada de decisão.
2. Seja conciso (1 a 3 parágrafos curtos ou bullet points objetivos).
3. Utilize os números reais acima para embasar suas recomendações.
4. Lembre que o pagamento da fatura de cartão de crédito não duplica despesas, pois é quitação de passivo.`;

    if (!this.apiKey) {
      return `[Modo Offline] Não foi detectada uma chave da API Gemini. Com sua sobra de ${FinancialEngine.formatCurrency(
        metrics.monthBalance
      )}, recomendamos direcionar 60% para reserva e 40% para investimentos.`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/interactions?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gemini-3.5-flash-lite',
            input: `${systemPrompt}\n\nPergunta do Usuário: "${message}"`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Gemini API call returned non-200:', errorData);
        // Fallback message with accurate metrics
        return `Com base nos seus números de Outubro (Receita de ${FinancialEngine.formatCurrency(
          metrics.totalIncome
        )} e Despesas de ${FinancialEngine.formatCurrency(
          metrics.totalExpense
        )}), seu comprometimento está controlado em ${metrics.commitmentRate.toFixed(
          1
        )}%. Você tem ${FinancialEngine.formatCurrency(
          metrics.monthBalance
        )} disponível para investir ou reforçar sua reserva.`;
      }

      const data = await response.json();
      const steps = data.steps || [];
      const modelOutputStep = steps.find((s: any) => s.type === 'model_output');
      const text = modelOutputStep?.content?.[0]?.text;

      if (text) {
        return text;
      }

      return 'Análise financeira processada com sucesso com base nas movimentações do mês.';
    } catch (err) {
      console.error('Erro na comunicação com a API Gemini:', err);
      return `Seu superávit de ${FinancialEngine.formatCurrency(
        metrics.monthBalance
      )} mantém seu fluxo de caixa saudável. Recomendo manter suas despesas abaixo de 60% da renda.`;
    }
  }
}
