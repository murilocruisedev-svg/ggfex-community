
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        // Extrai todos os campos possíveis do corpo da requisição
        const { action, userId, newPassword, newRole, newEmail, newName } = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !serviceRoleKey) {
            return new Response(JSON.stringify({ error: 'Configuração do Servidor Incompleta' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            })
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        // --- AÇÃO 1: Alterar Senha ---
        if (action === 'update_password') {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
            if (error) throw error

            return new Response(JSON.stringify({ success: true, message: "Senha atualizada!" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // --- AÇÃO 2: Alterar Cargo (Role) ---
        if (action === 'update_role') {
            // SEGURANÇA: Verificar se está tentando remover o último Admin
            if (newRole !== 'admin') {
                const { count, error: countError } = await supabaseAdmin
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'admin')

                if (countError) throw countError

                // Se só tem 1 (ou menos) admin, e estamos tentando tirar o cargo dele... BLOQUEIA!
                if (count !== null && count <= 1) {
                    // Verifica se o usuário alvo realmente é esse admin
                    const { data: targetUser } = await supabaseAdmin.from('users').select('role').eq('id', userId).single()
                    if (targetUser?.role === 'admin') {
                        throw new Error("AÇÃO BLOQUEADA: Você não pode remover o último Administrador do sistema.")
                    }
                }
            }

            const { error } = await supabaseAdmin
                .from('users')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            return new Response(JSON.stringify({ success: true, message: `Cargo alterado para ${newRole}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // --- AÇÃO 3: Criar Novo Admin ---
        if (action === 'create_admin') {
            // 1. Cria usuário no Auth do Supabase
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: newEmail,
                password: newPassword,
                email_confirm: true, // Já confirma o email para permitir login imediato
                user_metadata: { full_name: newName }
            })

            if (createError) throw createError

            // 2. Insere na tabela 'users' pública
            // A trigger de public.users pode rodar aqui, mas vamos garantir com upsert
            const { error: dbError } = await supabaseAdmin
                .from('users')
                .upsert({
                    id: newUser.user.id,
                    email: newEmail,
                    full_name: newName,
                    role: 'admin', // Cria como ADMIN
                    subscription_status: 'active', // Acesso liberado
                    created_at: new Date().toISOString()
                })

            if (dbError) throw dbError

            return new Response(JSON.stringify({ success: true, message: "Admin criado com sucesso!" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // --- AÇÃO 4: Listar Usuários (Bypass RLS) ---
        if (action === 'list_users') {
            const { data: users, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            return new Response(JSON.stringify({ users }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Se nenhuma ação válida for encontrada
        // --- AÇÃO 5: Excluir Usuário TOTALMENTE ---
        if (action === 'delete_user') {
            // SEGURANÇA: Verificar se está tentando excluir o último Admin
            // Primeiro checa se o usuário a ser deletado é admin
            const { data: targetUser } = await supabaseAdmin.from('users').select('role').eq('id', userId).single()

            if (targetUser?.role === 'admin') {
                const { count, error: countError } = await supabaseAdmin
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'admin')

                if (countError) throw countError

                // Se só tem 1 (ou menos) admin... BLOQUEIA!
                if (count !== null && count <= 1) {
                    throw new Error("AÇÃO BLOQUEADA: Você não pode excluir o último Administrador do sistema.")
                }
            }

            // Exclui do Auth (O banco deve apagar via Cascade, mas o Auth é o principal)
            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

            if (error) throw error

            return new Response(JSON.stringify({ success: true, message: "Usuário excluído permanentemente!" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        throw new Error(`Ação desconhecida: ${action}`)

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400, // Retorna erro 400 para o frontend pegar no catch block
        })
    }
})
