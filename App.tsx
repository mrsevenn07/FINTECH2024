
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ArchitectureDoc } from './components/ArchitectureDoc';
import { TransactionsPage } from './components/TransactionsPage';
import { BusinessManager } from './components/BusinessManager';
import { ReportsPage } from './components/ReportsPage';
import { ClientsPage } from './components/ClientsPage';
import { LoginPage } from './components/LoginPage';
import { AIAssistant } from './components/AIAssistant';
import { AccountType, User, Tenant, TransactionType } from './types';

type TabType = 'dashboard' | 'transactions' | 'reports' | 'business' | 'docs' | 'ai-assistant' | 'clients';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [previousTab, setPreviousTab] = useState<TabType | null>(null);
  const [accountMode, setAccountMode] = useState<AccountType>(() => {
    return (localStorage.getItem('fintech_last_mode') as AccountType) || 'BUSINESS';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<TransactionType | null>(null);
  const [reportAction, setReportAction] = useState<'print' | null>(null);

  useEffect(() => {
    localStorage.setItem('fintech_last_mode', accountMode);
    // Se mudar para pessoal e estiver na aba clientes (que é business only), volta pro dashboard
    if (accountMode === 'PERSONAL' && activeTab === 'clients') {
      setActiveTab('dashboard');
    }
  }, [accountMode, activeTab]);

  const handleNavigate = (newTab: TabType) => {
    if (newTab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(newTab);
    }
    setIsMobileMenuOpen(false);
  };

  const handleGoBack = () => {
    if (previousTab) {
      setActiveTab(previousTab);
      setPreviousTab(null);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLoginSuccess = (data: { user: User; tenant: Tenant; mode: AccountType }) => {
    setUser(data.user);
    setTenant(data.tenant);
    setAccountMode(data.mode);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setTenant(null);
  };

  const handleRequestNewTransaction = (type: TransactionType) => {
    handleNavigate('transactions');
    setInitialTransactionType(type);
    setIsTransactionModalOpen(true);
  };
  
  const handleRequestReportPDF = () => {
    setReportAction(null);
    setTimeout(() => {
      handleNavigate('reports');
      setReportAction('print');
    }, 50);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getPageTitle = () => {
    const prefix = accountMode === 'BUSINESS' ? 'Gestão Empresarial' : 'Finanças Pessoais';
    switch(activeTab) {
      case 'dashboard': return `${prefix} • Visão Geral`;
      case 'transactions': return 'Fluxo de Caixa';
      case 'reports': return 'Inteligência de Dados';
      case 'clients': return 'Carteira de Clientes (CRM)';
      case 'business': return 'Parceiros de Negócio';
      case 'docs': return 'Developer Hub';
      case 'ai-assistant': return 'FINTECH AI Assistant';
      default: return 'FINTECH';
    }
  };

  return (
    <div className={`flex min-h-screen font-inter transition-colors duration-500 ${accountMode === 'BUSINESS' ? 'bg-slate-50' : 'bg-emerald-50/30'}`}>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:relative z-50 transition-transform duration-300`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleNavigate} 
          accountMode={accountMode}
          setAccountMode={setAccountMode}
          onLogout={handleLogout}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </div>
      
      <main className="flex-1 min-h-screen flex flex-col w-full overflow-x-hidden">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 active:scale-90 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0">
                <span className={`text-[9px] font-black uppercase tracking-widest ${accountMode === 'BUSINESS' ? 'text-slate-400' : 'text-emerald-600'}`}>
                  {accountMode === 'BUSINESS' ? 'Módulo Business' : 'Módulo Pessoal'}
                </span>
                {activeTab !== 'dashboard' && (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="m9 18 6-6-6-6"/></svg>
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{activeTab}</span>
                  </>
                )}
              </div>
              <h1 className="text-base md:text-xl font-black text-slate-900 leading-tight truncate">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 pr-2.5 pl-1 py-1 rounded-2xl hover:bg-white transition-colors cursor-pointer group">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md transition-transform ${accountMode === 'BUSINESS' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                {user?.name.charAt(0)}
              </div>
              <div className="hidden xs:block text-left">
                <p className="text-[10px] font-black text-slate-800 leading-none">{user?.name.split(' ')[0]}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{tenant?.name}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              mode={accountMode} 
              onRequestNewTransaction={handleRequestNewTransaction}
              onRequestReportPDF={handleRequestReportPDF}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsPage 
              mode={accountMode}
              isModalOpen={isTransactionModalOpen}
              onModalClose={() => setIsTransactionModalOpen(false)}
              initialTransactionType={initialTransactionType}
              onModalOpen={() => {
                setInitialTransactionType(null);
                setIsTransactionModalOpen(true);
              }}
              onBack={handleGoBack}
            />
          )}
          {activeTab === 'clients' && accountMode === 'BUSINESS' && <ClientsPage />}
          {activeTab === 'reports' && (
            <ReportsPage 
              mode={accountMode}
              onLoadAction={reportAction}
              onActionComplete={() => setReportAction(null)}
              onBack={handleGoBack}
            />
          )}
          {activeTab === 'business' && accountMode === 'BUSINESS' && <BusinessManager />}
          {activeTab === 'docs' && <ArchitectureDoc />}
          {activeTab === 'ai-assistant' && <AIAssistant />}
        </section>
        
        <footer className="p-6 md:p-8 text-center border-t border-slate-200 no-print">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">FINTECH Ecosystem • {accountMode} Mode Enabled</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
