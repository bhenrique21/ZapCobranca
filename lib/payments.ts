
import { PlanType } from '../types';
import { supabase, SUPABASE_URL } from './supabase';

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    const currentOrigin = window.location.origin;
    console.log('Gerando checkout dinâmico para:', plan, 'com retorno para:', currentOrigin);

    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-webhook', {
        body: { 
          action: 'create_preference', 
          plan: plan.toUpperCase(),
          userId: session.user.id,
          email: userEmail,
          origin: currentOrigin
        }
      });

      if (error) {
        console.error('Supabase Function Error:', error);
        
        // Se o SDK falhar, tentamos verificar manualmente se a função existe (404)
        if (error.message === 'Failed to send a request to the Edge Function') {
           try {
              const check = await fetch(`${SUPABASE_URL}/functions/v1/mercado-pago-webhook`, { method: 'OPTIONS' });
              if (check.status === 404) {
                 throw new Error("ALERTA: A função de pagamento não foi instalada no Supabase. É necessário fazer o deploy via terminal.");
              }
           } catch (fetchErr) {
              console.error("Falha ao verificar função manualmente:", fetchErr);
           }
           throw new Error("Não foi possível conectar ao servidor de pagamento. Verifique se a Edge Function foi implantada corretamente.");
        }

        throw new Error(error.message || "Erro de comunicação com a função de pagamento.");
      }

      if (!data?.init_point) {
        throw new Error(data?.error || "O servidor não retornou o link de pagamento corretamente.");
      }

      localStorage.setItem('zapcobranca_pending_plan', plan.toUpperCase());

      const checkoutUrl = data.init_point;
      const win = window.open(checkoutUrl, '_blank');
      
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = checkoutUrl;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erro no checkout:', err);
      throw err;
    }
  }
};
