
import React, { useState } from 'react';
import { User, Tenant, AccountType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (data: { user: User; tenant: Tenant; mode: AccountType }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Estado para o modo de conta, inicializando com a última escolha salva ou 'BUSINESS'
  const [loginMode, setLoginMode] = useState<AccountType>(() => {
    return (localStorage.getItem('fintech_last_mode') as AccountType) || 'BUSINESS';
  });

  const validateEmail = (value: string) => {
    // Regex robusto para validação de e-mail
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);

    if (val && !validateEmail(val)) {
      setEmailError('Formato de e-mail inválido.');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bloqueia se houver erro de validação ou campo vazio
    if (emailError || !email) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }

    if (!validateEmail(email)) {
       setEmailError('Formato de e-mail inválido.');
       return;
    }

    setIsLoading(true);
    setError(null);

    // Simulando chamada de API real (POST /auth/login)
    setTimeout(() => {
      const allowedEmails = ['demo@fintech.mz', 'demo@kashfy.com', 'syntradesign@gmail.com'];
      
      // Senha personalizada para o usuário solicitado
      const isValidPassword = (email === 'syntradesign@gmail.com' && password === 'fintech2024') || 
                              (email !== 'syntradesign@gmail.com' && password === 'password123') ||
                              (email === 'demo@fintech.mz');

      if (allowedEmails.includes(email) && isValidPassword) {
        // Salvar a preferência do usuário
        localStorage.setItem('fintech_last_mode', loginMode);

        onLoginSuccess({
          user: {
            id: 'u-123',
            name: email === 'syntradesign@gmail.com' ? 'Syntra Design' : 'João Moçambique',
            email: email,
            role: 'OWNER',
            tenantId: 't-456',
            active: true,
          },
          tenant: {
            id: 't-456',
            name: loginMode === 'BUSINESS' ? 'FINTECH Enterprise' : 'Conta Pessoal',
            type: loginMode,
            plan: 'PRO',
          },
          mode: loginMode
        });
      } else {
        setError('Credenciais inválidas. Para syntradesign@gmail.com, use a senha definida.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-inter">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FINTECH</h1>
          <p className="text-slate-400 mt-2">Gestão financeira moderna para a África</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-800/5">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Acesse sua conta</h2>
          
          {/* Seletor de Modo de Conta */}
          <div className="flex p-1.5 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setLoginMode('PERSONAL')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginMode === 'PERSONAL' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Conta Pessoal
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('BUSINESS')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginMode === 'BUSINESS' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Empresarial
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-start gap-3 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-mail</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all font-medium ${emailError ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-2 focus:ring-orange-500'}`}
                placeholder="syntradesign@gmail.com"
              />
              {emailError && (
                <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1 animate-fadeIn">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={isLoading || !!emailError}
              className={`w-full text-white font-black py-4 rounded-xl transition-all shadow-lg uppercase text-xs tracking-widest active:scale-[0.98] ${isLoading || !!emailError ? 'opacity-70 cursor-not-allowed grayscale' : ''} ${loginMode === 'BUSINESS' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
            >
              {isLoading ? 'Verificando...' : `Entrar como ${loginMode === 'BUSINESS' ? 'Empresa' : 'Pessoal'}`}
            </button>
          </form>
        </div>
        <p className="mt-8 text-center text-slate-500 text-xs">Acesso exclusivo para Syntra Design</p>
      </div>
    </div>
  );
};
