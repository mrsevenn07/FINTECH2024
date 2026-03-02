
import React from 'react';

export const BusinessManager: React.FC = () => {
  const entities = [
    { name: 'Loja Central Maputo', type: 'CLIENT', balance: '+12.500', email: 'vendas@central.mz' },
    { name: 'Moçambique Telecom', type: 'SUPPLIER', balance: '-4.200', email: 'financeiro@mcel.mz' },
    { name: 'Supermercado Gourmet', type: 'CLIENT', balance: '+8.900', email: 'gerente@gourmet.mz' },
    { name: 'Seguros Moçambique', type: 'SUPPLIER', balance: '-15.000', email: 'contato@seguros.mz' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Clientes & Fornecedores</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">+ Novo Parceiro</button>
          </div>
          <div className="space-y-4">
            {entities.map((ent, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${ent.type === 'CLIENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ent.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{ent.name}</p>
                    <p className="text-xs text-gray-400">{ent.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${ent.type === 'CLIENT' ? 'text-green-600' : 'text-red-600'}`}>
                    {ent.balance} MZN
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">{ent.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Metas do Negócio</h3>
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Faturamento Mensal</span>
                <span className="text-sm font-bold text-blue-600">65.000 / 100.000 MZN</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Redução de Custos (Alvo 15%)</span>
                <span className="text-sm font-bold text-green-600">12% alcançado</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="flex gap-3">
                <div className="text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-800">Alerta de Fluxo</p>
                  <p className="text-xs text-yellow-700">Previsão de saldo negativo em 15 de Junho devido a 3 faturas de fornecedores com vencimento no mesmo dia.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
