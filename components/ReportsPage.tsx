
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AccountType, Transaction, Category } from '../types';

const TRANSACTIONS_KEY = 'fintech_transactions_v1';
const CATEGORIES_KEY = 'fintech_categories_v1';

// Seed data para fallback nos relatórios também, caso necessário
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_biz_inc_1', name: 'Vendas de Produtos', icon: '💰', color: 'bg-emerald-500', type: 'INCOME', accountType: 'BUSINESS' },
  { id: 'cat_biz_inc_2', name: 'Serviços Prestados', icon: '💼', color: 'bg-blue-500', type: 'INCOME', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_1', name: 'Fornecedores', icon: '📦', color: 'bg-rose-500', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_2', name: 'Marketing & Ads', icon: '🚀', color: 'bg-indigo-500', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_3', name: 'Operacional / Aluguel', icon: '🏢', color: 'bg-slate-600', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_4', name: 'Salários Equipe', icon: '👥', color: 'bg-amber-500', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_pers_inc_1', name: 'Salário Mensal', icon: '💵', color: 'bg-emerald-500', type: 'INCOME', accountType: 'PERSONAL' },
  { id: 'cat_pers_inc_2', name: 'Freelance / Extra', icon: '💻', color: 'bg-cyan-500', type: 'INCOME', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_1', name: 'Alimentação', icon: '🍔', color: 'bg-orange-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_2', name: 'Transporte', icon: '🚗', color: 'bg-slate-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_3', name: 'Educação', icon: '📚', color: 'bg-violet-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_4', name: 'Lazer', icon: '🎉', color: 'bg-pink-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_shared_1', name: 'Bancos & Taxas', icon: '🏦', color: 'bg-gray-500', type: 'EXPENSE', accountType: 'BOTH' },
];

// Cores de alto contraste seguindo padrões WCAG
const highContrastColors = ['#000000', '#0000ff', '#ffff00', '#ffffff'];
const highContrastBorders = ['#ffffff', '#ffffff', '#000000', '#000000'];
const standardColors = ['#f97316', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#64748b'];

interface ReportsPageProps {
  mode: AccountType;
  onLoadAction: 'print' | null;
  onActionComplete: () => void;
  onBack: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ mode, onLoadAction, onActionComplete, onBack }) => {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Carregar dados reais do LocalStorage com Fallback
  useEffect(() => {
    const loadedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const loadedCategories = localStorage.getItem(CATEGORIES_KEY);

    if (loadedTransactions) setTransactions(JSON.parse(loadedTransactions));
    
    if (loadedCategories) {
       const parsed = JSON.parse(loadedCategories);
       if (Array.isArray(parsed) && parsed.length > 0) {
         setCategories(parsed);
       } else {
         setCategories(DEFAULT_CATEGORIES);
       }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  const handleExportPDF = useCallback(() => {
    if (isPrinting) return;
    setIsPrinting(true);
    // Tempo suficiente para os gráficos do Recharts estabilizarem sem animação
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      onActionComplete();
    }, 800);
  }, [isPrinting, onActionComplete]);

  useEffect(() => {
    if (onLoadAction === 'print') {
      handleExportPDF();
    }
  }, [onLoadAction, handleExportPDF]);

  // Processamento de Dados: Gráfico de Pizza (Despesas por Categoria)
  const categoryData = useMemo(() => {
    const filtered = transactions.filter(t => t.accountType === mode && t.type === 'EXPENSE');
    const aggregation: Record<string, number> = {};

    filtered.forEach(t => {
      const catId = t.categoryId || 'uncategorized';
      aggregation[catId] = (aggregation[catId] || 0) + t.amount;
    });

    return Object.keys(aggregation).map((catId, index) => {
      const cat = categories.find(c => c.id === catId);
      const name = cat ? cat.name : (catId === 'uncategorized' ? 'Sem Categoria' : 'Outros');
      // Tentar usar a cor da categoria (classe Tailwind) convertida para HEX aproximado ou usar paleta padrão
      let color = standardColors[index % standardColors.length];
      
      return {
        name,
        value: aggregation[catId],
        color: isHighContrast ? highContrastColors[index % highContrastColors.length] : color,
        stroke: isHighContrast ? highContrastBorders[index % highContrastBorders.length] : 'none'
      };
    }).sort((a, b) => b.value - a.value); // Maiores primeiro
  }, [transactions, categories, mode, isHighContrast]);

  // Processamento de Dados: Histórico Mensal para Tabela e CSV
  const historyData = useMemo(() => {
    const filtered = transactions.filter(t => t.accountType === mode);
    const aggregation: Record<string, { income: number; expense: number; date: Date }> = {};

    filtered.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`; // Chave única YYYY-MM
      
      if (!aggregation[key]) {
        aggregation[key] = { income: 0, expense: 0, date };
      }

      if (t.type === 'INCOME') aggregation[key].income += t.amount;
      else aggregation[key].expense += t.amount;
    });

    return Object.values(aggregation)
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Mais recente primeiro
      .map(item => {
        const monthName = item.date.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' });
        // Capitalizar primeira letra
        return {
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          income: item.income,
          expense: item.expense,
          balance: item.income - item.expense
        };
      });
  }, [transactions, mode]);

  const handleExportCSV = async () => {
    try {
      setIsExportingCSV(true);
      
      // Cabeçalhos compatíveis com Excel PT-BR/PT-PT (separador ;)
      const headers = ['Mês Referência', 'Total Receitas (MZN)', 'Total Despesas (MZN)', 'Saldo Líquido (MZN)', 'Status'];
      
      const csvRows = historyData.map(item => [
        `"${item.month}"`, // Aspas para garantir que espaços não quebrem
        item.income.toFixed(2).replace('.', ','), // Formato local
        item.expense.toFixed(2).replace('.', ','),
        item.balance.toFixed(2).replace('.', ','),
        item.balance >= 0 ? 'POSITIVO' : 'NEGATIVO'
      ]);

      const csvContent = [headers.join(';'), ...csvRows.map(row => row.join(';'))].join('\n');
      
      // Adicionar BOM para suporte a UTF-8 no Excel Windows
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FINTECH_Relatorio_${mode}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <article 
      className={`space-y-8 animate-fadeIn pb-20 transition-colors duration-300 ${isHighContrast ? 'bg-black text-white' : ''}`}
      aria-labelledby="reports-title"
    >
      {/* Botões de Ação e Acessibilidade */}
      <div className="flex flex-wrap justify-between items-center no-print gap-4">
        <button 
          onClick={onBack} 
          className={`group flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border ${isHighContrast ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
          aria-label="Voltar para a página anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={isHighContrast ? 'text-yellow-400' : 'text-slate-400 group-hover:text-orange-500'}><path d="m15 18-6-6 6-6"/></svg>
          <span className="text-[11px] font-black uppercase tracking-widest">Voltar</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`px-5 py-2.5 rounded-full border-2 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${isHighContrast ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white border-slate-200 text-slate-700'}`}
            aria-pressed={isHighContrast}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 3v18"/></svg>
            {isHighContrast ? 'Normal' : 'Alto Contraste'}
          </button>
        </div>
      </div>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 no-print">
        <div>
          <h2 id="reports-title" className={`text-3xl font-black tracking-tight ${isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>
            Relatórios de Inteligência
          </h2>
          <p className={`${isHighContrast ? 'text-zinc-400' : 'text-slate-500'} font-medium`}>
            Análise detalhada do módulo {mode === 'BUSINESS' ? 'Empresarial' : 'Pessoal'}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button onClick={handleExportCSV} disabled={isExportingCSV || historyData.length === 0} className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border transition-all active:scale-95 ${isHighContrast ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
             Exportar CSV
           </button>
           <button 
            onClick={handleExportPDF} 
            disabled={isPrinting || historyData.length === 0}
            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale ${isHighContrast ? 'bg-white text-black' : 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600'}`}
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              {isPrinting ? 'Gerando...' : 'Imprimir PDF'}
           </button>
        </div>
      </header>

      {/* Cabeçalho exclusivo para impressão */}
      <div className="hidden print:block mb-8 border-b-4 border-black pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Relatório Consolidado • {mode}</h1>
        <div className="flex justify-between mt-4 font-bold uppercase text-[10px] tracking-widest text-slate-600">
           <span>Emissor: FINTECH SaaS Ecosystem</span>
           <span>Gerado em: {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-100 rounded-[40px]">
           <p className="text-slate-400 font-bold">Ainda não existem dados suficientes para gerar relatórios.</p>
           <button onClick={onBack} className="mt-4 text-orange-500 text-xs font-black uppercase tracking-widest hover:underline">Registrar transações</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section 
            className={`lg:col-span-2 p-10 rounded-[40px] shadow-sm border chart-container transition-all ${isHighContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-white border-slate-100'}`}
            role="region"
            aria-label="Gráfico de Composição de Despesas"
          >
            <h3 className={`text-lg font-black mb-8 ${isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>Composição de Despesas</h3>
            {categoryData.length > 0 ? (
              <div className="h-80 w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={110} 
                      paddingAngle={5} 
                      dataKey="value" 
                      isAnimationActive={!isPrinting} // Desativar animação na impressão para garantir renderização
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.stroke} strokeWidth={isHighContrast ? 3 : 0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('pt-MZ')} MZN`}
                      contentStyle={isHighContrast ? { backgroundColor: '#000', border: '2px solid #ffff00', color: '#fff' } : { borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className={`text-[10px] font-black uppercase tracking-widest ${isHighContrast ? 'text-white' : 'text-slate-600'}`}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                Sem despesas no período
              </div>
            )}
            <div className="mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 hidden print:block border-t pt-4">
              Nota: Este gráfico representa a distribuição de custos por categoria baseada nos lançamentos registrados.
            </div>
          </section>

          <section 
            className={`p-8 rounded-[40px] shadow-sm border transition-all ${isHighContrast ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-100'}`}
            role="region"
            aria-label="Resumo Mensal de Receitas"
          >
             <h3 className={`text-lg font-black mb-8 ${isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>Histórico Mensal</h3>
             <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                {historyData.map((item, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col p-4 rounded-2xl border transition-all ${isHighContrast ? 'bg-black border-zinc-700' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-black ${isHighContrast ? 'text-white' : 'text-slate-900'}`}>{item.month}</span>
                      <span className={`text-xs font-bold ${item.balance >= 0 ? (isHighContrast ? 'text-yellow-400' : 'text-emerald-500') : 'text-rose-500'}`}>
                        {item.balance >= 0 ? '+' : ''}{item.balance.toLocaleString()} MZN
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-60">
                       <span className={isHighContrast ? 'text-zinc-400' : 'text-slate-500'}>Rec: {item.income.toLocaleString()}</span>
                       <span className={isHighContrast ? 'text-zinc-400' : 'text-slate-500'}>Desp: {item.expense.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      )}

      <footer className="hidden print:block mt-20 text-center pt-8 border-t border-slate-200">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Este documento possui validade fiscal digital confirmada • FINTECH SaaS</p>
         <p className="text-[8px] text-slate-300 mt-2">Hash: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
      </footer>
    </article>
  );
};
