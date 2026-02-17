
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

// Cabeçalhos CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Tratamento de Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

        // Cliente Supabase Admin (Bypass RLS)
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        // 1. Receber Dados do Webhook
        const body = await req.json()
        console.log('--- WEBHOOK RECEBIDO ---')
        console.log(JSON.stringify(body, null, 2))
        console.log('------------------------')

        let email = null;
        let status = 'pending';
        let eventType = 'unknown';

        // --- INTEGRAÇÃO KIWIFY / LOWIFY / GENÉRICA ---
        // Tenta detectar o formato (Kiwify geralmente usa order_status e Customer com C maiúsculo)

        // 1. Tenta pegar Email
        if (body.customer && body.customer.email) email = body.customer.email; // Lowify / Padrão
        else if (body.Customer && body.Customer.email) email = body.Customer.email; // Kiwify (às vezes)
        else if (body.email) email = body.email; // Genérico

        // 2. Tenta pegar Status
        if (body.order_status) status = body.order_status.toLowerCase(); // Kiwify
        else if (body.status) status = body.status.toLowerCase(); // Lowify / Genérico

        // 3. Tenta pegar Evento
        eventType = body.event || body.webhook_event_type || 'payment_update';

        if (!email) {
            console.error('Email não encontrado no payload.')
            return new Response(JSON.stringify({ error: 'Email não encontrado' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            })
        }

        console.log(`Processando: ${email} | Status Origem: ${status}`)

        // 2. Verificar se o usuário existe no AUTH
        const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers()
        if (searchError) console.error('Erro ao listar usuários do Auth:', searchError)

        const authUser = users.find(u => u.email === email)
        let userId = authUser?.id
        let tempPassword = null

        // 3. Se não existir, CRIAR USUÁRIO
        if (!userId) {
            console.log('Usuário não existe. Criando novo...')
            tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

            const fullName = body.customer?.name || body.name || 'Novo Assinante';

            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: fullName }
            })

            if (createError) throw createError
            userId = newUser.user.id
        }

        // 4. Mapear Status para Ações
        let subscriptionStatus = 'inactive';
        let expiresAt = new Date();

        if (['paid', 'approved', 'completed', 'succeeded', 'pago', 'aprovada'].includes(status)) {
            subscriptionStatus = 'active';
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias de acesso
        } else if (['refunded', 'chargedback', 'canceled', 'failed', 'reembolsada', 'estornada', 'cancelada'].includes(status)) {
            subscriptionStatus = 'canceled';
            expiresAt = new Date(); // Expira agora
        } else {
            // Status pendente ou desconhecido
            console.log(`Status '${status}' ignorado. Mantendo atual.`)
        }

        console.log(`Novo Status do Usuário: ${subscriptionStatus}`)

        // 5. Atualizar Banco de Dados
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                subscription_status: subscriptionStatus,
                subscription_expires_at: subscriptionStatus === 'active' ? expiresAt.toISOString() : undefined,
                updated_at: new Date().toISOString()
            })

        if (upsertError) throw upsertError

        const responseData = {
            message: `Webhook processado. Status: ${subscriptionStatus}`,
            user_id: userId,
            email: email,
            temporaryPassword: tempPassword,
            status: subscriptionStatus
        }

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error: any) {
        console.error('Webhook Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
