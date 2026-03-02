
import React from 'react';

export const ArchitectureDoc: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto space-y-12 animate-fadeIn mb-20">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Arquitetura de Segurança FINTECH</h2>
        <p className="text-lg text-gray-600">
          Fluxo de autenticação e proteção de dados para escala industrial em ambiente multi-tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h3 className="text-xl font-bold flex items-center gap-2 text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Autenticação JWT (Stateless)
          </h3>
          <ul className="space-y-3 text-sm text-blue-800">
            <li><strong className="text-blue-900">Access Token:</strong> Curta duração (15 min). Armazenado em memória/estado.</li>
            <li><strong className="text-blue-900">Refresh Token:</strong> Longa duração (7 dias). Armazenado em Cookie <code>HttpOnly</code> e <code>Secure</code>.</li>
            <li><strong className="text-blue-900">Payload:</strong> Inclui <code>userId</code>, <code>role</code> e <code>tenantId</code> para isolamento de dados.</li>
          </ul>
        </div>

        <div className="space-y-4 p-6 bg-slate-900 rounded-2xl text-slate-300">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            Proteção de Backend
          </h3>
          <ul className="space-y-3 text-sm">
            <li><strong className="text-white">Bcrypt:</strong> Hashing de senhas com salt cost de 12.</li>
            <li><strong className="text-white">Rate Limiting:</strong> Bloqueio automático de IP após 5 tentativas falhas de login (Redis-based).</li>
            <li><strong className="text-white">Middleware RLS:</strong> Row-Level Security no PostgreSQL filtrando por <code>tenant_id</code> em cada query.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Fluxo de Login (Sequence)</h3>
        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-gray-300 font-mono text-xs text-slate-700 overflow-x-auto">
{`
1. CLIENT: POST /auth/login {email, password}
2. BACKEND:
   - Query User por email (SELECT * FROM users WHERE email = ?)
   - Se !user -> Retornar "Credenciais Inválidas" (401)
   - Bcrypt.compare(password, user.password_hash)
   - Se !match -> Retornar "Credenciais Inválidas" (401)
3. GENERATION:
   - Gerar accessToken (Exp 15m) assinado com JWT_SECRET
   - Gerar refreshToken (Exp 7d) salvo na DB e assinado com JWT_REFRESH_SECRET
4. RESPONSE:
   - Set-Cookie: refreshToken (HttpOnly, SameSite=Strict)
   - JSON { accessToken, user: {id, name, tenantId...} }
`}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Isolamento Multi-tenant</h3>
        <p className="text-sm text-gray-600">
            A plataforma FINTECH utiliza uma arquitetura de banco de dados compartilhado com Row-Level Security. Isso garante que cada inquilino (empresa ou indivíduo) tenha acesso exclusivo aos seus próprios registros, impedindo qualquer vazamento de dados entre contas.
        </p>
      </div>
    </div>
  );
};
