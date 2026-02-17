
'use client'

import { useEffect, useState } from 'react'
import { AudioCard } from '@/components/ui/AudioCard'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, Sparkles, Music } from 'lucide-react'

// Definindo tipo manual para garantir compatibilidade
interface SoundEffect {
    id: number
    name: string
    description: string | null
    file_url: string
    tags: string[] | null
    category_id: number | null
    created_at: string
}

export default function HomePage() {
    const [allSounds, setAllSounds] = useState<SoundEffect[]>([])
    const [loading, setLoading] = useState(true)

    // 1. Carregar TODOS os sons
    useEffect(() => {
        async function fetchAllSounds() {
            setLoading(true)
            try {
                // Removemos o .limit() para trazer tudo
                const { data, error } = await supabase
                    .from('sound_effects')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (data) setAllSounds(data)
            } catch (error) {
                console.error("Erro ao carregar sons:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchAllSounds()
    }, [])

    return (
        <div className="space-y-12 pb-24 font-sans bg-[#050505]">

            {/* Banner Compacto - Estilo Aligno */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E0E0E] to-[#121212] border border-white/5 shadow-2xl h-[220px] flex items-center group transition-all duration-700 hover:border-[#FF6130]/20">

                {/* Glow Effects (Fundo) */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-[#FF6130]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-50%] left-[-10%] w-[400px] h-[400px] bg-[#FFCEC2]/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 w-full px-8 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-6">

                    {/* Texto Esquerda */}
                    <div className="max-w-2xl space-y-3">
                        <div className="inline-flex items-center gap-2 mb-1 opacity-80">
                            <Sparkles className="h-3 w-3 text-[#FF6130]" />
                            <span className="text-[10px] font-bold text-[#FF6130] tracking-[0.2em] uppercase">Nova Coleção v2.0</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl text-white font-serif italic tracking-wide leading-tight">
                            Sons Cinematográficos <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6130] to-[#FFCEC2] not-italic font-sans font-bold text-3xl md:text-4xl">
                                Premium & Impactantes
                            </span>
                        </h1>
                    </div>

                    {/* Botão Direita */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/library"
                            className="group inline-flex items-center px-8 py-4 bg-[#FF6130] hover:bg-[#E54D1F] text-white font-bold rounded-2xl transition-all shadow-[0_4px_30px_-5px_rgba(255,97,48,0.4)] hover:shadow-[0_8px_40px_-5px_rgba(255,97,48,0.6)] hover:scale-105 border border-white/10"
                        >
                            <span className="mr-2">Explorar Agora</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                </div>
            </section>

            {/* Lista Completa de Sons - Grid Premium */}
            <section>
                <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl text-white font-serif italic flex items-center gap-3">
                            Galeria Completa
                            <span className="text-xs font-sans font-bold text-[#FF6130] bg-[#FF6130]/10 px-2 py-1 rounded border border-[#FF6130]/20 not-italic">
                                {allSounds.length} Assets
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">
                            Explore nossa biblioteca curada de alta fidelidade.
                        </p>
                    </div>

                    {/* Filtros Placeholder (Visual Only for now) */}
                    <div className="hidden md:flex gap-2">
                        {['Todos', 'Impactos', 'Ambiente'].map((filter, i) => (
                            <button key={filter} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${i === 0 ? 'bg-white text-black border-white' : 'bg-[#111] text-gray-400 border-white/10 hover:text-white'}`}>
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/3] bg-[#111] rounded-2xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : allSounds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in pb-20">
                        {allSounds.map((sound) => (
                            <AudioCard key={sound.id} sound={sound} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-32 bg-[#0A0A0A] rounded-3xl border border-white/5 flex flex-col items-center justify-center text-gray-600">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Music className="w-8 h-8 opacity-40 text-[#FF6130]" />
                        </div>
                        <h3 className="text-lg font-serif italic text-white mb-2">Sons não encontrados</h3>
                        <p className="text-sm max-w-xs mx-auto">Nenhum efeito sonoro encontrado no momento. Acesse o painel admin para fazer upload.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
