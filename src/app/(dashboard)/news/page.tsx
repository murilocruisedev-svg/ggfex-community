'use client'

import { useEffect, useState } from 'react'
import { AudioCard } from '@/components/ui/AudioCard'
import { Database } from '@/types/database'
import { Sparkles, Calendar } from 'lucide-react'

type SoundEffect = Database['public']['Tables']['sound_effects']['Row']

const MOCK_NEWS: SoundEffect[] = [
    { id: 10, name: 'Cyberpunk Impact', description: 'Futuristic hit', file_url: '#', tags: ['cyberpunk', 'impact'], category_id: 1, created_at: new Date().toISOString() },
    { id: 11, name: 'Glitch Transition 2', description: 'Another glitch', file_url: '#', tags: ['glitch', 'transition'], category_id: 3, created_at: new Date().toISOString() },
]

export default function NewsPage() {
    const [sounds, setSounds] = useState<SoundEffect[]>(MOCK_NEWS)

    return (
        <div className="space-y-8">
            <div className="border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                    <Sparkles className="mr-3 h-8 w-8 text-accent" />
                    New Arrivals
                </h1>
                <p className="text-gray-400">Discover the latest additions to the library.</p>
            </div>

            <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Added this Week
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sounds.map((sound) => (
                        <AudioCard key={sound.id} sound={sound} />
                    ))}
                </div>
            </div>
        </div>
    )
}
