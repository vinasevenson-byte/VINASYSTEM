# VINA FINACE — Atualização 2.5: Meu Financeiro Diário, Vales Acumulativos & Encargos de Cartão

## 🚀 O que há de novo na Versão 2.5

O **VINA FINACE** evoluiu para a versão **2.5**, consolidando o ERP financeiro pessoal e familiar com rotinas operacionais práticas, controle de saldo acumulativo de benefícios, visualização de cheque especial e calculadora regulamentar de atraso de cartão.

---

### 1. Painel "Meu Financeiro Diário"
- **Visão consolidada em tempo real**:
  - **Dinheiro Disponível nas Contas**: total em dinheiro bancário e espécie, com suporte a saldo negativo/cheque especial.
  - **Vale-Mercado & Vale-Combustível**: saldos dos cartões de benefício destacados individualmente.
  - **Recursos Disponíveis**: soma total do dinheiro em contas mais vales acumulados.
  - **Recebido no Mês**: soma das entradas já realizadas no mês corrente.
  - **Gasto no Mês**: total de despesas e compras já quitadas no mês.
  - **A Pagar nos Próximos 30 Dias**: total de faturas e compromissos pendentes.
  - **Saldo Previsto no Final do Mês**: projeção de caixa com alerta de risco caso o saldo fique negativo.
- **Ações Rápidas em 1 Clique**:
  - `[ Receber Salário ]`: atalho para crédito de salário/pró-labore direto na conta bancária.
  - `[ Registrar Gasto ]`: lançamento rápido de saída por conta, categoria e forma de pagamento.
  - `[ Recarregar Vale ]`: recarga dos cartões de benefícios com saldo acumulativo.
  - `[ Nova Conta / Vale ]`: cadastro imediato de novas contas bancárias ou benefícios.
  - `[ Taxa de Atraso Cartão ]`: simulador regulamentar CDC/BACEN de encargos por atraso de fatura.

---

### 2. Regra dos Benefícios com Saldo Acumulativo
- Benefícios de **Vale-Mercado/Alimentação** e **Vale-Combustível/Mobilidade** possuem saldo cumulativo mês a mês:
  - O valor não utilizado no mês não expira e segue somado ao saldo do mês seguinte.
  - Recargas de benefícios são adicionadas à carteira correspondente sem debitar o saldo das contas bancárias.
  - Gastos pagos com vale debitam exclusivamente a carteira de benefícios, mantendo o caixa bancário protegido e fiel.

---

### 3. Comportamento Diário dos Gastos & Previsões Multitemporais
- **Análise Diária de Gastos**:
  - Seletor de período: **7 dias**, **14 dias**, **15 dias** ou **30 dias**.
  - Gráfico de barras com dias da semana (`Seg`, `Ter`, `Qua`, `Qui`, `Sex`, `Sáb`, `Dom`).
  - Destaque estatístico do **Dia de Maior Gasto**, **Dia de Menor Gasto** e **Média Diária**.
- **Previsões Futuras Multitemporais**:
  - Horizontes calculados automaticamente: **Hoje**, **7 dias**, **15 dias**, **30 dias**, **60 dias** e **90 dias**.
  - **Banner de Alerta de Caixa**: caso qualquer horizonte fique negativo, o sistema exibe um aviso preventivo de risco de inadimplência ou uso de cheque especial.

---

### 4. Suporte Completo a Saldos Negativos (Cheque Especial)
- Contas bancárias agora suportam e exibem com clareza saldos negativos (ex.: `- R$ 150,00`).
- Badges visuais indicando **"Saldo Devedor / Cheque Especial"** quando o valor estiver abaixo de zero.
- Formatação monetária padronizada sem sinal duplo ou inconsistência visual.

---

### 5. Simulador Regulamentar de Atraso de Cartão (CDC & BACEN)
- Endpoint dedicado `@Get('cards/invoices/:id/late-fees')` e modal interativo no frontend.
- Cálculo oficial dos encargos de fatura vencida:
  - **Multa Moratória de 2%** fixa (Art. 52 § 1º do Código de Defesa do Consumidor).
  - **Juros de Mora de 1% a.m.** pro-rata die (0,0333% ao dia).
  - **Juros de Crédito Rotativo** configurável (padrão de mercado ~12% a.m.) pro-rata die.
  - **IOF** regulamentar (0,38% fixo + 0,0082% ao dia).
  - Demonstrativo item a item com total de encargos e valor total atualizado a pagar.

---

### 6. Integridade Técnica e Verificações
- **8 de 8 testes invariantes automatizados aprovados**.
- **Frontend Vite & TypeScript**: compilação 100% limpa com zero erros.
- **Backend NestJS & TypeScript**: compilação 100% limpa com zero erros.
- **Sessão estrita em sessionStorage**: `localStorage` proibido no frontend operacional.
