import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
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

        // 1. Gera senha temporária (o login será via OTP/Código, então a senha não importa muito)
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

        // 2. Cria usuário no Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (createError) throw createError;
        if (!newUser.user) throw new Error("Erro desconhecido ao criar usuário.");

        // 3. Insere na tabela 'users' pública
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: newUser.user.id,
                email: email,
                full_name: name,
                role: 'member', // Assinante
                subscription_status: 'active',
                subscription_expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 100)), // Vitalício (100 anos)
                created_at: new Date().toISOString()
            });

        if (dbError) throw dbError;

        return NextResponse.json({ success: true, message: 'Assinante criado com sucesso!' });

    } catch (error: any) {
        console.error('Erro na API Create User:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno ao criar usuário' },
            { status: 400 }
        );
    }
}
