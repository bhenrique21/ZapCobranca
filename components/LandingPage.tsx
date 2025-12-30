
import React, { useState } from 'react';
import { PLANS } from '../constants';
import { Client, PaymentStatus } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">Z</div>
            <span className="text-lg md:text-xl font-black tracking-tight text-slate-900">ZapCobrança</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={onLogin} className="text-xs md:text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors px-2 py-2">Entrar</button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 md:px-6 md:py-2.5 bg-slate-900 text-white text-xs md:text-sm font-black rounded-full hover:bg-indigo-600 transition-all active:scale-95 shadow-lg hover:shadow-indigo-200"
            >
              Começar
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-28 md:pt-48 pb-12 md:pb-16 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-indigo-300/20 rounded-full blur-[80px] md:blur-[100px] mix-blend-multiply animate-blob"></div>
          <div className="absolute top-40 right-10 w-48 h-48 md:w-72 md:h-72 bg-purple-300/20 rounded-full blur-[80px] md:blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6 md:mb-8 hover:bg-indigo-100 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-600">Gestão Simples e Eficiente</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] md:leading-[1.05] tracking-tighter mb-4 md:mb-6 px-2">
              Organize suas cobranças e <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">receba em dia.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl md:max-w-3xl mb-8 md:mb-10 px-4">
              Organize seus clientes em um só lugar, aqui você pode solicitar as cobranças de forma prática, rápida e profissional de apenas um lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto justify-center px-4">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all hover:-translate-y-1 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 text-sm md:text-base active:scale-95"
              >
                Criar Conta Grátis
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-white text-slate-900 font-black rounded-xl md:rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-sm md:text-base active:scale-95"
              >
                Ver Demonstração
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] md:text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg> Teste grátis de 7 dias</span>
            </div>
        </div>
      </section>

      {/* --- PROBLEM VS SOLUTION SECTION --- */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900">A diferença é brutal.</h2>
            <p className="text-sm md:text-base text-slate-500 mt-2 md:mt-4 font-medium">Veja como sua vida muda com o ZapCobrança.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* O Jeito Antigo */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 mb-6 text-red-500">
                <div className="p-2 bg-red-50 rounded-xl">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Manual (O Caos)</h3>
              </div>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 text-slate-600 font-medium text-sm md:text-base">
                  <span className="text-lg shrink-0">😓</span> <span className="pt-0.5">Cobra timidamente e sente vergonha.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 font-medium text-sm md:text-base">
                  <span className="text-lg shrink-0">📉</span> <span className="pt-0.5">Esquece quem pagou e quem deve.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 font-medium text-sm md:text-base">
                  <span className="text-lg shrink-0">⏳</span> <span className="pt-0.5">Perde horas copiando e colando mensagens.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 font-medium text-sm md:text-base">
                  <span className="text-lg shrink-0">💸</span> <span className="pt-0.5">Sem previsão de caixa.</span>
                </li>
              </ul>
            </div>

            {/* O Jeito ZapCobrança */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-indigo-600 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900">Organizado (A Paz)</h3>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start gap-3 text-slate-900 font-bold text-sm md:text-base">
                    <span className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-[10px] md:text-xs shrink-0 mt-0.5">✓</span>
                    <span className="pt-0.5">Mensagens profissionais prontas para enviar.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-900 font-bold text-sm md:text-base">
                    <span className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-[10px] md:text-xs shrink-0 mt-0.5">✓</span>
                    <span className="pt-0.5">Controle total em um Dashboard lindo.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-900 font-bold text-sm md:text-base">
                    <span className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-[10px] md:text-xs shrink-0 mt-0.5">✓</span>
                    <span className="pt-0.5">Envio em 1 clique. Sem digitar tudo de novo.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-900 font-bold text-sm md:text-base">
                    <span className="w-5 h-5 md:w-6 md:h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-[10px] md:text-xs shrink-0 mt-0.5">✓</span>
                    <span className="pt-0.5">
                      <span className="text-indigo-600">Taxa ZERO</span> no Pix. O dinheiro é seu.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD PREVIEW SECTION (SIMPLIFICADO) --- */}
      <section className="py-16 md:py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-10 md:mb-16">
          <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4">Visão de Águia</div>
          <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6">Controle total, zero poluição.</h2>
          <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto px-4">Substitua aquele caderno velho ou a planilha do Excel por um painel simples e direto ao ponto.</p>
        </div>

        <div className="max-w-5xl mx-auto px-0 sm:px-4">
          <div className="relative group">
               {/* Efeito de brilho de fundo */}
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
               
               {/* Container do Dashboard Visual */}
               <div className="relative bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border-[4px] md:border-[8px] border-white shadow-xl overflow-hidden pointer-events-none select-none">
                 
                 {/* Topo do Dashboard */}
                 <div className="bg-white border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Visão Geral</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">Fevereiro 2025</p>
                    </div>
                    <div className="flex gap-2">
                       <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">A</div>
                       <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 md:p-8 space-y-8">
                    {/* Cards de Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Total</p>
                          <p className="text-2xl font-black text-slate-900">R$ 8.450,00</p>
                       </div>
                       <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2">Recebido</p>
                          <p className="text-2xl font-black text-emerald-700">R$ 5.200,00</p>
                       </div>
                       <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm opacity-60">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Pendente</p>
                          <p className="text-2xl font-black text-slate-900">R$ 3.250,00</p>
                       </div>
                    </div>

                    {/* Conteúdo Principal (Gráfico Simulado + Lista) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Gráfico Simulado Visual */}
                        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-64 flex flex-col justify-end gap-2 relative overflow-hidden">
                           <div className="absolute top-6 left-6 text-sm font-bold text-slate-800">Evolução Mensal</div>
                           <div className="flex items-end justify-between h-32 w-full gap-2 md:gap-4 px-2">
                              {[30, 45, 35, 60, 50, 75, 55, 80].map((h, i) => (
                                 <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group">
                                    <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all"></div>
                                 </div>
                              ))}
                           </div>
                           <div className="flex justify-between px-2 text-[10px] font-bold text-slate-300 uppercase">
                              <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span>
                           </div>
                        </div>

                        {/* Lista Simplificada */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                           <div className="text-sm font-bold text-slate-800 mb-2">Últimas Cobranças</div>
                           
                           {[
                             { name: 'Empresa Alpha', val: 'R$ 1.200', status: 'pago' },
                             { name: 'Design Studio', val: 'R$ 850', status: 'pendente' },
                             { name: 'Tech Solutions', val: 'R$ 2.400', status: 'atrasado' },
                           ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between text-xs pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                <div>
                                   <p className="font-bold text-slate-700">{item.name}</p>
                                   <p className="font-medium text-slate-400 text-[10px]">Mensalidade</p>
                                </div>
                                <div className="text-right">
                                   <p className="font-black text-slate-800">{item.val}</p>
                                   {item.status === 'pago' && <span className="text-[9px] font-black text-emerald-500 uppercase">Pago</span>}
                                   {item.status === 'pendente' && <span className="text-[9px] font-black text-amber-500 uppercase">Aberto</span>}
                                   {item.status === 'atrasado' && <span className="text-[9px] font-black text-red-500 uppercase">Atrasado</span>}
                                </div>
                             </div>
                           ))}
                        </div>
                    </div>
                 </div>
               </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-16 md:py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-4 md:mb-6 max-w-4xl mx-auto leading-tight">
            Conheça nossos planos e escolha o que faz sentido para você agora.
          </h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium mb-10 md:mb-16">
            Sem compra recorrente. Você renova apenas se quiser.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
              const plan = PLANS[key];
              return (
                <div key={key} className={`relative p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all bg-white flex flex-col items-center text-center ${plan.recommended ? 'border-indigo-600 shadow-2xl scale-100 md:scale-105 z-10 ring-4 ring-indigo-50 order-first md:order-none' : 'border-slate-200 hover:border-indigo-200 shadow-sm'}`}>
                  {plan.recommended && <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] md:text-[10px] font-black uppercase px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-lg">Mais Escolhido</div>}
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">{plan.name}</h3>
                  <div className="my-4 md:my-6">
                    <span className="text-3xl md:text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-xs md:text-sm">/mês</span>
                  </div>
                  <ul className="space-y-3 md:space-y-4 w-full flex-1">
                    <li className="flex items-center justify-center gap-3 text-xs md:text-sm text-slate-700 font-bold">
                      <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Até {plan.limit} Clientes
                    </li>
                    <li className="flex items-center justify-center gap-3 text-xs md:text-sm text-slate-700 font-bold">
                      <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Envio via WhatsApp
                    </li>
                    <li className="flex items-center justify-center gap-3 text-xs md:text-sm text-slate-700 font-bold">
                      <svg className="w-5 h-5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Dashboard Completo
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 mb-8 md:mb-12">Perguntas Frequentes</h2>
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "Preciso baixar algum aplicativo?", a: "Não! O ZapCobrança é 100% online. Você acessa pelo navegador do seu celular ou computador." },
              { q: "Posso usar minha própria chave Pix?", a: "Com certeza. O dinheiro vai direto para a sua conta bancária. Nós não tocamos no seu dinheiro." },
              { q: "O WhatsApp pode bloquear meu número?", a: "Nós usamos a API oficial do WhatsApp, o que garante maior segurança no envio das mensagens de cobrança." },
              { q: "Tem fidelidade?", a: "Nenhuma. Você pode cancelar a qualquer momento sem multa." }
            ].map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors text-sm md:text-base"
                >
                  <span className="pr-4">{item.q}</span>
                  <svg className={`w-5 h-5 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openFaq === i && (
                  <div className="p-5 md:p-6 pt-0 text-slate-500 leading-relaxed font-medium animate-in slide-in-from-top-2 text-sm md:text-base border-t border-slate-100 mt-2">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-16 md:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto bg-indigo-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-white shadow-2xl shadow-indigo-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight">Pronto para organizar sua empresa?</h2>
            <p className="text-indigo-100 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 font-medium">Junte-se a centenas de profissionais que já simplificaram suas finanças.</p>
            <button 
              onClick={onGetStarted}
              className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-indigo-600 text-base md:text-lg font-black rounded-xl md:rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl active:scale-95"
            >
              Começar Teste Grátis
            </button>
            <p className="mt-6 text-[10px] md:text-xs font-bold text-indigo-200 opacity-80">Não pede cartão de crédito • Cancela quando quiser</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 md:py-12 border-t border-slate-100 bg-white text-center px-4">
        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">© 2025 ZapCobrança. Feito para empreendedores.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
