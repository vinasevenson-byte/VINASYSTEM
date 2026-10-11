# VINA FINACE 2.6 — Versão mobile responsiva

Base: código da atualização 2.4. Esta entrega altera a apresentação web React para celulares sem duplicar dados nem criar um backend separado.

## O que mudou
- Barra inferior fixa: Início, Meu Caixa, Lançar, Extrato e Mais.
- O item Lançar chama o fluxo real `handleNewEntry()` já existente.
- Menu completo abre em gaveta lateral com escurecimento do restante da tela e fecha ao escolher o módulo.
- Seleção de perfil acessível no cabeçalho do celular.
- Indicadores organizados em duas colunas; formulários com campos maiores e rolagem em telas pequenas.
- Melhoria de tabelas com rolagem horizontal, respeito à área segura de iPhone e responsividade sem interferir no desktop.

## Executar
1. Extraia o ZIP e abra a pasta `vina_operacional` no VS Code.
2. Na pasta raiz, execute `npm install` e depois `npm run build:web`.
3. Configure o endereço verdadeiro da API com `VITE_API_URL` conforme `.env.example`.
4. Execute `npm run dev:web` e abra a URL exibida no celular na mesma rede, quando possível.
5. Verifique viewport 360px, 390px e 430px no DevTools.
6. Faça login, selecione perfil, cadastre conta, abra Lançar pela barra inferior e confirme gravação real e persistência no PostgreSQL.

## Limitações e dependências
- É um layout web mobile responsivo, não um APK nativo nem um app publicado nas lojas.
- Os dados de vales e recargas mensais acumulativas pertencem ao próximo desenvolvimento operacional; não foram criados nesta entrega.
- A versão mobile usa a mesma API e banco da versão desktop. Se a API não estiver publicada/configurada, o salvamento continuará indisponível.
- Oito testes estáticos existentes passaram. A compilação web não pôde ser concluída neste ambiente porque não havia dependências React/React DOM/Lucide instaladas; os erros de tipos decorrem disso. Compile após `npm install`.
