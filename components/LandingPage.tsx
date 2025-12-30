
import React, { useState } from 'react';
import { PLANS } from '../constants';
import Dashboard from './Dashboard';
import { Client, PaymentStatus } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Dados Mock para o Dashboard Preview
const MOCK_CLIENTS: Client[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `mock-${i}`,
  userId: 'mock',
  name: ['Empresa Alpha', 'Design Studio', 'Consultoria Tech', 'Marketing Pro'][i % 4],
  whatsapp: '11999999999',
  monthlyValue: 1200 + (i * 150),
  dueDay: 10,
  status: i < 5 ? PaymentStatus.PAID : i < 7 ? PaymentStatus.PENDING : PaymentStatus.OVERDUE,
  createdAt: new Date().toISOString(),
  customMessage: '',
  autoSend: false
}));

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">Z</div>
            <span className="text-xl font-black tracking-tight text-slate-900">ZapCobrança</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={onLogin} className="hidden md:block text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-full hover:bg-indigo-600 transition-all active:scale-95 shadow-lg hover:shadow-indigo-200"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 md:pt-48 pb-16 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Gestão Simples e Eficiente</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter mb-6">
              Organize suas cobranças e <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">receba em dia.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mb-10">
              Organize seus clientes em um só lugar, aqui você pode solicitar as cobranças de forma prática, rápida e profissional de apenas um lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all hover:-translate-y-1 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2"
              >
                Criar Conta Grátis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Ver Demonstração
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1"><svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Sem cartão de crédito</span>
              <span className="flex items-center gap-1"><svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Teste grátis de 7 dias</span>
            </div>
        </div>
      </section>

      {/* --- PROBLEM VS SOLUTION SECTION --- */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">A diferença é brutal.</h2>
            <p className="text-slate-500 mt-4 font-medium">Veja como sua vida muda com o ZapCobrança.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* O Jeito Antigo */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 mb-6 text-red-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-xl font-black text-slate-900">Manual (O Caos)</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <span className="text-xl">😓</span> Cobra timidamente e sente vergonha.
                </li>
                <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <span className="text-xl">📉</span> Esquece quem pagou e quem deve.
                </li>
                <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <span className="text-xl">⏳</span> Perde horas copiando e colando mensagens.
                </li>
                <li className="flex items-start gap-3 text-slate-600 font-medium">
                  <span className="text-xl">💸</span> Sem previsão de caixa.
                </li>
              </ul>
            </div>

            {/* O Jeito ZapCobrança */}
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-600 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 text-indigo-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-xl font-black text-slate-900">Organizado (A Paz)</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-slate-900 font-bold">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">✓</span>
                    Mensagens profissionais prontas para enviar.
                  </li>
                  <li className="flex items-start gap-3 text-slate-900 font-bold">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">✓</span>
                    Controle total em um Dashboard lindo.
                  </li>
                  <li className="flex items-start gap-3 text-slate-900 font-bold">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">✓</span>
                    Envio em 1 clique. Sem digitar tudo de novo.
                  </li>
                  <li className="flex items-start gap-3 text-slate-900 font-bold">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">✓</span>
                    <span className="text-indigo-600">Taxa ZERO</span> no Pix. O dinheiro é seu.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD PREVIEW SECTION --- */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest mb-4">Visão de Águia</div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Controle total, zero planilhas.</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Substitua aquele caderno velho ou a planilha do Excel por um sistema simples e eficiente.</p>
        </div>

        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
               <div className="relative bg-slate-50 rounded-[2rem] border-[6px] md:border-[10px] border-white shadow-2xl overflow-hidden pointer-events-none select-none p-4 md:p-8 transform transition-transform duration-700 hover:scale-[1.01]">
                 <div className="absolute inset-0 z-20"></div>
                 <div className="opacity-100">
                    <Dashboard clients={MOCK_CLIENTS} logs={[]} onQuickAdd={() => {}} />
                 </div>
               </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto">
            Conheça nossos planos e escolha o que faz sentido para você agora.
          </h2>
          <p className="text-slate-500 font-medium mb-16 text-lg">
            Sem compra recorrente. Você renova apenas se quiser.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
              const plan = PLANS[key];
              return (
                <div key={key} className={`relative p-10 rounded-[2.5rem] border-2 transition-all bg-white flex flex-col items-start text-left ${plan.recommended ? 'border-indigo-600 shadow-2xl scale-105 z-10 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-indigo-200 shadow-sm'}`}>
                  {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">Mais Escolhido</div>}
                  <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-sm">/mês</span>
                  </div>
                  <ul className="space-y-4 w-full flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Até {plan.limit} Clientes
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Envio via WhatsApp
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Dashboard Completo
                    </li>
                  </ul>
                  {/* Botão removido para exposição estática */}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              { q: "Preciso baixar algum aplicativo?", a: "Não! O ZapCobrança é 100% online. Você acessa pelo navegador do seu celular ou computador." },
              { q: "Posso usar minha própria chave Pix?", a: "Com certeza. O dinheiro vai direto para a sua conta bancária. Nós não tocamos no seu dinheiro." },
              { q: "O WhatsApp pode bloquear meu número?", a: "Nós usamos a API oficial do WhatsApp, o que garante maior segurança no envio das mensagens de cobrança." },
              { q: "Tem fidelidade?", a: "Nenhuma. Você pode cancelar a qualquer momento sem multa." }
            ].map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {item.q}
                  <svg className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-slate-500 leading-relaxed font-medium animate-in slide-in-from-top-2">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl shadow-indigo-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Pronto para organizar sua empresa?</h2>
            <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">Junte-se a centenas de profissionais que já simplificaram suas finanças.</p>
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-indigo-600 text-lg font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl"
            >
              Começar Teste Grátis
            </button>
            <p className="mt-6 text-xs font-bold text-indigo-200 opacity-80">Não pede cartão de crédito • Cancela quando quiser</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-100 bg-white text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2025 ZapCobrança. Feito para empreendedores.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
