// Este código deve ser implantado no Supabase como uma Edge Function
// Nome da função: mercado-pago-webhook
// Deploy: npx supabase functions deploy mercado-pago-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const MP_ACCESS_TOKEN = "APP_USR-8375343003401062-122919-43e3e14d0d4be5820a1a751993c2b7e8-493705015";

// Configuração do Supabase (Usado para atualizar o status do usuário após pagamento)
// O Deno.env pega as variáveis de ambiente configuradas no Supabase Dashboard
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vgvwlmomdwvzoxlflaix.supabase.co";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const url = new URL(req.url);

  // 0. Tratamento de CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ==================================================================
    // 1. LÓGICA DE WEBHOOK (Recebimento de Notificação do Mercado Pago)
    // ==================================================================
    // O Mercado Pago envia notificações via query params (topic/id) ou body.
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (id && (topic === 'payment' || topic === 'merchant_order')) {
      console.log(`[Webhook] Recebida notificação de pagamento: ${id}`);

      // Se não tivermos a chave de serviço, não conseguimos atualizar o banco
      if (!SUPABASE_SERVICE_KEY) {
        console.error("ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não definida nos Secrets.");
        return new Response("Erro de Configuração no Servidor", { status: 500 });
      }

      // Buscar status atualizado no Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { "Authorization": `Bearer ${MP_ACCESS_TOKEN}` }
      });

      if (!mpResponse.ok) {
        console.error("Erro ao consultar MP:", await mpResponse.text());
        return new Response("Erro ao consultar Mercado Pago", { status: 400 });
      }

      const paymentData = await mpResponse.json();
      const status = paymentData.status; // approved, pending, rejected
      const userId = paymentData.external_reference; // ID do usuário no Supabase
      const planName = paymentData.metadata?.plan_name || 'PRO'; // Recupera o plano dos metadados

      console.log(`[Webhook] Pagamento ${id} - Status: ${status} - User: ${userId}`);

      if (status === 'approved' && userId) {
        // Inicializar Supabase com chave de ADMIN (Service Role) para poder escrever sem logar
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Calcular nova expiração (30 dias a partir de hoje)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Atualizar tabela profiles
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_active: true,
            plan: planName.toUpperCase(),
            subscription_expires_at: expiresAt.toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error("Erro ao atualizar Supabase:", updateError);
          return new Response("Falha ao atualizar banco de dados", { status: 500 });
        }

        console.log(`[Webhook] Sucesso! Usuário ${userId} ativado.`);
      }

      return new Response("Webhook Recebido", { status: 200 });
    }

    // ==================================================================
    // 2. LÓGICA DO CLIENTE (Criar Link de Pagamento)
    // ==================================================================
    // Se não for webhook, tentamos ler o corpo JSON enviado pelo app React
    let body;
    try {
      body = await req.json();
    } catch (e) {
      // Se falhar ao ler JSON e não for webhook, erro.
      return new Response(JSON.stringify({ error: "Body inválido" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      });
    }

    const { action, plan, email, userId, origin, webhookUrl } = body;

    // Diagnóstico
    if (action === 'test_config') {
      return new Response(JSON.stringify({ 
        mp_status: 'OK', 
        details: 'Função ativa e pronta para Webhooks.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar Preferência
    if (action === 'create_preference') {
      const PLANS_CONFIG: any = {
        'STARTER': { price: 2.00, name: 'Plano Starter - Teste (R$2)' },
        'PRO': { price: 59.90, name: 'Plano Pro - Mensal' },
        'ADVANCED': { price: 99.90, name: 'Plano Avançado - Mensal' }
      };

      const selectedPlan = PLANS_CONFIG[plan] || PLANS_CONFIG['STARTER'];
      const backUrl = origin || 'https://zapcobranca.vercel.app';
      
      // Define a URL que o Mercado Pago vai chamar quando pagar
      // Se webhookUrl vier do front, usa ela. Senão tenta adivinhar.
      const notificationUrl = webhookUrl || `${SUPABASE_URL}/functions/v1/mercado-pago-webhook`;

      console.log(`[Checkout] Criando preferência para ${email} - Notification: ${notificationUrl}`);

      const preference = {
        items: [
          {
            title: selectedPlan.name,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: selectedPlan.price
          }
        ],
        // Metadados são cruciais para sabermos qual plano ativar quando o webhook voltar
        metadata: {
          plan_name: plan,
          user_id: userId
        },
        external_reference: userId,
        auto_return: "approved",
        back_urls: {
          success: backUrl,
          failure: backUrl,
          pending: backUrl
        },
        notification_url: notificationUrl
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
    console.error("Erro Geral:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});