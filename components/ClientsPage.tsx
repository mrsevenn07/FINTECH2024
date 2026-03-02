
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Transaction } from '../types';

const CLIENTS_STORAGE_KEY = 'fintech_clients_v1';
const TRANSACTIONS_STORAGE_KEY = 'fintech_transactions_v1';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Supermercado Central', companyName: 'Grupo Central Lda', email: 'compras@central.mz', phone: '841234567', status: 'ACTIVE', totalRevenue: 125000, lastInteraction: '2023-10-15', joinDate: '2023-01-10', tags: ['Varejo', 'VIP'] },
      { id: '2', name: 'Restaurante Marés', companyName: 'Marés Gastronomia', email: 'gerencia@mares.mz', phone: '829876543', status: 'ACTIVE', totalRevenue: 45000, lastInteraction: '2023-10-20', joinDate: '2023-05-15', tags: ['Horeca'] },
      { id: '3', name: 'Tech Solutions', companyName: 'Tech Solutions SA', email: 'admin@techsol.mz', phone: '875551234', status: 'LEAD', totalRevenue: 0, lastInteraction: '2023-11-01', joinDate: '2023-11-01', tags: ['Tecnologia'] }
    ];
  });
  
  const [transactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [copied, setCopied] = useState(false);

  // Form States
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLastInteraction, setFormLastInteraction] = useState(new Date().toISOString().split('T')[0]);
  
  // Validation States
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  // Reset copied state when drawer closes
  useEffect(() => {
    if (!selectedClient) setCopied(false);
  }, [selectedClient]);

  // Validação de Datas em Tempo Real
  useEffect(() => {
    if (formJoinDate && formLastInteraction) {
      const join = new Date(formJoinDate);
      const last = new Date(formLastInteraction);
      
      if (isNaN(join.getTime()) || isNaN(last.getTime())) {
        setDateError('Datas inválidas.');
      } else if (join > last) {
        setDateError('A data de cadastro não pode ser posterior à última interação.');
      } else {
        setDateError(null);
      }
    }
  }, [formJoinDate, formLastInteraction]);

  // Memoize transações do cliente selecionado para performance
  const clientTransactions = useMemo(() => {
    if (!selectedClient) return [];
    
    const searchTerms = [
      selectedClient.name.toLowerCase(),
      selectedClient.companyName?.toLowerCase() || ''
    ].filter(term => term.length > 2); // Ignora termos muito curtos

    return transactions
      .filter(t => {
        const desc = t.description.toLowerCase();
        // Verifica se o nome do cliente ou empresa aparece na descrição da transação
        return searchTerms.some(term => desc.includes(term));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Mais recentes primeiro
      .slice(0, 5); // Limita a 5 itens
  }, [selectedClient, transactions]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    
    // Limite rigoroso de 9 dígitos
    if (val.length > 9) return;

    setFormPhone(val);

    // Validação de Prefixo e Continuidade
    if (val.length >= 2) {
      const prefix = val.substring(0, 2);
      const validPrefixes = ['82', '83', '84', '85', '86', '87'];
      
      if (!validPrefixes.includes(prefix)) {
        setPhoneError('Prefixo inválido. Use: 82, 83, 84, 85, 86 ou 87.');
      } else {
        // Prefixo válido, limpar erro para permitir digitação contínua
        setPhoneError(null);
      }
    } else {
      // Menos de 2 dígitos, ainda não validamos
      setPhoneError(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormEmail(val);

    // Regex simples para validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (val && !emailRegex.test(val)) {
      setEmailError('Formato de e-mail inválido.');
    } else {
      setEmailError(null);
    }
  };

  const handleSaveClient = () => {
    // Validação de Campos Obrigatórios
    if (!formName || !formPhone) return;
    
    // Validação final de comprimento do telefone
    if (formPhone.length !== 9) {
      setPhoneError('O número deve ter exatamente 9 dígitos.');
      return;
    }
    
    // Verifica se há erros pendentes
    if (phoneError || emailError || dateError) return;

    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: formName,
      companyName: formCompany,
      email: formEmail,
      phone: formPhone,
      status: 'ACTIVE',
      totalRevenue: 0,
      joinDate: formJoinDate,
      lastInteraction: formLastInteraction,
      tags: formTags.split(',').map(t => t.trim()).filter(t => t)
    };

    setClients([newClient, ...clients]);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormLastInteraction(new Date().toISOString().split('T')[0]);
    setPhoneError(null);
    setEmailError(null);
    setDateError(null);
    setFormTags('');
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const number = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone}`;
    window.open(`https://wa.me/${number}`, '_blank');
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareClient = (client: Client) => {
    const subject = encodeURIComponent(`Contato: ${client.name}`);
    const body = encodeURIComponent(
      `Resumo de Contato\n\n` +
      `Nome: ${client.name}\n` +
      `Empresa: ${client.companyName || 'Particular'}\n` +
      `WhatsApp/Telefone: ${client.phone}\n` +
      `E-mail: ${client.email || 'Não informado'}\n`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight">Carteira de Clientes</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de Relacionamento (CRM)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-4 bg-orange-500 text-white rounded-[22px] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
           Novo Cliente
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total de Clientes</p>
           <p className="text-3xl font-black text-slate-900">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clientes Ativos</p>
           <p className="text-3xl font-black text-emerald-500">{clients.filter(c => c.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Receita Total Acumulada</p>
           <p className="text-3xl font-black text-orange-500">{clients.reduce((acc, c) => acc + c.totalRevenue, 0).toLocaleString()} <span className="text-sm text-slate-400">MZN</span></p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome, empresa ou e-mail..."
          className="w-full px-6 py-4 pl-12 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-medium shadow-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-4 text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div 
            key={client.id} 
            onClick={() => setSelectedClient(client)}
            className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
             </div>

             <div className="flex items-center gap-4 mb-6">
               <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-300 border border-slate-100 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {client.name.charAt(0)}
               </div>
               <div>
                  <h3 className="font-black text-slate-900 leading-tight">{client.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{client.companyName || 'Particular'}</p>
               </div>
             </div>

             <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                   {client.phone}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                   {client.email || 'Sem e-mail'}
                </div>
             </div>

             <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Receita Total</p>
                   <p className="text-sm font-black text-slate-900">{client.totalRevenue.toLocaleString()} MZN</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${client.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                   {client.status === 'ACTIVE' ? 'Ativo' : 'Lead'}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
             <div className="p-8 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xl font-black text-slate-900">Novo Cliente</h3>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1">Cadastro de Parceiro de Negócio</p>
             </div>
             <div className="p-8 space-y-5">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Cliente *</label>
                   <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 font-bold" placeholder="Ex: João da Silva" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Empresa</label>
                   <input type="text" value={formCompany} onChange={e => setFormCompany(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Ex: Silva Lda" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telemóvel *</label>
                      <input 
                        type="tel" 
                        value={formPhone} 
                        onChange={handlePhoneChange} 
                        className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none font-bold transition-all ${phoneError ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/10'}`} 
                        placeholder="84..." 
                        maxLength={9}
                      />
                      {phoneError && (
                        <p className="text-[9px] font-bold text-rose-500 mt-1.5 ml-1 animate-fadeIn">{phoneError}</p>
                      )}
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                      <input 
                        type="email" 
                        value={formEmail} 
                        onChange={handleEmailChange} 
                        className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none font-bold transition-all ${emailError ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/10'}`} 
                        placeholder="@..." 
                      />
                      {emailError && (
                        <p className="text-[9px] font-bold text-rose-500 mt-1.5 ml-1 animate-fadeIn">{emailError}</p>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Data de Cadastro</label>
                    <input 
                      type="date" 
                      value={formJoinDate} 
                      onChange={e => setFormJoinDate(e.target.value)} 
                      className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none font-bold transition-all ${dateError ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/10'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Última Interação</label>
                    <input 
                      type="date" 
                      value={formLastInteraction} 
                      onChange={e => setFormLastInteraction(e.target.value)} 
                      className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none font-bold transition-all ${dateError ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-orange-500/10'}`}
                    />
                  </div>
                </div>
                {dateError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-shake">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <p className="text-[10px] font-bold text-rose-500">{dateError}</p>
                  </div>
                )}

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tags (separadas por vírgula)</label>
                   <input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Varejo, VIP, Maputo" />
                </div>
                
                <div className="flex gap-3 pt-4">
                   <button onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[24px] font-black text-xs uppercase tracking-widest">Cancelar</button>
                   <button 
                    onClick={handleSaveClient} 
                    disabled={!!phoneError || !!emailError || !!dateError || !formName || formPhone.length !== 9}
                    className="flex-1 py-4 bg-orange-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                   >
                     Salvar Cliente
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Client Details Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40 backdrop-blur-[2px] animate-fadeIn" onClick={() => setSelectedClient(null)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl animate-slideLeft flex flex-col" onClick={(e) => e.stopPropagation()}>
             <div className="p-8 bg-slate-900 text-white">
                <button onClick={() => setSelectedClient(null)} className="mb-6 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                <h2 className="text-3xl font-black mb-1">{selectedClient.name}</h2>
                <p className="text-orange-400 font-bold uppercase text-xs tracking-widest">{selectedClient.companyName || 'Cliente Particular'}</p>
                
                <div className="flex gap-3 mt-6">
                   <button onClick={() => openWhatsApp(selectedClient.phone)} className="flex-1 py-3 bg-emerald-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      WhatsApp
                   </button>
                   <button onClick={() => window.open(`mailto:${selectedClient.email || ''}`)} className="flex-1 py-3 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      E-mail
                   </button>
                   <button onClick={() => handleShareClient(selectedClient)} className="flex-1 py-3 bg-orange-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                      Compartilhar
                   </button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm mb-6">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Dados de Contato</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between border-b border-slate-50 pb-2 items-center">
                         <span className="text-xs text-slate-400 font-bold">Telemóvel</span>
                         <div className="flex items-center gap-2">
                           <span className="text-xs text-slate-900 font-bold">{selectedClient.phone}</span>
                           <button 
                             onClick={() => handleCopyPhone(selectedClient.phone)}
                             className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-orange-500 transition-colors"
                             title="Copiar número"
                           >
                             {copied ? (
                               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                             ) : (
                               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                             )}
                           </button>
                         </div>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-xs text-slate-400 font-bold">E-mail</span>
                         <span className="text-xs text-slate-900 font-bold">{selectedClient.email || '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-xs text-slate-400 font-bold">Cadastro</span>
                         <span className="text-xs text-slate-900 font-bold">{selectedClient.joinDate ? new Date(selectedClient.joinDate).toLocaleDateString('pt-MZ') : '-'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                         <span className="text-xs text-slate-400 font-bold">Última Interação</span>
                         <span className="text-xs text-slate-900 font-bold">{new Date(selectedClient.lastInteraction).toLocaleDateString('pt-MZ')}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs text-slate-400 font-bold">Status</span>
                         <span className="text-xs text-emerald-500 font-black uppercase">{selectedClient.status}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Histórico Recente</h3>
                   {clientTransactions.length > 0 ? (
                     <div className="space-y-4">
                       {clientTransactions.map(t => (
                         <div key={t.id} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <div>
                               <p className="text-xs font-black text-slate-800 truncate max-w-[150px]">{t.description}</p>
                               <p className="text-[10px] text-slate-400 font-bold">{new Date(t.date).toLocaleDateString('pt-MZ')}</p>
                            </div>
                            <p className={`text-xs font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {t.type === 'INCOME' ? '+' : '-'} {t.amount.toLocaleString()} MZN
                            </p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <p className="text-xs text-slate-400 font-medium">Nenhuma transação identificada.</p>
                        <p className="text-[9px] text-slate-300 font-bold mt-1">Dica: Use o nome do cliente na descrição do lançamento.</p>
                     </div>
                   )}
                   <button className="w-full mt-6 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-colors">Ver Extrato Completo</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
