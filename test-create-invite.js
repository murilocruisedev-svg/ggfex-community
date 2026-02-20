
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function manualInvite() {
    console.log('Tentando convidar murilocruisedev@gmail.com MANUALMENTE...');

    const { data, error } = await supabase.auth.admin.inviteUserByEmail('murilocruisedev@gmail.com', {
        redirectTo: 'https://gfex-community.vercel.app/auth/update-password',
        data: { full_name: 'Teste Manual Local' }
    });

    if (error) {
        console.error('❌ ERRO NO CONVITE:', error.message);
        console.error('Detalhes:', error);
    } else {
        console.log('✅ SUCESSO! Convite enviado.');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
    }
}

manualInvite();
