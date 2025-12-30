
import React from 'react';
import { PLANS } from '../constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">Z</div>
            <span className="text-lg md:text-xl font-black tracking-tight text-slate-900">ZapCobrança</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={onLogin} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 md:px-6 md:py-3 bg-slate-900 text-white text-xs md:text-sm font-black rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-12 md:pb-24 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-600 text-center">Gestão B2B para Profissionais</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000 px-2">
            Organize seus clientes em um só lugar, de forma <span className="text-indigo-600">prática, rápida e profissional.</span>
          </h1>
          
          <p className="mt-6 md:mt-8 text-base md:text-xl text-slate-500 max-w-3xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-4">
            Tenha acesso a um Dashboard completo para acompanhar e mensurar seus pagamentos mensais sem planilhas confusas.
          </p>

          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-200"
            >
              Criar Conta Gratuita
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Já sou cliente
            </button>
          </div>

          {/* Dashboard Preview Image - Atualizada com a captura real do sistema */}
          <div className="mt-16 md:mt-24 w-full max-w-5xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 px-2 sm:px-6">
            <div className="absolute inset-0 bg-indigo-600/10 md:bg-indigo-600/20 blur-[60px] md:blur-[120px] rounded-full -z-10 transform -translate-y-1/2"></div>
            <div className="relative group">
               <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[2.2rem] md:rounded-[3.2rem] opacity-30 group-hover:opacity-50 transition duration-1000 blur-xl"></div>
               <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border-8 border-white shadow-2xl">
                 <img 
                   src="https://r2.erweima.ai/i/157S76eRToK5E_3l_rX2Zg.png" 
                   alt="Dashboard ZapCobrança Real"
                   className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                 />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Message Section (Aesthetic Overhaul) */}
      <section className="py-24 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100/80 rounded-[2rem] text-emerald-600 mb-10 shadow-inner relative">
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full animate-pulse"></div>
            <svg className="w-10 h-10 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
            Aqui você não paga taxa de Pix.
          </h2>
          
          <div className="space-y-8">
            <p className="text-xl md:text-3xl text-slate-600 font-bold leading-tight max-w-4xl mx-auto">
              O dinheiro cai <span className="text-emerald-500 font-black">direto na sua conta</span>, sem intermediários.<br />
              Nós não mexemos no seu pagamento!
            </p>
            
            <div className="w-12 h-1 bg-indigo-100 mx-auto rounded-full"></div>
            
            <p className="text-xs md:text-sm text-slate-400 font-black uppercase tracking-[0.25em] max-w-2xl mx-auto leading-relaxed opacity-80">
              Nossa ferramenta apenas organiza seus clientes em um só lugar, de forma simples e prática.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {[
              { t: 'WhatsApp', d: 'Lembretes amigáveis e cobranças diretas sem atrito, na palma da mão.', i: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', c: 'indigo' },
              { t: 'Pix e Link', d: 'Sua chave Pix e links de pagamento sem intermediários ou taxas abusivas.', i: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', c: 'emerald' },
              { t: 'Gestão MRR', d: 'Acompanhe seu faturamento recorrente e saiba quem já pagou em segundos.', i: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', c: 'slate' }
            ].map((f, idx) => (
              <div key={idx} className="p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-${f.c}-50 rounded-2xl flex items-center justify-center text-${f.c === 'slate' ? 'slate-900' : f.c + '-600'} mb-6 md:mb-8 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={f.i} /></svg>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-4">{f.t}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Planos Transparentes</h2>
          <p className="text-slate-500 font-medium mb-12 md:mb-16">Escolha o plano ideal para a sua estrutura atual.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-sm md:max-w-none mx-auto">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
              const plan = PLANS[key];
              return (
                <div key={key} className={`relative p-8 md:p-10 rounded-[2.5rem] border-2 transition-all bg-white flex flex-col items-start text-left ${plan.recommended ? 'border-indigo-600 shadow-2xl scale-100 lg:scale-105 z-10' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase px-6 py-2 rounded-full whitespace-nowrap shadow-lg shadow-indigo-200">Recomendado</div>}
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-slate-400 text-xs md:text-sm font-medium mt-2 mb-6 leading-relaxed">{plan.description}</p>
                  <div className="mb-6 md:mb-8">
                    <span className="text-3xl md:text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-xs md:text-sm">/mês</span>
                  </div>
                  <ul className="space-y-3 md:space-y-4 w-full flex-1">
                    {[
                      `${plan.limit} Clientes Ativos`,
                      'Dashboard Financeiro',
                      'WhatsApp Direto',
                      'Automação de Mensagens'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs md:text-sm text-slate-600 font-bold">
                        <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-20 border-t border-slate-100 text-center px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">Z</div>
              <span className="text-base md:text-lg font-black text-slate-900">Desenvolvido por ZapCobranças</span>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">© 2025/2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
