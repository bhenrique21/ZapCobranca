
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Client, PaymentStatus, PlanType, User } from '../types';
import { PLANS } from '../constants';

interface ClientsProps {
  clients: Client[];
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
  clients, onAdd, onUpdate, onUpdateStatus, onDelete, onSendMessage, 
  userPlan, currentUser, autoOpenAdd, onModalClose 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    monthlyValue: '',
    dueDay: '10',
    customMessage: '',
    autoSend: false
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

  // Função auxiliar para formatar moeda no input
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove tudo que não é dígito ou vírgula
    value = value.replace(/[^0-9,]/g, '');
    setFormData({ ...formData, monthlyValue: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Correção para suportar formato brasileiro (1.000,00)
      // 1. Remove pontos de milhar
      // 2. Substitui vírgula decimal por ponto
      const cleanValue = formData.monthlyValue.replace(/\./g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue);
      
      if (isNaN(numericValue) || numericValue <= 0) {
        alert("Por favor, insira um valor mensal válido (maior que zero).");
        setIsSaving(false);
        return;
      }

      const clientData = {
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        monthlyValue: numericValue,
        dueDay: parseInt(formData.dueDay, 10),
        customMessage: formData.customMessage.trim(),
        autoSend: formData.autoSend
      };

      if (editingClient) {
        await onUpdate(editingClient.id, clientData);
      } else {
        await onAdd({ ...clientData, status: PaymentStatus.PENDING });
      }
      
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      // App.tsx já lida com o feedback de erro global se o Supabase falhar
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ 
      name: '', 
      whatsapp: '', 
      monthlyValue: '', 
      dueDay: '10', 
      customMessage: currentUser?.messageTemplate || '',
      autoSend: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      whatsapp: client.whatsapp,
      // Formata o valor para exibição (Ex: 1200.5 -> 1200,50)
      monthlyValue: client.monthlyValue.toFixed(2).replace('.', ','),
      dueDay: client.dueDay.toString(),
      customMessage: client.customMessage || currentUser?.messageTemplate || '',
      autoSend: !!client.autoSend
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    if (onModalClose) onModalClose();
  };

  const handleWhatsAppClick = (client: Client) => {
    let message = client.customMessage || currentUser?.messageTemplate || '';
    const replacements: Record<string, string> = {
      '{{nome_cliente}}': client.name,
      '{{valor}}': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyValue),
      '{{vencimento}}': `dia ${client.dueDay}`,
      '{{chave_pix}}': currentUser?.pixKey || '',
      '{{link_pagamento}}': currentUser?.paymentLink || ''
    };
    
    Object.entries(replacements).forEach(([tag, value]) => {
      message = message.replace(new RegExp(tag, 'g'), value);
    });

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = client.whatsapp.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    const whatsappUrl = `${baseUrl}?phone=${finalPhone}&text=${encodedMessage}`;
    
    onSendMessage(client, client.status === PaymentStatus.OVERDUE ? 'COBRANÇA' : 'LEMBRETE');
    window.open(whatsappUrl, '_blank');
  };

  const planKey = userPlan.toUpperCase() as keyof typeof PLANS;
  const isTrial = !currentUser?.subscriptionActive;
  const planLimit = isTrial ? 2 : (PLANS[planKey]?.limit || 5);
  const isLimitReached = clients.length >= planLimit && !editingClient;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Meus Clientes</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            {isTrial ? "Modo Teste: " : ""}
            Você tem {clients.length} de {planLimit} clientes.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-64 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-xs"
          />
          <button
            onClick={openAddModal}
            disabled={isLimitReached}
            className={`flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-white text-xs md:text-sm transition-all active:scale-95 shadow-xl ${
              isLimitReached ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                <th className="px-6 py-4 md:px-8 md:py-6">Cliente</th>
                <th className="px-6 py-4 md:px-8 md:py-6">WhatsApp</th>
                <th className="px-6 py-4 md:px-8 md:py-6">Valor</th>
                <th className="px-6 py-4 md:px-8 md:py-6">Venc.</th>
                <th className="px-6 py-4 md:px-8 md:py-6">Status</th>
                <th className="px-6 py-4 md:px-8 md:py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 md:py-20 text-center text-slate-400 font-bold">Nenhum cliente.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 md:px-8 md:py-5">
                       <div className="font-black text-slate-900 text-xs md:text-sm">{client.name}</div>
                       {client.autoSend && (
                         <div className="flex items-center gap-1 mt-0.5 text-[8px] font-black text-indigo-500 uppercase tracking-wide">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Auto
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-slate-500 text-xs">{client.whatsapp}</td>
                    <td className="px-6 py-4 md:px-8 md:py-5 font-black text-slate-800 text-xs">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyValue)}
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-slate-500 font-bold text-xs">Dia {client.dueDay}</td>
                    <td className="px-6 py-4 md:px-8 md:py-5">
                      <select
                        value={client.status}
                        onChange={(e) => onUpdateStatus(client.id, e.target.value as PaymentStatus)}
                        className={`text-[9px] md:text-[10px] font-black py-1.5 px-3 md:px-4 rounded-lg md:rounded-xl border-none cursor-pointer ${
                          client.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' :
                          client.status === PaymentStatus.OVERDUE ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <option value={PaymentStatus.PAID}>PAGO</option>
                        <option value={PaymentStatus.PENDING}>PENDENTE</option>
                        <option value={PaymentStatus.OVERDUE}>ATRASADO</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 md:px-8 md:py-5 text-right flex items-center justify-end gap-1 md:gap-2">
                      <button onClick={() => handleWhatsAppClick(client)} className="p-2 md:p-2.5 bg-indigo-600 text-white rounded-lg md:rounded-xl hover:bg-indigo-700 transition-all">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      </button>
                      <button onClick={() => openEditModal(client)} className="p-2 md:p-2.5 text-slate-400 hover:text-indigo-600 transition-all">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => onDelete(client.id)} className="p-2 md:p-2.5 text-slate-400 hover:text-red-600 transition-all">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Nome Completo</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-4 focus:ring-indigo-50" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">WhatsApp</label>
                    <input type="tel" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm focus:ring-4 focus:ring-indigo-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Valor (R$)</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.monthlyValue} 
                        onChange={handleValueChange}
                        placeholder="0,00"
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-black text-xs md:text-sm text-indigo-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Vencimento</label>
                      <select value={formData.dueDay} onChange={(e) => setFormData({...formData, dueDay: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-black text-xs md:text-sm">
                        {[...Array(31)].map((_, i) => (<option key={i + 1} value={i + 1}>Dia {i + 1}</option>))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Mensagem Customizada</label>
                    <textarea 
                      rows={6}
                      value={formData.customMessage} 
                      onChange={(e) => setFormData({...formData, customMessage: e.target.value})} 
                      className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl outline-none font-medium text-xs md:text-sm focus:ring-4 focus:ring-indigo-50 resize-none leading-relaxed"
                    />
                    <div className="mt-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="flex flex-wrap gap-1">
                        {['{{nome_cliente}}', '{{valor}}', '{{vencimento}}'].map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-white text-[8px] font-bold text-indigo-600 rounded border border-indigo-100">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl p-4 flex items-center justify-between">
                <div className="pr-4">
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Disparo Automático (API)
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Requer Gateway configurado.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.autoSend} onChange={(e) => setFormData({...formData, autoSend: e.target.checked})} />
                  <div className="w-10 h-5 md:w-11 md:h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 md:after:h-5 after:w-4 md:after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={closeModal} className="w-full py-4 border border-slate-200 rounded-xl md:rounded-2xl text-slate-600 font-black text-xs md:text-sm hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
