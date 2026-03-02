
import React, { useState, useMemo, useEffect } from 'react';
import { AccountType, Transaction, Category, TransactionType, TransactionStatus, PaymentProvider } from '../types';
import { CategoryManagerModal } from './CategoryManagerModal';
import { MobileMoneyModal } from './MobileMoneyModal';
import { ReceiptTemplate } from './ReceiptTemplate';

const STORAGE_KEY = 'fintech_transactions_v1';
const CATEGORIES_STORAGE_KEY = 'fintech_categories_v1';

// SEED DATA: Categorias Padrão para inicialização do sistema
const DEFAULT_CATEGORIES: Category[] = [
  // Business Income
  { id: 'cat_biz_inc_1', name: 'Vendas de Produtos', icon: '💰', color: 'bg-emerald-500', type: 'INCOME', accountType: 'BUSINESS' },
  { id: 'cat_biz_inc_2', name: 'Serviços Prestados', icon: '💼', color: 'bg-blue-500', type: 'INCOME', accountType: 'BUSINESS' },
  // Business Expense
  { id: 'cat_biz_exp_1', name: 'Fornecedores', icon: '📦', color: 'bg-rose-500', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_2', name: 'Marketing & Ads', icon: '🚀', color: 'bg-indigo-500', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_3', name: 'Operacional / Aluguel', icon: '🏢', color: 'bg-slate-600', type: 'EXPENSE', accountType: 'BUSINESS' },
  { id: 'cat_biz_exp_4', name: 'Salários Equipe', icon: '👥', color: 'bg-amber-500', type: 'EXPENSE', accountType: 'BUSINESS' },
  // Personal Income
  { id: 'cat_pers_inc_1', name: 'Salário Mensal', icon: '💵', color: 'bg-emerald-500', type: 'INCOME', accountType: 'PERSONAL' },
  { id: 'cat_pers_inc_2', name: 'Freelance / Extra', icon: '💻', color: 'bg-cyan-500', type: 'INCOME', accountType: 'PERSONAL' },
  // Personal Expense
  { id: 'cat_pers_exp_1', name: 'Alimentação', icon: '🍔', color: 'bg-orange-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_2', name: 'Transporte', icon: '🚗', color: 'bg-slate-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_3', name: 'Educação', icon: '📚', color: 'bg-violet-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  { id: 'cat_pers_exp_4', name: 'Lazer', icon: '🎉', color: 'bg-pink-500', type: 'EXPENSE', accountType: 'PERSONAL' },
  // Shared
  { id: 'cat_shared_1', name: 'Bancos & Taxas', icon: '🏦', color: 'bg-gray-500', type: 'EXPENSE', accountType: 'BOTH' },
];

interface TransactionsPageProps {
  mode: AccountType;
  isModalOpen: boolean;
  onModalClose: () => void;
  onModalOpen: () => void;
  initialTransactionType: TransactionType | null;
  onBack: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ mode, isModalOpen, onModalClose, onModalOpen, initialTransactionType, onBack }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMobileMoneyModalOpen, setIsMobileMoneyModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [isPrintingList, setIsPrintingList] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'ALL'>('ALL');

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formStatus, setFormStatus] = useState<TransactionStatus>('COMPLETED');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentProvider>('CASH');

  // Inicialização Robusta das Categorias
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (initialTransactionType) {
      setFormType(initialTransactionType);
    }
  }, [initialTransactionType]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.accountType === mode || c.accountType === 'BOTH');
  }, [categories, mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const handlePrintReceipt = () => {
    if (isPrintingReceipt) return;
    setIsPrintingReceipt(true);
    setTimeout(() => {
      window.print();
      setIsPrintingReceipt(false);
    }, 150);
  };

  const handlePrintList = () => {
    if (isPrintingList) return;
    setIsPrintingList(true);
    setTimeout(() => {
      window.print();
      setIsPrintingList(false);
    }, 150);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesMode = t.accountType === mode;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const tDate = new Date(t.date).setHours(0,0,0,0);
      const matchesStart = !filterStartDate || tDate >= new Date(filterStartDate).setHours(0,0,0,0);
      const matchesEnd = !filterEndDate || tDate <= new Date(filterEndDate).setHours(0,0,0,0);
      return matchesMode && matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
  }, [transactions, mode, searchTerm, filterStatus, filterStartDate, filterEndDate]);

  const handleSaveTransaction = () => {
    if (!formDescription || !formAmount || !formCategoryId) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    const transactionData: Transaction = {
      id: editingTransaction?.id || Math.random().toString(36).substr(2, 9),
      amount: parseFloat(formAmount),
      description: formDescription,
      date: formDate,
      type: formType,
      status: formStatus,
      categoryId: formCategoryId,
      tenantId: 't1',
      accountType: mode, 
      notes: formNotes,
      paymentMethod: formPaymentMethod,
    };
    if (editingTransaction) setTransactions(transactions.map(t => t.id === editingTransaction.id ? transactionData : t));
    else setTransactions([transactionData, ...transactions]);
    closeAndResetModal();
  };

  const closeAndResetModal = () => {
    onModalClose();
    setEditingTransaction(null);
    setFormDescription('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    if (!initialTransactionType) setFormType('EXPENSE');
    setFormStatus('COMPLETED');
    setFormCategoryId('');
    setFormNotes('');
    setFormPaymentMethod('CASH');
  };

  const getStatusBadge = (t: Transaction, isLarge = false) => {
    const status = t.status;
    let colorClass = status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100";
    let label = status === 'COMPLETED' ? "Efetivado" : status === 'PENDING' ? "Pendente" : "Atrasado";
    return <span className={`${isLarge ? 'px-4 py-2 text-[12px]' : 'px-3 py-1.5 text-[10px]'} rounded-full font-black border uppercase ${colorClass}`}>{label}</span>;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 relative">
      {/* 
        NOTA: ReceiptTemplate só aparece se houver uma transação selecionada E formos imprimir.
        Se quisermos imprimir a LISTA, selectedTransaction deve ser null ou ignorado.
      */}
      {selectedTransaction && (
        <ReceiptTemplate 
          transaction={selectedTransaction} 
          category={categories.find(c => c.id === selectedTransaction.categoryId)}
          tenantName="FINTECH SaaS Moçambique" 
        />
      )}

      {/* Cabeçalho exclusivo para impressão do Extrato (Só aparece se NÃO estivermos vendo recibo individual) */}
      {!selectedTransaction && (
        <div className="hidden print:block mb-8 border-b-4 border-slate-900 pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Extrato de Transações • {mode}</h1>
          <div className="flex justify-between mt-4 font-bold uppercase text-[10px] tracking-widest text-slate-600">
             <span>Filtro: {filterStatus === 'ALL' ? 'Todos' : filterStatus}</span>
             <span>Gerado em: {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Conteúdo da UI - Escondido na impressão via classe 'no-print' */}
      <div className="no-print">
        {/* Botão de Voltar */}
        <div className="mb-6">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border bg-white border-slate-200 text-slate-500 hover:text-orange-500"
            aria-label="Voltar para o Painel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="text-[11px] font-black uppercase tracking-widest">Voltar</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 max-w-xl w-full">
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Pesquisar no extrato ${mode === 'BUSINESS' ? 'comercial' : 'pessoal'}...`}
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-medium shadow-sm"
              />
              <button onClick={() => setShowFilters(!showFilters)} className={`p-4 rounded-[22px] border transition-all ${showFilters ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-slate-200 text-slate-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="4" y1="4" y2="4"/><line x1="21" x2="4" y1="12" y2="12"/><line x1="21" x2="4" y1="20" y2="20"/><circle cx="7" cy="4" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="7" cy="20" r="2"/></svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <button onClick={() => setIsCategoryModalOpen(true)} className="px-5 py-4 bg-white border border-slate-200 text-slate-700 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Categorias</button>
            
            <button 
              onClick={handlePrintList} 
              disabled={isPrintingList || filteredTransactions.length === 0}
              className="px-5 py-4 bg-white border border-slate-200 text-slate-700 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              {isPrintingList ? '...' : 'Imprimir Extrato'}
            </button>

            <button onClick={onModalOpen} className={`flex-1 lg:flex-none px-8 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white ${mode === 'BUSINESS' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}>
              Novo Lançamento
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideDown mt-6">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none">
              <option value="ALL">Todos os Status</option>
              <option value="COMPLETED">Efetivado</option>
              <option value="PENDING">Pendente</option>
              <option value="OVERDUE">Atrasado</option>
            </select>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
          </div>
        )}
      </div>

      {/* Tabela - Visível na impressão (removemos 'no-print' daqui, adicionamos estilos print-friendly) */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mt-8 print:shadow-none print:border-0 print:rounded-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 print:bg-gray-100 print:text-black">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Data</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Descrição</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Categoria</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right print:text-black">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold text-sm">
                     Nenhum lançamento encontrado neste período.
                   </td>
                 </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  return (
                    <tr key={t.id} onClick={() => setSelectedTransaction(t)} className={`cursor-pointer transition-colors group print:break-inside-avoid ${selectedTransaction?.id === t.id ? (mode === 'BUSINESS' ? 'bg-orange-50/50' : 'bg-emerald-50/50') : 'hover:bg-slate-50/50'}`}>
                      <td className="px-8 py-6 text-sm font-bold text-slate-400 print:text-black">{new Date(t.date).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })}</td>
                      <td className="px-8 py-6"><p className="text-sm font-black text-slate-900 print:text-black">{t.description}</p></td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 text-slate-700 flex items-center gap-2 w-fit print:border print:border-gray-300">
                          <span>{cat?.icon || '📁'}</span>
                          {cat?.name || 'Geral'}
                        </span>
                      </td>
                      <td className="px-8 py-6">{getStatusBadge(t)}</td>
                      <td className={`px-8 py-6 text-base font-black text-right ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.amount.toLocaleString('pt-MZ')} MZN</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
                <tfoot className="hidden print:table-footer-group border-t-2 border-black">
                   <tr>
                     <td colSpan={4} className="px-8 py-4 text-right font-black uppercase tracking-widest text-xs">Total do Período:</td>
                     <td className="px-8 py-4 text-right font-black text-sm">
                       {(filteredTransactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0)).toLocaleString('pt-MZ')} MZN
                     </td>
                   </tr>
                </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal de Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn no-print">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-900">Novo Registo no Módulo {mode}</h3>
                <button onClick={closeAndResetModal} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-[22px] border border-slate-200">
                  <button onClick={() => setFormType('EXPENSE')} className={`py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${formType === 'EXPENSE' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}>Despesa</button>
                  <button onClick={() => setFormType('INCOME')} className={`py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${formType === 'INCOME' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}>Entrada</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                    <input type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Ex: Pagamento Fornecedor" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor (MZN)</label>
                    <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                    <select value={formCategoryId} onChange={e => setFormCategoryId(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700">
                      <option value="">Selecione...</option>
                      {filteredCategories.filter(c => c.type === formType).map(c => (
                        <option key={c.id} value={c.id}>
                           {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                    {filteredCategories.filter(c => c.type === formType).length === 0 && (
                       <p className="text-[9px] text-rose-500 mt-1 font-bold ml-1">Nenhuma categoria encontrada para {formType === 'INCOME' ? 'Entradas' : 'Despesas'}. Crie uma nova.</p>
                    )}
                  </div>
                </div>
             </div>
             <div className="p-8 border-t border-slate-100 flex gap-4">
                <button onClick={closeAndResetModal} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[24px] font-black text-xs uppercase tracking-widest">Cancelar</button>
                <button onClick={handleSaveTransaction} className={`flex-[2] py-5 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${mode === 'BUSINESS' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}>Confirmar Lançamento</button>
             </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40 backdrop-blur-[2px] animate-fadeIn no-print" onClick={() => setSelectedTransaction(null)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl animate-slideLeft flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div><h3 className="text-xl font-black text-slate-900">Detalhes</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{selectedTransaction.id}</p></div>
              <button onClick={() => setSelectedTransaction(null)} className="p-3 hover:bg-slate-50 rounded-2xl border border-slate-100"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 text-center">
              <p className={`text-5xl font-black ${selectedTransaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedTransaction.amount.toLocaleString('pt-MZ')} MZN</p>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Módulo</p>
                    <p className="text-sm font-black text-slate-900">{selectedTransaction.accountType}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-emerald-600 uppercase">Efetivado</p>
                 </div>
              </div>

              {selectedTransaction.type === 'INCOME' && selectedTransaction.accountType === 'BUSINESS' && (
                <button onClick={handlePrintReceipt} disabled={isPrintingReceipt} className={`w-full py-4 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Imprimir Recibo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CategoryManagerModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} setCategories={setCategories} currentMode={mode} />
    </div>
  );
};
