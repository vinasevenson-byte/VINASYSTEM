# VINA FINACE — Pacote operacional 2.7 (Mobile + Diário)

## Entregue no código

- Tela **Meu Financeiro Diário** como página inicial do web mobile, preservando o desktop.
- Resumo do saldo bancário e do dinheiro em espécie, entradas confirmadas e saídas confirmadas do mês.
- Criação de carteiras de benefício (mercado, combustível e outras), com saldo de abertura digitado pelo titular (campo inicia vazio) e manutenção do saldo entre os meses.
- Recargas e compras do benefício gravadas em transações próprias; recarga identificada pelo mês com unicidade por carteira; compra impedida quando o saldo for insuficiente. Não existe recarga automática fictícia.
- Cadastro de salários mensais *previstos*, com dia, valor e conta de destino. A programação não credita dinheiro. O recebimento é feito pelo botão Entrada e só então aumenta o saldo real.
- Painel de despesas diárias reais (gastos bancários e com benefícios), incluindo calendário de dias sem lançamentos, filtros 7/15/30/90 dias e extremos dos dias com movimento.
- Projeção bancária 7/15/30/60/90 dias com receitas agendadas e compromissos futuros registrados; não inclui benefícios no saldo bancário.
- Estados vazios sem salários, contas, extratos, gráficos ou benefícios simulados.
- Fluxo preservado para registrar entradas, despesas e contas usando as operações já existentes no backend.

## Atenção: trabalho não concluído

Esta entrega NÃO foi compilada nem executada com PostgreSQL real neste ambiente. Os 17 testes executados são estáticos e não garantem gravação efetiva no servidor. São necessárias migrações, execução real e testes de aceitação antes do uso com dinheiro de verdade. O salário mensal programado e uma entrada prevista cadastrada separadamente podem aparecer duas vezes na previsão; não registre ambos para o mesmo pagamento até existir vinculação por ocorrência.

O formulário de pagamento dividido PIX + vale, a exportação de extratos de benefícios, fechamento diário e relatórios familiares de benefícios também ficam pendentes.

## Instalação sem perda de dados

1. **Faça backup verificável do PostgreSQL existente** antes de modificar o esquema; não use `db:push` com opções de reset.
2. Extraia este pacote e configure `apps/api/.env` com `DATABASE_URL`, `JWT_SECRET` e demais variáveis da implantação real. Configure `apps/web/.env` com `VITE_API_URL` correto.
3. Instale as dependências com `npm ci` em ambiente com rede (não foi possível executar offline aqui).
4. Execute `npm run db:generate`, inspecione uma migração Prisma que **apenas acrescente** as tabelas `BenefitWallet`, `BenefitMovement`, `IncomeSchedule`; nunca aceite resetar ou eliminar dados.
5. No desenvolvimento, use `npx prisma migrate dev --name daily_finance_27 --schema apps/api/prisma/schema.prisma` (ajuste o caminho a partir da raiz). Em produção, aplique uma migração revisada via `npx prisma migrate deploy --schema apps/api/prisma/schema.prisma`.
6. Compile `npm run build:web` e `npm run build:api`. Execute API e frontend. Verifique `/api/health`.
7. Teste login, perfil, conta com saldo real, entrada de salário, vale e recarga, compra no vale, gasto no PIX, refresh da página e saldos.
8. Publique a API e ajuste `VITE_API_URL` na Vercel; só então publique o frontend.

**Não** executar seed financeiro, limpar tabelas, recriar perfis ou importar dados de demonstração. Não repetir reset do banco.

## Critérios de aceite

- Nenhuma ação anuncia sucesso sem confirmação da API.
- Após F5, saldo do caixa, carteiras, recargas e compras continuam no PostgreSQL.
- Conta não cadastrada é exibida como pendente (não como banco fictício zerado).
- Vale-mercado e vale-combustível acumulam saldo entre meses e não contam como dinheiro bancário.
- Gastos de benefício aparecem na série de gastos diários.
- Usuário sem permissão recebe 403 em consultas e gravações de perfis alheios.
- No consolidado não há criação de lançamento sem perfil individual.
- Nenhuma migração apaga registros existentes.
