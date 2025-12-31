
import React, { useState, useMemo, useEffect } from 'react';
import { Client, PaymentStatus, PlanType, User, MessageLog } from '../types';
import { PLANS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface ClientsProps {
  clients: Client[];
  logs: MessageLog[];
  onAdd: (client: Omit<Client, 'id' | 'userId'>) => void;
  onUpdate: (id: string, updatedData: Partial<Client>) => void;
  onUpdateStatus: (id: string, status: PaymentStatus) => void;
  onDelete: (id: string) => void;
  onSendMessage: (client: Client, type: 'COBRANÇA' | 'LEMBRETE' | 'ATRASO') => void;
  userPlan: PlanType;
  currentUser: User | null;
  autoOpenAdd?: boolean;
  onModalClose?: () => void;
}

const Clients: React.FC<ClientsProps> = ({ 
  clients, logs, onAdd, onUpdate, onUpdateStatus, onDelete, onSendMessage, 
  userPlan, currentUser, autoOpenAdd, onModalClose 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    monthlyValue: '',
    dueDay: '10',
    customMessage: '',
    autoSend: false,
    notes: '',
    reminderDaysBefore: 1
  });
  
  useEffect(() => {
    if (autoOpenAdd) {
      openAddModal();
    }
  }, [autoOpenAdd]);

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.whatsapp.includes(term)
    );
  }, [clients, searchTerm]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9,]/g, '');
    setFormData({ ...formData, monthlyValue: value });
  };

  const handleExport = (type: 'CSV' | 'XLS' | 'PDF') => {
    setShowExportOptions(false);
    if (type === 'PDF') {
      window.print();
      return;
    }

    const headers = ['Nome', 'WhatsApp', 'Valor Mensal', 'Dia Vencimento', 'Status', 'Notas'];
    const rows = filteredClients.map(c => [
      c.name,
      c.whatsapp,
      c.monthlyValue.toString().replace('.', ','),
      c.dueDay.toString(),
      c.status,
      (c.notes || '').replace(/,/g, ';')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const ext = type === 'XLS' ? 'xls' : 'csv';
    link.setAttribute("download", `clientes_zapcobranca_${new Date().toISOString().split('T')[0]}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateIA = async (style: 'AMIGÁVEL' | 'PROFISSIONAL' | 'DURA') => {
    if (!formData.name || !formData.monthlyValue) {
      alert("Preencha nome e valor para que a IA gere a mensagem correta.");
      return;
    }
    setIsGeneratingIA(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Gere uma mensagem de cobrança do estilo ${style} para o cliente ${formData.name}, no valor de R$ ${formData.monthlyValue} com vencimento no dia ${formData.dueDay}. 
      Use variáveis {{nome_cliente}}, {{valor}}, {{vencimento}}, {{chave_pix}}. 
      Regras:
      - Estilo AMIGÁVEL: Use emojis, seja acolhedor, trate como lembrete parceiro.
      - Estilo PROFISSIONAL: Linguagem corporativa, direta, polida, sem emojis excessivos.
      - Estilo DURA: Linguagem séria, formal, enfatizando a importância do pagamento pontual e mencionando a data limite.
      Apenas o texto da mensagem.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      if (response.text) {
        setFormData(prev => ({ ...prev, customMessage: response.text.trim() }));
      }
    } catch (err) {
      console.error("Erro IA:", err);
      alert("Falha ao gerar mensagem com IA.");
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanValue = formData.monthlyValue.replace(/\./g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue);
      
      const clientData = {
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        monthlyValue: numericValue,
        dueDay: parseInt(formData.dueDay, 10),
        customMessage: formData.customMessage.trim(),
        autoSend: formData.autoSend,
        notes: formData.notes,
        reminderDaysBefore: Number(formData.reminderDaysBefore)
      };

      if (editingClient) {
        await onUpdate(editingClient.id, clientData);
      } else {
        await onAdd({ ...clientData, status: PaymentStatus.PENDING });
      }
      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ 
      name: '', whatsapp: '', monthlyValue: '', dueDay: '10', 
      customMessage: currentUser?.messageTemplate || '',
      autoSend: false, notes: '', reminderDaysBefore: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      whatsapp: client.whatsapp,
      monthlyValue: client.monthlyValue.toFixed(2).replace('.', ','),
      dueDay: client.dueDay.toString(),
      customMessage: client.customMessage || '',
      autoSend: !!client.autoSend,
      notes: client.notes || '',
      reminderDaysBefore: client.reminderDaysBefore || 1
    });
    setIsModalOpen(true);
  };

  const openDetail = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    if (onModalClose) onModalClose();
  };

  const clientLogs = useMemo(() => {
    if (!selectedClient) return [];
    return logs.filter(l => l.clientId === selectedClient.id);
  }, [logs, selectedClient]);

  const handleWhatsAppClick = (client: Client) => {
    let message = client.customMessage || currentUser?.messageTemplate || '';
    const replacements: Record<string, string> = {
      '{{nome_cliente}}': client.name,
      '{{valor}}': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyValue),
      '{{vencimento}}': `dia ${client.dueDay}`,
      '{{chave_pix}}': currentUser?.pixKey || '',
      '{{link_pagamento}}': currentUser?.paymentLink || ''
    };
    Object.entries(replacements).forEach(([tag, value]) => message = message.replace(new RegExp(tag, 'g'), value));
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = client.whatsapp.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const baseUrl = /Android|iPhone/i.test(navigator.userAgent) ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    onSendMessage(client, client.status === PaymentStatus.OVERDUE ? 'COBRANÇA' : 'LEMBRETE');
    window.open(`${baseUrl}?phone=${finalPhone}&text=${encodedMessage}`, '_blank');
  };

  const isLimitReached = clients.length >= (currentUser?.subscriptionActive ? PLANS[currentUser.plan.toUpperCase() as keyof typeof PLANS].limit : 2) && !editingClient;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 print:bg-white print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Meus Clientes</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Gestão e organização de faturamento.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Buscar por nome ou celular..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-64 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-xs"
          />
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)} 
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all shadow-sm flex items-center gap-2"
              title="Exportar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline text-xs font-black">Exportar</span>
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-2 overflow-hidden animate-in zoom-in-95">
                <button onClick={() => handleExport('CSV')} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">Planilha CSV</button>
                <button onClick={() => handleExport('XLS')} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">Planilha XLS</button>
                <button onClick={() => handleExport('PDF')} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">Relatório PDF</button>
              </div>
            )}
          </div>
          <button
            onClick={openAddModal}
            disabled={isLimitReached}
            className={`flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-white text-xs md:text-sm transition-all active:scale-95 shadow-xl ${
              isLimitReached ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-widest print:bg-white print:text-black print:border-b-2 print:border-black">
                <th className="px-6 py-4 md:px-8 md:py-6">Cliente</th>
                <th className="px-6 py-4 md:px-8 md:py-6">WhatsApp</th>
                <th className="px-6 py-4 md:px-8 md:py-6 text-center">Valor / Venc.</th>
                <th className="px-6 py-4 md:px-8 md:py-6">Status</th>
                <th className="px-6 py-4 md:px-8 md:py-6 text-right print:hidden">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-black">
              {filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">Nenhum cliente encontrado.</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-white">
                    <td className="px-6 py-4 md:px-8 md:py-5">
                       <button onClick={() => openDetail(client)} className="font-black text-slate-900 text-xs md:text-sm hover:text-indigo-600 underline decoration-indigo-200 decoration-2 underline-offset-4 print:no-underline">{client.name}</button>
                       <div className="flex items-center gap-2 mt-1 print:hidden">
                          {client.autoSend && <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Auto</span>}
                          {client.notes && <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Notas</span>}
                       </div>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-slate-500 text-xs">{client.whatsapp}</td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-center">
                      <div className="font-black text-slate-800 text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyValue)}</div>
                      <div className="text-[10px] text-slate-400 font-bold">Todo dia {client.dueDay}</div>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5">
                      <select
                        value={client.status}
                        onChange={(e) => onUpdateStatus(client.id, e.target.value as PaymentStatus)}
                        className={`text-[9px] font-black py-1.5 px-3 rounded-lg border-none cursor-pointer print:appearance-none ${
                          client.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' :
                          client.status === PaymentStatus.OVERDUE ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <option value={PaymentStatus.PAID}>PAGO</option>
                        <option value={PaymentStatus.PENDING}>PENDENTE</option>
                        <option value={PaymentStatus.OVERDUE}>ATRASADO</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-right flex items-center justify-end gap-1 print:hidden">
                      <button onClick={() => handleWhatsAppClick(client)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all" title="Cobrar WhatsApp">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      </button>
                      <button onClick={() => openEditModal(client)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all" title="Editar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => onDelete(client.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all" title="Excluir">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dados do Cliente</label>
                    <div className="space-y-3">
                      <input type="text" placeholder="Nome completo" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-50" />
                      <input type="tel" placeholder="WhatsApp (DDD + Número)" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-indigo-50" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Valor (R$)" required value={formData.monthlyValue} onChange={handleValueChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm text-indigo-600" />
                        <select value={formData.dueDay} onChange={(e) => setFormData({...formData, dueDay: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm">
                          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>Dia {i+1}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observações Internas (Histórico/Notas)</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Escreva observações privadas sobre este cliente..." rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-sm focus:ring-4 focus:ring-indigo-50 resize-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">IA: Gerar Template Inteligente</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => generateIA('AMIGÁVEL')} disabled={isGeneratingIA} className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50">IA Amigável</button>
                      <button type="button" onClick={() => generateIA('PROFISSIONAL')} disabled={isGeneratingIA} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 disabled:opacity-50">IA Profissional</button>
                      <button type="button" onClick={() => generateIA('DURA')} disabled={isGeneratingIA} className="px-2 py-1 bg-red-50 text-red-600 text-[8px] font-bold rounded-lg border border-red-100 hover:bg-red-100 disabled:opacity-50">IA Dura</button>
                    </div>
                  </div>
                  <textarea rows={8} value={formData.customMessage} onChange={(e) => setFormData({...formData, customMessage: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-xs focus:ring-4 focus:ring-indigo-50 resize-none leading-relaxed" />
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Agendamento Inteligente</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={formData.autoSend} onChange={(e) => setFormData({...formData, autoSend: e.target.checked})} />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                    {formData.autoSend && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                         <span className="text-[10px] font-bold text-slate-500">Enviar lembrete quantos dias antes?</span>
                         <select value={formData.reminderDaysBefore} onChange={(e) => setFormData({...formData, reminderDaysBefore: Number(e.target.value)})} className="bg-white text-[10px] font-black border border-slate-200 rounded px-2 py-1 outline-none">
                            <option value={1}>1 dia antes</option>
                            <option value={2}>2 dias antes</option>
                            <option value={3}>3 dias antes</option>
                            <option value={5}>5 dias antes</option>
                            <option value={0}>No dia exato</option>
                         </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={closeModal} className="w-full py-4 border border-slate-200 rounded-2xl text-slate-600 font-black text-sm hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100">
                  {isSaving ? 'Gravando...' : 'Salvar Dados do Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHES E HISTÓRICO REAL */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedClient.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Histórico Completo do Cliente</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Financeiro</p>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${
                    selectedClient.status === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 
                    selectedClient.status === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedClient.status}
                  </span>
               </div>
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor Acordado</p>
                  <p className="text-xl font-black text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedClient.monthlyValue)}</p>
               </div>
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Ciclo de Cobrança</p>
                  <p className="text-xl font-black text-slate-900">Dia {selectedClient.dueDay}</p>
               </div>
            </div>

            <div className="space-y-8">
              {/* HISTÓRICO DE MENSAGENS */}
              <div>
                <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                   <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Linha do Tempo de Cobranças
                </h4>
                <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                  {clientLogs.length === 0 ? (
                    <div className="p-12 text-center">
                       <p className="text-slate-400 font-bold text-xs italic">Nenhuma interação registrada no sistema ainda.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {clientLogs.map((log) => (
                        <div key={log.id} className="p-5 flex items-center justify-between text-xs transition-colors hover:bg-slate-100/50">
                          <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.type === 'ATRASO' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                               </svg>
                             </div>
                             <div>
                                <p className="font-black text-slate-800 uppercase text-[9px] mb-1">{log.type}</p>
                                <p className="text-slate-400 font-bold">{new Date(log.sentAt).toLocaleString('pt-BR')}</p>
                             </div>
                          </div>
                          <span className="font-black text-emerald-600 text-[10px] tracking-widest uppercase flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                             DISPARADA
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* OBSERVAÇÕES INTERNAS */}
              <div>
                <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                   <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                   Observações e Notas Internas
                </h4>
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap min-h-[100px] italic">
                  {selectedClient.notes || "Nenhuma observação interna para este cliente."}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
               <button onClick={() => { setIsDetailModalOpen(false); openEditModal(selectedClient); }} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100">Editar Cliente</button>
               <button onClick={() => setIsDetailModalOpen(false)} className="px-10 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
