
import React from 'react';

interface TrialBlockedProps {
  onGoToBilling: () => void;
  onLogout: () => void;
  isTrial: boolean;
}

const TrialBlocked: React.FC<TrialBlockedProps> = ({ onGoToBilling, onLogout, isTrial }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-red-100 rounded-[2rem] flex items-center justify-center text-red-600 mb-8 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 10h10a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2z" />
        </svg>
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
        {isTrial ? 'Período de Teste Encerrado' : 'Sua Assinatura Venceu'}
      </h2>
      <p className="text-lg text-slate-500 max-w-lg mb-12 leading-relaxed font-medium">
        {isTrial 
          ? 'Seus 7 dias de acesso gratuito terminaram. Para continuar automatizando suas cobranças e acessando seus clientes, escolha um de nossos planos.'
          : 'O período mensal da sua assinatura chegou ao fim. Realize a renovação para continuar utilizando todas as funcionalidades do ZapCobrança sem interrupções.'
        }
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onGoToBilling}
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
        >
          {isTrial ? 'Ver Planos e Assinar' : 'Renovar Assinatura'}
        </button>
        <button
          onClick={onLogout}
          className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
        >
          Sair da conta
        </button>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Suas informações continuam salvas e seguras.</p>
      </div>
    </div>
  );
};

export default TrialBlocked;
