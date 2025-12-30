
import React, { useMemo, useState } from 'react';
import { Client, PaymentStatus, MessageLog } from '../types';

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

  // --- LÓGICA DE DADOS (Mantida da versão anterior) ---
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

  const financialStats = useMemo(() => {
    const targetEndDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    const clientsInPeriod = clients.filter(c => {
      if (!c.createdAt) return true;
      return new Date(c.createdAt) <= targetEndDate;
    });

    const totalMRR = clientsInPeriod.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    const paidList = clientsInPeriod.filter(c => wasPaidInMonth(c, selectedYear, selectedMonth));
    const paidValue = paidList.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    
    // Para a tabela, usamos o status atual, mas ajustamos visualmente se já pagou neste mês histórico
    const displayList = clientsInPeriod.map(c => {
        const isPaidHistory = wasPaidInMonth(c, selectedYear, selectedMonth);
        return {
            ...c,
            displayStatus: isPaidHistory ? PaymentStatus.PAID : (c.status === PaymentStatus.PAID ? PaymentStatus.PENDING : c.status)
        };
    });

    // Stats para a barra de progresso e analytics
    const pendingValue = totalMRR - paidValue;
    const progressPercentage = totalMRR > 0 ? (paidValue / totalMRR) * 100 : 0;
    
    // Contagens para Analytics
    const countPaid = paidList.length;
    const countOverdue = displayList.filter(c => c.displayStatus === PaymentStatus.OVERDUE).length;
    const countPending = displayList.length - countPaid - countOverdue;

    // Crescimento (Growth)
    const prevMonthDate = new Date(selectedYear, selectedMonth, 0);
    const prevMonthClients = clients.filter(c => c.createdAt && new Date(c.createdAt) <= prevMonthDate);
    const prevMonthMRR = prevMonthClients.reduce((acc, curr) => acc + curr.monthlyValue, 0);
    const growth = prevMonthMRR > 0 ? ((totalMRR - prevMonthMRR) / prevMonthMRR) * 100 : 0;

    return { 
      totalMRR, 
      paidValue, 
      pendingValue,
      progressPercentage,
      displayList,
      growth,
      counts: { paid: countPaid, pending: countPending, overdue: countOverdue, total: displayList.length }
    };
  }, [clients, selectedMonth, selectedYear]);

  // Ícones SVG Inline para o Design System
  const Icons = {
    Wallet: () => (
      <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 7h-1V5.5a2.5 2.5 0 00-5 0V7h-1V5.5a4.5 4.5 0 019 0V7z" opacity="0.4" /><path fillRule="evenodd" d="M22 11v8a3 3 0 01-3 3H5a3 3 0 01-3-3v-8a3 3 0 013-3h14a3 3 0 013 3zm-9 3a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" /></svg>
    ),
    Expense: () => (
      <svg className="w-6 h-6 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/><path d="M22 12a2 2 0 012 2v4a2 2 0 01-2 2H20a2 2 0 01-2-2v-4a2 2 0 012-2h2z" /></svg>
    ),
    ArrowUp: () => <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
    ArrowDown: () => <svg className="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
    Filter: () => <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Dots: () => <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
  };

  // Componente de Avatar Simples
  const Avatar = ({ name }: { name: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600', 'bg-sky-100 text-sky-600'];
    const colorClass = colors[name.length % colors.length];

    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${colorClass}`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10 font-sans">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
           <p className="text-slate-500 text-sm font-medium">Visão geral financeira de {months[selectedMonth]} {selectedYear}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
             <select 
               value={selectedMonth} 
               onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
               className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer py-2 pl-3 pr-8 rounded-lg hover:bg-slate-50 outline-none"
             >
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <div className="w-px h-4 bg-slate-200"></div>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
              className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer py-2 pl-3 pr-8 rounded-lg hover:bg-slate-50 outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>

      {/* TOP METRICS GRID (2x2 Layout like reference) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: TOTAL INCOME (MRR) */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40 md:h-48 relative overflow-hidden group hover:border-indigo-100 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-semibold text-sm">Receita Potencial</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">{formatCurrency(financialStats.totalMRR)}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icons.Wallet />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-auto">
             <span className={`flex items-center gap-1 text-xs font-bold ${financialStats.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {financialStats.growth >= 0 ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                {Math.abs(financialStats.growth).toFixed(1)}%
             </span>
             <span className="text-slate-400 text-xs font-medium">desde o mês passado</span>
          </div>
        </div>

        {/* CARD 2: SPENDING LIMIT (Recebimento Goal) */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40 md:h-48">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-500 font-semibold text-sm">Meta de Recebimento</p>
            <span className="text-xs font-bold text-slate-400 border border-slate-100 px-2 py-1 rounded-lg bg-slate-50">{selectedYear}</span>
          </div>
          
          <div className="mt-auto">
             <div className="flex items-end gap-2 mb-3">
               <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(financialStats.paidValue)}</span>
               <span className="text-xs font-bold text-slate-400 mb-1.5">de {formatCurrency(financialStats.totalMRR)}</span>
             </div>
             
             <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${financialStats.progressPercentage}%` }}
                ></div>
             </div>
             <p className="text-[10px] text-slate-400 font-bold mt-2 text-right">{financialStats.progressPercentage.toFixed(0)}% Completo</p>
          </div>
        </div>

        {/* CARD 3: TOTAL EXPENSE (Pending/Overdue) */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40 md:h-48 group hover:border-rose-100 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-semibold text-sm">Pendente/Atrasado</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">{formatCurrency(financialStats.pendingValue)}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icons.Expense />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-auto">
             <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                <Icons.ArrowDown />
                {((financialStats.pendingValue / (financialStats.totalMRR || 1)) * 100).toFixed(1)}%
             </span>
             <span className="text-slate-400 text-xs font-medium">do total previsto</span>
          </div>
        </div>

        {/* CARD 4: EXPENSES ANALYTICS (Wallet Distribution) */}
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-40 md:h-48">
          <div className="flex justify-between items-center mb-2">
             <p className="text-slate-500 font-semibold text-sm">Distribuição</p>
             <span className="text-xs font-bold text-slate-400 border border-slate-100 px-2 py-1 rounded-lg bg-slate-50">Status</span>
          </div>
          
          <div className="mt-auto space-y-4">
             {/* Segmented Progress Bar */}
             <div className="flex w-full h-3 rounded-full overflow-hidden gap-1">
                {financialStats.counts.paid > 0 && (
                    <div style={{ flex: financialStats.counts.paid }} className="bg-emerald-400 h-full rounded-l-full"></div>
                )}
                {financialStats.counts.pending > 0 && (
                    <div style={{ flex: financialStats.counts.pending }} className="bg-indigo-400 h-full"></div>
                )}
                {financialStats.counts.overdue > 0 && (
                    <div style={{ flex: financialStats.counts.overdue }} className="bg-rose-400 h-full rounded-r-full"></div>
                )}
                {financialStats.counts.total === 0 && <div className="w-full bg-slate-100 h-full"></div>}
             </div>

             <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                   Pago ({financialStats.counts.paid})
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                   Aberto ({financialStats.counts.pending})
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                   Atrasado ({financialStats.counts.overdue})
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS HISTORY TABLE */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-lg md:text-xl font-bold text-slate-900">Histórico de Clientes</h3>
           <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors border border-slate-200">
                <Icons.Filter />
                Filtrar
             </button>
             <button onClick={onQuickAdd} className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
                <thead>
                    <tr className="text-left border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-[40%]">Nome / Cliente</th>
                        <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Tipo</th>
                        <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Vencimento</th>
                        <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Valor</th>
                        <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-[15%] text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {financialStats.displayList.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-400 text-sm font-medium">
                                Nenhum cliente encontrado neste período.
                            </td>
                        </tr>
                    ) : (
                        financialStats.displayList.map((client) => (
                            <tr key={client.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pr-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar name={client.name} />
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{client.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{client.whatsapp}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-sm font-medium text-slate-600">
                                    Mensalidade
                                </td>
                                <td className="py-4 text-sm font-bold text-slate-700">
                                    {new Date().getFullYear() === selectedYear && new Date().getMonth() === selectedMonth 
                                      ? `Dia ${client.dueDay}` 
                                      : `${client.dueDay}/${selectedMonth + 1}/${selectedYear}`
                                    }
                                </td>
                                <td className="py-4 text-sm font-black text-slate-900">
                                    {formatCurrency(client.monthlyValue)}
                                </td>
                                <td className="py-4 text-right">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                        ${client.displayStatus === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-600' : 
                                          client.displayStatus === PaymentStatus.OVERDUE ? 'bg-rose-100 text-rose-600' : 
                                          'bg-amber-100 text-amber-600'
                                        }`}
                                    >
                                        {client.displayStatus === PaymentStatus.PAID ? 'Pago' : 
                                         client.displayStatus === PaymentStatus.OVERDUE ? 'Atrasado' : 'Aberto'}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
