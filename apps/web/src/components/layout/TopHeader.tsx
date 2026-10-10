import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronDown,
  Layers,
  Plus,
  Bell,
  Search,
  Check,
  Calendar,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { FinancialEngine } from '@boma/shared';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewTransaction: () => void;
  onOpenTransferModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewTransaction,
  onOpenTransferModal,
}) => {
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    activeProfile,
    isConsolidated,
    referenceMonth,
    referenceYear,
    setPeriod,
    metrics,
  } = useFinance();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
        setPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    { num: 9, label: 'Setembro 2026' },
    { num: 10, label: 'Outubro 2026' },
    { num: 11, label: 'Novembro 2026' },
    { num: 12, label: 'Dezembro 2026' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Left: Mobile hamburger & Global Profile Switcher */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Financial Profile Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
              isConsolidated
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50/60 border-emerald-300/80 text-emerald-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isConsolidated ? (
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activeProfile?.color || '#10B981' }}
                />
              )}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Perfil Ativo
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {isConsolidated ? 'Todos os perfis — Consolidado' : activeProfile?.name}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100">
                Selecione a Visão Financeira
              </div>

              {/* Option 1: Consolidated */}
              <button
                onClick={() => {
                  setActiveProfileId('CONSOLIDATED');
                  setProfileDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all mt-1 ${
                  isConsolidated
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Consolidado Geral</div>
                    <div className="text-xs text-slate-400">Todos os perfis autorizados</div>
                  </div>
                </div>
                {isConsolidated && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <div className="my-2 border-t border-slate-100" />

              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Perfis Individuais
              </div>

              {/* Profiles list */}
              {profiles.map((profile) => {
                const isSelected = activeProfileId === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setActiveProfileId(profile.id);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-100"
                        style={{ backgroundColor: profile.color }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{profile.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[180px]">
                          {profile.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Period Selector (Outubro 2026) */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 text-xs font-semibold text-slate-700 border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Outubro 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Right: Actions, Notifications and New Transaction Button */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {/* Quick Transfer Button */}
        <button
          onClick={onOpenTransferModal}
          title="Transferência entre contas ou perfis"
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Transferência</span>
        </button>

        {/* Notification Bell */}
        <button
          title="Alertas e Vencimentos"
          className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* Primary Action Button: "+ Novo Lançamento" */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Lançamento</span>
        </button>
      </div>
    </header>
  );
};
