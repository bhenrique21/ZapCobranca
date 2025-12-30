
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../lib/supabase';

interface SettingsProps {
  user: User;
  onUpdateUser: (userData: Partial<User>) => Promise<any>;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [saving, setSaving] = useState(false);
  const [localUser, setLocalUser] = useState<User>(user);
  const [showToast, setShowToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Estados de Diagnóstico
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResults, setDiagResults] = useState<{
    database: boolean | null;
    edgeFunction: boolean | null;
    mercadoPago: boolean | null;
    details?: string;
  }>({ database: null, edgeFunction: null, mercadoPago: null });

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleInputChange = (field: keyof User, value: string) => {
    setLocalUser(prev => ({ ...prev, [field]: value }));
  };

  const runDiagnostics = async () => {
    console.log("Botão 'Executar Testes' clicado.");
    setDiagLoading(true);
    setDiagResults({ database: null, edgeFunction: null, mercadoPago: null, details: 'Iniciando testes...' });
    
    try {
      const results = await db.testIntegration();
      console.log("Resultado final do diagnóstico:", results);
      setDiagResults(results);
    } catch (err: any) {
      console.error("Erro ao rodar diagnóstico no componente:", err);
      setDiagResults(prev => ({ ...prev, details: "Erro de execução: " + err.message }));
    } finally {
      setDiagLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorToast(null);
    
    try {
      const result = await onUpdateUser(localUser);
      
      if (result?.error) {
        setErrorToast("Erro ao salvar: " + result.error);
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err: any) {
      setErrorToast("Falha na conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Informações Pessoais</h2>
          <p className="text-slate-500 mt-1">Configure seus dados para automação de pagamentos e cobranças.</p>
        </div>
        
        {showToast && (
          <div className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-sm font-black animate-in fade-in slide-in-from-right-4 shadow-lg shadow-emerald-100">
            ✓ Informações salvas com sucesso!
          </div>
        )}

        {errorToast && (
          <div className="bg-red-500 text-white px-5 py-2.5 rounded-2xl text-sm font-black animate-in shake duration-300 shadow-lg shadow-red-100">
            ⚠ {errorToast}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card de Diagnóstico (Destaque para teste) */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-xl font-black mb-1">Diagnóstico do Sistema</h3>
              <p className="text-xs text-slate-400 font-medium italic">Use isto para verificar se o Mercado Pago está ativo.</p>
            </div>
            <button 
              type="button"
              onClick={runDiagnostics}
              disabled={diagLoading}
              className={`px-8 py-3 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 ${
                diagLoading ? 'bg-slate-700 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-900/40'
              }`}
            >
              {diagLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Testando...
                </>
              ) : 'Executar Testes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {[
              { label: 'Banco de Dados', key: 'database' },
              { label: 'Edge Function', key: 'edgeFunction' },
              { label: 'Mercado Pago', key: 'mercadoPago' }
            ].map((item) => (
              <div key={item.key} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.label}</span>
                {diagResults[item.key as keyof typeof diagResults] === null ? (
                  <div className="w-3 h-3 rounded-full bg-slate-700 animate-pulse"></div>
                ) : diagResults[item.key as keyof typeof diagResults] ? (
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
                )}
              </div>
            ))}
          </div>
          
          {diagResults.details && (
            <div className="mt-2 p-4 bg-black/40 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
              <p className="text-[10px] font-mono text-indigo-300 leading-relaxed whitespace-pre-wrap">{diagResults.details}</p>
            </div>
          )}
        </div>

        {/* Card: Dados do Perfil */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Seu Perfil</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
              <input
                type="text"
                required
                value={localUser.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-bold"
                placeholder="Como seus clientes te conhecem"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">E-mail (Login)</label>
              <input
                type="email"
                disabled
                value={localUser.email}
                className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card: Dados de Recebimento */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Recebimento de Valores</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Chave Pix</label>
              <input
                type="text"
                value={localUser.pixKey}
                onChange={(e) => handleInputChange('pixKey', e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none font-bold"
                placeholder="CPF, CNPJ, E-mail ou Celular"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Link de Pagamento (Opcional)</label>
              <input
                type="url"
                value={localUser.paymentLink || ''}
                onChange={(e) => handleInputChange('paymentLink', e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none font-bold"
                placeholder="Ex: Mercado Pago, Stripe, etc."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 justify-end pt-4 pb-10">
          <p className="text-xs text-slate-400 italic font-medium">As alterações refletem imediatamente em novas mensagens enviadas.</p>
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {saving ? 'Gravando...' : 'Salvar Todas as Informações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
