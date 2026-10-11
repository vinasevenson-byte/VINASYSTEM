# VINA FINACE — Padrão Arquitetural e Regras Oficiais do Sistema

Este documento estabelece as **diretrizes arquiteturais obrigatórias**, a **organização estrutural de diretórios** e as **regras financeiras definitivas** que governam todas as versões e evoluções do **VINA FINACE**.

---

## 1. Organização Estrutural de Pastas (Padrão Monorepo)

A raiz do projeto deve permanecer **estritamente limpa**, contendo apenas manifestos de projeto e arquivos essenciais de configuração global.

```
VINASYSTEM/
├── apps/
│   ├── api/                 # Backend oficial (NestJS + Prisma Client + Serviços)
│   └── web/                 # Frontend SPA (React + TypeScript + Vite + CSS)
├── packages/
│   ├── database/            # Definições centrais de persistência e esquemas Prisma
│   └── shared/              # Motores matemáticos, tipos compartilhados e validações
├── api/                     # Funções Serverless (Edge / Vercel: /api/welcome, /api/config)
├── tests/                   # Suíte de testes automatizados (invariantes e financeiro diário)
├── scripts/                 # Scripts operacionais de banco de dados e utilitários
├── docs/                    # Documentação técnica e operacional completa
│   ├── architecture/        # Padrões arquiteturais e regras estruturais (este documento)
│   ├── guides/              # Guias operacionais e manuais de inicialização
│   ├── sql/                 # Scripts e dumps SQL estruturais
│   └── updates/             # Histórico cronológico e notas de release (v2.2 a v2.7+)
├── archives/                # Repositório de pacotes compactados (.zip) e backups históricos
├── .env.example             # Modelo de variáveis de ambiente
├── .gitignore               # Regras de exclusão do controle de versão Git
├── docker-compose.yml       # Orquestração de containers (PostgreSQL / Redis)
├── package.json             # Manifesto raiz com scripts dos workspaces NPM
├── README.md                # Visão geral do ERP, comandos e links
└── vercel.json              # Configuração de build e roteamento de borda da Vercel
```

### Regras de Localização de Arquivos:
- **Arquivos `.zip`**: Devem ser armazenados exclusivamente na pasta `archives/`. É proibido deixar arquivos compactados na raiz.
- **Documentos de atualização (`ATUALIZACAO-*.md`)**: Devem ser arquivados em `docs/updates/`.
- **Guias de uso e implantação**: Devem ficar em `docs/guides/`.
- **Scripts SQL avulsos**: Devem ficar em `docs/sql/`.

---

## 2. Regras Financeiras Obrigatórias (Valores Reais e Início Zerado)

Fica terminantemente proibida a inclusão de dados financeiros fictícios, saldos simulados, salários inventados ou despesas demonstrativas. O ERP opera exclusivamente com base em dados reais inseridos pelo usuário.

| Módulo / Item | Comportamento Obrigatório |
| :--- | :--- |
| **Saldo Bancário** | Inicia estritamente em **R$ 0,00** até que o usuário cadastre a conta e defina o saldo real. |
| **Salário** | Inicia em **R$ 0,00**. O agendamento é uma previsão e **não credita dinheiro automaticamente**; o saldo só se altera após confirmação do recebimento. |
| **Vale-Mercado** | Carteira própria com saldo acumulativo entre meses. Não se mistura com saldo bancário. Inicia em **R$ 0,00**. |
| **Vale-Combustível**| Carteira própria com saldo acumulativo entre meses. Não se mistura com saldo bancário. Inicia em **R$ 0,00**. |
| **Recargas de Benefícios** | Registradas com mês de referência (`YYYY-MM`) e unicidade por carteira para evitar recargas duplicadas no mesmo mês. |
| **Despesas** | Nenhum registro pré-fabricado ou inventado. |
| **Gráficos e Calendário**| Permanecem em estado vazio (`Empty State`) até que ocorram movimentações reais. |
| **Previsões Financeiras**| Projeções calculadas exclusivamente sobre compromissos pendentes e salários cadastrados. |
| **Contas Não Cadastradas**| Devem ser exibidas como **pendentes de configuração**, nunca como contas ativas com saldo zero fictício. |
| **Integridade da API**| A API nunca deve retornar confirmação de sucesso caso a gravação no banco de dados falhe. |

---

## 3. Diretrizes de Banco de Dados e Migrações

1. **Preservação de Dados Cadastrados**:
   - É estritamente proibido rodar rotinas de `seed` com valores monetários fictícios.
   - Migrações de banco devem ser sempre **incrementais**, apenas adicionando tabelas e colunas, preservando as contas e lançamentos reais cadastrados pelo usuário.
2. **Isolamento de Perfis (Multi-tenancy Familiar)**:
   - Toda consulta e escrita exige validação estrita de permissão de acesso ao perfil (`this.member(userId, profileId)`).
   - Não é permitida a criação de lançamentos na visão consolidada sem a seleção de um perfil individual.
3. **Bloqueio de Saldo Negativo em Benefícios**:
   - Compras em carteiras de benefícios usam transação atômica com bloqueio pessimista (`FOR UPDATE`) para impedir saldo negativo concorrente.

---

## 4. Padrões de Verificação e Homologação Contínua

Antes de qualquer commit e deploy, o sistema deve ser validado com os seguintes comandos:

```bash
# 1. Executar bateria de 17 testes de invariantes e integridade financeira
npm test

# 2. Compilar backend NestJS e validar tipagem estrita
npm run build:api

# 3. Compilar frontend React e validar bundle de produção
npm run build:web
```
