
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
          isMobileMenuOpen 
            ? 'bg-white' 
            : (scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-2' : 'bg-transparent py-4')
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group z-50 relative" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">Z</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ZapCobrança</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
             <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Funcionalidades</button>
             <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Como Funciona</button>
             <button onClick={() => scrollToSection('pricing')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Preços</button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-200 transform active:scale-95"
            >
              Começar Grátis
            </button>
          </div>

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

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-[40] flex flex-col pt-24 px-6 animate-in slide-in-from-top-10 duration-200">
             <nav className="flex flex-col gap-6 text-center">
                <button onClick={() => scrollToSection('features')} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Funcionalidades</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Como Funciona</button>
                <button onClick={() => scrollToSection('pricing')} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Preços</button>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-50 rounded-full blur-[80px] md:blur-[100px] opacity-60 mix-blend-multiply"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-50 rounded-full blur-[80px] md:blur-[120px] opacity-60 mix-blend-multiply"></div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-slate-200 rounded-full mb-6 md:mb-8 shadow-sm hover:border-indigo-200 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-600">Gestão Simples e Eficiente</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.2] tracking-tight mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Cobranças pelo WhatsApp, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x italic">sem constrangimento e sem esquecer ninguém.</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-3xl mb-8 md:mb-10 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Automatize lembretes de pagamento, organize seus clientes e tenha controle total das cobranças, tudo em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-10 py-4.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 text-base md:text-lg active:scale-95"
              >
                Começar grátis agora
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
        </div>

        {/* --- DASHBOARD PREVIEW --- */}
        <div className="mt-16 md:mt-20 max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
           <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[1.5rem] md:rounded-[2.5rem] blur-xl opacity-20"></div>
           <div className="relative bg-[#F8FAFC] border-[4px] md:border-[10px] border-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden">
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
               
               <div className="p-4 md:p-8 space-y-4 md:space-y-6 overflow-x-auto md:overflow-visible">
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

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-w-[300px]">
                      <div className="bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] shadow-xl text-white relative overflow-hidden group">
                         <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 rounded-full mb-3">
                               <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                               <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-300">Faturamento</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-black tracking-tight">R$ 12.450</p>
                         </div>
                      </div>
                      <div className="bg-emerald-500 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] shadow-xl text-white">
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Recebido</p>
                          <p className="text-2xl md:text-3xl font-black mt-2 tracking-tight">R$ 8.200</p>
                      </div>
                      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] border border-slate-200 shadow-sm hidden md:block">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Pendente</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">R$ 4.250</p>
                      </div>
                      <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] border border-slate-200 shadow-sm hidden lg:block">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket Médio</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">R$ 1.556</p>
                      </div>
                   </div>
               </div>
           </div>
        </div>
      </section>

      {/* --- PAIN POINTS SECTION --- */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-6">
              Você ainda perde tempo cobrando clientes manualmente?
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cobrar não deveria ser um problema — deveria ser automático.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Esquece de cobrar", desc: "Perde o dia certo e acaba recebendo com atraso por falta de lembrete.", icon: "🗓️" },
              { title: "Mensagem constrangedora", desc: "A sensação de 'pedir' o seu próprio dinheiro todo mês é horrível.", icon: "😰" },
              { title: "Falta de controle", desc: "Não saber quem já pagou ou quem está devendo sem olhar o extrato.", icon: "📊" },
              { title: "Conversas perdidas", desc: "Planilhas, blocos de notas e chats misturados que dificultam a gestão.", icon: "🌪️" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- THE SOLUTION SECTION --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs mb-4 block">🚀 A SOLUÇÃO</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
                O ZapCobranças faz a cobrança por você
              </h2>
              <div className="space-y-6">
                {[
                  "Envie cobranças automáticas pelo WhatsApp",
                  "Personalize mensagens com nome, valor e vencimento",
                  "Organize todos os seus clientes em um só painel",
                  "Saiba exatamente quem pagou e quem está em atraso"
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-lg font-bold text-slate-700">{text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-10 text-slate-500 font-medium">Tudo simples, rápido e sem complicação.</p>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  </div>
                  <h4 className="text-2xl font-black mb-6 relative z-10">Mensagem de Exemplo</h4>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative z-10">
                    <p className="text-sm md:text-base italic leading-relaxed">
                      "Olá <span className="text-indigo-200 font-black">João</span>, este é um lembrete amigável sobre sua mensalidade de <span className="text-indigo-200 font-black">R$ 150,00</span> com vencimento em <span className="text-indigo-200 font-black">dia 10</span>. Você pode realizar o pagamento via Pix: <span className="text-indigo-200 font-black">financeiro@suaempresa.com</span>"
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (3 STEPS) --- */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-indigo-400 font-bold tracking-wider uppercase text-xs mb-4 block">⚙️ COMO FUNCIONA</span>
            <h2 className="text-3xl md:text-5xl font-black">Em apenas 3 passos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 hidden md:block -translate-y-1/2"></div>
            
            {[
              { step: "01", title: "Cadastre seus clientes", desc: "Informe nome, WhatsApp, valor e vencimento.", icon: "👥" },
              { step: "02", title: "Configure a mensagem", desc: "Escolha um modelo ou personalize do seu jeito.", icon: "💬" },
              { step: "03", title: "Envie ou automatize", desc: "O ZapCobranças lembra e envia no momento certo.", icon: "🚀" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-xl shadow-indigo-500/20">
                  {item.icon}
                </div>
                <div className="text-indigo-400 font-black text-xs mb-2 tracking-widest">{item.step}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <p className="text-indigo-300 font-bold">👉 Você economiza tempo e evita atrasos.</p>
          </div>
        </div>
      </section>

      {/* --- MAIN FEATURES GRID --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">📊 FUNCIONALIDADES PRINCIPAIS</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Cadastro de clientes", icon: "📋" },
              { label: "Agenda de cobranças", icon: "🗓️" },
              { label: "Envio via WhatsApp", icon: "💬" },
              { label: "Cobranças recorrentes", icon: "🔁" },
              { label: "Dashboard de controle", icon: "📈" },
              { label: "Histórico de cobranças", icon: "🧾" },
              { label: "Link de pagamento próprio", icon: "🔗" },
              { label: "Taxa Zero no PIX", icon: "⚡" }
            ].map((feat, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-indigo-200 transition-all">
                <span className="text-3xl mb-4 group-hover:scale-110 transition-transform">{feat.icon}</span>
                <span className="text-sm font-bold text-slate-800">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TARGET AUDIENCE (PARA QUEM É) --- */}
      <section className="py-24 bg-indigo-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">🧲 PARA QUEM É</h2>
            <p className="text-slate-500 font-medium">Ideal para quem cobra mensalidades ou serviços.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Prestadores de Serviço", list: ["Agências de Marketing", "Web Designers", "Freelancers", "Consultores"] },
              { title: "Pequenas Empresas", list: ["Escolas de Cursos", "Personal Trainers", "Contabilidades", "Pet Shops"] },
              { title: "Autônomos e MEI", list: ["Fotógrafos", "Psicólogos", "Professores Particulares", "Terapias"] }
            ].map((card, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-indigo-600 mb-6">{card.title}</h3>
                <ul className="space-y-4">
                  {card.list.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-lg text-slate-700 font-bold">Se você precisa cobrar clientes todo mês, o ZapCobranças é para você.</p>
          </div>
        </div>
      </section>

      {/* --- DIFFERENTIATOR SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs mb-4 block">🧠 DIFERENCIAL</span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-12">Por que usar o ZapCobranças?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {[
              { title: "Não é intermediador", desc: "Você recebe o dinheiro direto na sua conta bancária via PIX ou Link que já usa.", icon: "🏦" },
              { title: "Taxa Zero", desc: "Não cobramos porcentagem sobre seus recebimentos. Sua mensalidade é fixa.", icon: "🏷️" },
              { title: "Seu jeito, suas regras", desc: "Funciona com o pagamento que você já usa (Nubank, MP, Stripe, Inter).", icon: "🛠️" },
              { title: "Foco em Simplicidade", desc: "Interface intuitiva pensada para quem não quer perder tempo com sistemas complexos.", icon: "✨" }
            ].map((diff, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <span className="text-3xl">{diff.icon}</span>
                <div>
                   <h4 className="font-bold text-slate-900 mb-1">{diff.title}</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{diff.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 text-slate-400 font-bold italic">Você cobra do seu jeito. O ZapCobranças só facilita.</p>
        </div>
      </section>

      {/* --- CONFIANÇA E SEGURANÇA --- */}
      <section className="py-24 bg-indigo-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="text-indigo-300 font-bold tracking-wider uppercase text-xs mb-4 block">🛡️ PRIVACIDADE</span>
          <h2 className="text-3xl md:text-5xl font-black mb-16">🔒 CONFIANÇA E SEGURANÇA</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Dados Protegidos", desc: "Seus dados e de seus clientes são criptografados e armazenados com segurança.", icon: "🛡️" },
              { title: "Controle Total", desc: "Você tem o domínio completo sobre quem cobrar e como as mensagens são enviadas.", icon: "🎮" },
              { title: "Pagamento Direto", desc: "Nenhum pagamento passa pela plataforma. O dinheiro cai direto na sua conta.", icon: "💸" },
              { title: "Transparência", desc: "Transparência desde o início, sem taxas ocultas ou intermediários surpresa.", icon: "💎" }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center group hover:bg-white/10 transition-all">
                <div className="text-4xl mb-6">{item.icon.split(' ')[0]}</div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-indigo-200 text-sm font-medium leading-relaxed opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Investimento Simples</h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Escolha o plano ideal para o tamanho da sua base de clientes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
              const plan = PLANS[key];
              const isRecommended = plan.recommended;
              return (
                <div 
                  key={key} 
                  className={`relative p-8 md:p-10 rounded-[2.5rem] transition-all duration-300 flex flex-col h-full
                    ${isRecommended 
                      ? 'bg-slate-900 text-white shadow-2xl scale-100 md:scale-105 z-10' 
                      : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm'
                    }
                  `}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase px-4 py-2 rounded-bl-2xl rounded-tr-[2rem]">
                       Popular
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${isRecommended ? 'text-indigo-300' : 'text-slate-500'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-xs font-bold opacity-60">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm font-bold">✓ Até {plan.limit} Clientes</li>
                    <li className="flex items-center gap-3 text-sm font-bold">✓ WhatsApp Ilimitado</li>
                    <li className="flex items-center gap-3 text-sm font-bold">✓ Suporte Premium</li>
                  </ul>
                  <button onClick={onGetStarted} className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${isRecommended ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Assinar {plan.name}</button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- ROADMAP (EM BREVE) --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs mb-4 block">🧾 EM BREVE</span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-12">Recursos em desenvolvimento</h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {["Emissão de nota fiscal", "Relatórios avançados", "Automação inteligente", "Split de pagamentos"].map((item, i) => (
              <div key={i} className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-full text-sm font-bold text-slate-500 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                 {item}
              </div>
            ))}
          </div>
          <p className="mt-12 text-indigo-600 font-black tracking-tight">👉 Um sistema que cresce junto com você.</p>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 bg-slate-50 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Dúvidas Comuns</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Preciso baixar algum aplicativo?", a: "Não! O ZapCobrança é 100% online (Web App). Você acessa pelo navegador do seu celular ou computador." },
              { q: "Posso usar minha própria chave Pix?", a: "Com certeza. O dinheiro vai direto para a sua conta bancária. Nós não intermediamos pagamentos." },
              { q: "O WhatsApp pode bloquear meu número?", a: "Utilizamos as melhores práticas e APIs oficiais para garantir segurança." },
              { q: "Tem fidelidade?", a: "Nenhuma. Você assina mensalmente e pode cancelar a qualquer momento sem multas." }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 text-sm md:text-base"
                >
                  <span className="pr-4">{item.q}</span>
                  <div className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-500 text-sm font-medium animate-in slide-in-from-top-1">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL (fechamento forte) --- */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
           <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>
              <div className="relative z-10">
                <span className="text-indigo-400 font-black tracking-widest uppercase text-xs mb-4 block">📣 CTA FINAL</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                  Pare de perder tempo cobrando clientes. <br className="hidden md:block" />
                  Comece a usar o ZapCobranças hoje.
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                  <button 
                    onClick={onGetStarted}
                    className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-full hover:bg-indigo-500 transition-all hover:scale-105 shadow-xl shadow-indigo-500/20 active:scale-95 text-lg flex items-center justify-center gap-2"
                  >
                    👉 Criar conta grátis
                  </button>
                </div>
                <p className="mt-8 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest italic">
                  Junte-se a centenas de profissionais que já simplificaram suas finanças.
                </p>
              </div>
           </div>
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Z</div>
             <span className="font-bold text-slate-900">ZapCobrança</span>
          </div>
          <div className="text-slate-400 text-xs font-medium">
             © 2025 ZapCobrança. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
