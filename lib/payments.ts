
import { PlanType } from '../types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    const currentOrigin = window.location.origin;
    // URL alterada para 'api-checkout' para evitar bloqueio de AdBlock
    const functionUrl = `${SUPABASE_URL}/functions/v1/api-checkout`;

    try {
      console.log(`Iniciando checkout: ${plan}`);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          action: 'create_preference', 
          plan: plan.toUpperCase(),
          userId: session.user.id,
          email: userEmail,
          origin: currentOrigin,
          webhookUrl: functionUrl
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
             throw new Error("Erro de Configuração: A função 'api-checkout' não foi encontrada. Faça o deploy novamente.");
        }
        const errorText = await response.text();
        console.error('Erro no servidor:', errorText);
        throw new Error("Falha ao conectar com o servidor de pagamentos.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.init_point) {
        throw new Error("Link de pagamento não recebido.");
      }

      localStorage.setItem('zapcobranca_pending_plan', plan.toUpperCase());
      
      // Redirecionamento
      window.location.href = data.init_point;

      return { success: true };
    } catch (err: any) {
      console.error('Erro Checkout:', err);
      if (err.message.includes('Failed to fetch')) {
        throw new Error("Erro de Conexão: Bloqueador de Anúncios detectado. Por favor, desative o AdBlock para realizar o pagamento.");
      }
      throw err;
    }
  }
};
