import React, { useState } from 'react';
import { X, ShieldCheck, Key, User, Mail, Lock, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { UserRole } from '@boma/shared';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    mfaEnabled: boolean;
  };
  onUpdateRole: (newRole: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateRole,
}) => {
  const [tab, setTab] = useState<'PROFILE' | 'LOGIN' | 'REGISTER'>('PROFILE');
  const [email, setEmail] = useState('vinicius@bomafinance.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Vinicius P.');
  const [mfaCode, setMfaCode] = useState('');
  const [role, setRole] = useState<UserRole>(currentUser.role);

  if (!isOpen) return null;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setRole(newRole);
    onUpdateRole(newRole);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Autenticação realizada com sucesso para ${email}! Token JWT gerado e verificado.`);
    setTab('PROFILE');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Usuário ${name} cadastrado com sucesso! Perfil Pessoal inicial vinculado.`);
    setTab('PROFILE');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Autenticação & Segurança</h3>
              <p className="text-xs text-slate-500">Controle de acesso e papéis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setTab('PROFILE')}
              className={`py-1.5 rounded-lg transition-all ${
                tab === 'PROFILE' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              Meu Usuário
            </button>
            <button
              onClick={() => setTab('LOGIN')}
              className={`py-1.5 rounded-lg transition-all ${
                tab === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              Fazer Login
            </button>
            <button
              onClick={() => setTab('REGISTER')}
              className={`py-1.5 rounded-lg transition-all ${
                tab === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {tab === 'PROFILE' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  VP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentUser.name}</h4>
                  <span className="text-xs text-slate-500">{currentUser.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">MFA / Passkeys:</span>
                <span className="inline-flex items-center text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Ativado (TOTP)
                </span>
              </div>
            </div>

            {/* Role Simulator */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Papel Ativo no Sistema (Simulador de Permissões)
              </label>
              <select
                value={role}
                onChange={handleRoleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="ADMIN">ADMIN — Administrador Principal (Acesso total)</option>
                <option value="PROFILE_MANAGER">PROFILE_MANAGER — Gestor de Perfil</option>
                <option value="OPERATOR">OPERATOR — Operador (Lança e edita)</option>
                <option value="VIEWER">VIEWER — Consulta (Somente leitura)</option>
                <option value="AUDITOR">AUDITOR — Auditor (Trilha de auditoria)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Permite testar as regras de acesso e restrições de cada perfil no sistema.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Salvar & Fechar
              </button>
            </div>
          </div>
        )}

        {tab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código MFA (Opcional)</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: 849 201"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Entrar
              </button>
            </div>
          </form>
        )}

        {tab === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Senha Segura</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Cadastrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
