import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
        }

        // 1. Verificação de Segurança (Apenas Admin)
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('sb-custom-user');

        let isAdmin = false;
        if (userCookie) {
            try {
                const user = JSON.parse(decodeURIComponent(userCookie.value));
                if (user.role === 'admin') isAdmin = true;
            } catch (e) { }
        }

        if (!isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 });
        }

        // 2. Inicializar Cliente Admin (Service Role)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Configuração de servidor incompleta (Falta Service Key).' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 3. Deletar do Supabase Auth (Login)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Erro ao deletar do Auth:', authError);
            // Não retorna erro imediatamente, tenta deletar do banco também para não deixar inconsistente
        }

        // 4. Deletar da tabela pública 'users'
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) {
            console.error('Erro ao deletar do DB:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Usuário excluído permanentemente.' });

    } catch (error: any) {
        console.error('Erro na API Delete User:', error);
        return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
    }
}
