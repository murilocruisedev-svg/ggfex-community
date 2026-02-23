'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AudioCard } from '@/components/ui/AudioCard'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, Sparkles, Music, Loader2 } from 'lucide-react'
import { WalkingLoader } from '@/components/ui/WalkingLoader'
import { cn } from '@/lib/utils'

// Definindo tipos manuais para garantir compatibilidade
interface SoundEffect {
    id: number
    name: string
    description: string | null
    file_url: string
    tags: string[] | null
    category_id: number | null
    created_at: string
}

interface Category {
    id: number
    name: string
}

function HomeContent() {
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('q') || ''
    const [allSounds, setAllSounds] = useState<SoundEffect[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // 1. Busca Sons
                const { data: soundsData, error: soundsError } = await supabase
                    .from('sound_effects')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (soundsError) throw soundsError
                setAllSounds(soundsData || [])

                // 2. Busca Categorias
                const { data: categoriesData } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name')

                setCategories(categoriesData || [])

                // 3. Busca Usuário (Auth Oficial ou Cookie Customizado)
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    setUser(session.user)
                } else {
                    // Fallback para Cookie Customizado (Login Antigo/Híbrido)
                    const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
                    if (cookieMatch) {
                        try {
                            const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
                            setUser(userData);
                        } catch (e) {
                            console.error("Erro ao ler cookie de usuário", e);
                        }
                    }
                }

            } catch (error) {
                console.error('Erro ao buscar dados:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Filtrar por categoria e busca
    const filteredSounds = allSounds.filter(s => {
        const matchesCategory = selectedCategoryId ? s.category_id === selectedCategoryId : true
        const matchesSearch = searchQuery
            ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (s.tags && s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            : true
        return matchesCategory && matchesSearch
    });

    return (
        <div className="space-y-6 md:space-y-12 pb-12 font-sans bg-[#050505]">

            {/* Banner Compacto - Estilo Aligno - 100% Responsivo */}
            <section className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E0E0E] to-[#121212] border border-white/5 shadow-2xl p-6 md:h-[220px] flex items-center group transition-all duration-700 hover:border-[#1F51FF]/20">
                {/* ... (Banner content unchanged) ... */}
                {/* Glow Effects (Fundo) */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                {/* Glows ajustados para mobile (menos agressivos) */}
                <div className="absolute top-[-50%] right-[-10%] w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-[#1F51FF]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-50%] left-[-10%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[#a0b4ff]/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 w-full px-2 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-0">

                    {/* Texto Esquerda */}
                    <div className="max-w-2xl space-y-2 md:space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-1 opacity-80 w-full md:w-auto">
                            <Sparkles className="h-3 w-3 text-[#1F51FF]" />
                            <span className="text-[10px] font-bold text-[#1F51FF] tracking-[0.2em] uppercase">Nova Coleção v2.0</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl text-white font-serif italic tracking-wide leading-tight drop-shadow-2xl">
                            Bem-vindo à comunidade dos <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1F51FF] via-[#5a7fff] to-[#a0b4ff] not-italic font-sans font-black text-3xl md:text-6xl block md:inline mt-2 uppercase tracking-tight filter drop-shadow-[0_0_15px_rgba(31,81,255,0.3)] animate-text-shimmer bg-[length:200%_auto]">
                                Editores de Vídeo
                            </span>
                        </h1>
                    </div>

                    {/* Botão Direita (Full width no mobile) */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <Link
                            href="/library"
                            className="group flex md:inline-flex justify-center items-center px-6 md:px-8 py-3 md:py-4 bg-[#1F51FF] hover:bg-[#1a45e0] text-white font-bold rounded-xl md:rounded-2xl transition-all shadow-[0_4px_30px_-5px_rgba(31,81,255,0.4)] hover:shadow-[0_8px_40px_-5px_rgba(31,81,255,0.6)] active:scale-95 md:hover:scale-105 border border-white/10 w-full md:w-auto"
                        >
                            <span className="mr-2 text-sm md:text-base">Explorar Agora</span>
                            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                </div>
            </section>

            {/* Lista Completa de Sons - Grid Premium (Ajustado Mobile) */}
            <section>
                <div className="mb-8 md:mb-10 space-y-6">
                    {/* Título */}
                    <div>
                        <h2 className="text-2xl md:text-3xl text-white font-bold tracking-tight flex items-center gap-3">
                            <Music className="w-6 h-6 text-[#1F51FF]" />
                            Galeria Completa
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 ml-9">
                            {filteredSounds.length} efeitos sonoros disponíveis
                        </p>
                    </div>

                    {/* Filtros de Categoria */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide ml-9">
                        <button
                            onClick={() => setSelectedCategoryId(null)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border",
                                selectedCategoryId === null
                                    ? "bg-[#1F51FF] text-white border-[#1F51FF] shadow-[0_0_16px_rgba(31,81,255,0.3)]"
                                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Todos
                        </button>

                        {categories.map((category) => {
                            const isActive = selectedCategoryId === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border",
                                        isActive
                                            ? "bg-[#1F51FF] text-white border-[#1F51FF] shadow-[0_0_16px_rgba(31,81,255,0.3)]"
                                            : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/3] bg-[#111] rounded-2xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : filteredSounds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 pb-20">
                        {filteredSounds.map((sound, index) => (
                            <div
                                key={sound.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <AudioCard sound={sound} isLocked={!user} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 md:p-32 bg-[#0A0A0A] rounded-3xl border border-white/5">
                        <WalkingLoader />
                        <p className="text-xs md:text-sm text-gray-500 mt-6 max-w-xs mx-auto">
                            Nenhum efeito sonoro encontrado no momento.
                        </p>
                    </div>
                )}
            </section>
        </div>
    )
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
            <HomeContent />
        </Suspense>
    )
}
