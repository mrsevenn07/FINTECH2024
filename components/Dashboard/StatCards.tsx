
import React from 'react';
import { AccountType, Transaction } from '../../types';

interface StatCardsProps {
  mode: AccountType;
  dateRange: { start: Date; end: Date };
  transactions: Transaction[];
}

const StatCards: React.FC<StatCardsProps> = ({ mode, dateRange, transactions }) => {
  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= dateRange.start && d <= dateRange.end;
  });

  const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Cálculo para o período anterior (comparativo)
  const duration = dateRange.end.getTime() - dateRange.start.getTime();
  const prevStart = new Date(dateRange.start.getTime() - duration);
  const prevEnd = new Date(dateRange.end.getTime() - duration);
  
  const prevFiltered = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= prevStart && d <= prevEnd;
  });
  
  const prevIncome = prevFiltered.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const incomeDiff = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="relative overflow-hidden bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Saldo do Período</p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {balance.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-400">MZN</span>
          </h2>
          <div className="mt-4 flex items-center gap-2">
             <span className={`px-2 py-1 text-[10px] font-black rounded-full ${balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
               {balance >= 0 ? 'Positivo' : 'Negativo'}
             </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Fluxo de Caixa</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{mode === 'BUSINESS' ? 'Faturamento' : 'Receitas'}</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {totalIncome.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-400">MZN</span>
        </h2>
        <div className="mt-4 flex items-center gap-2">
           <span className={`text-[10px] font-black ${incomeDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
             {incomeDiff >= 0 ? '+' : ''}{incomeDiff.toFixed(1)}%
           </span>
           <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap uppercase tracking-tighter">Vs. Período Anterior</span>
        </div>
      </div>

      <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Saídas</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {totalExpense.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-400">MZN</span>
        </h2>
        <div className="mt-4 flex items-center gap-2">
           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${Math.min((totalExpense / (totalIncome || 1)) * 100, 100)}%` }}></div>
           </div>
           <span className="text-[10px] text-slate-400 font-black whitespace-nowrap uppercase tracking-tighter">Comprometimento</span>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
