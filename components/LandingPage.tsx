
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
            <button onClick={onLogin} className="text-xs md:text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 md:px-6 md:py-3 bg-slate-900 text-white text-xs md:text-sm font-black rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Grátis
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

          {/* UI Mockup - Visual representativo do Dashboard */}
          <div className="mt-16 md:mt-24 w-full max-w-5xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 px-2 sm:px-6">
            <div className="absolute inset-0 bg-indigo-600/10 md:bg-indigo-600/20 blur-[60px] md:blur-[120px] rounded-full -z-10 transform -translate-y-1/2"></div>
            <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 shadow-2xl border-[4px] md:border-[8px] border-slate-800">
              <div className="bg-slate-50 rounded-[1.8rem] md:rounded-[2.2rem] overflow-hidden aspect-video md:aspect-[16/9] flex flex-col">
                <div className="h-10 md:h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between">
                  <div className="flex gap-2 md:gap-4">
                    <div className="w-2 md:w-4 h-2 md:h-4 rounded-full bg-slate-200"></div>
                    <div className="w-16 md:w-24 h-2 md:h-4 rounded-full bg-slate-100"></div>
                  </div>
                  <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-slate-200"></div>
                </div>
                <div className="p-3 md:p-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  <div className="h-20 md:h-32 bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-3 md:p-6 flex flex-col justify-end">
                     <div className="w-10 md:w-12 h-2 md:h-3 bg-indigo-100 rounded mb-2"></div>
                     <div className="w-16 md:w-20 h-4 md:h-6 bg-indigo-600 rounded"></div>
                  </div>
                  <div className="h-20 md:h-32 bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-3 md:p-6 flex flex-col justify-end">
                     <div className="w-10 md:w-12 h-2 md:h-3 bg-emerald-100 rounded mb-2"></div>
                     <div className="w-16 md:w-20 h-4 md:h-6 bg-emerald-500 rounded"></div>
                  </div>
                  <div className="hidden md:flex h-32 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-end">
                     <div className="w-12 h-3 bg-slate-100 rounded mb-2"></div>
                     <div className="w-20 h-6 bg-slate-900 rounded"></div>
                  </div>
                  <div className="col-span-2 md:col-span-3 h-32 md:h-64 bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 p-4 md:p-8">
                     <div className="flex justify-between mb-4 md:mb-8">
                       <div className="w-24 md:w-32 h-4 md:h-6 bg-slate-200 rounded"></div>
                       <div className="w-12 md:w-20 h-4 md:h-6 bg-slate-100 rounded"></div>
                     </div>
                     <div className="space-y-3 md:space-y-4">
                        {[1,2].map(i => (
                          <div key={i} className="flex justify-between items-center pb-2 md:pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-8 md:w-10 h-8 md:h-10 bg-slate-100 rounded-lg md:rounded-xl"></div>
                              <div className="w-24 md:w-32 h-3 md:h-4 bg-slate-100 rounded"></div>
                            </div>
                            <div className="w-12 md:w-16 h-3 md:h-4 bg-indigo-50 rounded"></div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {[
            { v: '+10k', l: 'Cobranças' },
            { v: '98%', l: 'Taxa Receb.' },
            { v: '2min', l: 'Setup' },
            { v: '0%', l: 'Taxas Pix' }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl md:text-4xl font-black text-slate-900">{stat.v}</p>
              <p className="text-[8px] md:text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.l}</p>
            </div>
          ))}
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
                <div key={key} className={`relative p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 transition-all bg-white flex flex-col items-start text-left ${plan.recommended ? 'border-indigo-600 shadow-2xl scale-100 lg:scale-105 z-10' : 'border-slate-100 shadow-sm'}`}>
                  {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase px-6 py-2 rounded-full whitespace-nowrap">Recomendado</div>}
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-slate-400 text-xs md:text-sm font-medium mt-2 mb-6 leading-relaxed">{plan.description}</p>
                  <div className="mb-6 md:mb-8">
                    <span className="text-3xl md:text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-xs md:text-sm">/mês</span>
                  </div>
                  <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 w-full flex-1">
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
                  <button 
                    onClick={onGetStarted}
                    className={`w-full py-4 md:py-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${plan.recommended ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100'}`}
                  >
                    Assinar Agora
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-20 border-t border-slate-100 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">Profissionalize suas cobranças hoje.</h2>
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200"
          >
            Começar Grátis
          </button>
          <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center gap-4 md:gap-8 text-slate-400 text-xs md:text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center text-slate-400 font-black text-[7px]">Z</div>
              ZapCobrança © 2024
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-600">Termos</a>
              <a href="#" className="hover:text-slate-600">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
