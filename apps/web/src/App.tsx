import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardView } from './views/DashboardView';
import { ProfilesView } from './views/ProfilesView';
import { IncomeView } from './views/IncomeView';
import { ExpensesView } from './views/ExpensesView';
import { AccountsView } from './views/AccountsView';
import { CreditCardsView } from './views/CreditCardsView';
import { BudgetsView } from './views/BudgetsView';
import { GoalsView } from './views/GoalsView';
import { InvestmentsView } from './views/InvestmentsView';
import { AIAssistantView } from './views/AIAssistantView';
import { ReportsView } from './views/ReportsView';
import { AdminView } from './views/AdminView';
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { TransferModal } from './components/modals/TransferModal';
import { AuthModal } from './components/modals/AuthModal';
import { UserRole } from '@boma/shared';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [newTxModalOpen, setNewTxModalOpen] = useState<boolean>(false);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    mfaEnabled: boolean;
  }>({
    id: 'usr-1',
    name: 'Vinicius P.',
    email: 'vinicius@bomafinance.com',
    role: 'ADMIN',
    mfaEnabled: true,
  });

  const { setActiveProfileId } = useFinance();

  const handleSelectTab = (tab: NavItem) => {
    setCurrentTab(tab);
    if (tab === 'consolidated') {
      setActiveProfileId('CONSOLIDATED');
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
      case 'consolidated':
      case 'calendar':
        return <DashboardView />;
      case 'profiles':
      case 'by-profile':
        return <ProfilesView />;
      case 'income':
        return <IncomeView />;
      case 'expenses':
      case 'payables':
        return <ExpensesView />;
      case 'accounts':
        return <AccountsView />;
      case 'credit-cards':
        return <CreditCardsView />;
      case 'budgets':
        return <BudgetsView />;
      case 'goals':
        return <GoalsView />;
      case 'investments':
        return <InvestmentsView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'reports':
        return <ReportsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => setNewTxModalOpen(true)}
          onOpenTransferModal={() => setTransferModalOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={newTxModalOpen}
        onClose={() => setNewTxModalOpen(false)}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateRole={(newRole) => setCurrentUser((prev) => ({ ...prev, role: newRole }))}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
