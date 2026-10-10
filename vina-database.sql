-- ====================================================================
-- VINA FINACE — Consultas Rápidas no PostgreSQL (DBCode / VS Code)
-- Conexão: postgresql://boma:boma_password@localhost:5432/boma_finance
-- ====================================================================

-- 1. Usuários e credenciais administrativas
SELECT id, name, email, created_at FROM users;

-- 2. Perfis financeiros (Pessoal, Familiar)
SELECT id, name, description, color, created_at FROM financial_profiles;

-- 3. Contas bancárias e saldos cadastrados
SELECT id, profile_id, name, opening_balance, type, created_at FROM accounts;

-- 4. Extrato de lançamentos com Perfil e Conta
SELECT 
    e.id, 
    e.occurred_at, 
    p.name AS perfil, 
    a.name AS conta, 
    e.type, 
    e.status, 
    e.amount, 
    e.description 
FROM entries e
LEFT JOIN financial_profiles p ON e.profile_id = p.id
LEFT JOIN accounts a ON e.account_id = a.id
ORDER BY e.occurred_at DESC
LIMIT 50;

-- 5. Cartões de crédito cadastrados e limites
SELECT id, name, "limit", closing_day, due_day, color FROM credit_cards;

-- 6. Faturas de cartão de crédito
SELECT id, card_id, reference_month, total_amount, status, closing_date, due_date FROM invoices;

-- 7. Compromissos (Contas a Pagar e a Receber)
SELECT id, profile_id, type, status, description, amount, due_date, entity_name FROM commitments ORDER BY due_date ASC;

-- 8. Metas financeiras e progresso
SELECT id, name, target_amount, current_amount, status FROM goals;

-- 9. Planejamento orçamentário por categoria
SELECT id, reference_month, category_name, planned_amount FROM budgets;

-- 10. Trilha de auditoria (Log de acessos e ações)
SELECT id, user_id, action, entity, entity_id, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 20;
