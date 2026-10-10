# BOMA Finance — Gestão Financeira Pessoal, Familiar e Multiperfis

> **Versão 1.0** — Plataforma financeira moderna, independente e multiperfis construída com React, TypeScript, Node.js, Tailwind CSS e PostgreSQL.

---

## 🏛️ Visão do Sistema

O **BOMA Finance** é uma plataforma financeira de alta fidelidade desenhada sob o conceito de bancos digitais modernos (referência visual *Fiscaly* / *Finestra*). 

Sua principal característica é a **Arquitetura Multiperfis**: cada perfil financeiro (*Pessoal*, *Familiar*, *Patrimônio*, *Projetos*) possui suas próprias contas, despesas, faturas de cartão e metas, com a capacidade de alternar instantaneamente para a **Visão Consolidada** — eliminando transferências internas e prevenindo qualquer duplicação contábil.

---

## 💎 Regras Fundamentais do Motor Financeiro (`@boma/shared`)

1. **Eliminação de Transferências Internas**: Uma transferência entre dois perfis autorizados (ex: Pessoal para Familiar) altera os saldos individuais, mas gera **R$ 0,00 de variação na receita ou despesa consolidada**.
2. **Regra de Ouro dos Cartões de Crédito**: A compra parcelada ou à vista é lançada como despesa na competência da fatura. A quitação da fatura na conta bancária é tratada como liquidação de passivo, **nunca duplicando a despesa** no fluxo de caixa ou DRE.
3. **Saldos Disponíveis vs Projetados**: O saldo real em conta reflete a liquidez imediata, enquanto o projetado incorpora vencimentos futuros até o final do período.
4. **Índice de Comprometimento Real**: Aponta a porcentagem da renda consumida por custos operacionais e a capacidade líquida de poupança/investimento.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (recomendado Node.js 20 ou 24)
- npm 10+

### 1. Iniciar a Aplicação Web (Frontend React)
```bash
cd apps/web
npm install
npm run dev
```
Acesse no navegador: **`http://localhost:3000`**

### 2. Iniciar a API REST (Backend Node.js)
```bash
cd apps/api
npm install
npm run dev
```
API disponível em: **`http://localhost:4000`**

---

## 📁 Estrutura do Repositório

```
boma-finance/
├── apps/
│   ├── web/                     # Frontend React 18 + Vite + Tailwind CSS + Recharts
│   │   ├── src/
│   │   │   ├── components/      # Sidebar, TopHeader, MetricCards, Modais
│   │   │   ├── contexts/        # FinanceContext (Estado global reativo)
│   │   │   └── views/           # 12 Telas completas (Dashboard, Cartões, DRE, Perfis, IA...)
│   └── api/                     # Backend Node.js Express + REST API
│       └── src/                 # Endpoints REST e cálculo dinâmico
├── packages/
│   ├── shared/                  # Motor de cálculo (FinancialEngine) e DTOs tipados
│   └── database/                # Schema completo PostgreSQL com Prisma (27 tabelas)
└── package.json                 # Monorepo workspaces
```

---

## 🔒 Segurança e Banco de Dados

- **PostgreSQL**: Modelagem relacional completa com 27 tabelas mapeadas em `packages/database/prisma/schema.prisma`.
- **Row-Level Security (RLS)**: Isolamento estrito por `profile_id`.
- **Padrão OWASP**: Auditoria contábil imutável em `audit_logs` e autenticação multifator (MFA/Passkeys).
