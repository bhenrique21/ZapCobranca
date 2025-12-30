
import { createClient } from '@supabase/supabase-js';
import { User, Client, MessageLog, PlanType, PaymentStatus } from '../types';
import { DEFAULT_TEMPLATE } from '../constants';

const SUPABASE_URL = 'https://vgvwlmomdwvzoxlflaix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__M8OpRuAFQOfZRXTH-UQTg_TfzakYbv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.message?.includes('fetch') || err.status === 429)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw err;
  }
}

export const db = {
  async testIntegration() {
    console.log("[Diag] Iniciando testes de conectividade...");
    const results = {
      database: false,
      edgeFunction: false,
      mercadoPago: false,
      details: ''
    };

    try {
      // 1. Teste de Banco de Dados
      console.log("[Diag] Testando Banco de Dados...");
      const { data: dbData, error: dbError } = await supabase.from('profiles').select('id').limit(1);
      results.database = !dbError;
      if (dbError) console.error("[Diag] Erro DB:", dbError);

      // 2. Teste de Edge Function
      console.log("[Diag] Chamando Edge Function...");
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('mercado-pago-webhook', {
        body: { action: 'test_config' }
      });

      if (edgeError) {
        console.error("[Diag] Erro Edge Function:", edgeError);
        results.edgeFunction = false;
        results.details = edgeError.message.includes('404') 
          ? "Função 'mercado-pago-webhook' não encontrada. Verifique se você fez o 'supabase functions deploy'."
          : edgeError.message;
      } else {
        results.edgeFunction = true;
        results.mercadoPago = edgeData?.mp_status === 'OK';
        results.details = edgeData?.details || "Conexão com Edge Function OK.";
        console.log("[Diag] Sucesso Edge Function:", edgeData);
      }

      return results;
    } catch (err: any) {
      console.error("[Diag] Erro Fatal no teste:", err);
      return {
        ...results,
        details: "Erro crítico: " + err.message
      };
    }
  },

  async getProfile(userId: string): Promise<User | null> {
    if (!userId) return null;
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) throw error;
        return data ? this.mapProfile(data) : null;
      });
    } catch (err) {
      console.error("[Database] Erro ao buscar perfil:", err);
      return null;
    }
  },

  async ensureProfile(userId: string, email: string, name: string): Promise<void> {
    try {
      const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (!existing) {
        await supabase.from('profiles').insert({
          id: userId,
          email: email,
          name: name,
          message_template: DEFAULT_TEMPLATE,
          plan: 'STARTER',
          subscription_active: false
        });
      }
    } catch (err) {
      console.warn("[Database] Ignorando falha silenciosa no ensureProfile");
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
      createdAt: data.created_at || new Date().toISOString()
    };
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const dbData: any = {};
      if (updates.name !== undefined) dbData.name = updates.name;
      if (updates.whatsapp !== undefined) dbData.whatsapp = updates.whatsapp;
      if (updates.pixKey !== undefined) dbData.pix_key = updates.pixKey;
      if (updates.paymentLink !== undefined) dbData.payment_link = updates.paymentLink;
      if (updates.messageTemplate !== undefined) dbData.message_template = updates.messageTemplate;
      if (updates.subscriptionActive !== undefined) dbData.subscription_active = updates.subscriptionActive;
      if (updates.plan !== undefined) dbData.plan = updates.plan;
      if (updates.subscriptionExpiresAt !== undefined) dbData.subscription_expires_at = updates.subscriptionExpiresAt;

      const { error } = await supabase.from('profiles').update(dbData).eq('id', userId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async getClients(userId: string): Promise<Client[]> {
    if (!userId) return [];
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
      createdAt: c.created_at
    }));
  },

  async saveClient(client: Client) {
    const payload = {
      id: client.id,
      user_id: client.userId, 
      name: client.name,
      whatsapp: client.whatsapp,
      monthly_value: client.monthlyValue,
      due_day: client.dueDay,
      status: client.status,
      custom_message: client.customMessage
    };
    return await supabase.from('clients').upsert(payload);
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
