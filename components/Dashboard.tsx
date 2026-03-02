
import React, { Suspense, useState, useMemo } from 'react';
import { AccountType, TransactionType, Transaction } from '../types';

// Lazy load components
const StatCards = React.lazy(() => import('./Dashboard/StatCards'));
const PerformanceChart = React.lazy(() => import('./Dashboard/PerformanceChart'));
const BottomGrid = React.lazy(() => import('./Dashboard/BottomGrid'));

const STORAGE_KEY = 'fintech_transactions_v1';

// Skeleton Loaders
const StatCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => <div key={i} className="bg-slate-100 p-7 rounded-[32px] h-[156px] animate-pulse"></div>)}
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-slate-100 p-8 rounded-[40px] h-[456px] animate-pulse"></div>
);

const BottomGridSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-slate-100 p-8 rounded-[40px] h-[360px] animate-pulse"></div>
    <div className="bg-slate-100 p-8 rounded-[40px] h-[360px] animate-pulse"></div>
  </div>
);

interface DashboardProps {
  mode: AccountType;
  onRequestNewTransaction: (type: TransactionType) => void;
  onRequestReportPDF: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ mode, onRequestNewTransaction, onRequestReportPDF }) => {
  const [period, setPeriod] = useState<'7D' | '30D' | 'MONTH' | 'YEAR' | 'ALL'>('MONTH');

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch(period) {
      case '7D': start.setDate(end.getDate() - 7); break;
      case '30D': start.setDate(end.getDate() - 30); break;
      case 'MONTH': start.setDate(1); break;
      case 'YEAR': 
        start.setMonth(0);
        start.setDate(1); 
        break;
      case 'ALL': start.setFullYear(2000); break;
    }
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }, [period]);

  const transactions: Transaction[] = useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const all = saved ? JSON.parse(saved) : [];
    // FILTRAGEM CRÍTICA: Mostrar apenas dados do modo atual
    return all.filter((t: Transaction) => t.accountType === mode);
  }, [period, mode]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'BUSINESS' ? 'Painel de Business Intelligence' : 'Controle Financeiro Familiar'}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            {mode === 'BUSINESS' ? 'Métricas de Performance e ROI' : 'Gestão de Orçamento e Metas de Vida'}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-[22px] shadow-sm">
          {[
            { id: '7D', label: '7 Dias' },
            { id: '30D', label: '30 Dias' },
            { id: 'MONTH', label: 'Mês' },
            { id: 'YEAR', label: 'Ano' },
            { id: 'ALL', label: 'Tudo' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all ${
                period === p.id 
                ? (mode === 'BUSINESS' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-emerald-600 text-white shadow-lg') 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards mode={mode} dateRange={dateRange} transactions={transactions} />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <PerformanceChart mode={mode} dateRange={dateRange} transactions={transactions} />
      </Suspense>

      <Suspense fallback={<BottomGridSkeleton />}>
        <BottomGrid mode={mode} onRequestNewTransaction={onRequestNewTransaction} onRequestReportPDF={onRequestReportPDF} />
      </Suspense>
    </div>
  );
};
