# VINA FINACE — ativação dos cadastros reais

## Importante
O frontend Vercel isolado NÃO salva dados: é obrigatório hospedar a API NestJS e o PostgreSQL. O sistema não tem salvamento offline.

## Backend
1. Hospede `apps/api` em um serviço Node.js que suporte processo persistente (por exemplo Railway/Render).
2. Configure no serviço da API as variáveis `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN` e `PORT`. Use como origem o endereço HTTPS real do frontend.
3. Execute `npm install`, `npm run db:generate` e migrações Prisma antes de iniciar a API; confirme que existe conexão com o banco.
4. Na Vercel, crie `VITE_API_URL` com o endereço público HTTPS DA API (sem o sufixo /api) e publique novamente.
5. Abra o sistema, cadastre-se, crie um perfil individual, uma conta e um lançamento. Atualize a página: o registro deve permanecer. Se não permanecer, não use dados reais.

## Botão Novo Lançamento
O botão agora conduz ao cadastro de perfil, ao cadastro de conta ou ao formulário. No consolidado, solicita um perfil individual.

## Segurança
Os tokens ainda são guardados na sessão do navegador; endurecimento de segurança, backups, proteção contra abuso e testes ponta a ponta são pendentes antes de uso com dados pessoais sensíveis.
