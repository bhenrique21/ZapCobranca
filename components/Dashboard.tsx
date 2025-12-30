
import React, { useMemo, useState } from 'react';
import { Client, PaymentStatus, MessageLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  clients: Client[];
  logs: MessageLog[];
  onQuickAdd: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, logs, onQuickAdd }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getFontSize = (val: number) => {
    const formatted = formatCurrency(val);
    const length = formatted.length;
    
    if (length > 14) return "text-lg md:text-2xl"; 
    if (length > 10) return "text-xl md:text-3xl"; 
    return "text-2xl md:text-4xl"; 
  };

  // Lógica Principal de Fluxo de Caixa (REGIME DE CAIXA)
  // Agora desvinculado do Status Atual (Pendente/Pago) e focado puramente na data do pagamento.
  // Isso permite que o status resete para "Pendente" no dia 01 sem apagar o histórico financeiro do mês anterior.
  const wasPaidInMonth = (client: Client, year: number, month: number) => {
    if (client.lastPaymentDate) {
        const payDate = new Date(client.lastPaymentDate);
        return payDate.getMonth() === month && payDate.getFullYear() === year;
    }
    
    // Fallback para dados legados (sem data): Confia no status apenas se for o mês corrente
    // Isso evita distorções históricas para clientes antigos sem data gravada
    if (client.status === PaymentStatus.PAID) {
        const now = new Date();
        return now.getMonth() === month && now.getFullYear() === year;
    }
    
    return false;
  };

  const financialStats = useMemo(() => {
    const targetEndDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    // Filtra clientes que já existiam até o fim do mês selecionado
    const clientsInPeriod = clients.filter(c => {
      if (!c.createdAt) return true;
      return new Date(c.createdAt) <= targetEndDate;
    });

    const totalMRR = clientsInPeriod.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    
    // Lista de Pagos (Regime de Caixa): Só conta se pagou NESTE mês selecionado
    const paidList = clientsInPeriod.filter(c => wasPaidInMonth(c, selectedYear, selectedMonth));
    
    // Pendentes/Atrasados (Lógica Visual)
    // Para a lista nominal, se o usuário pagou neste mês (paidList), ele não está pendente.
    // Caso contrário, está pendente PARA ESSE MÊS VISUALIZADO.
    const pendingOrOverdueList = clientsInPeriod.filter(c => !wasPaidInMonth(c, selectedYear, selectedMonth));
    
    const paidValue = paidList.reduce((acc, curr) => acc + curr.monthlyValue, 0);

    // Cálculo de crescimento (Simples)
    const prevMonthDate = new Date(selectedYear, selectedMonth, 0);
    const prevMonthClients = clients.filter(c => c.createdAt && new Date(c.createdAt) <= prevMonthDate);
    const prevMonthMRR = prevMonthClients.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    
    const growth = prevMonthMRR > 0 ? ((totalMRR - prevMonthMRR) / prevMonthMRR) * 100 : 100;
    const ticketMedio = clientsInPeriod.length > 0 ? totalMRR / clientsInPeriod.length : 0;
    
    return { 
      totalMRR, 
      paidValue, 
      growth, 
      clientsCount: clientsInPeriod.length,
      paidList,
      pendingList: pendingOrOverdueList, 
      ticketMedio
    };
  }, [clients, selectedMonth, selectedYear]);

  const progressionData = useMemo(() => {
    const data = [];
    const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const endOfM = new Date(y, m + 1, 0);
      
      const clientsAtPoint = clients.filter(c => c.createdAt && new Date(c.createdAt) <= endOfM);
      
      // Cálculo Dinâmico por Mês (Histórico)
      const pago = clientsAtPoint
        .filter(c => wasPaidInMonth(c, y, m))
        .reduce((acc, curr) => acc + curr.monthlyValue, 0);
      
      // Removemos o cálculo de pendente visualmente, focando apenas no pago
      data.push({ 
        name: `${shortMonths[m]}/${String(y).slice(-2)}`, 
        pago
      });
    }
    return data;
  }, [clients, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Status Financeiro</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">Acompanhamento de fluxo de caixa (Regime de Caixa).</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-2xl border border-slate-200 shadow-sm">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent border-none font-bold text-xs md:text-sm text-slate-700 focus:ring-0 cursor-pointer px-3 md:px-4 py-2 outline-none">
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <div className="w-px h-6 bg-slate-200" />
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent border-none font-bold text-xs md:text-sm text-slate-700 focus:ring-0 cursor-pointer px-3 md:px-4 py-2 outline-none">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <button 
            onClick={onQuickAdd}
            className="flex items-center justify-center gap-3 px-6 md:px-8 py-3.5 md:py-4 bg-indigo-600 text-white text-sm md:text-base font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Grid de Métricas Adaptativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-indigo-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white transform hover:scale-[1.01] transition-transform">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">MRR Total (Potencial)</p>
          <p className={`${getFontSize(financialStats.totalMRR)} font-black mt-2 transition-all tracking-tight`}>
            {formatCurrency(financialStats.totalMRR)}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
            <span>+{financialStats.growth.toFixed(0)}% vs anterior</span>
          </div>
        </div>
        {/* CARD RECEBIDO - COR VERDE (EMERALD) */}
        <div className="bg-emerald-500 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-emerald-100 text-white transform hover:scale-[1.01] transition-transform">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Recebido (Caixa)</p>
          <p className={`${getFontSize(financialStats.paidValue)} font-black mt-2 transition-all tracking-tight`}>
            {formatCurrency(financialStats.paidValue)}
          </p>
          <p className="text-[10px] font-bold mt-4 opacity-80">{financialStats.paidList.length} pagamentos confirmados</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pendente / Aberto</p>
          <p className={`${getFontSize(financialStats.totalMRR - financialStats.paidValue)} font-black text-slate-900 mt-2 transition-all tracking-tight`}>
             {formatCurrency(financialStats.totalMRR - financialStats.paidValue)}
          </p>
          <p className="text-[10px] font-black text-amber-500 mt-4 uppercase tracking-tighter">Aguardando {financialStats.pendingList.length} transações</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket Médio</p>
          <p className={`${getFontSize(financialStats.ticketMedio)} font-black text-slate-900 mt-2 transition-all tracking-tight`}>
            {formatCurrency(financialStats.ticketMedio)}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Base: {financialStats.clientsCount} clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Gráfico de Evolução - AGORA SÓ MOSTRA RECEITA */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm min-h-[400px] md:h-auto relative flex flex-col">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800">Receita Realizada (Últimos 6 meses)</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Apenas valores efetivamente pagos</p>
            </div>
          </div>
          <div className="h-[280px] md:h-[320px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                  tickFormatter={(v) => `R$${v}`} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    padding: '12px'
                  }} 
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                {/* Removido Legend pois agora só tem uma barra */}
                <Bar name="Receita" dataKey="pago" fill="#10b981" radius={[8, 8, 8, 8]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda Interativa de Explicação */}
          <div className="mt-auto bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-bottom-2">
             <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide mb-1">Automação de Virada</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  <strong>Status Automático:</strong> Todo dia 01, clientes <span className="text-emerald-600 font-bold">PAGOS</span> voltam para <span className="text-amber-500 font-bold">PENDENTE</span> para o novo ciclo. 
                  O gráfico acima mantém o histórico dos pagamentos anteriores, garantindo que sua receita passada fique salva.
                </p>
             </div>
          </div>
        </div>

        {/* Listagem Nominal */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[400px] md:h-[480px]">
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-black text-slate-800">Detalhe Mensal</h3>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Quem pagou em {months[selectedMonth]}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 pr-1 custom-scrollbar">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full">Não Pagaram no Mês</span>
                <span className="text-[9px] font-black text-amber-500">{financialStats.pendingList.length}</span>
              </div>
              {financialStats.pendingList.length === 0 && (
                <p className="text-[10px] text-slate-400 font-bold text-center py-4">Todos pagaram neste mês!</p>
              )}
              {financialStats.pendingList.map(c => (
                <div key={c.id} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                  <div className="flex items-center gap-2">
                     {c.status === PaymentStatus.OVERDUE && <span className="text-[8px] font-black text-red-500">ATRASADO HOJE</span>}
                     <span className="font-black text-amber-600">{formatCurrency(c.monthlyValue)}</span>
                  </div>
                </div>
              ))}
            </div>

            {financialStats.paidList.length > 0 && (
              <div className="space-y-3 border-t border-slate-50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Confirmados em {months[selectedMonth]}</span>
                  <span className="text-[9px] font-black text-emerald-500">{financialStats.paidList.length}</span>
                </div>
                {financialStats.paidList.map(c => (
                  <div key={c.id} className="flex justify-between items-center text-xs opacity-80">
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                    <span className="font-black text-emerald-600">{formatCurrency(c.monthlyValue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
