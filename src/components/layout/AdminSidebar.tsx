
'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Music, Users, Settings, LogOut, ChevronRight, ShieldCheck, FolderOpen, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';

const adminNavItems = [
    { name: 'Dashboard', href: '/painel', icon: LayoutDashboard },
    { name: 'Meus Áudios', href: '/painel/audios', icon: Music },
    { name: 'Categorias', href: '/painel/categories', icon: FolderOpen },
    { name: 'Assinantes', href: '/painel/users', icon: Users },
    { name: 'Administradores', href: '/painel/admins', icon: ShieldCheck },
    { name: 'Chaves de API', href: '/painel/chave', icon: Key },
    { name: 'Configurações', href: '/painel/settings', icon: Settings },
];


interface UserProfile {
    email: string | undefined;
    full_name?: string;
    avatar_url?: string;
    user_metadata?: {
        full_name?: string;
    };
    id?: string;
}

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const getUser = async () => {
            let foundUser = null;
            let foundProfile = null;

            // 1. Tenta pegar do Auth Oficial do Supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                foundUser = user;
                // Tenta pegar avatar e nome atualizados da tabela users
                const { data: profile } = await supabase
                    .from('users')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();
                foundProfile = profile;
            } else {
                // 2. Fallback: Cookie Customizado (Igual ao AuthGuard)
                // Isso resolve o problema visual se o Auth do Supabase perder sessão mas o cookie persistir
                try {
                    const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
                    if (cookieMatch) {
                        const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
                        if (userData && userData.id) {
                            foundUser = userData;
                            // Se o cookie tiver dados de profile, usamos
                            foundProfile = {
                                full_name: userData.full_name || userData.user_metadata?.full_name,
                                avatar_url: userData.avatar_url
                            };
                        }
                    }
                } catch (e) {
                    console.error("Erro ao ler cookie no Sidebar", e);
                }
            }

            if (foundUser) {
                setUser({
                    id: foundUser.id,
                    email: foundUser.email,
                    full_name: foundProfile?.full_name || foundUser.user_metadata?.full_name,
                    avatar_url: foundProfile?.avatar_url
                });
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Limpar cookies customizados
        document.cookie = "sb-custom-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sb-custom-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/auth/login');
    };

    return (
        <aside className="h-full w-full flex flex-col bg-[#0A0A0A] border-r border-[#222] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
            {/* Header / Logo Area */}
            <div className="h-24 flex items-center px-8 border-b border-[#1A1A1A]/80 bg-[#0A0A0A]">
                <div className="flex items-center gap-4 group cursor-pointer transition-opacity hover:opacity-80">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#F24405] to-[#D93D04] flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
                        <span className="text-white font-bold text-xl tracking-tighter">G</span>
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                            GGFEX <span className="text-[#F24405]">Painel</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase mt-1">
                            Gestor v1.0
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    Menu Principal
                </div>

                {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    // Lógica para saber se está ativo (inclusive subrotas)
                    const isActive = pathname === item.href || (item.href !== '/painel' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 border border-transparent",
                                isActive
                                    ? "bg-white/5 text-white border-white/5 shadow-inner"
                                    : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#F24405] rounded-r-full shadow-[0_0_12px_#F24405]" />
                            )}

                            <Icon
                                className={cn(
                                    "mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                                    isActive ? "text-[#F24405]" : "text-gray-500 group-hover:text-gray-300"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />

                            <span className="flex-1">{item.name}</span>

                            {isActive && (
                                <ChevronRight className="w-4 h-4 text-[#F24405] opacity-100 transition-opacity" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout Area */}
            <div className="p-4 border-t border-[#1A1A1A]">
                <div className="bg-[#111] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                        {/* Avatar Dinâmico */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-xs text-white font-bold border border-white/10 overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.full_name?.[0]?.toUpperCase() || 'AD'}</span>
                            )}
                        </div>

                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate group-hover:text-[#F24405] transition-colors">
                                {user?.full_name || 'Administrador'}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={user?.email}>
                                {user?.email || 'Carregando...'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all border border-red-500/10"
                    >
                        <LogOut className="mr-2 h-3.5 w-3.5" />
                        Sair do Painel
                    </button>
                </div>
            </div>
        </aside>
    );
}
