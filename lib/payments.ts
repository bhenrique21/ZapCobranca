
import { PlanType } from '../types';
import { supabase } from './supabase';

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    console.log('Gerando checkout dinâmico para:', plan);

    try {
      // Chamamos a Edge Function para criar a preferência de pagamento no Mercado Pago
      const { data, error } = await supabase.functions.invoke('mercado-pago-webhook', {
        body: { 
          action: 'create_preference', 
          plan: plan.toUpperCase(),
          userId: session.user.id,
          email: userEmail
        }
      });

      if (error || !data?.init_point) {
        throw new Error(data?.error || "Falha ao gerar link de pagamento");
      }

      // Salva o plano pretendido para monitoramento local
      localStorage.setItem('zapcobranca_pending_plan', plan.toUpperCase());

      // Redireciona para o Checkout Pro do Mercado Pago
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
