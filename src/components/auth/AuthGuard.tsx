'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            // Tenta pegar usuário do Cookie Customizado
            const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
            if (cookieMatch) {
                // Se tem cookie, assume que está logado
                try {
                    const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
                    if (userData && userData.id) {
                        setIsAuthorized(true);
                        return;
                    }
                } catch (e) {
                    console.error("Erro ao ler cookie", e);
                }
            }

            // Fallback: Tenta pegar do Auth Oficial
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setIsAuthorized(true);
            } else {
                // Bloqueado
                setIsAuthorized(false);
                router.replace('/auth/login');
            }
        };

        checkAccess();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
                <Loader2 className="h-8 w-8 animate-spin text-[#1F51FF]" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // ou um loading discreto enquanto redireciona
    }

    return <>{children}</>;
}
