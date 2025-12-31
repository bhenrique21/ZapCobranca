
import React, { useState, useEffect } from 'react';
import { PLANS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para mudar estilo do header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dados estáticos para o Preview fiel ao Dashboard real
  const mockChartData = [
    { name: 'Set', pago: 4500 },
    { name: 'Out', pago: 6200 },
    { name: 'Nov', pago: 5800 },
    { name: 'Dez', pago: 7100 },
    { name: 'Jan', pago: 6900 },
    { name: 'Fev', pago: 8200 },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group z-50 relative" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">Z</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ZapCobrança</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
             <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Funcionalidades</button>
             <button onClick={() => scrollToSection('pricing')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Preços</button>
             <button onClick={() => scrollToSection('faq')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">FAQ</button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-200 transform active:scale-95"
            >
              Começar Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600 z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 animate-in slide-in-from-top-10 duration-200">
             <nav className="flex flex-col gap-6 text-center">
                <button onClick={() => scrollToSection('features')} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Funcionalidades</button>
                <button onClick={() => scrollToSection('pricing')} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Preços</button>
                <button onClick={() => scrollToSection('faq')} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Perguntas Frequentes</button>
                <div className="flex flex-col gap-4 mt-8">
                   <button onClick={() => { setIsMobileMenuOpen(false); onLogin(); }} className="w-full py-4 rounded-xl border border-slate-200 font-bold text-slate-700">Fazer Login</button>
                   <button onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }} className="w-full py-4 rounded-xl bg-indigo-600 font-bold text-white shadow-xl shadow-indigo-200">Começar Grátis</button>
                </div>
             </nav>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-50 rounded-full blur-[80px] md:blur-[100px] opacity-60 mix-blend-multiply"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-50 rounded-full blur-[80px] md:blur-[120px] opacity-60 mix-blend-multiply"></div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-slate-200 rounded-full mb-6 md:mb-8 shadow-sm hover:border-indigo-200 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-600">Gestão Simples e Eficiente</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Cobranças pelo WhatsApp, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">sem constrangimento e sem esquecer ninguém.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-8 md:mb-10 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Organize seus clientes em um só lugar. Solicite pagamentos de forma prática, rápida e profissional sem complicações.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 text-base active:scale-95"
              >
                Criar Conta Grátis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>

            <div className="mt-8 md:mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-semibold text-slate-400 animate-in fade-in delay-300">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Sem cartão de crédito</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 7 dias grátis</span>
            </div>
        </div>

        {/* --- DASHBOARD PREVIEW (REAL APP REPLICA) --- */}
        <div className="mt-16 md:mt-20 max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[1.5rem] md:rounded-[2.5rem] blur-xl opacity-20"></div>
           <div className="relative bg-[#F8FAFC] border-[4px] md:border-[10px] border-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden">
               {/* Header Fake do Browser */}
               <div className="bg-white px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex gap-1.5 md:gap-2">
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400"></div>
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="hidden md:flex h-6 w-64 bg-slate-50 rounded-lg border border-slate-100 items-center justify-center text-[10px] text-slate-400 font-medium">
                    app.zapcobranca.com.br/dashboard
                  </div>
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] md:text-xs font-bold">U</div>
               </div>
               
               {/* CONTEÚDO FIEL AO DASHBOARD.TSX (Escalado para mobile) */}
               <div className="p-4 md:p-8 space-y-4 md:space-y-6 overflow-x-auto md:overflow-visible">
                   {/* Header do App */}
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">Status Financeiro</h2>
                        <p className="text-[10px] md:text-xs text-slate-500 font-medium">Fluxo de caixa (Regime de Caixa).</p>
                      </div>
                      <div className="hidden md:flex gap-2">
                         <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">Fevereiro</div>
                         <div className="bg-indigo-600 px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2">
                            <span>Novo Cliente</span>
                         </div>
                      </div>
                   </div>

                   {/* Grid de Cards Bento */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-w-[300px]">
                      {/* Dark Hero Card */}
                      <div className="bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] shadow-xl text-white relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                         </div>
                         <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 rounded-full mb-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                               <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-300">Faturamento</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-black tracking-tight">R$ 12.450</p>
                            <div className="flex items-center gap-2 mt-2 md:mt-3 text-[9px] font-bold text-slate-400">
                               <span>+12% vs anterior</span>
                            </div>
                         </div>
                      </div>

                      {/* Green Card */}
                      <div className="bg-emerald-500 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] shadow-xl text-white relative overflow-hidden">
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Recebido</p>
                          <p className="text-2xl md:text-3xl font-black mt-2 tracking-tight">R$ 8.200</p>
                          <p className="text-[9px] font-bold mt-2 md:mt-3 opacity-80">5 pagamentos</p>
                      </div>

                      {/* White Card 1 */}
                      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] border border-slate-200 shadow-sm hidden md:block">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Pendente</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">R$ 4.250</p>
                          <p className="text-[9px] font-black text-amber-500 mt-3 uppercase tracking-tighter">3 transações</p>
                      </div>

                      {/* White Card 2 */}
                      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] border border-slate-200 shadow-sm hidden lg:block">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket Médio</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">R$ 1.556</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase">Base: 8 clientes</p>
                      </div>
                   </div>

                   {/* Charts Area */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm h-[250px] md:h-[300px] flex flex-col">
                          <div className="mb-2 md:mb-4">
                             <h3 className="text-sm md:text-lg font-black text-slate-800">Receita Realizada</h3>
                             <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">Últimos 6 meses</p>
                          </div>
                          <div className="flex-1 w-full -ml-2 md:ml-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} width={30} />
                                <Tooltip 
                                  cursor={{ fill: '#f8fafc', radius: 10 }}
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="pago" fill="#10b981" radius={[6, 6, 6, 6]} barSize={20} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Mobile hide Detail list to save space or stack it */}
                      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-[250px] md:h-[300px] hidden md:flex">
                          <div className="mb-4">
                             <h3 className="text-lg font-black text-slate-800">Pagamentos</h3>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Recentes</p>
                          </div>
                          <div className="space-y-3 overflow-hidden relative">
                             {/* Pendentes */}
                             <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                <span className="font-bold text-slate-700 text-xs">Consultoria Tech</span>
                                <span className="font-black text-amber-600 text-xs">R$ 2.500</span>
                             </div>
                             <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                <span className="font-bold text-slate-700 text-xs">Design Studio</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-black text-red-500">ATRASADO</span>
                                  <span className="font-black text-amber-600 text-xs">R$ 1.200</span>
                                </div>
                             </div>
                             <div className="w-full h-px bg-slate-100 my-2"></div>
                             {/* Pagos */}
                             <div className="flex justify-between items-center p-2 opacity-60">
                                <span className="font-bold text-slate-700 text-xs">Agência MKT</span>
                                <span className="font-black text-emerald-600 text-xs">R$ 3.000</span>
                             </div>
                          </div>
                      </div>
                   </div>
               </div>
           </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs mb-2 block">Por que escolher o ZapCobrança?</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">Gerencie menos,<br/> receba mais.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 md:mb-4">Economia de Tempo</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                Deixe de perder horas copiando e colando mensagens. Com um clique, você envia lembretes profissionais.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                 <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 md:mb-4">Organização Total</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                Saiba exatamente quem pagou, quem deve e quanto dinheiro vai entrar. Adeus planilhas confusas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                 <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 md:mb-4">Taxa Zero no Pix</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                O dinheiro vai direto para sua conta. Não intermediamos pagamentos, apenas organizamos sua vida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
        {/* Decorative Blob */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs mb-2 block">Investimento Inteligente</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">Planos que cabem no bolso.</h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
              Comece grátis. Cancele quando quiser. Sem letras miúdas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
              const plan = PLANS[key];
              const isRecommended = plan.recommended;
              return (
                <div 
                  key={key} 
                  className={`relative p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-300 flex flex-col h-full
                    ${isRecommended 
                      ? 'bg-slate-900 text-white shadow-2xl scale-100 md:scale-105 z-10 ring-8 ring-slate-900/10' 
                      : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg'
                    }
                  `}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase px-4 py-2 rounded-bl-2xl rounded-tr-[2rem]">
                       Popular
                    </div>
                  )}
                  
                  <div className="mb-6 md:mb-8">
                     <h3 className={`text-xl font-bold mb-2 ${isRecommended ? 'text-indigo-300' : 'text-slate-500'}`}>{plan.name}</h3>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black">{plan.price}</span>
                        <span className={`text-xs md:text-sm font-bold ${isRecommended ? 'text-slate-400' : 'text-slate-400'}`}>/mês</span>
                     </div>
                     <p className={`mt-4 text-xs md:text-sm font-medium ${isRecommended ? 'text-slate-400' : 'text-slate-500'}`}>
                        {plan.description}
                     </p>
                  </div>

                  <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm font-bold">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isRecommended ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>✓</div>
                      Até {plan.limit} Clientes
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isRecommended ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>✓</div>
                      Envio via WhatsApp
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isRecommended ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>✓</div>
                      Dashboard Completo
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isRecommended ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>✓</div>
                      Suporte Prioritário
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-16 md:py-24 bg-slate-50 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Dúvidas Comuns</h2>
            <p className="text-slate-500">Tudo o que você precisa saber antes de começar.</p>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "Preciso baixar algum aplicativo?", a: "Não! O ZapCobrança é 100% online (Web App). Você acessa pelo navegador do seu celular, tablet ou computador, sem ocupar memória." },
              { q: "Posso usar minha própria chave Pix?", a: "Com certeza. O dinheiro vai direto para a sua conta bancária. Nós não tocamos no seu dinheiro e não cobramos taxas sobre transações." },
              { q: "O WhatsApp pode bloquear meu número?", a: "Utilizamos as melhores práticas e APIs oficiais para garantir segurança. Porém, recomendamos sempre usar boas práticas de envio e evitar spam." },
              { q: "Tem fidelidade?", a: "Nenhuma. Você assina mensalmente e pode cancelar a qualquer momento sem multas ou taxas surpresas." }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[20px] overflow-hidden transition-all hover:border-indigo-200">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left font-bold text-slate-800 text-sm md:text-lg"
                >
                  <span className="pr-4">{item.q}</span>
                  <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6 text-slate-500 leading-relaxed font-medium text-sm md:text-base animate-in slide-in-from-top-1">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
           <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center relative overflow-hidden">
              {/* Abstract shapes */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl md:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight">Pronto para organizar sua empresa?</h2>
                <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10">
                  Junte-se a centenas de profissionais que já simplificaram suas finanças com o ZapCobrança.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={onGetStarted}
                    className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl active:scale-95 text-base md:text-lg"
                  >
                    Começar Teste Grátis
                  </button>
                </div>
                <p className="mt-6 md:mt-8 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Sem compromisso • Sem cartão</p>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 md:py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Z</div>
             <span className="font-bold text-slate-900">ZapCobrança</span>
          </div>
          <div className="text-slate-400 text-xs md:text-sm font-medium text-center md:text-left">
             © 2025 ZapCobrança. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
             <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
             <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
