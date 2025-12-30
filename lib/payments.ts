
import { PlanType } from '../types';
import { supabase } from './supabase';

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    // Detecta dinamicamente a URL onde o app está rodando (importante para Vercel Preview)
    const currentOrigin = window.location.origin;

    console.log('Gerando checkout dinâmico para:', plan, 'com retorno para:', currentOrigin);

    try {
      // Chamamos a Edge Function passando a origem dinâmica
      const { data, error } = await supabase.functions.invoke('mercado-pago-webhook', {
        body: { 
          action: 'create_preference', 
          plan: plan.toUpperCase(),
          userId: session.user.id,
          email: userEmail,
          origin: currentOrigin
        }
      });

      if (error || !data?.init_point) {
        throw new Error(data?.error || "Falha ao gerar link de pagamento");
      }

      // Salva o plano pretendido para monitoramento local
      localStorage.setItem('zapcobranca_pending_plan', plan.toUpperCase());

      // Tenta abrir em nova aba, se falhar (bloqueio de popup), redireciona na mesma
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
