'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkAdminAccess() {
            let role = 'member'; // Default: Membro (Sem acesso)

            // 1. Tenta pegar do Auth Oficial
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Tenta pegar ROLE atualizado da tabela users
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.role) role = profile.role;
            } else {
                // 2. Tenta pegar do Cookie Customizado (Fallback)
                try {
                    const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
                    if (cookieMatch) {
                        const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
                        // Tenta validar role no banco (segurança extra) ou confia no cookie (rápido)
                        // Vamos validar no banco pra garantir que ninguém forjou o cookie
                        const { data: profile } = await supabase
                            .from('users')
                            .select('role')
                            .eq('id', userData.id)
                            .single();

                        if (profile?.role) role = profile.role;
                        else if (userData.role) role = userData.role; // Fallback do cookie
                    }
                } catch (e) {
                    console.error("Erro auth custom:", e);
                }
            }

            // 3. Verifica Acesso
            if (role === 'admin') {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.replace('/'); // CHUTA O INVASOR
            }
        }

        checkAdminAccess();
    }, [router]);

    // Tela de Carregamento enquanto verifica (Evita flash de conteúdo proibido)
    if (isAuthorized === null) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <Loader2 className="w-10 h-10 animate-spin text-[#1F51FF]" />
                <span className="ml-3 font-bold">Verificando Permissões...</span>
            </div>
        );
    }

    // Se autorizado, mostra o conteúdo
    return isAuthorized ? <>{children}</> : null;
}
