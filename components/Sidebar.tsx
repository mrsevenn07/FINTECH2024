
import React from 'react';
import { AccountType } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  accountMode: AccountType;
  setAccountMode: (mode: AccountType) => void;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  accountMode, 
  setAccountMode, 
  onLogout,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Resumo', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )},
    { id: 'transactions', label: 'Lançamentos', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m19 7 3 5-3 5"/><path d="m5 7-3 5 3 5"/></svg>
    )},
    { id: 'clients', label: 'Gestão de Clientes', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ), showOnlyOnBusiness: true },
    { id: 'ai-assistant', label: 'FINTECH AI', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/></svg>
    )},
    { id: 'reports', label: 'Relatórios', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
    )},
    { id: 'business', label: 'Parceiros', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ), showOnlyOnBusiness: true },
    { id: 'docs', label: 'API & Docs', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>
    )},
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-900 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r border-slate-200 shadow-2xl lg:shadow-none h-screen flex flex-col">
      {/* Header Sidebar com Close para Mobile */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/30">F</div>
          <span className="text-xl font-black tracking-tight text-slate-900">FINTECH</span>
        </div>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        {/* Module Switcher */}
        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Módulo de Atuação</p>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-[20px] border border-slate-200">
            <button 
              onClick={() => setAccountMode('PERSONAL')}
              className={`py-3 rounded-[14px] text-[10px] font-black uppercase tracking-wider transition-all ${accountMode === 'PERSONAL' ? 'bg-white text-orange-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Eu
            </button>
            <button 
              onClick={() => setAccountMode('BUSINESS')}
              className={`py-3 rounded-[14px] text-[10px] font-black uppercase tracking-wider transition-all ${accountMode === 'BUSINESS' ? 'bg-white text-orange-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Negócio
            </button>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Menu Principal</p>
          {menuItems.map((item) => {
            if (item.showOnlyOnBusiness && accountMode !== 'BUSINESS') return null;
            
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[18px] text-sm font-bold transition-all group active:scale-[0.97] ${
                  isActive 
                    ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar */}
      <div className="p-6 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-[18px] text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all group active:scale-[0.97]"
        >
          <svg className="group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};
