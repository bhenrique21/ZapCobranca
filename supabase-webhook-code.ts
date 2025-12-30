
// Este código deve ser implantado no Supabase como uma Edge Function
// Nome da função: mercado-pago-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MP_ACCESS_TOKEN = "APP_USR-8375343003401062-122919-43e3e14d0d4be5820a1a751993c2b7e8-493705015";

// Cabeçalhos CORS para permitir que o frontend chame a função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // 1. Trata requisições OPTIONS (Pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    // --- AÇÃO: DIAGNÓSTICO ---
    if (body.action === 'test_config') {
      let mpStatus = 'FAIL';
      let details = '';
      
      try {
        const mpRes = await fetch('https://api.mercadopago.com/v1/payment_methods', {
          headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
        });
        if (mpRes.ok) mpStatus = 'OK';
        else details = `Erro MP: ${mpRes.status}`;
      } catch (e) {
        details = `Erro Conexão MP: ${e.message}`;
      }

      return new Response(JSON.stringify({ 
        status: "alive", 
        mp_status: mpStatus,
        details: details || "Tudo configurado corretamente (CORS OK)."
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // --- AÇÃO: CRIAR CHECKOUT ---
    if (body.action === 'create_preference') {
      const { plan, userId, email } = body;
      
      const PLANS_CONFIG: any = {
        'STARTER': { price: 39.90, name: 'Plano Starter - ZapCobrança' },
        'PRO': { price: 59.90, name: 'Plano Pro - ZapCobrança' },
        'ADVANCED': { price: 99.90, name: 'Plano Avançado - ZapCobrança' }
      };
      
      const config = PLANS_CONFIG[plan] || PLANS_CONFIG.STARTER;

      const preferenceBody = {
        items: [{
          title: config.name,
          unit_price: config.price,
          quantity: 1,
          currency_id: 'BRL'
        }],
        payer: { email: email },
        external_reference: userId,
        notification_url: `https://vgvwlmomdwvzoxlflaix.supabase.co/functions/v1/mercado-pago-webhook`,
        back_urls: {
          success: `https://zapcobranca.vercel.app`, 
          pending: `https://zapcobranca.vercel.app`,
          failure: `https://zapcobranca.vercel.app`
        },
        auto_return: 'approved'
      };

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceBody)
      });

      const pref = await mpRes.json();
      return new Response(JSON.stringify({ init_point: pref.init_point }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // --- LÓGICA: WEBHOOK (RECEBIMENTO) ---
    const paymentId = body.data?.id || body.id || searchParams.get("data.id") || searchParams.get("id");
    const type = body.type || searchParams.get("type");

    if (paymentId && (type === "payment" || !type)) {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
      });
      
      if (mpResponse.ok) {
        const payment = await mpResponse.json();
        if (payment.status === "approved" && payment.external_reference) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          await supabase.from('profiles').update({
            subscription_active: true,
            subscription_expires_at: expiresAt.toISOString()
          }).eq('id', payment.external_reference);
        }
      }
    }

    return new Response(JSON.stringify({ status: "received" }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
