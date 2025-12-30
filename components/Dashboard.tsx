
import React, { useMemo, useState } from 'react';
import { Client, PaymentStatus, MessageLog } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  // --- LÓGICA DE DADOS ---
  const wasPaidInMonth = (client: Client, year: number, month: number) => {
    if (client.lastPaymentDate) {
        const payDate = new Date(client.lastPaymentDate);
        return payDate.getMonth() === month && payDate.getFullYear() === year;
    }
    if (client.status === PaymentStatus.PAID) {
        const now = new Date();
        return now.getMonth() === month && now.getFullYear() === year;
    }
    return false;
  };

  const stats = useMemo(() => {
    const targetEndDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    const clientsInPeriod = clients.filter(c => {
      if (!c.createdAt) return true;
      return new Date(c.createdAt) <= targetEndDate;
    });

    const totalMRR = clientsInPeriod.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    const paidList = clientsInPeriod.filter(c => wasPaidInMonth(c, selectedYear, selectedMonth));
    const paidValue = paidList.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    
    // Lista para exibição na tabela
    const displayList = clientsInPeriod.map(c => {
        const isPaidHistory = wasPaidInMonth(c, selectedYear, selectedMonth);
        return {
            ...c,
            // Se foi pago historicamente neste mês, forçamos o status visual PAGO
            // Se não, mantemos o status atual, exceto se for PAGO atual mas estamos vendo mês passado (aí vira pendente)
            displayStatus: isPaidHistory ? PaymentStatus.PAID : (c.status === PaymentStatus.PAID ? PaymentStatus.PENDING : c.status)
        };
    });

    const pendingValue = totalMRR - paidValue;
    const progress = totalMRR > 0 ? (paidValue / totalMRR) * 100 : 0;
    
    const countPaid = paidList.length;
    const countOverdue = displayList.filter(c => c.displayStatus === PaymentStatus.OVERDUE).length;
    const countPending = displayList.length - countPaid - countOverdue;

    // Dados para o Gráfico de Rosca (Pie)
    const distributionData = [
      { name: 'Pago', value: countPaid, color: '#10b981' }, // emerald-500
      { name: 'Pendente', value: countPending, color: '#f59e0b' }, // amber-500
      { name: 'Atrasado', value: countOverdue, color: '#ef4444' }, // red-500
    ].filter(d => d.value > 0);

    return { 
      totalMRR, 
      paidValue, 
      pendingValue, 
      progress,
      displayList,
      distributionData,
      counts: { paid: countPaid, pending: countPending, overdue: countOverdue, total: displayList.length }
    };
  }, [clients, selectedMonth, selectedYear]);

  // Dados para o Gráfico de Área (Histórico de Receita)
  const areaChartData = useMemo(() => {
    const data = [];
    const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      // Simulação simples de variação histórica baseada nos clientes criados até aquela data
      const endOfM = new Date(y, m + 1, 0);
      const clientsAtPoint = clients.filter(c => c.createdAt && new Date(c.createdAt) <= endOfM);
      
      // Receita realizada naquele mês
      const revenue = clientsAtPoint
        .filter(c => wasPaidInMonth(c, y, m))
        .reduce((acc, curr) => acc + curr.monthlyValue, 0);

      data.push({ 
        name: shortMonths[m], 
        receita: revenue,
        // Projeção para dar volume ao gráfico (apenas estético/referência)
        projecao: clientsAtPoint.reduce((acc,curr) => acc + curr.monthlyValue, 0)
      });
    }
    return data;
  }, [clients, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6 pb-10 font-sans text-slate-900 animate-in fade-in duration-500">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
             {months[selectedMonth].substring(0,3)}
           </div>
           <div>
             <h2 className="text-lg font-bold text-slate-900 leading-none">Visão Geral</h2>
             <p className="text-xs text-slate-400 font-medium mt-1">Gerencie seu fluxo de caixa</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
            <select 
               value={selectedMonth} 
               onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
               className="bg-slate-50 border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer py-2.5 px-4 rounded-xl hover:bg-slate-100 outline-none transition-colors"
            >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
              className="bg-slate-50 border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer py-2.5 px-4 rounded-xl hover:bg-slate-100 outline-none transition-colors"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button 
              onClick={onQuickAdd}
              className="ml-2 bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl transition-all active:scale-95 shadow-lg"
              title="Adicionar Cliente Rápido"
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
      </div>

      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* COL 1: DARK CARD (HERO METRIC) */}
        <div className="md:col-span-4 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[280px] group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
           </div>
           
           <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Faturamento Previsto</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{formatCurrency(stats.totalMRR)}</h3>
              <p className="text-slate-400 text-sm font-medium">Soma de todas as mensalidades ativas</p>
           </div>

           <div className="mt-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                 <span>Progresso de Recebimento</span>
                 <span className="text-white">{stats.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                 <div style={{ width: `${stats.progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              </div>
           </div>
        </div>

        {/* COL 2: MAIN CHART & SECONDARY METRICS */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart Card */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative h-[320px] md:h-auto flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-bold text-slate-800">Fluxo de Caixa</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Últimos 6 meses</p>
                  </div>
                  {/* Legendinha simples */}
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="text-[10px] font-bold text-slate-500">Realizado</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] font-bold text-slate-400">Projeção</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={areaChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorProjecao" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} tickFormatter={(v) => `R$${v/1000}k`} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value: number) => formatCurrency(value)}
                     />
                     <Area type="monotone" dataKey="projecao" stroke="#cbd5e1" strokeWidth={2} fillOpacity={1} fill="url(#colorProjecao)" activeDot={false} />
                     <Area type="monotone" dataKey="receita" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Metric Small 1: PAID */}
            <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex flex-col justify-between h-40 group hover:bg-emerald-100 transition-colors cursor-default">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-emerald-600 font-bold text-xs bg-white px-2 py-1 rounded-lg">
                    {stats.counts.paid} clientes
                  </span>
               </div>
               <div>
                  <p className="text-emerald-800 text-xs font-bold uppercase tracking-widest mb-1">Recebido</p>
                  <p className="text-2xl font-black text-emerald-900 tracking-tight">{formatCurrency(stats.paidValue)}</p>
               </div>
            </div>

            {/* Metric Small 2: PENDING/OVERDUE */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-[100%] -mr-4 -mt-4 z-0"></div>
               
               <div className="relative z-10 flex justify-between items-start">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-500 shadow-sm">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  {stats.counts.overdue > 0 && (
                      <span className="text-white font-bold text-xs bg-rose-500 px-2 py-1 rounded-lg animate-pulse">
                        {stats.counts.overdue} Atrasados
                      </span>
                  )}
               </div>
               <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">A Receber</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.pendingValue)}</p>
               </div>
            </div>

        </div>

        {/* COL 3: TRANSACTION FEED & DISTRIBUTION */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Distribution Pie Chart */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
               <h4 className="font-bold text-slate-800 w-full text-left mb-4">Saúde da Carteira</h4>
               <div className="w-48 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.distributionData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-slate-800">{stats.counts.total}</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Clientes</span>
                  </div>
               </div>
               <div className="flex flex-wrap gap-3 justify-center mt-6">
                  {stats.distributionData.map((d) => (
                     <div key={d.name} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{d.name}</span>
                        <span className="text-[10px] font-black text-slate-900 ml-1">{d.value}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Listagem Estilo Feed */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col h-[500px] md:h-[400px]">
               <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-800">Transações Recentes</h4>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    Ver Todos
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {stats.displayList.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <p className="text-xs font-bold">Nenhum registro encontrado</p>
                     </div>
                  ) : (
                     stats.displayList.map((client) => (
                        <div key={client.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default">
                           <div className="flex items-center gap-3 md:gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm shrink-0
                                 ${client.displayStatus === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-600' : 
                                   client.displayStatus === PaymentStatus.OVERDUE ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}
                              `}>
                                 {client.name.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-800 text-sm leading-tight">{client.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                    Vence dia {client.dueDay}
                                 </p>
                              </div>
                           </div>
                           
                           <div className="text-right">
                              <p className="font-black text-slate-900 text-sm">{formatCurrency(client.monthlyValue)}</p>
                              <div className="mt-1">
                                 {client.displayStatus === PaymentStatus.PAID && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pago
                                    </span>
                                 )}
                                 {client.displayStatus === PaymentStatus.PENDING && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Aberto
                                    </span>
                                 )}
                                 {client.displayStatus === PaymentStatus.OVERDUE && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Atrasado
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
