
import React from 'react';
import { Transaction, Category } from '../types';

interface ReceiptTemplateProps {
  transaction: Transaction;
  category?: Category;
  tenantName: string;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ transaction, category, tenantName }) => {
  return (
    <div className="print-only hidden print:block p-12 bg-white text-slate-900 w-full max-w-[800px] mx-auto">
      {/* Header */}
      <div className="text-center mb-10 border-b-4 border-slate-900 pb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">{tenantName}</h1>
        <div className="inline-block px-4 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em]">
          Recibo Electrónico
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referência do Documento</p>
          <p className="text-base font-black font-mono">#{transaction.id.toUpperCase()}</p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data e Hora de Emissão</p>
          <p className="text-base font-black">
            {new Date(transaction.date).toLocaleDateString('pt-MZ')} • {new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="mb-12">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b-2 border-slate-200">
              <th className="py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Descrição detalhada</th>
              <th className="py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal (MZN)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-8">
                <p className="text-lg font-black text-slate-900 mb-1">{transaction.description}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Categoria: {category?.name || 'Vendas Gerais'}</p>
              </td>
              <td className="py-8 text-right">
                <p className="text-2xl font-black">{transaction.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</p>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-8 pt-10 text-sm font-black uppercase tracking-[0.3em] text-slate-400">Total Pago à Vista</td>
              <td className="py-8 pt-10 text-right">
                <p className="text-4xl font-black border-b-4 border-slate-900 inline-block pb-1">
                  {transaction.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} <span className="text-sm font-bold">MZN</span>
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Meta */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Método</p>
          <p className="text-sm font-black text-slate-900">{transaction.paymentMethod?.replace('_', ' ') || 'DINHEIRO'}</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado</p>
          <p className="text-sm font-black text-emerald-600 uppercase">Confirmado</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ref. Operadora</p>
          <p className="text-sm font-mono font-black">{transaction.providerRef || 'N/A'}</p>
        </div>
      </div>

      {/* Security & Footer - Adjusted Alignment for QR Code */}
      <div className="flex justify-between items-end pt-12 border-t-2 border-slate-900 border-dashed">
        <div className="max-w-[400px]">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3">Autenticidade & Verificação</h4>
          <p className="text-[10px] font-medium leading-relaxed text-slate-500 italic mb-4">
            Este comprovativo é um documento digital original. A integridade financeira desta transacção é garantida pelo sistema FINTECH SAAS através de protocolos de encriptação bancária.
          </p>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-400 uppercase">Cópia do Cliente</div>
             <div className="text-[9px] font-bold text-slate-300"># {transaction.id.substring(0,8).toUpperCase()}</div>
          </div>
        </div>
        
        {/* QR Code aligned to the right, vertically centered with the text section above */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-28 h-28 bg-slate-900 flex items-center justify-center p-3 rounded-[24px] shadow-lg shadow-slate-200">
             {/* QR Code Placeholder Simulado */}
             <div className="w-full h-full border border-white/30 border-dashed flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <svg width="100%" height="100%" viewBox="0 0 24 24"><path fill="white" d="M3 3h18v18H3V3m2 2v14h14V5H5z"/></svg>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="5" height="5" x="3" y="3" rx="1"/>
                  <rect width="5" height="5" x="16" y="3" rx="1"/>
                  <rect width="5" height="5" x="3" y="16" rx="1"/>
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                  <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                  <path d="M3 12h.01"/>
                  <path d="M12 3h.01"/>
                  <path d="M16 12h1"/>
                </svg>
             </div>
          </div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Validar Recibo</span>
        </div>
      </div>

      <div className="text-center mt-20 no-print-child">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Processado por FINTECH SaaS Moçambique</p>
      </div>
    </div>
  );
};
