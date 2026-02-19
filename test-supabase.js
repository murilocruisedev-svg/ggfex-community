
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    console.log('--- DIAGNÓSTICO DO USUÁRIO ---');

    // 1. Verifica tabela pública
    const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'murilocruisedev@gmail.com')
        .single();

    if (dbUser) {
        console.log(`[DB] Usuário existe! Status: ${dbUser.subscription_status}`);
    } else {
        console.log('[DB] Usuário NÃO encontrado na tabela.');
    }

    // 2. Verifica Auth
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const authUser = users.find(u => u.email === 'murilocruisedev@gmail.com');

    if (authUser) {
        console.log(`[AUTH] Usuário existe! ID: ${authUser.id}`);
        console.log(`       Confirmado em: ${authUser.email_confirmed_at}`);
        console.log(`       Último Login: ${authUser.last_sign_in_at}`);
    } else {
        console.log('[AUTH] Usuário NÃO encontrado no Auth.');
    }
}

checkUser();
