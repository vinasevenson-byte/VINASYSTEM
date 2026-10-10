import React from 'react';
import { Settings, ShieldCheck, Key, Database, Download, History, Lock, FileCode } from 'lucide-react';

export const AdminView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Administração & Segurança do Sistema</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              OWASP & RLS Ativos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configurações de isolamento multiperfis, autenticação multifator (MFA), chaves criptográficas e trilha de auditoria contábil.
          </p>
        </div>

        <button
          onClick={() => alert('Backup completo baixado com sucesso.')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Backup do Banco</span>
        </button>
      </div>

      {/* Security Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Isolamento PostgreSQL (RLS)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Row-Level Security ativo no schema. Cada consulta SQL é filtrada pelo <code>profile_id</code> autorizado pelo token JWT.
          </p>
          <div className="text-[11px] font-bold text-emerald-600">✓ 25 Tabelas Protegidas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Autenticação & MFA</h3>
          </div>
          <p className="text-xs text-slate-500">
            Padrão OWASP com suporte a senhas Argon2id, códigos TOTP (Authenticator) e chave de segurança Passkeys.
          </p>
          <div className="text-[11px] font-bold text-blue-600">✓ MFA Ativado para o Titular</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Trilha de Auditoria Contábil</h3>
          </div>
          <p className="text-xs text-slate-500">
            Qualquer alteração em lançamentos, transferências ou fechamentos mensais gera um registro imutável em <code>audit_logs</code>.
          </p>
          <div className="text-[11px] font-bold text-purple-600">✓ Registro Ativo</div>
        </div>
      </div>
    </div>
  );
};
