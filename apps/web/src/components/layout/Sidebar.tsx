import React from 'react';
import {
  LayoutDashboard,
  Layers,
  UserCheck,
  Calendar,
  Users,
  TrendingUp,
  Receipt,
  Building2,
  CreditCard,
  Clock,
  PieChart,
  Landmark,
  Target,
  Sparkles,
  BarChart4,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export type NavItem =
  | 'dashboard'
  | 'consolidated'
  | 'by-profile'
  | 'calendar'
  | 'profiles'
  | 'income'
  | 'expenses'
  | 'accounts'
  | 'credit-cards'
  | 'payables'
  | 'budgets'
  | 'investments'
  | 'goals'
  | 'ai-assistant'
  | 'reports'
  | 'admin';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const menuGroups = [
    {
      group: 'PAINÉIS',
      items: [
        { id: 'dashboard' as NavItem, label: 'Dashboard Geral', icon: LayoutDashboard },
        { id: 'consolidated' as NavItem, label: 'Minha Visão Consolidada', icon: Layers },
        { id: 'by-profile' as NavItem, label: 'Visão por Perfil', icon: UserCheck },
        { id: 'calendar' as NavItem, label: 'Calendário Financeiro', icon: Calendar },
      ],
    },
    {
      group: 'GESTÃO & MOVIMENTAÇÕES',
      items: [
        { id: 'profiles' as NavItem, label: 'Perfis Financeiros', icon: Users, badge: 'Multiperfis' },
        { id: 'income' as NavItem, label: 'Renda e Receitas', icon: TrendingUp },
        { id: 'expenses' as NavItem, label: 'Despesas e Gastos', icon: Receipt },
        { id: 'accounts' as NavItem, label: 'Contas e Movimentações', icon: Building2 },
        { id: 'credit-cards' as NavItem, label: 'Cartões de Crédito', icon: CreditCard, highlight: true },
        { id: 'payables' as NavItem, label: 'Contas a Pagar e Receber', icon: Clock },
      ],
    },
    {
      group: 'PLANEJAMENTO & PATRIMÔNIO',
      items: [
        { id: 'budgets' as NavItem, label: 'Orçamento e Planejamento', icon: PieChart },
        { id: 'investments' as NavItem, label: 'Investimentos e Patrimônio', icon: Landmark },
        { id: 'goals' as NavItem, label: 'Metas Financeiras', icon: Target },
      ],
    },
    {
      group: 'INTELIGÊNCIA & CONTROLE',
      items: [
        { id: 'ai-assistant' as NavItem, label: 'Inteligência Financeira', icon: Sparkles, badge: 'IA' },
        { id: 'reports' as NavItem, label: 'Relatórios & DRE', icon: BarChart4 },
        { id: 'admin' as NavItem, label: 'Administração & Acesso', icon: Settings },
      ],
    },
  ];

  const handleSelect = (tab: NavItem) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <span className="font-extrabold text-xl tracking-tight">B</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">BOMA</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    FINANCE
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400 truncate">
                  Gestão Pessoal & Multiperfis
                </span>
              </div>
            )}
          </div>

          {/* Close on mobile / Collapse on desktop */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center group relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-sm border border-emerald-200/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badge === 'IA'
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  VP
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 truncate">Vinicius P.</span>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin Principal</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                title="Recolher menu"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 hidden lg:block"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onToggleCollapse}
                title="Expandir menu"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
