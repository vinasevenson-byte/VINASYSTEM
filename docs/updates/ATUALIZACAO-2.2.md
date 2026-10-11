# VINA FINACE — Pacote 2.2 de correções operacionais

Base: pacote 2.1 recebido na conversa.

## Alterações implementadas
- A ação **Novo lançamento** na Central de Lançamentos não fica mais bloqueada sem conta ou perfil: utiliza o fluxo guiado já existente no dashboard.
- Transferências entre perfis agora carregam as contas reais do perfil de destino, mediante autorização da API, dispensando UUID digitado manualmente.
- Transferência valida que a conta escolhida foi carregada da API autorizada.
- Formulários exibem aviso de confirmação após a resposta de sucesso da API; em falha, não exibem confirmação.
- Etiqueta da sidebar atualizada para versão 2.2.

## Verificações
- `npm test`: 6/6 verificações estáticas aprovadas.
- `npm ci` / build: não concluídos devido a tempo excedido no ambiente. Portanto este pacote ainda requer build, API, migrações e testes com PostgreSQL antes do uso real.

## Implantação necessária
1. Configure PostgreSQL e `DATABASE_URL` da API, com segredo JWT próprio.
2. Execute instalação de dependências, geração do Prisma e migrações em ambiente com acesso aos pacotes.
3. Publique a API Node.js acessível via HTTPS e configure CORS conforme origem real da web.
4. Em Vercel, configure `VITE_API_URL` para a origem da API, faça novo build e deploy.
5. Teste cadastro, login, perfil, conta, lançamento, recarregamento da página, transferência e fatura.

Não adicione informações pessoais reais antes de conferir a persistência e a segurança do ambiente. Nenhum banco ou deploy foi realizado neste pacote.
