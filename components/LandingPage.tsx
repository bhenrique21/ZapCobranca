
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">Z</div>
            <span className="text-xl font-black tracking-tight text-slate-900">ZapCobrança</span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={onLogin} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 bg-slate-900 text-white text-sm font-black rounded-full hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">SaaS B2B para Autônomos e Empresas</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Tenha acesso a um Dashboard para acompanhar e mensurar seus <span className="text-indigo-600">pagamentos mensais.</span>
          </h1>
          
          <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Organize seus clientes em um só lugar, onde você pode solicitar as cobranças de forma prática, rápida e profissional de apenas um lugar.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button 
              onClick={onGetStarted}
              className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-200"
            >
              Criar Conta Gratuita
            </button>
            <button 
              onClick={onLogin}
              className="px-12 py-5 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Já sou cliente
            </button>
          </div>

          {/* UI Mockup - Visual representativo do Dashboard */}
          <div className="mt-24 w-full max-w-6xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[120px] rounded-full -z-10 transform -translate-y-1/2"></div>
            <div className="bg-slate-900 rounded-[3rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[8px] border-slate-800">
              <div className="bg-slate-50 rounded-[2.2rem] overflow-hidden aspect-[16/9] flex flex-col">
                {/* Mini Header UI */}
                <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                    <div className="w-24 h-4 rounded-full bg-slate-100"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                </div>
                {/* Mini Body UI */}
                <div className="p-8 grid grid-cols-3 gap-6">
                  <div className="h-32 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-end">
                     <div className="w-12 h-3 bg-indigo-100 rounded mb-2"></div>
                     <div className="w-20 h-6 bg-indigo-600 rounded"></div>
                  </div>
                  <div className="h-32 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-end">
                     <div className="w-12 h-3 bg-emerald-100 rounded mb-2"></div>
                     <div className="w-20 h-6 bg-emerald-500 rounded"></div>
                  </div>
                  <div className="h-32 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-end">
                     <div className="w-12 h-3 bg-slate-100 rounded mb-2"></div>
                     <div className="w-20 h-6 bg-slate-900 rounded"></div>
                  </div>
                  <div className="col-span-3 h-64 bg-white rounded-[2rem] border border-slate-200 p-8">
                     <div className="flex justify-between mb-8">
                       <div className="w-32 h-6 bg-slate-200 rounded"></div>
                       <div className="w-20 h-6 bg-slate-100 rounded"></div>
                     </div>
                     <div className="space-y-4">
                        {[1,2,3].map(i => (
                          <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                              <div className="w-32 h-4 bg-slate-100 rounded"></div>
                            </div>
                            <div className="w-16 h-4 bg-indigo-50 rounded"></div>
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

      {/* Social Proof / Stats */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-black text-slate-900">+10k</p>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Cobranças Enviadas</p>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">98%</p>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Taxa de Recebimento</p>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">2min</p>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Tempo de Config.</p>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900">0%</p>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Taxas por Transação</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="p-10 bg-white rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-black mb-4">Envio via WhatsApp</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Lembretes amigáveis e cobranças diretas sem atrito, abrindo o app do seu cliente na hora.</p>
            </div>

            <div className="p-10 bg-white rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black mb-4">Pix e Link Direto</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Configure sua chave Pix e envie links de pagamento sem intermediários ou taxas extras sobre suas vendas.</p>
            </div>

            <div className="p-10 bg-white rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black mb-4">Gestão de MRR</h3>
              <p className="text-slate-500 leading-relaxed font-medium">Acompanhe seu faturamento recorrente mensal e saiba exatamente quem já pagou e quem está em atraso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Final */}
      <footer className="py-20 border-t border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <h2 className="text-3xl font-black mb-8">Pronto para profissionalizar suas cobranças?</h2>
          <button 
            onClick={onGetStarted}
            className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200"
          >
            Começar Agora Grátis
          </button>
          <div className="mt-16 flex flex-col md:flex-row items-center gap-8 text-slate-400 text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-400 font-black text-[8px]">Z</div>
              ZapCobrança © 2024
            </div>
            <a href="#" className="hover:text-slate-600">Termos</a>
            <a href="#" className="hover:text-slate-600">Privacidade</a>
            <a href="#" className="hover:text-slate-600">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
