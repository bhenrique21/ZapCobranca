
// Este código deve ser implantado no Supabase como uma Edge Function
// Nome da função: mercado-pago-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MP_ACCESS_TOKEN = "APP_USR-8375343003401062-122919-43e3e14d0d4be5820a1a751993c2b7e8-493705015";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento de CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, plan, email, userId, origin } = await req.json();

    // 1. Ação de Diagnóstico (Simples)
    if (action === 'test_config') {
      return new Response(JSON.stringify({ 
        mp_status: 'OK', 
        details: 'Função ativa (Modo Simplificado)' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Ação de Criar Preferência de Pagamento
    if (action === 'create_preference') {
      
      // CONFIGURAÇÃO DE PREÇOS
      const PLANS_CONFIG: any = {
        'STARTER': { price: 2.00, name: 'Plano Starter - Teste (R$2)' },
        'PRO': { price: 59.90, name: 'Plano Pro - Mensal' },
        'ADVANCED': { price: 99.90, name: 'Plano Avançado - Mensal' }
      };

      const selectedPlan = PLANS_CONFIG[plan] || PLANS_CONFIG['STARTER'];
      const backUrl = origin || 'https://zapcobranca.vercel.app';

      const preference = {
        items: [
          {
            title: selectedPlan.name,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: selectedPlan.price
          }
        ],
        payer: {
          email: email
        },
        external_reference: userId,
        auto_return: "approved",
        back_urls: {
          success: backUrl,
          failure: backUrl,
          pending: backUrl
        }
      };

      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify(preference)
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        throw new Error(`Mercado Pago Error: ${errorText}`);
      }

      const data = await mpResponse.json();

      return new Response(JSON.stringify({ init_point: data.init_point }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
