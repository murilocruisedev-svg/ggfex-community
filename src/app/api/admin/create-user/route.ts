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
        // 2. Criar ou Obter Usuário (Enviando Convite)
        const requestUrl = new URL(request.url);
        const siteUrl = requestUrl.origin; // Pega a URL exata de onde veio a requisição (https://seu-site.vercel.app)
        const redirectUrl = `${siteUrl}/auth/update-password`;

        console.log(`Enviando convite para: ${email} (Redirect: ${redirectUrl})`);

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectUrl
        });

        if (authError) {
            console.error('Erro ao convidar usuário:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const user = authData.user;

        // 3. Criar/Atualizar na tabela pública 'users'
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: name,
                role: 'member', // Assinante
                status: 'active',
                plan: 'pro',
                created_at: new Date().toISOString()
            });

        if (dbError) {
            console.error('Erro ao salvar no banco:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
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
