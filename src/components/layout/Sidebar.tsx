
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, MessageCircle, Music, Zap, Layers, Volume2, Globe, User, Settings, LogOut, Folder, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'

// Tipo manual para evitar erro de build
interface Category {
    id: number
    name: string
    slug: string
    description: string | null
}

interface UserProfile {
    email: string | undefined
    full_name?: string
    avatar_url?: string | null
    role?: string // Adicionado
}

const navItems = [
    { name: 'Sound Effects', href: '/', icon: Music },
]

export function Sidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [categories, setCategories] = useState<Category[]>([])
    const [user, setUser] = useState<UserProfile | null>(null)

    useEffect(() => {
        // 1. Fetch Categories
        async function fetchCategories() {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (data) {
                setCategories(data)
            }
        }

        // 2. Fetch Current User (Support Custom Cookie Auth)
        async function fetchUser() {
            let currentUser = null;

            // Tenta Auth Oficial
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (authUser) {
                currentUser = authUser;
            } else {
                // Tenta Auth Customizado (Cookie)
                try {
                    const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
                    if (cookieMatch) {
                        const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
                        currentUser = userData;
                    }
                } catch (e) {
                    console.error("Erro ao ler cookie custom:", e);
                }
            }

            if (currentUser) {
                // Tenta pegar avatar e nome atualizados da tabela users
                const { data: profile } = await supabase
                    .from('users')
                    .select('full_name, avatar_url, role')
                    .eq('id', currentUser.id)
                    .single();

                setUser({
                    email: currentUser.email,
                    full_name: profile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                    avatar_url: profile?.avatar_url,
                    role: profile?.role
                })
            }
        }

        fetchCategories()
        fetchUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        document.cookie = "sb-custom-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "sb-custom-user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        window.location.href = '/auth/login'
    }

    return (
        <div className="h-full bg-[#050505] flex flex-col border-r border-white/5">
            {/* Header */}
            <div className="p-6 shrink-0 flex justify-center">
                <Link href="/">
                    <Logo className="text-2xl" />
                </Link>
            </div>

            {/* Menu Principal - fixo */}
            <div className="px-4 space-y-1 shrink-0">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all group border",
                                isActive
                                    ? "bg-[#1F51FF] text-white border-[#1F51FF] shadow-lg shadow-blue-600/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                            )}
                        >
                            <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            {/* Botão Comunidade - fixo */}
            <div className="px-4 mt-4 shrink-0">
                <Link
                    href="https://whatsapp.com"
                    target="_blank"
                    className="flex items-center px-4 py-3 text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all group"
                >
                    <MessageCircle className="mr-3 h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                    Comunidade
                </Link>
            </div>

            {/* Título Categorias - fixo */}
            <p className="px-6 mt-6 text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 flex items-center gap-2 shrink-0">
                <Layers className="w-3 h-3" />
                Categorias
            </p>

            {/* Lista de Categorias - SCROLLÁVEL com efeito de fade */}
            <div
                className="flex-1 min-h-0 overflow-y-auto px-4"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)',
                }}
            >
                <div className="space-y-1 py-2 pb-4">
                    {categories.length === 0 ? (
                        <div className="px-4 py-2 space-y-2">
                            <div className="h-8 bg-white/5 rounded-lg w-full animate-pulse" />
                        </div>
                    ) : (
                        categories.map((category) => {
                            const currentCategory = searchParams.get('category')
                            const isActive = currentCategory === category.slug

                            return (
                                <Link
                                    key={category.id}
                                    href={`/library?category=${category.slug}`}
                                    className={cn(
                                        "group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 border border-transparent",
                                        isActive
                                            ? "bg-white/5 text-white border-white/5 shadow-inner"
                                            : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#1F51FF] rounded-r-full shadow-[0_0_12px_#1F51FF]" />
                                    )}
                                    <Folder className={cn(
                                        "w-4 h-4 mr-3 transition-all duration-300 group-hover:scale-110",
                                        isActive ? "text-[#1F51FF] fill-[#1F51FF]/20" : "text-gray-500 group-hover:text-gray-300"
                                    )} />
                                    <span className="flex-1">{category.name}</span>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 text-[#1F51FF]" />
                                    )}
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>


            {/* User Profile Section - Footer */}
            <div className="p-4 border-t border-white/5 bg-[#080808]">
                {user ? (
                    <Link
                        href={user.role === 'admin' ? "/painel/settings" : "/settings"}
                        className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                    >
                        {/* Avatar Placeholder com Gradiente */}
                        {user.avatar_url ? (
                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-lg shadow-blue-600/10 flex-shrink-0">
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F51FF] to-[#a0b4ff] flex items-center justify-center text-[#050505] font-bold text-lg shadow-lg shadow-blue-600/20 flex-shrink-0">
                                {user.full_name?.[0].toUpperCase() || 'U'}
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-[#1F51FF] transition-colors">
                                {user.full_name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <Settings className="w-3 h-3 mr-1" />
                                <span>Configurações</span>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link
                        href="/auth/login"
                        className="w-full flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-white/10"
                    >
                        Fazer Login
                    </Link>
                )}
            </div>
        </div>
    )
}
