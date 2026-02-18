import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // --- SECURITY CHECK ---
        const cookieHeader = request.headers.get('cookie') || '';
        const userCookie = cookieHeader.split('; ').find(row => row.startsWith('sb-custom-user='))?.split('=')[1];

        let isAdmin = false;
        if (userCookie) {
            try {
                const userData = JSON.parse(decodeURIComponent(userCookie));
                if (userData.role === 'admin') isAdmin = true;
            } catch (e) { }
        }

        if (!isAdmin) {
            return NextResponse.json({ error: 'Acesso Negado: Apenas administradores.' }, { status: 401 });
        }
        // ---------------------

        const body = await request.json();
        const { email, name } = body;

        // Verifica se a chave secreta (SERVICE_ROLE) existe
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: 'Configuração de Servidor Incompleta: Falta SUPABASE_SERVICE_ROLE_KEY no .env.local' },
                { status: 500 }
            );
        }

        // Cria cliente Admin
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // 2. Tentar enviar convite por E-mail (Método Ideal)
        const requestUrl = new URL(request.url);
        const siteUrl = requestUrl.origin;
        const redirectUrl = `${siteUrl}/auth/update-password`;

        console.log(`Tentando enviar convite para: ${email}`);

        let userId = null;
        let tempPassword = null;

        // Tenta enviar convite
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectUrl
        });

        if (!inviteError && inviteData.user) {
            userId = inviteData.user.id;
            console.log("Convite enviado com sucesso.");
        } else {
            // FALLBACK: Se der erro (ex: Rate Limit), cria com senha temporária
            console.warn("Erro ao enviar convite (Rate Limit?), criando manualmente:", inviteError);

            tempPassword = "mudar123"; // Senha padrão de emergência

            // Verifica se usuário já existe no Auth
            const { data: existingUser } = await supabaseAdmin.from('users').select('id').eq('email', email).single();

            if (existingUser) {
                userId = existingUser.id;
                // Apenas atualiza senha se necessário (opcional)
            } else {
                // Cria do zero
                const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: { full_name: name }
                });

                if (createError) {
                    // Erro: Usuário já existe no Auth mas não na Tabela Pública
                    if (createError.message?.toLowerCase().includes("already")) {
                        console.warn("Usuário Zumbi detectado (Auth sem Tabela). Tentando recuperar...");

                        // Tenta encontrar o ID listando usuários (Fallback pesado mas necessário)
                        const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
                        const zombieUser = listData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

                        if (zombieUser) {
                            userId = zombieUser.id;
                            // Força a senha temporária para garantir acesso
                            await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword });
                            console.log("Zumbi recuperado e senha resetada.");
                        } else {
                            return NextResponse.json({ error: "Erro crítico: Email duplicado no Auth mas não encontrado. Contate suporte." }, { status: 400 });
                        }
                    } else {
                        return NextResponse.json({ error: createError.message }, { status: 400 });
                    }
                } else {
                    userId = createData.user?.id;
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "Erro fatal ao criar usuário." }, { status: 500 });
        }

        // 3. Criar/Atualizar na tabela pública 'users'
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: userId,
                email: email,
                full_name: name,
                role: 'member', // Assinante
                subscription_status: 'active',
                created_at: new Date().toISOString()
            });

        if (dbError) {
            console.error('Erro ao salvar no banco:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        if (tempPassword) {
            return NextResponse.json({
                success: true,
                message: `ATENÇÃO: Limite de e-mail atingido. Usuário criado com senha temporária: ${tempPassword}`
            });
        }

        return NextResponse.json({ success: true, message: 'Convite enviado com sucesso!' });

    } catch (error: any) {
        console.error('Erro na API Create User:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno ao criar usuário' },
            { status: 400 }
        );
    }
}
