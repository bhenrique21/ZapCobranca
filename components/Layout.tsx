
import React from 'react';
import { View, User } from '../types';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
  daysRemaining: number;
  isExpired: boolean;
  isTrial: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, user, onLogout, daysRemaining, isExpired, isTrial }) => {
  // Ocultar layout para telas de marketing e auth
  if (activeView === 'AUTH' || activeView === 'LANDING') return <>{children}</>;

  const navItems = [
    { id: 'DASHBOARD' as View, label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'CLIENTS' as View, label: 'Clientes', icon: Icons.Users },
    { id: 'SETTINGS' as View, label: 'Informações', icon: Icons.Settings },
    { id: 'BILLING' as View, label: 'Meu Plano', icon: Icons.CreditCard },
  ];

  const showStatusWarning = isTrial || isExpired;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-black">Z</span>
            ZapCobrança
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeView === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>

        {showStatusWarning && (
           <div className={`mx-4 mb-4 p-4 rounded-2xl border ${isExpired ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                {isExpired ? (isTrial ? 'Teste Expirado' : 'Assinatura Vencida') : (isTrial ? 'Período de Teste' : 'Assinatura Ativa')}
              </p>
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {isExpired ? 'Suas funções estão bloqueadas.' : `${daysRemaining} dias restantes.`}
              </p>
              <button 
                onClick={() => setView('BILLING')}
                className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
              >
                {isExpired ? 'Renovar agora →' : 'Assinar agora →'}
              </button>
           </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-3 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                Plano {user?.plan || 'Starter'}
              </p>
              <p className={`text-[10px] font-black uppercase ${(!isExpired && user?.subscriptionActive) ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isExpired ? 'Expirado' : `${daysRemaining} dias restantes`}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Icons.Logout />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px] font-black">Z</span>
            <h1 className="text-lg font-bold text-indigo-600">ZapCobrança</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-900 leading-none">{user?.name?.split(' ')[0]}</p>
                <p className={`text-[9px] font-bold uppercase ${isExpired ? 'text-red-500' : 'text-amber-500'}`}>{isExpired ? 'Exp' : `${daysRemaining}d`}</p>
             </div>
             <button onClick={onLogout} className="p-2 text-slate-400"><Icons.Logout /></button>
          </div>
        </header>
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto mb-20 md:mb-0">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeView === item.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'
              }`}
            >
              <item.icon />
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
