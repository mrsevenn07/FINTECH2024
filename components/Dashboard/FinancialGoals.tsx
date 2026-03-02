
import React, { useState, useEffect } from 'react';
import { Goal, Transaction, AccountType } from '../../types';

const GOALS_STORAGE_KEY = 'fintech_goals_v1';
const TRANSACTIONS_STORAGE_KEY = 'fintech_transactions_v1';
const ICONS = ['✈️', '🏠', '🚗', '🎓', '💻', '💍', '💼', '🏖️'];

interface FinancialGoalsProps {
  mode: AccountType;
}

const FinancialGoals: React.FC<FinancialGoalsProps> = ({ mode }) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Viagem para Zanzibar', targetAmount: 25000, currentAmount: 7500, icon: '✈️' },
      { id: '2', name: 'Fundo de Emergência', targetAmount: 50000, currentAmount: 45000, icon: '🏠' },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'contribute'>('new');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Form state
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const openModal = (mode: 'new' | 'contribute', goal: Goal | null = null) => {
    setModalMode(mode);
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGoal(null);
    setGoalName('');
    setTargetAmount('');
    setContributionAmount('');
  };

  const handleSave = () => {
    if (modalMode === 'new') {
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      };
      setGoals([...goals, newGoal]);
    } else if (modalMode === 'contribute' && selectedGoal) {
      const amount = parseFloat(contributionAmount);
      
      // 1. Update Goal
      setGoals(goals.map(g => 
        g.id === selectedGoal.id 
          ? { ...g, currentAmount: g.currentAmount + amount } 
          : g
      ));

      // 2. Create new transaction
      // Fix: Add missing accountType property required by Transaction type
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: amount,
        description: `Contribuição para: ${selectedGoal.name}`,
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE',
        status: 'COMPLETED',
        categoryId: '6', // 'Metas' category ID
        tenantId: 't1',
        accountType: mode,
      };
      
      const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      const currentTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify([newTransaction, ...currentTransactions]));
    }
    closeModal();
  };

  return (
    <>
      <div className="bg-slate-950 p-8 rounded-[40px] text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-orange-400/30 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black tracking-tight">Metas Financeiras</h3>
            <button onClick={() => openModal('new')} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-[10px] font-black uppercase hover:bg-white/20 transition-colors">+ Nova Meta</button>
          </div>
          <div className="space-y-5">
            {goals.length > 0 ? goals.map(goal => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{goal.icon}</span>
                      <span className="text-sm font-bold text-slate-200">{goal.name}</span>
                    </div>
                    <button onClick={() => openModal('contribute', goal)} className="px-3 py-1 bg-orange-500 rounded-lg text-white text-[10px] font-black uppercase hover:bg-orange-400 transition-colors">Adicionar</button>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] font-bold text-slate-400">{goal.currentAmount.toLocaleString('pt-MZ')} MZN</span>
                    <span className="text-[10px] font-bold text-slate-500">{goal.targetAmount.toLocaleString('pt-MZ')} MZN</span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-400">
                <p className="font-bold">Nenhuma meta definida.</p>
                <p className="text-xs">Clique em "+ Nova Meta" para começar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xl font-black text-slate-900">
                {modalMode === 'new' ? 'Criar Nova Meta' : `Contribuir para "${selectedGoal?.name}"`}
              </h3>
            </div>
            <div className="p-8 space-y-6">
              {modalMode === 'new' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Meta</label>
                    <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Ex: Viagem dos Sonhos" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor Total (MZN)</label>
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="50000" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-bold" />
                  </div>
                </>
              ) : (
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor da Contribuição (MZN)</label>
                    <input type="number" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} placeholder="1000" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-bold" />
                  </div>
              )}
               <div className="pt-4 flex gap-3">
                <button onClick={closeModal} className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialGoals;
