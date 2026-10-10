import React from 'react';
import { Users, Shield, UserPlus, CheckCircle2, Lock, Eye, FileText, Settings2 } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

export const ProfilesView: React.FC = () => {
  const { profiles, accounts, transactions, setActiveProfileId, activeProfileId } = useFinance();

  const roles = [
    {
      role: 'Administrador principal',
      permission: 'Gerencia usuários, perfis e dados autorizados em todo o sistema.',
      badge: 'Acesso Total',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      role: 'Gestor de perfil',
      permission: 'Administra integralmente um perfil financeiro específico (contas, cartões e metas).',
      badge: 'Gestão Direta',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      role: 'Operador',
      permission: 'Registra e edita movimentações, anexos e lançamentos permitidos.',
      badge: 'Operação',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      role: 'Consulta',
      permission: 'Visualiza dados, extratos e relatórios analíticos sem permissão de edição.',
      badge: 'Somente Leitura',
      badgeColor: 'bg-slate-100 text-slate-800',
    },
    {
      role: 'Auditor',
      permission: 'Consulta histórico contábil, trilha de auditoria e registros de alterações.',
      badge: 'Auditoria',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Perfis Financeiros & Permissões</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Arquitetura Multiperfis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cada perfil possui suas próprias contas, despesas, cartões e patrimônio isolados, permitindo visualização consolidada com eliminação automática de duplicidades.
          </p>
        </div>

        <button
          onClick={() => alert('Modal para criação de novo perfil financeiro aberto.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Perfil</span>
        </button>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => {
          const profileAccounts = accounts.filter((a) => a.profileId === profile.id);
          const totalBalance = profileAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
          const txCount = transactions.filter((t) => t.profileId === profile.id).length;
          const isSelected = activeProfileId === profile.id;

          return (
            <div
              key={profile.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-4 h-4 rounded-full ring-4 ring-slate-100"
                    style={{ backgroundColor: profile.color }}
                  />
                  <h3 className="font-bold text-slate-900 text-base">{profile.name}</h3>
                </div>
                {profile.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Principal
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2 min-h-[32px]">{profile.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Saldo em Contas:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {FinancialEngine.formatCurrency(totalBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contas Vinculadas:</span>
                  <span className="font-semibold text-slate-700">{profileAccounts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Movimentações:</span>
                  <span className="font-semibold text-slate-700">{txCount} lançamentos</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setActiveProfileId(profile.id)}
                  className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Perfil Ativo' : 'Ativar Este Perfil'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regras de Acesso e Permissões Table (Exatamente da seção 2) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Regras de Acesso e Isolamento por Papel
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          O PostgreSQL aplica políticas de isolamento de linhas (Row-Level Security). Nenhum usuário visualiza ou altera perfis para os quais não possua permissão concedida explicitamente.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Papel do Usuário</th>
                <th className="py-2.5 px-3">Nível de Permissão</th>
                <th className="py-2.5 px-3">Escopo Autorizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {roles.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{r.role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{r.permission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
