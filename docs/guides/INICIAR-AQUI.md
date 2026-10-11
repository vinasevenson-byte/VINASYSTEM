# VINA FINACE — correção operacional 1.3

## Diagnóstico confirmado no backup
- O Vercel só publica `apps/web/dist` (frontend Vite). `vercel.json` manda todos os caminhos para `index.html` e NÃO disponibiliza a API NestJS.
- Quando login e cadastro não conseguiam contatar a API, o frontend criava um token `demo_token` e exibia números fixos.
- No modo demonstração, ações de criação retornavam IDs fictícios, mas não gravavam dados; ao recarregar, as alterações desapareciam.
- O botão de novo lançamento depende de haver um perfil individual selecionado E uma conta cadastrada. `Visão Consolidada` é somente leitura para esse fluxo.

## Alterações neste pacote
- Remove o login automático simulado e o botão de demonstração.
- Remove respostas financeiras fictícias geradas pelo frontend.
- Erros de conexão explicam que os dados NÃO foram salvos.
- Seleciona automaticamente o perfil criado após resposta de sucesso da API.
- Aplica reforços no CSS do shell e restaura verificação estrita de CORS na API.
- NÃO inclui arquivos `.env`, credenciais, pasta `data/db` ou banco de dados do backup.

## Para deixar efetivamente operacional online
1. Provisionar PostgreSQL persistente numa hospedagem confiável e configurar `DATABASE_URL` na API.
2. Hospedar `apps/api` num serviço Node.js persistente (Railway/Render/VPS), com `JWT_SECRET` forte, `DATABASE_URL` e `WEB_ORIGIN=https://vinasystem-vert.vercel.app`.
3. Executar geração Prisma e migração contra o banco de dados de destino; certificar-se de que a API responde a `/api` com JSON nas rotas válidas.
4. Na Vercel do frontend, adicionar **VITE_API_URL=https://endereco-real-da-api** (sem /api no final) e fazer novo deploy.
5. Criar usuário, perfil, conta, receita, despesa; atualizar página e verificar persistência. Repetir com outro perfil para validar isolamento.
6. Antes de usar dados financeiros reais, concluir auditoria de segurança, autenticação, cookies HttpOnly/MFA, regras de isolamento e backups.

> O ZIP por si só NÃO ativa o backend na Vercel: é necessário implantá-lo e conectá-lo ao PostgreSQL.
> O banco original e as credenciais do backup não foram copiados. Se essas credenciais eram reais, recomendo trocá-las.
