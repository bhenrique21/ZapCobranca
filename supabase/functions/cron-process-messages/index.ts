
// Função Edge para automação de mensagens
// Deploy: npx supabase functions deploy cron-process-messages --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

Deno.serve(async (req: any) => {
  try {
    // 1. Identificar o dia de hoje
    const today = new Date();
    const dayOfMonth = today.getDate(); // Dia 1 a 31
    
    console.log(`[Cron] Iniciando processamento para o dia ${dayOfMonth}`);

    // 2. Buscar clientes que vencem hoje e têm auto_send = true
    // Precisamos fazer um join manual ou buscar clientes e depois os perfis
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*, profiles:user_id (id, message_template, pix_key, payment_link, gateway_url, gateway_api_key)")
      .eq("due_day", dayOfMonth)
      .eq("auto_send", true)
      .neq("status", "PAGO"); // Não cobra quem já pagou

    if (error) {
        console.error("Erro ao buscar clientes:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!clients || clients.length === 0) {
        console.log("[Cron] Nenhuma mensagem para enviar hoje.");
        return new Response(JSON.stringify({ message: "Nada a processar" }), { status: 200 });
    }

    console.log(`[Cron] ${clients.length} mensagens potenciais encontradas.`);

    const results = [];

    // 3. Processar cada cliente
    for (const client of clients) {
        const user = client.profiles;

        // Validação básica: O usuário tem Gateway configurado?
        if (!user.gateway_url) {
            console.log(`[Skip] Usuário ${user.id} não configurou Gateway.`);
            results.push({ client: client.name, status: "skipped_no_config" });
            continue;
        }

        // Montar a mensagem
        let message = client.custom_message || user.message_template || "Olá, lembrete de pagamento.";
        const replacements = {
            '{{nome_cliente}}': client.name,
            '{{valor}}': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthly_value),
            '{{vencimento}}': `dia ${client.due_day}`,
            '{{chave_pix}}': user.pix_key || '',
            '{{link_pagamento}}': user.payment_link || ''
        };

        for (const [key, value] of Object.entries(replacements)) {
            message = message.replace(new RegExp(key, 'g'), value);
        }

        // Preparar o telefone (remover não dígitos e garantir 55)
        let phone = client.whatsapp.replace(/\D/g, '');
        if (!phone.startsWith("55")) phone = "55" + phone;

        // 4. Enviar Request para o Gateway do Usuário
        try {
            console.log(`[Sending] Enviando para ${client.name} via ${user.gateway_url}`);
            
            // Payload padrão (compatível com Evolution API / Z-API / Woofy)
            // Geralmente é number/phone e message/text
            const payload = {
                number: phone,
                phone: phone, // redundância para compatibilidade
                message: message,
                text: message // redundância
            };

            const headers: any = { "Content-Type": "application/json" };
            if (user.gateway_api_key) {
                headers["Authorization"] = user.gateway_api_key.includes("Bearer") 
                    ? user.gateway_api_key 
                    : `Bearer ${user.gateway_api_key}`;
                // Alguns gateways usam 'apikey' no header
                headers["apikey"] = user.gateway_api_key;
            }

            const response = await fetch(user.gateway_url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Registrar Log no Supabase
                await supabase.from("message_logs").insert({
                    user_id: user.id,
                    client_id: client.id,
                    client_name: client.name,
                    type: "AUTO_LEMBRETE",
                    sent_at: new Date().toISOString(),
                    status: "SENT"
                });
                results.push({ client: client.name, status: "success" });
            } else {
                const errText = await response.text();
                console.error(`[Error] Gateway recusou: ${errText}`);
                results.push({ client: client.name, status: "gateway_error", details: errText });
            }

        } catch (reqErr: any) {
            console.error(`[Error] Falha de requisição: ${reqErr.message}`);
            results.push({ client: client.name, status: "network_error" });
        }
    }

    return new Response(JSON.stringify({ processed: results }), { 
        headers: { "Content-Type": "application/json" },
        status: 200 
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
