
import { createClient } from '@supabase/supabase-js';
import { User, Client, MessageLog, PlanType, PaymentStatus } from '../types';
import { DEFAULT_TEMPLATE } from '../constants';

export const SUPABASE_URL = 'https://vgvwlmomdwvzoxlflaix.supabase.co';

// Chave ANON/PUBLIC correta fornecida
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndndsbW9tZHd2em94bGZsYWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDkxMDAsImV4cCI6MjA4MjYyNTEwMH0.o3x5j5zxqPDFzMVLayFtJN6wf6waXpnQO5RdYcnPbDY'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

export const db = {
  async testIntegration() {
    console.log("[Diagnostic] Iniciando sequência de testes...");
    const results = {
      database: false,
      edgeFunction: false,
      mercadoPago: false,
      details: ''
    };

    try {
      // 1. Teste de Banco de Dados
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      results.database = !dbError;
      if (dbError) {
        console.error("[Diagnostic] Erro no Banco:", dbError);
        if (dbError.message && (dbError.message.includes("JWT") || dbError.message.includes("apikey"))) {
            results.details = "ERRO DE CHAVE API: Sua SUPABASE_ANON_KEY parece inválida ou expirada.";
            return results;
        }
      }

      // 2. Teste de Edge Function (Chamada Direta via Fetch para ignorar bugs de SDK)
      console.log("[Diagnostic] Testando Edge Function em: " + SUPABASE_URL + "/functions/v1/mercado-pago-webhook");
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/mercado-pago-webhook`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY // Adicionado para garantir compatibilidade
        },
        body: JSON.stringify({ action: 'test_config' })
      }).catch(err => {
        console.error("[Diagnostic] Falha de fetch:", err);
        return null;
      });

      if (!response) {
        results.details = "Erro de Rede: Não foi possível alcançar a Edge Function. Causas prováveis:\n1. AdBlock ativo (bloqueando 'mercado-pago').\n2. Falha de deploy no Supabase.";
      } else if (response.status === 404) {
        results.details = "Erro 404: A função 'mercado-pago-webhook' não foi encontrada. Rode: 'npx supabase functions deploy mercado-pago-webhook --no-verify-jwt'";
      } else if (response.status === 200) {
        const data = await response.json();
        results.edgeFunction = true;
        results.mercadoPago = data?.mp_status === 'OK';
        results.details = data?.details || "Tudo funcionando perfeitamente!";
      } else {
        results.details = `Erro Inesperado (${response.status}): O servidor respondeu, mas com erro.`;
      }

      return results;
    } catch (err: any) {
      results.details = "Erro crítico na execução do teste: " + err.message;
      return results;
    }
  },

  async getProfile(userId: string): Promise<User | null> {
    if (!userId) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return null;
    return data ? this.mapProfile(data) : null;
  },

  async ensureProfile(userId: string, email: string, name: string): Promise<void> {
    // Lógica de Super Admin: Se for o email do admin, força o plano vitalício
    const isSuperAdmin = email.trim().toLowerCase() === 'admin@admin.com';
    
    const { data: existing } = await supabase.from('profiles').select('id, plan').eq('id', userId).maybeSingle();
    
    if (!existing) {
      await supabase.from('profiles').insert({
        id: userId,
        email: email,
        name: name,
        message_template: DEFAULT_TEMPLATE,
        plan: isSuperAdmin ? 'ADVANCED' : 'STARTER',
        subscription_active: isSuperAdmin, // Já nasce ativo se for admin
        subscription_expires_at: isSuperAdmin ? '2099-12-31T23:59:59.999Z' : null // Expira em 2099
      });
    } else if (isSuperAdmin) {
      // Se o admin já existe mas por algum motivo não está com o plano correto, atualiza
      await supabase.from('profiles').update({
        plan: 'ADVANCED',
        subscription_active: true,
        subscription_expires_at: '2099-12-31T23:59:59.999Z'
      }).eq('id', userId);
    }
  },

  mapProfile(data: any): User {
    return {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      whatsapp: data.whatsapp || '',
      pixKey: data.pix_key || '',
      paymentLink: data.payment_link || '',
      messageTemplate: data.message_template || DEFAULT_TEMPLATE,
      plan: (data.plan?.toUpperCase() as PlanType) || PlanType.STARTER,
      subscriptionActive: !!data.subscription_active,
      subscriptionExpiresAt: data.subscription_expires_at,
      createdAt: data.created_at || new Date().toISOString(),
      gatewayUrl: data.gateway_url || '',
      gatewayApiKey: data.gateway_api_key || ''
    };
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const dbData: any = {};
    if (updates.name !== undefined) dbData.name = updates.name;
    if (updates.whatsapp !== undefined) dbData.whatsapp = updates.whatsapp;
    if (updates.pixKey !== undefined) dbData.pix_key = updates.pixKey;
    if (updates.paymentLink !== undefined) dbData.payment_link = updates.paymentLink;
    if (updates.messageTemplate !== undefined) dbData.message_template = updates.messageTemplate;
    if (updates.subscriptionActive !== undefined) dbData.subscription_active = updates.subscriptionActive;
    if (updates.plan !== undefined) dbData.plan = updates.plan;
    if (updates.subscriptionExpiresAt !== undefined) dbData.subscription_expires_at = updates.subscriptionExpiresAt;
    
    // Novos campos de automação
    if (updates.gatewayUrl !== undefined) dbData.gateway_url = updates.gatewayUrl;
    if (updates.gatewayApiKey !== undefined) dbData.gateway_api_key = updates.gatewayApiKey;

    return await supabase.from('profiles').update(dbData).eq('id', userId);
  },

  async getClients(userId: string): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      whatsapp: c.whatsapp,
      monthlyValue: Number(c.monthly_value),
      dueDay: Number(c.due_day),
      status: c.status as PaymentStatus,
      customMessage: c.custom_message || '',
      autoSend: !!c.auto_send,
      createdAt: c.created_at
    }));
  },

  async saveClient(client: Client) {
    // Usado PRINCIPALMENTE PARA INSERT (Novos Clientes)
    const payload = {
      id: client.id,
      user_id: client.userId, 
      name: client.name,
      whatsapp: client.whatsapp,
      monthly_value: Number(client.monthlyValue), 
      due_day: Number(client.dueDay), 
      status: client.status,
      custom_message: client.customMessage || null,
      auto_send: !!client.autoSend
    };
    return await supabase.from('clients').upsert(payload);
  },

  async updateClient(clientId: string, updates: Partial<Client>) {
    // Usado PARA ATUALIZAÇÕES PARCIAIS (Editar ou Mudar Status)
    // Mapeia camelCase para snake_case apenas dos campos que vieram
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.monthlyValue !== undefined) payload.monthly_value = Number(updates.monthlyValue);
    if (updates.dueDay !== undefined) payload.due_day = Number(updates.dueDay);
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.customMessage !== undefined) payload.custom_message = updates.customMessage;
    if (updates.autoSend !== undefined) payload.auto_send = !!updates.autoSend;

    // Retorna erro se tentar atualizar sem nada, mas evita chamada ao banco
    if (Object.keys(payload).length === 0) return { error: null };

    return await supabase.from('clients').update(payload).eq('id', clientId);
  },

  async deleteClient(clientId: string) {
    return await supabase.from('clients').delete().eq('id', clientId);
  },

  async addLog(log: MessageLog, userId: string) {
    await supabase.from('message_logs').insert({
      id: log.id,
      user_id: userId,
      client_id: log.clientId,
      client_name: log.clientName,
      type: log.type,
      sent_at: log.sentAt,
      status: log.status
    });
  },

  async getLogs(userId: string): Promise<MessageLog[]> {
    const { data } = await supabase.from('message_logs').select('*').eq('user_id', userId).order('sent_at', { ascending: false }).limit(20);
    return (data || []).map(l => ({
      id: l.id,
      clientId: l.client_id,
      clientName: l.client_name,
      type: l.type as any,
      sentAt: l.sent_at,
      status: l.status as any
    }));
  }
};
