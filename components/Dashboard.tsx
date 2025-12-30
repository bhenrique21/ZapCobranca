
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

  const financialStats = useMemo(() => {
    const targetEndDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    const clientsInPeriod = clients.filter(c => {
      if (!c.createdAt) return true;
      return new Date(c.createdAt) <= targetEndDate;
    });

    const totalMRR = clientsInPeriod.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    const paidList = clientsInPeriod.filter(c => c.status === PaymentStatus.PAID);
    const pendingList = clientsInPeriod.filter(c => c.status === PaymentStatus.PENDING);
    const overdueList = clientsInPeriod.filter(c => c.status === PaymentStatus.OVERDUE);
    const paidValue = paidList.reduce((acc, curr) => acc + curr.monthlyValue, 0);

    const prevMonthDate = new Date(selectedYear, selectedMonth, 0);
    const prevMonthMRR = clients.filter(c => c.createdAt && new Date(c.createdAt) <= prevMonthDate)
                                .reduce((acc, curr) => acc + curr.monthlyValue, 0);
    
    const growth = prevMonthMRR > 0 ? ((totalMRR - prevMonthMRR) / prevMonthMRR) * 100 : 100;
    
    return { 
      totalMRR, 
      paidValue, 
      growth, 
      clientsCount: clientsInPeriod.length,
      paidList,
      pendingList,
      overdueList
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
      
      const pago = clientsAtPoint
        .filter(c => c.status === PaymentStatus.PAID)
        .reduce((acc, curr) => acc + curr.monthlyValue, 0);
        
      const pendente = clientsAtPoint
        .filter(c => c.status !== PaymentStatus.PAID)
        .reduce((acc, curr) => acc + curr.monthlyValue, 0);

      data.push({ 
        name: `${shortMonths[m]}/${String(y).slice(-2)}`, 
        pago, 
        pendente 
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
          <p className="text-sm md:text-base text-slate-500 font-medium">Acompanhamento nominal da sua carteira.</p>
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
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">MRR Total</p>
          <p className="text-2xl md:text-4xl font-black mt-2">{formatCurrency(financialStats.totalMRR)}</p>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
            <span>+{financialStats.growth.toFixed(0)}% vs anterior</span>
          </div>
        </div>
        <div className="bg-emerald-500 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-emerald-100 text-white transform hover:scale-[1.01] transition-transform">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Recebido</p>
          <p className="text-2xl md:text-4xl font-black mt-2">{formatCurrency(financialStats.paidValue)}</p>
          <p className="text-[10px] font-bold mt-4 opacity-80">{financialStats.paidList.length} clientes ativos pagos</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pendente</p>
          <p className="text-2xl md:text-4xl font-black text-slate-900 mt-2">{formatCurrency(financialStats.totalMRR - financialStats.paidValue)}</p>
          <p className="text-[10px] font-black text-amber-500 mt-4 uppercase tracking-tighter">Aguardando {financialStats.pendingList.length + financialStats.overdueList.length} transações</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket Médio</p>
          <p className="text-2xl md:text-4xl font-black text-slate-900 mt-2">
            {formatCurrency(financialStats.clientsCount > 0 ? financialStats.totalMRR / financialStats.clientsCount : 0)}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Total: {financialStats.clientsCount} clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Gráfico de Evolução */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm min-h-[400px] md:h-[480px] relative">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-800">Evolução de Carteira</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Performance Realizada vs Meta</p>
            </div>
          </div>
          <div className="h-[280px] md:h-[320px] w-full">
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
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}
                />
                <Bar name="Realizado" dataKey="pago" stackId="a" fill="#10b981" barSize={30} />
                <Bar name="Em Aberto" dataKey="pendente" stackId="a" fill="#f87171" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listagem Nominal */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[400px] md:h-[480px]">
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-black text-slate-800">Status Nominal</h3>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Detalhamento Individual</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 pr-1 custom-scrollbar">
            {financialStats.overdueList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">Atrasados</span>
                  <span className="text-[9px] font-black text-red-500">{financialStats.overdueList.length}</span>
                </div>
                {financialStats.overdueList.map(c => (
                  <div key={c.id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                    <span className="font-black text-red-600">{formatCurrency(c.monthlyValue)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full">Em Aberto</span>
                <span className="text-[9px] font-black text-amber-500">{financialStats.pendingList.length}</span>
              </div>
              {financialStats.pendingList.length === 0 && financialStats.overdueList.length === 0 && (
                <p className="text-[10px] text-slate-400 font-bold text-center py-4">Tudo em dia ou sem dados.</p>
              )}
              {financialStats.pendingList.map(c => (
                <div key={c.id} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                  <span className="font-black text-amber-600">{formatCurrency(c.monthlyValue)}</span>
                </div>
              ))}
            </div>

            {financialStats.paidList.length > 0 && (
              <div className="space-y-3 border-t border-slate-50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Pagos</span>
                  <span className="text-[9px] font-black text-emerald-500">{financialStats.paidList.length}</span>
                </div>
                {financialStats.paidList.map(c => (
                  <div key={c.id} className="flex justify-between items-center text-xs opacity-60">
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
