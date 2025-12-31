
import React from 'react';

const Invoices: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mb-8 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
        Emissão de Notas Fiscais
      </h2>
      <div className="bg-indigo-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full mb-8">EM BREVE</div>
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-bold">
        “Em breve você poderá emitir nota fiscal direto pelo ZapCobranças”
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          { title: "NFSe Automática", desc: "Integração com prefeituras para emissão após o pagamento." },
          { title: "Envio por E-mail", desc: "Seu cliente recebe o PDF da nota automaticamente." },
          { title: "Painel Fiscal", desc: "Controle total de impostos e notas emitidas no mês." }
        ].map((feat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            </div>
            <h4 className="text-sm font-black text-slate-800 mb-2">{feat.title}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invoices;
