import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

export interface FinancialContext {
  profileName: string;
  totalLiquidBalance: Decimal;
  monthlyIncome: Decimal;
  monthlyExpense: Decimal;
  pendingPayablesNext30Days: Decimal;
  pendingPayablesNext90Days: Decimal;
  pendingReceivablesNext90Days: Decimal;
  openInvoiceAmount: Decimal;
  totalCardLimit: Decimal;
  goalsCount: number;
  totalSavedInGoals: Decimal;
}

export interface AdvisorResult {
  score: number;
  status: 'EXCELENTE' | 'ESTAVEL' | 'ATENCAO' | 'CRITICO';
  safeMonthlySpend: string;
  threeMonthSurplus: string;
  diagnosis: string;
  actionPlan: string[];
  aiGenerated: boolean;
}

@Injectable()
export class AdvisorService {
  private apiKey = process.env.GEMINI_API_KEY || '';

  async analyze(ctx: FinancialContext, userQuestion?: string): Promise<AdvisorResult> {
    // 1. Cálculo do motor financeiro matemático
    const netMonthlyOperating = ctx.monthlyIncome.minus(ctx.monthlyExpense);
    const threeMonthTotalIncome = ctx.monthlyIncome.times(3).plus(ctx.pendingReceivablesNext90Days);
    const threeMonthTotalObligations = ctx.monthlyExpense.times(3)
      .plus(ctx.pendingPayablesNext90Days)
      .plus(ctx.openInvoiceAmount);

    const projectedSurplus3M = ctx.totalLiquidBalance.plus(threeMonthTotalIncome).minus(threeMonthTotalObligations);

    // Margem de segurança de 15% para reserva de liquidez
    const safetyReserve = ctx.monthlyExpense.times(0.15);
    const safeMonthlySpend = ctx.totalLiquidBalance
      .plus(ctx.monthlyIncome)
      .minus(ctx.pendingPayablesNext30Days)
      .minus(ctx.openInvoiceAmount)
      .minus(safetyReserve);

    const safeSpendFormatted = safeMonthlySpend.isNegative() ? '0.00' : safeMonthlySpend.toFixed(2);
    const surplusFormatted = projectedSurplus3M.toFixed(2);

    let score = 75;
    let status: AdvisorResult['status'] = 'ESTAVEL';

    if (projectedSurplus3M.isNegative()) {
      score = 35;
      status = 'CRITICO';
    } else if (safeMonthlySpend.isNegative() || ctx.openInvoiceAmount.gt(ctx.monthlyIncome.times(0.6))) {
      score = 55;
      status = 'ATENCAO';
    } else if (ctx.totalSavedInGoals.gt(ctx.monthlyExpense.times(3)) && netMonthlyOperating.gt(0)) {
      score = 95;
      status = 'EXCELENTE';
    }

    // 2. Tentativa de enriquecimento via Gemini API com timeout rígido
    const prompt = `Você é o Consultor Financeiro Inteligente do BOMA Finance.
Analise os seguintes dados financeiros do perfil "${ctx.profileName}":
- Saldo líquido disponível em contas: R$ ${ctx.totalLiquidBalance.toFixed(2)}
- Renda operacional mensal: R$ ${ctx.monthlyIncome.toFixed(2)}
- Despesas operacionais mensais: R$ ${ctx.monthlyExpense.toFixed(2)}
- Contas a pagar nos próximos 30 dias: R$ ${ctx.pendingPayablesNext30Days.toFixed(2)}
- Contas a pagar nos próximos 90 dias: R$ ${ctx.pendingPayablesNext90Days.toFixed(2)}
- Faturas de cartão de crédito em aberto: R$ ${ctx.openInvoiceAmount.toFixed(2)}
- Valor poupado em metas financeiras: R$ ${ctx.totalSavedInGoals.toFixed(2)}
- Margem segura calculada para gastar este mês: R$ ${safeSpendFormatted}
- Superávit projetado para 3 meses: R$ ${surplusFormatted}

Pergunta do usuário: "${userQuestion || 'Quanto posso gastar este mês sem comprometer minhas contas dos próximos 3 meses?'}"

Forneça uma resposta executiva estruturada com:
1. Resposta direta à pergunta com o valor máximo sugerido.
2. Diagnóstico da liquidez e comprometimento de renda.
3. Três recomendações práticas em tópicos.
Responda em português brasileiro profissional.`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === 'string') {
          return {
            score,
            status,
            safeMonthlySpend: safeSpendFormatted,
            threeMonthSurplus: surplusFormatted,
            diagnosis: text,
            actionPlan: [
              `Limite de gastos seguros para o mês: R$ ${Number(safeSpendFormatted).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
              `Compromissos futuros mapeados para os próximos 90 dias: R$ ${Number(ctx.pendingPayablesNext90Days.toFixed(2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
              `Faturas de cartão sob controle com quitação programada.`
            ],
            aiGenerated: true
          };
        }
      }
    } catch {
      // Fallback gracioso para o motor analítico nativo
    }

    // Fallback nativo determinístico
    const defaultDiagnosis = `Com base na consolidação financeira do perfil "${ctx.profileName}", seu saldo líquido atual é de R$ ${Number(ctx.totalLiquidBalance.toFixed(2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Considerando seus compromissos imediatos (R$ ${Number(ctx.pendingPayablesNext30Days.toFixed(2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) e faturas de cartão (R$ ${Number(ctx.openInvoiceAmount.toFixed(2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}), você possui uma margem segura de gasto discricionário de aproximadamente R$ ${Number(safeSpendFormatted).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} neste mês sem comprometer a liquidez dos próximos 90 dias.`;

    return {
      score,
      status,
      safeMonthlySpend: safeSpendFormatted,
      threeMonthSurplus: surplusFormatted,
      diagnosis: defaultDiagnosis,
      actionPlan: [
        `Mantenha os gastos variáveis dentro do teto seguro de R$ ${Number(safeSpendFormatted).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
        `Monitore os compromissos dos próximos 90 dias (total de R$ ${Number(ctx.pendingPayablesNext90Days.toFixed(2)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`,
        `Destine o excedente de liquidez (superávit projetado de R$ ${Number(surplusFormatted).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) para reforço de reserva ou metas.`
      ],
      aiGenerated: false
    };
  }
}
