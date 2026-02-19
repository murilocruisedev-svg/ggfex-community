import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const requestUrl = new URL(request.url);
        const siteUrl = requestUrl.origin; // https://ggfex-community.vercel.app

        console.log('--- WEBHOOK KIWIFY (VERCEL) ---');
        // console.log(JSON.stringify(body, null, 2)); // Descomente para debug

        let email = null;
        let status = 'pending';
        let name = 'Novo Assinante';

        // 1. EXTRAIR DADOS (Compatível com Kiwify e genérico)
        // Kiwify envia "Customer" ou "customer"
        if (body.Customer) { // Padrão Kiwify (Maiúsculo)
            email = body.Customer.email;
            name = body.Customer.full_name || body.Customer.name || name;
        } else if (body.customer) {
            email = body.customer.email;
            name = body.customer.name || name;
        } else if (body.email) {
            email = body.email;
            name = body.name || name;
        }

        // Status da Compra
        if (body.order_status) status = body.order_status.toLowerCase();
        else if (body.status) status = body.status.toLowerCase();

        if (!email) {
            return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 });
        }

        console.log(`Processando: ${email} | Status: ${status}`);

        // 2. DEFINIR STATUS DA ASSINATURA
        let subscriptionStatus = 'inactive';
        // Lista de status considerados "PAGO"
        const paidStatuses = ['paid', 'approved', 'completed', 'succeeded', 'pago', 'aprovada'];

        if (paidStatuses.includes(status)) {
            subscriptionStatus = 'active';
        } else if (['refunded', 'chargedback', 'canceled', 'failed', 'reembolsada', 'estornada', 'cancelada'].includes(status)) {
            subscriptionStatus = 'canceled';
        }

        // 3. VERIFICAR SE O USUÁRIO JÁ EXISTE (Tabela Pública)
        const { data: existingUser, error: findError } = await supabaseAdmin
            .from('users')
            .select('id, subscription_status')
            .eq('email', email)
            .single();

        let userId = existingUser?.id;

        // CENÁRIO A: USUÁRIO JÁ EXISTE -> Apenas atualiza status (Renovação/Recompra)
        if (userId) {
            console.log(`Usuário existente (${userId}). Atualizando status...`);
            await supabaseAdmin
                .from('users')
                .update({
                    subscription_status: subscriptionStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);
        }
        // CENÁRIO B: NOVO USUÁRIO -> Envia Convite (Apenas se estiver PAGO)
        else {
            if (subscriptionStatus === 'active') { // Só cria se pagou
                console.log(`Novo usuário! Enviando convite...`);

                const redirectUrl = `${siteUrl}/auth/update-password`;

                // Envia convite (Supabase Auth)
                const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                    redirectTo: redirectUrl,
                    data: { full_name: name }
                });

                if (inviteError) {
                    // Fallback para usuário Zumbi (já existe no Auth mas não no banco)
                    if (inviteError.message?.includes("already")) {
                        // Buscar ID do Auth e criar na tabela
                        const { data: listData } = await supabaseAdmin.auth.admin.listUsers(); // Fallback pesado
                        const zombie = listData.users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
                        if (zombie) {
                            userId = zombie.id;
                            // Atualiza senha se necessário ou manda reset?
                            // Vamos assumir que se ele já existe no Auth, ele sabe a senha ou pede reset.
                            // Apenas criamos o registro no banco para liberar acesso.
                        }
                    } else {
                        console.error("Erro no convite:", inviteError);
                        return NextResponse.json({ error: inviteError.message }, { status: 500 });
                    }
                } else {
                    userId = inviteData.user?.id;
                }

                if (userId) {
                    // Cria registro na tabela users
                    await supabaseAdmin
                        .from('users')
                        .insert({
                            id: userId,
                            email: email,
                            full_name: name,
                            role: 'member',
                            subscription_status: 'active',
                            created_at: new Date().toISOString()
                        });
                }
            } else {
                console.log("Recebido novo usuário mas pagamento não aprovado. Ignorando criação.");
                return NextResponse.json({ message: 'Ignored: Not paid' });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Webhook processado. User: ${email}, Status: ${subscriptionStatus}`
        });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
