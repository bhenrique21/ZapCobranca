
import { PlanType } from '../types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    const currentOrigin = window.location.origin;
    const functionUrl = `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`;

    try {
      console.log(`Iniciando checkout: ${plan} em ${functionUrl}`);

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
          origin: currentOrigin
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro no servidor:', errorText);
        throw new Error("Falha ao conectar com o servidor de pagamentos. Verifique se a função foi implantada (deploy).");
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
      // Repassa o erro de forma limpa para a UI
      if (err.message.includes('Failed to fetch')) {
        throw new Error("Erro de Conexão: O servidor recusou a conexão. Verifique se o Deploy foi feito ou se você tem bloqueadores de anúncio ativos.");
      }
      throw err;
    }
  }
};
