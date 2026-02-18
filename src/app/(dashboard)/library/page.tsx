'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AudioCard } from '@/components/ui/AudioCard'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { WalkingLoader } from '@/components/ui/WalkingLoader'

// Definindo o tipo manualmente para garantir compatibilidade caso o types/database esteja desatualizado
interface SoundEffect {
    id: number
    name: string
    description: string | null
    file_url: string
    tags: string[] | null
    category_id: number | null
    created_at: string
}

function LibraryContent() {
    const searchParams = useSearchParams()
    const categorySlug = searchParams.get('category')
    const [sounds, setSounds] = useState<SoundEffect[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchSounds() {
            setIsLoading(true)
            try {
                let query = supabase
                    .from('sound_effects')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (categorySlug) {
                    // 1. Buscar ID da categoria pelo Slug
                    const { data: categoryData } = await supabase
                        .from('categories')
                        .select('id')
                        .eq('slug', categorySlug)
                        .single()

                    if (categoryData) {
                        // 2. Filtrar sons por essa categoria
                        query = query.eq('category_id', categoryData.id)
                    }
                }

                const { data, error } = await query

                if (error) throw error

                if (data) {
                    setSounds(data)
                }

            } catch (error) {
                console.error('Erro ao buscar sons:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSounds()
    }, [categorySlug])

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading capitalize">
                        {categorySlug ? `Categoria: ${categorySlug}` : 'Biblioteca Completa'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Explore nossa coleção de efeitos sonoros premium.
                    </p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-300">
                    {sounds.length} resultados encontrados
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-24 text-gray-500 animate-pulse">
                    <Loader2 className="h-10 w-10 animate-spin text-[#F24405] mb-4" />
                    <p>Carregando biblioteca...</p>
                </div>
            ) : sounds.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-24 bg-[#0A0A0A] rounded-3xl border border-white/5">
                    <WalkingLoader />
                    <p className="text-sm text-gray-500 mt-8 max-w-sm mx-auto text-center animate-pulse">
                        Em andamento...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sounds.map((sound) => (
                        <AudioCard key={sound.id} sound={sound} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function LibraryPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-gray-500">Carregando...</div>}>
            <LibraryContent />
        </Suspense>
    )
}
