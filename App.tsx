
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

const CACHE_KEY_USER = 'zap_cache_user';
const CACHE_KEY_CLIENTS = 'zap_cache_clients';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('AUTH');
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
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const checkPaymentOnce = useCallback(async (userId: string) => {
    setIsManualChecking(true);
    const profile = await db.getProfile(userId);
    if (profile?.subscriptionActive) {
      setUser(profile);
      localStorage.setItem(CACHE_KEY_USER, JSON.stringify(profile));
      localStorage.removeItem('zapcobranca_pending_plan');
      setIsVerifyingPayment(false);
      return true;
    }
    setIsManualChecking(false);
    return false;
  }, []);

  const pollPaymentStatus = useCallback(async (userId: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 2 minutos (5s * 24)
    const interval = setInterval(async () => {
      attempts++;
      const found = await checkPaymentOnce(userId);
      if (found || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!found) {
          setIsVerifyingPayment(false);
          alert("Ainda não detectamos seu pagamento. Se você já pagou, aguarde 1 minuto e recarregue a página.");
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [checkPaymentOnce]);

  // Monitora retorno de compra
  useEffect(() => {
    const pending = localStorage.getItem('zapcobranca_pending_plan');
    if (pending && user && !user.subscriptionActive) {
      setIsVerifyingPayment(true);
      pollPaymentStatus(user.id);
    }
  }, [user, pollPaymentStatus]);

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
        if (viewRef.current === 'AUTH') setActiveView('DASHBOARD');
      } else {
        setIsLoading(false);
      }
    };
    handleAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          loadUserData(session.user.id, session.user.email, session.user.user_metadata?.full_name);
          if (viewRef.current === 'AUTH') setActiveView('DASHBOARD');
        }
      } else {
        setUser(null);
        setClients([]);
        localStorage.removeItem(CACHE_KEY_USER);
        localStorage.removeItem(CACHE_KEY_CLIENTS);
        setActiveView('AUTH');
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const handleLogout = async () => {
    localStorage.removeItem(CACHE_KEY_USER);
    localStorage.removeItem(CACHE_KEY_CLIENTS);
    localStorage.removeItem('zapcobranca_pending_plan');
    await supabase.auth.signOut();
  };

  const handleAddClient = async (newClient: Omit<Client, 'id' | 'userId'>) => {
    if (!user) return;
    const userPlanKey = user.plan.toUpperCase() as keyof typeof PLANS;
    
    // Lógica de Limite: Se não pagou (Trial), limite é 2. Se pagou, usa o limite do plano.
    const isTrialMode = !user.subscriptionActive;
    const limit = isTrialMode ? 2 : (PLANS[userPlanKey]?.limit || 0);

    if (clients.length >= limit) {
      if (isTrialMode) {
        alert("Modo Teste: Limite de 2 clientes atingido. Assine um plano para continuar.");
      } else {
        alert(`Limite do plano ${user.plan} atingido.`);
      }
      setActiveView('BILLING');
      return;
    }
    const client: Client = { ...newClient, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    setClients(prev => [client, ...prev]);
    await db.saveClient(client);
  };

  const handleSendMessage = async (client: Client, type: 'COBRANÇA' | 'LEMBRETE' | 'ATRASO') => {
    if (!user) return;
    const newLog: MessageLog = { id: crypto.randomUUID().substring(0, 8), clientId: client.id, clientName: client.name, type, sentAt: new Date().toISOString(), status: 'SENT' };
    setLogs(prev => [newLog, ...prev]);
    await db.addLog(newLog, user.id);
  };

  const handleUpdateClient = async (id: string, updatedData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    const client = clients.find(c => c.id === id);
    if (client) await db.saveClient({ ...client, ...updatedData });
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== id));
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
    setIsProcessing(true);
    try {
      await payments.createCheckoutSession(plan, user.email);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-5">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">Sincronizando ZapCobrança...</p>
        </div>
      </div>
    );
  }

  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
        <div className="max-w-md w-full space-y-10 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="w-32 h-32 border-[6px] border-slate-50 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Processando Pagamento</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Recebemos seu pedido! Estamos aguardando a confirmação do Mercado Pago para liberar suas funções.
            </p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-5">
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 animate-progress"></div>
            </div>
            <button 
              onClick={() => user && checkPaymentOnce(user.id)}
              disabled={isManualChecking}
              className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all"
            >
              {isManualChecking ? 'Verificando...' : 'Verificar agora'}
            </button>
          </div>
          <button onClick={() => { setIsVerifyingPayment(false); localStorage.removeItem('zapcobranca_pending_plan'); }} className="text-slate-400 text-xs font-bold hover:text-slate-600 underline">
            Voltar para o sistema
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (activeView === 'AUTH') return <Auth onLogin={() => {}} />;
    if (isExpired && activeView !== 'BILLING' && activeView !== 'SETTINGS') {
      return <TrialBlocked isTrial={isTrial} onGoToBilling={() => setActiveView('BILLING')} onLogout={handleLogout} />;
    }
    switch (activeView) {
      case 'DASHBOARD': return <Dashboard clients={clients} logs={logs} onQuickAdd={() => {setShouldOpenAddModal(true); setActiveView('CLIENTS');}} />;
      case 'CLIENTS': return (
        <Clients 
          clients={clients} onAdd={handleAddClient} onUpdate={handleUpdateClient}
          onUpdateStatus={(id, status) => handleUpdateClient(id, { status })}
          onDelete={handleDeleteClient} onSendMessage={handleSendMessage}
          userPlan={user?.plan || PlanType.STARTER} currentUser={user}
          autoOpenAdd={shouldOpenAddModal} onModalClose={() => setShouldOpenAddModal(false)}
        />
      );
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
                <div key={key} className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col h-full bg-white ${plan.recommended ? 'border-indigo-600 shadow-xl scale-105 z-10' : 'border-slate-100 shadow-sm'}`}>
                  {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-5 py-2 rounded-full">Mais Vendido</div>}
                  <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
                  <p className="text-4xl font-black text-slate-900 my-6">{plan.price}<span className="text-sm text-slate-400 font-bold">/mês</span></p>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">✓ Até {plan.limit} clientes ativos</li>
                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">✓ Lembretes via WhatsApp</li>
                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">✓ Dashboard Financeiro</li>
                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">✓ Gestão de Cobranças</li>
                  </ul>
                  <button 
                    onClick={() => handleSubscribe(key as PlanType)}
                    disabled={isProcessing || (isCurrent && user?.subscriptionActive)}
                    className={`w-full py-5 rounded-2xl font-black transition-all active:scale-95 ${isCurrent && user?.subscriptionActive ? 'bg-emerald-50 text-emerald-600 cursor-default' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'}`}
                  >
                    {isProcessing ? 'Abrindo Checkout...' : (isCurrent && user?.subscriptionActive) ? 'Plano Ativo' : 'Assinar Agora'}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium italic">O pagamento é processado pelo Mercado Pago. Ativação automática via Webhook em até 2 minutos.</p>
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
