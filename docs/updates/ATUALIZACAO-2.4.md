# VINA FINACE — Atualização 2.4 / 2.5: Meu Caixa Pessoal & Benefícios Corporativos

Base: atualização 2.3. Pacote integral, substitui e expande as versões anteriores.

## Implementações Principais

- **Meu Caixa Pessoal & Benefícios Corporativos:**
  - Novo painel financeiro diário acessível pelo menu lateral como tela inicial padrão.
  - Separação e unificação inteligente de recursos:
    - **Saldo Bancário:** Contas correntes, poupanças e dinheiro em espécie.
    - **Saldo Vale-Mercado:** Benefícios corporativos de alimentação/refeição (Alelo, VR, Sodexo).
    - **Saldo Vale-Combustível:** Benefícios corporativos de transporte e combustível (Ticket Log, Mobilidade).
    - **Recursos Disponíveis:** Soma unificada de todo o poder de compra (bancos + vales).
- **Atalhos Operacionais Rápidos:**
  - `[ Adicionar entrada ]`: Abertura ágil de modal de receita com pré-seleção.
  - `[ Registrar saída ]`: Abertura ágil de modal de despesa.
  - `[ + Nova conta bancária ]`: Cadastro assistido com permissão de saldo inicial negativo (cheque especial / saldo devedor).
  - `[ + Cadastrar benefício ]`: Cadastro assistido com pré-configuração para vales.
- **Gastos Diários & Histórico Gráfico:**
  - Seletor de período dinâmico (últimos 7 dias / últimos 14 dias).
  - Gráfico de barras responsivo com indicação de dia de maior gasto, dia de menor gasto e média diária.
- **Previsão de Caixa (Projeção Financeira):**
  - Saldo bancário atual.
  - (+) Recebimentos previstos (contas a receber + lançamentos agendados).
  - (−) Despesas previstas (contas a pagar + despesas agendadas).
  - (=) Saldo bancário projetado.
- **Validações e Correções Operacionais:**
  - `AccountDto`: Regex atualizado (`/^-?\d{1,16}(\.\d{1,2})?$/`) permitindo saldos iniciais negativos no backend e formulário web.
  - Desbloqueio da visão consolidada: Ao clicar para adicionar conta ou lançamento na visão familiar ("Todos os perfis"), o sistema seleciona automaticamente o perfil individual ativo sem travar a interface.
  - Seleção de contas nos lançamentos exibe o saldo atual em tempo real: `Conta X (Saldo Atual: R$ ...)`.
  - Conformidade estrita: 8/8 testes de invariantes aprovados, zero uso de `localStorage` (somente `sessionStorage`).
