import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        // --- SECURITY CHECK ---
        const cookieHeader = request.headers.get('cookie') || '';
        const envCookie = cookieHeader.split('; ').find(row => row.trim().startsWith('sb-custom-user='))?.split('=')[1];

        let isAdmin = false;
        if (envCookie) {
            try {
                const userData = JSON.parse(decodeURIComponent(envCookie));
                if (userData.role === 'admin') isAdmin = true;
            } catch (e) { }
        }

        if (!isAdmin) {
            return NextResponse.json({ error: 'Acesso Negado.' }, { status: 401 });
        }
        // ---------------------

        const { key } = await request.json();

        if (!key || !key.startsWith('ey')) {
            return NextResponse.json({ error: 'Chave inválida. Ela deve começar com "ey".' }, { status: 400 });
        }

        const envPath = path.join(process.cwd(), '.env.local');

        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');
        }

        // Verifica se já existe
        if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
            // Substitui
            const regex = /SUPABASE_SERVICE_ROLE_KEY=.*/g;
            envContent = envContent.replace(regex, `SUPABASE_SERVICE_ROLE_KEY=${key}`);
        } else {
            // Adiciona no final
            envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${key}\n`;
        }

        fs.writeFileSync(envPath, envContent);

        return NextResponse.json({ success: true, message: 'Chave salva com sucesso! O servidor precisa ser reiniciado para aplicar.' });

    } catch (error: any) {
        console.error('Erro ao salvar chave:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
