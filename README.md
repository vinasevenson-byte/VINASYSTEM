# VINASYSTEM — BOMA Finance

> **BOMA Finance — Gestão Financeira Pessoal, Familiar e Multiperfis**  
> **Versão 1.1** — Plataforma financeira moderna, segura e multiperfis construída com React 19, TypeScript, Node.js (NestJS), Tailwind CSS e PostgreSQL com Prisma ORM.

[![Production Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vinasystem-vert.vercel.app/)
[![Invariants Tests](https://img.shields.io/badge/Invariants_Tests-6%2F6_Passing-success?style=for-the-badge)](tests/invariants.test.cjs)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)](#)

---

## 🌐 Deploy em Produção

A interface web está publicada e acessível em:
👉 **[https://vinasystem-vert.vercel.app/](https://vinasystem-vert.vercel.app/)**

---

## 🏛️ Visão do Sistema

O **BOMA Finance** é uma plataforma financeira de alta fidelidade desenhada sob o conceito de bancos digitais modernos (referência visual *Fiscaly* / *Finestra*). 

Sua principal característica é a **Arquitetura Multiperfis**: cada perfil financeiro (*Pessoal*, *Familiar*, *Patrimônio*, *Investimentos*, etc.) possui suas próprias contas, despesas, faturas de cartão e metas, com a capacidade de alternar instantaneamente para a **Visão Consolidada** — eliminando transferências internas e prevenindo qualquer duplicação contábil.

---

## 🎯 Roadmap de Entregas Homologadas (100% Concluído)

### 1. Homologação Real e Stack Unificada
- **PostgreSQL 18** rodando em banco dedicado `boma_finance`.
- **Prisma ORM** com schema relacional robusto (`packages/database/prisma/schema.prisma`).
- **NestJS REST API** na porta `3001` com injeção de dependência via serviço desacoplado `Db`.
- **React 19 + Vite** com interface responsiva, ícones Lucide e gráficos interativos.
- Validação ponta a ponta: cadastro, login, contas bancárias, lançamentos e dashboard dinâmico.

### 2. Segurança de Produção
- **Trilha de Auditoria Imutável (`AuditLog`)**: Registro em banco de tentativas de login (sucesso/falha), criação de perfis, contas, lançamentos e movimentações.
- **Proteção Contra Força Bruta (`RateLimiter`)**: Bloqueio de IP após tentativas repetidas de login com retorno HTTP `429 Too Many Requests`.
- **Gestão Segura de Sessão**: Armazenamento estrito em `sessionStorage` (sem exposição em `localStorage`).
- **Autenticação JWT**: Bearer tokens com validação estrita de integridade e formato.

### 3. Gestão Multiperfis Completa
- **Controle de Acesso Baseado em Papéis (RBAC)** por perfil:
  - `OWNER`: Controle total e delegação de membros.
  - `MANAGER`: Gestão financeira e lançamentos.
  - `EDITOR`: Inclusão e edição de movimentações.
  - `VIEWER`: Apenas visualização de relatórios.
- **Grupos de Consolidação Customizados (`ConsolidationGroup`)**: Agrupamento flexível de perfis (ex: "Consolidado Família", "Consolidado Negócios").
- **Isolamento de Dados**: Nenhuma operação ou leitura cruza fronteiras de perfis não autorizados.

### 4. Motor Financeiro Avançado
- **Ciclo de Vida de Lançamentos**:
  - `SCHEDULED` (Previsto): Compõe saldo projetado sem impactar caixa imediato.
  - `POSTED` (Realizado): Compõe o saldo realizado real.
  - `VOID` (Estornado): Excluído integralmente dos cálculos de fluxo de caixa e resultados.
- **Reconciliação Bancária (`reconciled`)**: Rastreamento com carimbo de data/hora (`reconciledAt`).
- **Eliminação Absoluta de Transferências Internas**: Uma transferência entre perfis tem efeito contábil nulo (R$ 0,00) no consolidado global.

### 5. Cartões de Crédito e Faturas Inteligentes
- **Modelagem Relacional de Cartões**: Tabelas `CreditCard`, `Invoice` e `CardPurchase`.
- **Faturas Mensais Dinâmicas**: Geração automática por mês de referência (`YYYY-MM`) com dias de fechamento e vencimento.
- **Parcelamento Inteligente**: Divisão automática de compras em até 48x distribuídas nas faturas dos meses subsequentes.
- **Limite Disponível em Tempo Real**: Subtração automática do saldo devedor e restituição do limite mediante pagamentos.
- **Quitação Sem Duplicidade Contábil**: O pagamento de fatura debita a conta bancária como liquidação de passivo, prevenindo dupla contagem no DRE.

### 6. Gestão de Compromissos (Contas a Pagar & Receber)
- **Obrigações e Créditos**: Cadastro de contas a pagar e a receber com data de vencimento, credor/beneficiário, categoria e status (Pendente / Liquidado).
- **Liquidação Integrada**: A quitação do compromisso gera automaticamente o lançamento contábil correspondente na conta bancária selecionada.

### 7. Metas Financeiras e Aportes
- **Acompanhamento de Objetivos**: Metas de curto, médio e longo prazo (Reserva de Emergência, Imóvel, Viagem) com cálculo percentual de progresso em tempo real.
- **Aportes Rápidos**: Integração opcional com débito em conta corrente.

### 8. Planejamento Orçamentário por Categoria
- **Tetos de Gastos Mensais**: Configuração de orçamentos por categoria com monitoramento em tempo real do gasto realizado e percentual consumido.

### 9. Projeção de Fluxo de Caixa e Exportação
- **Visão Temporal**: Análise de receitas, despesas e compromissos futuros com horizonte de projeção.
- **Exportação de Dados**: Download instantâneo de extratos contábeis completos em formato CSV.

### 10. BOMA Inteligente · Consultor Financeiro com IA (Gemini API)
- **Diagnóstico em Tempo Real**: Cálculo de Score de Saúde Financeira (0-100), margem segura de gastos para o mês e superávit projetado para 90 dias.
- **IA Generativa Conectada**: Integração com a API do Google Gemini com fallback determinístico local para consultoria executiva.

---

## 💎 Regras Fundamentais do Motor Financeiro

1. **Eliminação de Transferências Internas**: Uma transferência entre dois perfis autorizados (ex: Pessoal para Familiar) altera os saldos individuais, mas gera **R$ 0,00 de variação na receita ou despesa consolidada**.
2. **Regra de Ouro dos Cartões de Crédito**: A compra parcelada ou à vista é lançada como despesa na competência da fatura. A quitação da fatura na conta bancária é tratada como liquidação de passivo, **nunca duplicando a despesa** no fluxo de caixa ou DRE.
3. **Saldos Disponíveis vs Projetados**: O saldo real em conta reflete a liquidez imediata, enquanto o projetado incorpora vencimentos futuros até o final do período.
4. **Índice de Comprometimento Real**: Aponta a porcentagem da renda consumida por custos operacionais e a capacidade líquida de poupança/investimento.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 20+ ou 24+
- npm 10+

### Passo a Passo

```powershell
# 1. Iniciar o servidor PostgreSQL local
node scripts/db.cjs

# 2. Gerar o cliente Prisma e sincronizar tabelas
npm.cmd run db:generate
npm.cmd run db:push

# 3. Iniciar a API REST (NestJS - porta 3001)
npm.cmd run dev:api

# 4. Iniciar o Frontend Web (Vite/React - porta 5173)
npm.cmd run dev:web
```

Acesse localmente em: **`http://localhost:5173`**

---

## 🧪 Testes de Invariantes e Integridade

O projeto conta com suíte de testes estáticos e de invariantes contábeis:

```powershell
npm.cmd test
```

Resultado verificado:
- ✔ Perfil protegido em consultas e gravações
- ✔ Transferência exige autorização dos dois perfis e atomicidade
- ✔ Transferências são excluídas de receitas e despesas
- ✔ Chaves de integridade ligam lançamentos a contas no mesmo perfil
- ✔ Sessão não é persistida em localStorage
- ✔ Cabeçalho Authorization exige Bearer estrito
- **Total: 6/6 aprovados (100%)**

---

## 📦 Build e Deploy Vercel

### Build de Produção
```powershell
npm.cmd run build
```

### Configurações no Vercel
- **Framework**: `Vite`
- **Build Command**: `npm run build:web`
- **Output Directory**: `apps/web/dist`
- **Variáveis de Ambiente**:
  - `VITE_API_URL`: URL base da API backend (ex: `https://api.seudominio.com`). Se omitido, utiliza as rotas relativas `/api`.
