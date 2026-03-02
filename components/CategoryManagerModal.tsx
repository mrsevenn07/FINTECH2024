
import React, { useState } from 'react';
import { Category, TransactionType, AccountType } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  currentMode: AccountType;
}

const AVAILABLE_ICONS = ['💰', '🛒', '🏠', '🍔', '🚗', '🎯', '👗', '💊', '📚', '⚡', '💻', '💼', '✈️', '🎁', '⚽', '🎭', '🐶', '🍕', '🛠️', '🌿'];
const AVAILABLE_COLORS = [
  'bg-emerald-500', 'bg-rose-500', 'bg-blue-500', 'bg-orange-500', 
  'bg-slate-800', 'bg-indigo-500', 'bg-amber-500', 'bg-pink-500',
  'bg-cyan-500', 'bg-violet-500'
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, setCategories, currentMode }) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState(AVAILABLE_ICONS[0]);
  const [formColor, setFormColor] = useState(AVAILABLE_COLORS[0]);
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formAccountType, setFormAccountType] = useState<AccountType | 'BOTH'>(currentMode);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formName) return;
    const categoryData: Category = {
      id: editingCategory?.id || Math.random().toString(36).substr(2, 9),
      name: formName,
      icon: formIcon,
      color: formColor,
      type: formType,
      accountType: formAccountType,
    };
    if (editingCategory) setCategories(categories.map(c => c.id === editingCategory.id ? categoryData : c));
    else setCategories([...categories, categoryData]);
    localStorage.setItem('fintech_categories_v1', JSON.stringify([...categories, categoryData]));
    resetForm();
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormName('');
    setFormIcon(AVAILABLE_ICONS[0]);
    setFormColor(AVAILABLE_COLORS[0]);
    setFormType('EXPENSE');
    setFormAccountType(currentMode);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Gestão de Categorias</h3>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1">Configurando módulo {currentMode}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto p-8 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.filter(c => c.accountType === currentMode || c.accountType === 'BOTH').map(c => (
                <div key={c.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${c.color} rounded-2xl flex items-center justify-center text-xl`}>{c.icon}</div>
                    <p className="text-sm font-black text-slate-900">{c.name}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => setEditingCategory(c)} className="p-2 text-slate-400 hover:text-orange-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-96 p-8 space-y-6 bg-white shrink-0">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Nova Categoria</h4>
            <div className="space-y-4">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Visibilidade</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button onClick={() => setFormAccountType('PERSONAL')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter ${formAccountType === 'PERSONAL' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>Pessoal</button>
                  <button onClick={() => setFormAccountType('BUSINESS')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter ${formAccountType === 'BUSINESS' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}>Business</button>
                  <button onClick={() => setFormAccountType('BOTH')} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter ${formAccountType === 'BOTH' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Ambos</button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" />
              </div>
            </div>
            <button onClick={handleSave} className="w-full py-4 bg-orange-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20">Salvar Categoria</button>
          </div>
        </div>
      </div>
    </div>
  );
};
