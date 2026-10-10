# VINA FINACE — Atualização 2.3

Base: atualização 2.2. Pacote integral, substitui a 2.2; não é um patch isolado.

## Implementações

- **Categorias financeiras por perfil:** GET/POST `/api/profiles/:id/categories`, com acesso vinculado ao perfil, distinção entre RECEITA/DESPESA e impedimento de duplicidade por nome+tipo.
- **Categorias no lançamento:** escolha opcional de categoria compatível com receita ou despesa; lançamentos gravados na API real.
- **Edição de lançamento:** PATCH `/api/entries/:id` para receitas/despesas, valida conta e categoria no mesmo perfil, bloqueia edição unilateral de transferências e lançamentos conciliados e registra trilha de auditoria.
- **Central de Lançamentos:** botões de Categoria, Novo lançamento e Editar (apenas lançamentos individuais não conciliados).
- **Testes estáticos:** dois testes acrescentados aos seis preexistentes.

## Implementação / testes

1. Configure `.env` para API e frontend; não inclua credenciais em repositórios.
2. `npm install` na raiz.
3. `npm run db:generate` e `npm run db:migrate` com PostgreSQL operacional.
4. `npm run build:web`, `npm run build:api`, `npm test`.
5. Inicie backend e frontend e valide login, perfil, conta, categoria, lançamento, edição e persistência após recarregar.

## Limitações

- A execução completa com PostgreSQL e o deploy **não** foram homologados aqui.
- A tentativa de compilar com dependências reaproveitadas de ambiente anterior falhou devido a pacotes de definição de tipos ausentes. Faça uma instalação limpa das dependências.
- Cartões, compromissos, metas e orçamentos anteriores são preservados, mas não foram ampliados neste pacote.
- Não inserir dados financeiros sensíveis até confirmar HTTPS, servidor, persistência e backups.
