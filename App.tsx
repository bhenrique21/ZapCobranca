
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Client, MessageLog, View, PaymentStatus, PlanType } from './types';
import { PLANS } from './constants';
import { supabase, db } from './lib/supabase';
import { payments } from './lib/payments';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Settings from './components/Settings';
import TrialBlocked from './components/TrialBlocked';
import LandingPage from './components/LandingPage';
import Invoices from './components/Invoices';

const CACHE_KEY_USER = 'zap_cache_user';
const CACHE_KEY_CLIENTS = 'zap_cache_clients';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('LANDING');
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem(CACHE_KEY_USER);
    return cached ? JSON.parse(cached) : null;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY_CLIENTS);
    return cached ? JSON.parse(cached) : [];
  });
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const viewRef = useRef<View>(activeView);
  useEffect(() => {
    viewRef.current = activeView;
  }, [activeView]);

  const getPlanStatus = useCallback(() => {
    if (!user) return { isExpired: false, daysRemaining: 0, isTrial: true };
    const now = new Date();
    if (user.subscriptionActive && user.subscriptionExpiresAt) {
      const expirationDate = new Date(user.subscriptionExpiresAt);
      const diffTime = expirationDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { isExpired: daysRemaining <= 0, daysRemaining: Math.max(0, daysRemaining), isTrial: false };
    }
    const createdAt = new Date(user.createdAt || new Date());
    const trialExpiration = new Date(createdAt.getTime() + (7 * 24 * 60 * 60 * 1000));
    const diffTime = trialExpiration.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { isExpired: daysRemaining <= 0, daysRemaining: Math.max(0, daysRemaining), isTrial: true };
  }, [user]);

  const { isExpired, daysRemaining, isTrial } = getPlanStatus();

  const loadUserData = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    if (!userId) { setIsLoading(false); return; }
    try {
      await db.ensureProfile(userId, userEmail || '', userName || 'Usuário');
      const profile = await db.getProfile(userId);
      if (profile) {
        setUser(profile);
        localStorage.setItem(CACHE_KEY_USER, JSON.stringify(profile));
      }
      const [clientsData, logsData] = await Promise.all([
        db.getClients(userId),
        db.getLogs(userId)
      ]);
      setClients(clientsData);
      setLogs(logsData);
      localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(clientsData));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email, session.user.user_metadata?.full_name);
        if (viewRef.current === 'AUTH' || viewRef.current === 'LANDING') setActiveView('DASHBOARD');
      } else {
        setIsLoading(false);
      }
    };
    handleAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          loadUserData(session.user.id, session.user.email, session.user.user_metadata?.full_name);
          setActiveView('DASHBOARD');
        }
      } else {
        setUser(null);
        setClients([]);
        localStorage.removeItem(CACHE_KEY_USER);
        localStorage.removeItem(CACHE_KEY_CLIENTS);
        if (viewRef.current !== 'AUTH') setActiveView('LANDING');
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const handleLogout = async () => {
    localStorage.removeItem(CACHE_KEY_USER);
    localStorage.removeItem(CACHE_KEY_CLIENTS);
    await supabase.auth.signOut();
    setActiveView('LANDING');
  };

  const handleAddClient = async (newClient: Omit<Client, 'id' | 'userId'>) => {
    if (!user) return;
    const client: Client = { ...newClient, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    const newClientsList = [client, ...clients];
    setClients(newClientsList);
    localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(newClientsList));
    await db.saveClient(client);
  };

  const handleSendMessage = async (client: Client, type: 'COBRANÇA' | 'LEMBRETE' | 'ATRASO') => {
    if (!user) return;
    const newLog: MessageLog = { id: crypto.randomUUID().substring(0, 8), clientId: client.id, clientName: client.name, type, sentAt: new Date().toISOString(), status: 'SENT' };
    setLogs(prev => [newLog, ...prev]);
    await db.addLog(newLog, user.id);
  };

  const handleUpdateClient = async (id: string, updatedData: Partial<Client>) => {
    const updatedClients = clients.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setClients(updatedClients);
    localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(updatedClients));
    await db.updateClient(id, updatedData);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      const filtered = clients.filter(c => c.id !== id);
      setClients(filtered);
      localStorage.setItem(CACHE_KEY_CLIENTS, JSON.stringify(filtered));
      await db.deleteClient(id);
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem(CACHE_KEY_USER, JSON.stringify(updatedUser));
    return await db.updateProfile(user.id, userData);
  };

  const handleSubscribe = async (plan: PlanType) => {
    if (!user) return;
    try {
      await payments.createCheckoutSession(plan, user.email);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const renderView = () => {
    if (activeView === 'LANDING') return <LandingPage onGetStarted={() => setActiveView('AUTH')} onLogin={() => setActiveView('AUTH')} />;
    if (activeView === 'AUTH') return <Auth onLogin={() => {}} />;
    if (isExpired && activeView !== 'BILLING' && activeView !== 'SETTINGS') {
      return <TrialBlocked isTrial={isTrial} onGoToBilling={() => setActiveView('BILLING')} onLogout={handleLogout} />;
    }
    switch (activeView) {
      case 'DASHBOARD': return <Dashboard clients={clients} logs={logs} onQuickAdd={() => {setShouldOpenAddModal(true); setActiveView('CLIENTS');}} />;
      case 'CLIENTS': return (
        <Clients 
          clients={clients} logs={logs} onAdd={handleAddClient} onUpdate={handleUpdateClient}
          onUpdateStatus={(id, status) => handleUpdateClient(id, { status })}
          onDelete={handleDeleteClient} onSendMessage={handleSendMessage}
          userPlan={user?.plan || PlanType.STARTER} currentUser={user}
          autoOpenAdd={shouldOpenAddModal} onModalClose={() => setShouldOpenAddModal(false)}
        />
      );
      case 'INVOICES': return <Invoices />;
      case 'SETTINGS': return user ? <Settings user={user} onUpdateUser={handleUpdateUser} /> : null;
      case 'BILLING': return (
        <div className="space-y-8 max-w-5xl mx-auto py-4 pb-20">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Planos Profissionais</h2>
            <p className="text-slate-500 font-medium">Escolha o plano ideal para o tamanho do seu negócio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
              const plan = PLANS[key];
              const isCurrent = user?.plan.toUpperCase() === key.toUpperCase();
              return (
                <div key={key} className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col h-full bg-white ${plan.recommended ? 'border-indigo-600 shadow-xl scale-105 z-10' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-5 py-2 rounded-full shadow-lg shadow-indigo-100">Mais Vendido</div>}
                  <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
                  <p className="text-4xl font-black text-slate-900 my-6">{plan.price}<span className="text-sm text-slate-400 font-bold">/mês</span></p>
                  <button onClick={() => handleSubscribe(key as PlanType)} disabled={isCurrent && user?.subscriptionActive} className={`w-full py-5 rounded-2xl font-black transition-all active:scale-95 ${isCurrent && user?.subscriptionActive ? 'bg-indigo-50 text-indigo-700 cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'}`}>{(isCurrent && user?.subscriptionActive) ? 'Plano Ativo' : 'Assinar Agora'}</button>
                </div>
              );
            })}
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <Layout activeView={activeView} setView={setActiveView} user={user} onLogout={handleLogout} daysRemaining={daysRemaining} isExpired={isExpired} isTrial={isTrial}>
      {renderView()}
    </Layout>
  );
};

export default App;
