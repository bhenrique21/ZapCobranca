
import { PlanType } from '../types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

export const payments = {
  async createCheckoutSession(plan: PlanType, userEmail: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Usuário não autenticado");

    const currentOrigin = window.location.origin;
    console.log('Gerando checkout para:', plan, 'com retorno para:', currentOrigin);

    const functionUrl = `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`;
    
    // Debug no console para ajudar o usuário a verificar se a URL está correta
    console.log('Tentando conectar em:', functionUrl);

    try {
      // ADIÇÃO CRÍTICA: O header 'apikey' é frequentemente obrigatório pelo Gateway do Supabase
      // além do Authorization Bearer. Sem ele, o Gateway pode rejeitar com 401/403 sem CORS.
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
        // Se a resposta for 404, significa que a função não existe
        if (response.status === 404) {
          throw new Error("ALERTA: A função de pagamento não foi encontrada (404). Rode: 'npx supabase functions deploy mercado-pago-webhook --no-verify-jwt' no terminal.");
        }
        
        // Tenta ler o erro do JSON, se falhar, lê como texto
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { error: errorText || `Erro HTTP ${response.status}` };
        }
        
        throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
      }

      const data = await response.json();

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
      console.error('Erro detalhado no checkout:', err);
      
      if (err.message.includes('ALERTA')) throw err;
      
      if (err.message.includes('Failed to fetch')) {
        // Mensagem de erro mais específica e amigável
        throw new Error("Erro de conexão (Failed to Fetch). Isso geralmente acontece por 3 motivos:\n1. AdBlock bloqueando 'mercado-pago' na URL.\n2. A Edge Function não foi implantada (rode o deploy).\n3. Problema momentâneo de internet.\n\nTente desativar o AdBlock e tente novamente.");
      }
      throw err;
    }
  }
};
