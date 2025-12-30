
import { PlanType } from '../types';
import { supabase, SUPABASE_URL } from './supabase';

// Helper para obter a anon key definida no lib/supabase.ts
// Como ela não é exportada diretamente lá, vamos pegá-la da instância do cliente
// ou usar a string hardcoded se necessário. Para garantir, vamos usar o getter do supabase.
const getAnonKey = () => {
  // @ts-ignore - Acessando propriedade interna para garantir envio correto
  return supabase.supabaseKey || 'sb_publishable__M8OpRuAFQOfZRXTH-UQTg_TfzakYbv';
};

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    const currentOrigin = window.location.origin;
    console.log('Gerando checkout dinâmico para:', plan, 'com retorno para:', currentOrigin);

    const functionUrl = `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`;
    const anonKey = getAnonKey();

    try {
      // Usamos fetch direto ao invés de supabase.functions.invoke para evitar problemas de SDK
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
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
        // Se a resposta for 404, significa que a função não existe (não deployada)
        if (response.status === 404) {
          throw new Error("ALERTA: A função de pagamento não foi encontrada (404). Verifique se você rodou o comando 'npx supabase functions deploy mercado-pago-webhook --no-verify-jwt' no terminal.");
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.init_point) {
        throw new Error(data?.error || "O servidor não retornou o link de pagamento corretamente.");
      }

      localStorage.setItem('zapcobranca_pending_plan', plan.toUpperCase());

      const checkoutUrl = data.init_point;
      
      // Tentar abrir em nova aba
      const win = window.open(checkoutUrl, '_blank');
      
      // Se bloqueador de popup impedir, redirecionar na mesma aba
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = checkoutUrl;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Erro no checkout:', err);
      // Repassar erro amigável
      if (err.message.includes('ALERTA')) throw err;
      if (err.message.includes('Failed to fetch')) {
        throw new Error("Erro de conexão. Verifique se a Edge Function está no ar e se você não tem bloqueadores de anúncio ativos.");
      }
      throw err;
    }
  }
};
