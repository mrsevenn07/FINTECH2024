
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Transaction, Category } from '../types';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  isThinking?: boolean;
  sources?: { title: string; uri: string }[];
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Olá! Sou seu assistente FINTECH AI. Analisei seus dados financeiros atuais e estou pronto para ajudar com insights, previsões ou consultas de mercado. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para ler o contexto atual das transações e categorias
  const getFinancialContext = () => {
    try {
      const transactionsJson = localStorage.getItem('fintech_transactions_v1');
      const categoriesJson = localStorage.getItem('fintech_categories_v1');
      
      const transactions: Transaction[] = transactionsJson ? JSON.parse(transactionsJson) : [];
      const categories: Category[] = categoriesJson ? JSON.parse(categoriesJson) : [];

      const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
      const balance = totalIncome - totalExpense;

      // Resumo simplificado para o contexto da IA
      const summary = transactions.slice(0, 10).map(t => 
        `- ${t.date}: ${t.description} (${t.type === 'INCOME' ? '+' : '-'} ${t.amount} MZN)`
      ).join('\n');

      return `
        CONTEXTO FINANCEIRO DO USUÁRIO:
        Saldo Atual: ${balance} MZN
        Total Entradas: ${totalIncome} MZN
        Total Saídas: ${totalExpense} MZN
        Últimas 10 Transações:
        ${summary || 'Nenhuma transação registrada ainda.'}
      `;
    } catch (e) {
      return "Não foi possível carregar o contexto financeiro.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiPlaceholder: Message = { role: 'assistant', text: '', isThinking: true };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = getFinancialContext();
      
      const isMarketQuery = input.toLowerCase().match(/mercado|preço|hoje|notícia|valor|dólar|meticais|investimento/);

      let response;
      if (isMarketQuery) {
        // Para dados em tempo real, usamos o Flash com Google Search
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: input,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: `Você é um analista financeiro especialista em Moçambique e mercados globais. 
            Você tem acesso ao seguinte contexto financeiro do usuário para personalizar sua resposta: ${context}.
            Seja direto, técnico e cite fontes se usar a busca.`
          }
        });
      } else {
        // Para análise estratégica profunda, usamos o Pro com Thinking
        response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: input,
          config: {
            thinkingConfig: { thinkingBudget: 15000 },
            systemInstruction: `Você é um CFO Virtual de elite. Analise os dados do usuário e forneça conselhos estratégicos. 
            Contexto atual: ${context}. Pense passo a passo sobre a saúde financeira do usuário.`
          }
        });
      }

      const text = response.text || "Desculpe, não consegui processar sua solicitação agora.";
      
      // Extrair fontes de pesquisa (Grounding Chunks) se houver
      const sources: { title: string; uri: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
        });
      }

      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1] = { 
          role: 'assistant', 
          text, 
          isThinking: false, 
          sources: sources.length > 0 ? sources : undefined 
        };
        return last;
      });
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1] = { role: 'assistant', text: "Houve um erro técnico ao consultar a inteligência artificial. Verifique sua conexão.", isThinking: false };
        return last;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
      {/* AI Header */}
      <div className="bg-slate-950 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <div>
            <h3 className="text-white font-black tracking-tight">FINTECH AI</h3>
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Inteligência Contextual Ativa</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-white/60 font-black uppercase">Analista On-line</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-[32px] p-6 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-orange-500 text-white border-orange-400 rounded-tr-none' 
                : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
            }`}>
              {msg.isThinking ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Processando Inteligência...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.sources && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fontes de Pesquisa:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, idx) => (
                          <a 
                            key={idx} 
                            href={src.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 px-3 py-1.5 rounded-full transition-all font-bold flex items-center gap-1 border border-slate-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                            {src.title.length > 30 ? src.title.substring(0, 30) + '...' : src.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ex: 'Analise meu saldo' ou 'Qual o preço do dólar hoje?'"
              className="w-full pl-6 pr-14 py-4 bg-slate-100 border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white focus:border-orange-500 transition-all font-medium text-slate-700 shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-12 h-12 bg-orange-500 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
          <p className="mt-3 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            FINTECH AI pode analisar seus dados para fornecer insights estratégicos.
          </p>
        </div>
      </div>
    </div>
  );
};
