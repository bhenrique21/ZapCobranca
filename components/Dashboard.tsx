
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header com Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Status Financeiro</h2>
          <p className="text-slate-500 font-medium">Acompanhamento nominal da sua carteira de clientes.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent border-none font-bold text-slate-700 focus:ring-0 cursor-pointer px-4 py-2 outline-none">
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <div className="w-px h-6 bg-slate-200" />
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent border-none font-bold text-slate-700 focus:ring-0 cursor-pointer px-4 py-2 outline-none">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <button 
            onClick={onQuickAdd}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white transform hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">MRR Total</p>
          <p className="text-4xl font-black mt-2">{formatCurrency(financialStats.totalMRR)}</p>
          <div className="flex items-center gap-2 mt-4 text-[11px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
            <span>+{financialStats.growth.toFixed(0)}% vs anterior</span>
          </div>
        </div>
        <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-100 text-white transform hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Recebido</p>
          <p className="text-4xl font-black mt-2">{formatCurrency(financialStats.paidValue)}</p>
          <p className="text-[11px] font-bold mt-4 opacity-80">{financialStats.paidList.length} clientes pagaram</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pendente</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{formatCurrency(financialStats.totalMRR - financialStats.paidValue)}</p>
          <p className="text-[11px] font-bold text-amber-500 mt-4 uppercase">Aguardando {financialStats.pendingList.length + financialStats.overdueList.length} pessoas</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket Médio</p>
          <p className="text-4xl font-black text-slate-900 mt-2">
            {formatCurrency(financialStats.clientsCount > 0 ? financialStats.totalMRR / financialStats.clientsCount : 0)}
          </p>
          <p className="text-[11px] font-bold text-slate-400 mt-4 uppercase">Base: {financialStats.clientsCount} clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Evolução (Barras Empilhadas) */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm h-[480px] relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800">Evolução e Performance</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Ganhos Realizados vs Pendentes</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} 
                  tickFormatter={(v) => `R$${v}`} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 15 }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '16px'
                  }} 
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}
                />
                <Bar 
                  name="Ganhos Realizados"
                  dataKey="pago" 
                  stackId="a" 
                  fill="#10b981" 
                  barSize={40} 
                />
                <Bar 
                  name="Em Aberto"
                  dataKey="pendente" 
                  stackId="a" 
                  fill="#ef4444" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detalhamento Nominal da Carteira */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-[480px]">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-800">Quem Pagou?</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Status Nominal</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
            
            {/* Seção: Atrasados */}
            {financialStats.overdueList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Atrasados</span>
                  <span className="text-[10px] font-black text-red-500">{financialStats.overdueList.length}</span>
                </div>
                {financialStats.overdueList.map(c => (
                  <div key={c.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">{c.name}</span>
                    </div>
                    <span className="text-sm font-black text-red-600">{formatCurrency(c.monthlyValue)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Seção: Pendentes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Em Aberto</span>
                <span className="text-[10px] font-black text-amber-500">{financialStats.pendingList.length}</span>
              </div>
              {financialStats.pendingList.length === 0 && financialStats.overdueList.length === 0 && financialStats.paidList.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 font-bold">Nenhum cliente na lista.</p>
                </div>
              ) : financialStats.pendingList.map(c => (
                <div key={c.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 transition-colors">{c.name}</span>
                  </div>
                  <span className="text-sm font-black text-amber-600">{formatCurrency(c.monthlyValue)}</span>
                </div>
              ))}
            </div>

            {/* Seção: Pagos */}
            {financialStats.paidList.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Realizaram Pagamento</span>
                  <span className="text-[10px] font-black text-emerald-500">{financialStats.paidList.length}</span>
                </div>
                {financialStats.paidList.map(c => (
                  <div key={c.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{c.name}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">{formatCurrency(c.monthlyValue)}</span>
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
