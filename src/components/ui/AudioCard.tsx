
'use client'

import { Play, Pause, Download, Volume2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SoundEffect {
    id: number
    name: string
    description: string | null
    file_url: string
    tags: string[] | null
    category_id: number | null
    created_at: string
}

interface AudioCardProps {
    sound: SoundEffect
    subscriptionStatus?: 'active' | 'inactive'
}

export function AudioCard({ sound }: AudioCardProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const togglePlay = () => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
        } else {
            // Pausa outros players
            document.querySelectorAll('audio').forEach(el => {
                if (el !== audio) (el as HTMLAudioElement).pause();
            });
            audio.play().catch(console.error)
            setIsPlaying(true)
        }
    }

    return (
        <div
            className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:border-[#F24405] hover:shadow-[0_0_20px_rgba(242,68,5,0.4)] flex flex-col justify-between h-full overflow-hidden" // AUMENTADO O SHADOW E A BORDA
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Glow de Fundo no Hover - Intensificado */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F24405]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <audio
                ref={audioRef}
                src={sound.file_url}
                onEnded={() => setIsPlaying(false)}
                preload="none"
            />

            <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="overflow-hidden">
                    <h3 className="font-semibold text-white/90 truncate text-base group-hover:text-[#F24405] transition-colors" title={sound.name}>
                        {sound.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                        {sound.description || "Cinematic SFX"}
                    </p>
                </div>
                <div className="p-2 bg-white/5 rounded-full text-gray-400 group-hover:bg-[#F24405] group-hover:text-white transition-colors duration-300 shadow-lg group-hover:shadow-orange-500/50">
                    <Volume2 className="w-4 h-4" />
                </div>
            </div>

            {/* Visualizer Minimalista */}
            <div className="relative z-10 h-16 bg-[#050505] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-[#F24405]/30 transition-colors">

                {/* Barras de Onda */}
                <div className="absolute inset-x-4 bottom-0 flex items-center justify-center space-x-1 h-full opacity-60 pointer-events-none">
                    {[...Array(16)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1 rounded-full transition-all duration-200 ease-in-out",
                                isPlaying ? "bg-[#F24405] animate-pulse shadow-[0_0_8px_#F24405]" : "bg-white/10"
                            )}
                            style={{
                                height: isPlaying ? `${Math.random() * 60 + 20}%` : '20%',
                            }}
                        />
                    ))}
                </div>

                {/* Botão Play Central - Estilo Glass */}
                <button
                    onClick={togglePlay}
                    className={cn(
                        "z-20 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10",
                        isPlaying
                            ? "bg-[#F24405] text-white shadow-[0_0_15px_#F24405] scale-110"
                            : "bg-white/10 text-white hover:bg-[#F24405] hover:border-[#F24405] hover:shadow-[0_0_15px_rgba(242,68,5,0.6)] hover:scale-110"
                    )}
                >
                    {isPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                    ) : (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                </button>
            </div>

            {/* Rodapé */}
            <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5 group-hover:border-white/10">
                <div className="flex gap-1.5 flex-wrap">
                    {sound.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-[#F24405]/20 group-hover:text-gray-300 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                <a
                    href={sound.file_url}
                    download
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#F24405] hover:text-white text-gray-400 transition-all text-xs font-semibold border border-white/5 hover:shadow-[0_0_10px_rgba(242,68,5,0.5)] active:scale-95"
                >
                    <Download className="h-3 w-3" />
                </a>
            </div>
        </div>
    )
}
