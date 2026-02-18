
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Music, Zap, Layers, Volume2, Globe, User, Settings, LogOut, Folder } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
            let currentProfile = null;

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
                        // O cookie já tem o objeto user
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

                // Tenta pegar metadados ou usa email como fallback
                setUser({
                    email: currentUser.email,
                    full_name: profile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                    avatar_url: profile?.avatar_url,
                    role: profile?.role // Adicionado
                })
            }
        }

        fetchCategories()
        fetchUser()
    }, [])

    const handleLogout = async () => {
        // 1. Supabase SignOut
        await supabase.auth.signOut()

        // 2. Limpar Cookies
        document.cookie = "sb-custom-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "sb-custom-user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

        // 3. Redirecionar
        window.location.href = '/auth/login'
    }

    return (
        <div className="h-full bg-[#050505] flex flex-col border-r border-white/5 overflow-y-auto">
            {/* ... (Header e Nav: Inalterado) ... */}
            {/* Header */}
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                    GGFEX <span className="text-[#F24405]">Community</span>
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-8">
                {/* Menu Principal */}
                <div>
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            const isSoundEffects = item.name === 'Sound Effects'

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all group border",
                                        isActive
                                            ? "bg-[#F24405] text-white shadow-lg shadow-orange-500/20"
                                            : "text-gray-400 hover:text-white hover:bg-white/5",

                                        // Force orange border for Sound Effects item
                                        isSoundEffects
                                            ? "border-[#F24405]/50 hover:border-[#F24405]"
                                            : isActive ? "border-transparent" : "border-transparent hover:border-white/5"
                                    )}
                                >
                                    <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Botão Comunidade (WhatsApp) - Mantendo a mesma lógica */}
                <div>
                    <Link
                        href="https://whatsapp.com"
                        target="_blank"
                        className="flex items-center px-4 py-3 text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all group"
                    >
                        <MessageCircle className="mr-3 h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                        Comunidade
                    </Link>
                </div>

                {/* Categorias - Mantendo a mesma lógica */}
                <div>
                    <p className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        Categorias
                    </p>
                    <div className="space-y-1">
                        {categories.length === 0 ? (
                            <div className="px-4 py-2 space-y-2">
                                <div className="h-8 bg-white/5 rounded-lg w-full animate-pulse" />
                            </div>
                        ) : (
                            categories.map((category) => {
                                const isActive = pathname === `/library` && window.location.search.includes(category.slug)

                                return (
                                    <Link
                                        key={category.id}
                                        href={`/library?category=${category.slug}`}
                                        className={cn(
                                            "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all group relative overflow-hidden",
                                            isActive
                                                ? "text-[#F24405] bg-[#F24405]/10 border border-[#F24405]/20"
                                                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <Folder className={cn(
                                            "w-4 h-4 mr-3 transition-colors",
                                            isActive ? "text-[#F24405] fill-[#F24405]/20" : "text-gray-600 group-hover:text-gray-400"
                                        )} />
                                        <span className="relative z-10">{category.name}</span>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </div>
            </nav>


            {/* User Profile Section - Footer */}
            <div className="p-4 border-t border-white/5 bg-[#080808]">
                {user ? (
                    <Link
                        href={user.role === 'admin' ? "/painel/settings" : "/settings"}
                        className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                    >
                        {/* Avatar Placeholder com Gradiente */}
                        {user.avatar_url ? (
                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-lg shadow-orange-500/10 flex-shrink-0">
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F24405] to-[#FFCEC2] flex items-center justify-center text-[#050505] font-bold text-lg shadow-lg shadow-orange-500/20 flex-shrink-0">
                                {user.full_name?.[0].toUpperCase() || 'U'}
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-[#F24405] transition-colors">
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
