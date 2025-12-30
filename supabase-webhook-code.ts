
// Este código deve ser implantado no Supabase como uma Edge Function
// Nome da função: mercado-pago-webhook

declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MP_ACCESS_TOKEN = "APP_USR-8375343003401062-122919-43e3e14d0d4be5820a1a751993c2b7e8-493705015";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  // É CRUCIAL retornar status 204 para OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

    let supabase: any = null;
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      try {
        supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      } catch (e) {
        console.error("Erro ao inicializar Supabase Client:", e);
      }
    }

    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);

    // --- AÇÃO: DIAGNÓSTICO ---
    if (body.action === 'test_config') {
      let mpStatus = 'FAIL';
      let details = '';
      let dbStatus = supabase ? 'OK' : 'MISSING_KEY';
      
      try {
        const mpRes = await fetch('https://api.mercadopago.com/v1/payment_methods', {
          headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
        });
        if (mpRes.ok) {
          mpStatus = 'OK';
          details = "Conexão com Mercado Pago OK!";
        } else {
          details = `Erro MP: ${mpRes.status}`;
        }
      } catch (e) {
        details = `Erro MP: Falha de conexão.`;
      }

      if (dbStatus === 'MISSING_KEY') {
        details += " | ALERTA: SERVICE_ROLE_KEY não configurada no Supabase Secrets.";
      }

      return new Response(JSON.stringify({ 
        status: "alive", 
        mp_status: mpStatus,
        db_status: dbStatus,
        details: details
      }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // --- AÇÃO: CRIAR CHECKOUT ---
    if (body.action === 'create_preference') {
      const { plan, userId, email, origin } = body;
      
      const redirectUrl = origin || 'https://zapcobranca.vercel.app';

      const PLANS_CONFIG: any = {
        'STARTER': { price: 2.00, name: 'Plano Starter - Teste v3 (R$2)' },
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
        notification_url: `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`,
        back_urls: {
          success: redirectUrl, 
          pending: redirectUrl,
          failure: redirectUrl
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

      if (!mpRes.ok) {
         const errText = await mpRes.text();
         throw new Error(`Erro Mercado Pago (${mpRes.status}): ${errText}`);
      }

      const pref = await mpRes.json();
      return new Response(JSON.stringify({ init_point: pref.init_point }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // --- WEBHOOK ---
    // Só processamos webhook se tivermos acesso ao banco
    if (supabase) {
        const paymentId = body.data?.id || body.id || searchParams.get("data.id") || searchParams.get("id");
        if (paymentId) {
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
    }

    return new Response(JSON.stringify({ status: "received" }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, // Bad Request para erros de lógica
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
