
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../types';

interface PerformanceChartProps {
  dateRange: { start: Date; end: Date };
  transactions: Transaction[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ dateRange, transactions }) => {
  const chartData = useMemo(() => {
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= dateRange.start && d <= dateRange.end;
    });

    const isLargeRange = (dateRange.end.getTime() - dateRange.start.getTime()) > (45 * 24 * 60 * 60 * 1000);
    const aggregation: Record<string, { name: string; income: number; expense: number }> = {};

    filtered.forEach(t => {
      const d = new Date(t.date);
      // Agrega por mês se o range for longo, senão por dia
      const key = isLargeRange 
        ? d.toLocaleDateString('pt-MZ', { month: 'short', year: '2-digit' })
        : d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' });

      if (!aggregation[key]) {
        aggregation[key] = { name: key, income: 0, expense: 0 };
      }

      if (t.type === 'INCOME') aggregation[key].income += t.amount;
      else aggregation[key].expense += t.amount;
    });

    return Object.values(aggregation).sort((a, b) => {
      // Ordenação simples baseada no formato da string se necessário, 
      // mas transações costumam estar ordenadas se viermos de uma lista cronológica
      return 1; 
    });
  }, [dateRange, transactions]);

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Análise de Performance</h3>
          <p className="text-sm text-slate-400 font-medium">Visualização dinâmica de entradas e saídas no período</p>
        </div>
      </div>
      
      <div className="h-80 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip 
                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                itemStyle={{fontSize: '12px', fontWeight: 800}}
              />
              <Area type="monotone" dataKey="income" name="Entradas" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Saídas" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
             <p className="font-bold uppercase text-[10px] tracking-widest">Sem dados para este período</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;
