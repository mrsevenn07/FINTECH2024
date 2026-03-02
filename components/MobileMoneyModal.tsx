
import React, { useState, useEffect } from 'react';
import { PaymentProvider } from '../types';

interface SavedContact {
  id: string;
  name: string;
  number: string;
  provider: PaymentProvider;
}

const SAVED_CONTACTS_KEY = 'fintech_saved_contacts_v1';

interface MobileMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: (provider: PaymentProvider, number: string) => void;
}

export const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({ isOpen, onClose, amount, description, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [shouldSave, setShouldSave] = useState(false);
  
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>(() => {
    const saved = localStorage.getItem(SAVED_CONTACTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Detectar operadora pelo prefixo moçambicano
  useEffect(() => {
    const cleanNum = phoneNumber.replace(/\s/g, '');
    if (cleanNum.startsWith('84') || cleanNum.startsWith('85')) {
      setProvider('M-PESA');
    } else if (cleanNum.startsWith('86') || cleanNum.startsWith('87')) {
      setProvider('E-MOLA');
    } else {
      setProvider(null);
    }
  }, [phoneNumber]);

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!provider || phoneNumber.length < 9) return;
    
    // Salvar contacto se solicitado
    if (shouldSave && contactName.trim()) {
      const newContact: SavedContact = {
        id: Math.random().toString(36).substr(2, 9),
        name: contactName.trim(),
        number: phoneNumber,
        provider: provider
      };
      
      const exists = savedContacts.find(c => c.number === phoneNumber);
      if (!exists) {
        const updated = [newContact, ...savedContacts].slice(0, 5); // Limitar a 5 favoritos
        setSavedContacts(updated);
        localStorage.setItem(SAVED_CONTACTS_KEY, JSON.stringify(updated));
      }
    }

    setStep('PROCESSING');
    
    // Simulação do tempo de resposta do Gateway de Pagamento (STK Push)
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess(provider, phoneNumber);
        handleClose();
      }, 2000);
    }, 4000);
  };

  const selectContact = (contact: SavedContact) => {
    setPhoneNumber(contact.number);
    setProvider(contact.provider);
    setShouldSave(false); // Reset save mode when selecting existing
  };

  const removeContact = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedContacts.filter(c => c.id !== id);
    setSavedContacts(updated);
    localStorage.setItem(SAVED_CONTACTS_KEY, JSON.stringify(updated));
  };

  const handleClose = () => {
    setStep('INPUT');
    setPhoneNumber('');
    setContactName('');
    setShouldSave(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
        
        {step === 'INPUT' && (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 bg-slate-50 rounded-3xl mb-4 border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Checkout Digital</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Mobile Money Moçambique</p>
            </div>

            <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 flex justify-between items-center shadow-xl">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total a Processar</p>
                <p className="text-2xl font-black text-white">{amount.toLocaleString('pt-MZ')} <span className="text-xs text-orange-500">MZN</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Serviço</p>
                <p className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{description}</p>
              </div>
            </div>

            {/* Saved Contacts & Quick Add */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Favoritos</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => setShouldSave(!shouldSave)}
                  className={`flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${shouldSave ? 'border-orange-500 bg-orange-50 text-orange-500' : 'border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-400'}`}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                {savedContacts.map(contact => (
                  <button 
                    key={contact.id}
                    onClick={() => selectContact(contact)}
                    className={`flex-shrink-0 group relative px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 ${phoneNumber === contact.number ? 'bg-orange-500 border-orange-400 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                  >
                    <span className="text-xs font-black">{contact.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${contact.provider === 'M-PESA' ? 'bg-rose-500' : 'bg-orange-400'}`}></div>
                    <div 
                      onClick={(e) => removeContact(e, contact.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número de Telemóvel</label>
                <input 
                  type="tel" 
                  maxLength={9}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="8XXXXXXXX"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-black tracking-[0.2em] outline-none focus:border-orange-500 focus:bg-white transition-all text-center"
                />
                
                <div className="absolute right-4 top-[48px] transition-all">
                  {provider === 'M-PESA' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-xl text-white animate-fadeIn shadow-lg shadow-rose-600/20">
                       <span className="text-[9px] font-black uppercase tracking-widest">M-Pesa</span>
                    </div>
                  )}
                  {provider === 'E-MOLA' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 rounded-xl text-white animate-fadeIn shadow-lg shadow-orange-500/20">
                       <span className="text-[9px] font-black uppercase tracking-widest">e-Mola</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulário Simplificado de Novo Contacto */}
              {shouldSave ? (
                <div className="p-5 bg-orange-50 rounded-[24px] border border-orange-100 animate-slideDown space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-black text-orange-600 uppercase tracking-wide flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
                       Novo Contacto
                     </span>
                     <button onClick={() => setShouldSave(false)} className="text-orange-400 hover:text-orange-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                  </div>
                  
                  <div className="space-y-3">
                    <input 
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nome (ex: Cliente João)"
                      autoFocus
                      className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-xl outline-none text-sm font-bold text-slate-900 focus:border-orange-500 placeholder:font-medium placeholder:text-slate-400"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white/60 p-2.5 rounded-xl border border-orange-100">
                          <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Número</p>
                          <p className="text-xs font-bold text-slate-600">{phoneNumber || '---'}</p>
                       </div>
                       <div className="bg-white/60 p-2.5 rounded-xl border border-orange-100">
                          <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Operadora</p>
                          <p className="text-xs font-bold text-slate-600">{provider || 'Detetando...'}</p>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => setShouldSave(true)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                   </div>
                   <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">Deseja salvar este número?</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleClose} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Sair</button>
              <button 
                onClick={handleProcess}
                disabled={!provider || phoneNumber.length < 9}
                className="flex-[2] py-5 bg-orange-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/30 active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="p-12 text-center space-y-8 animate-fadeIn">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200 animate-pulse"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="M12 22v-2"/><path d="m17.66 17.66 1.41 1.41"/><path d="M22 12h-2"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Autorização Pendente</h3>
              <p className="text-slate-500 font-medium leading-relaxed">STK Push enviado para <strong>{phoneNumber}</strong>.<br/>Por favor, introduza o PIN no seu telemóvel para finalizar.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
               <div className="px-4 py-2 bg-slate-900 rounded-full flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Gateway Conectado via {provider}</span>
               </div>
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="p-12 text-center space-y-6 animate-scaleIn">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Pagamento Recebido!</h3>
              <p className="text-slate-500 font-medium">A transação de {amount.toLocaleString()} MZN foi liquidada com sucesso.</p>
            </div>
            <div className="pt-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">ID da Operação</p>
              <p className="text-xs font-mono font-bold text-slate-400">{Math.random().toString(36).substring(2,10).toUpperCase()}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
