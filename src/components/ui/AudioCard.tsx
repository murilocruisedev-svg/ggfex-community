
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
            className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:border-[#F24405]/50 hover:shadow-[0_0_30px_rgba(242,68,5,0.15)] flex flex-col justify-between h-full overflow-hidden active:scale-[0.98] md:active:scale-100 mobile-tap-highlight-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Glow de Fundo no Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F24405]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <audio
                ref={audioRef}
                src={sound.file_url}
                onEnded={() => setIsPlaying(false)}
                preload="none"
            />

            <div className="relative z-10 flex items-start justify-between mb-3 md:mb-4">
                <div className="overflow-hidden pr-2">
                    <h3 className="font-bold text-white text-base md:text-lg truncate group-hover:text-[#F24405] transition-colors tracking-tight leading-tight" title={sound.name}>
                        {sound.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate font-medium">
                        {sound.description || "Cinematic SFX"}
                    </p>
                </div>
                <div className="p-2 bg-white/5 rounded-full text-gray-400 group-hover:bg-[#F24405] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
            </div>

            {/* Visualizer Premium */}
            <div className="relative z-10 h-20 md:h-24 bg-[#050505] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-[#F24405]/30 transition-colors shadow-inner">

                {/* Grid Decorativo Fundo */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-50" />

                {/* Barras de Onda */}
                <div className="absolute inset-x-4 bottom-0 flex items-center justify-center space-x-1 h-3/4 opacity-80 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-1.5 rounded-full transition-all duration-200 ease-in-out",
                                isPlaying ? "bg-[#F24405] shadow-[0_0_10px_#F24405]" : "bg-white/10 group-hover:bg-white/20"
                            )}
                            style={{
                                height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                                animationDelay: `${i * 0.05}s`
                            }}
                        />
                    ))}
                </div>

                {/* Botão Play Central (Maior no Mobile) */}
                <button
                    onClick={togglePlay}
                    className={cn(
                        "z-20 h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl border border-white/10 cursor-pointer",
                        isPlaying
                            ? "bg-[#F24405] text-white shadow-[0_0_20px_#F24405] scale-105"
                            : "bg-white/10 text-white hover:bg-[#F24405] hover:border-[#F24405] hover:shadow-[0_0_20px_rgba(242,68,5,0.6)] hover:scale-110 active:scale-95"
                    )}
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                    ) : (
                        <Play className="h-5 w-5 md:h-6 md:w-6 fill-current ml-1" />
                    )}
                </button>
            </div>

            {/* Rodapé - Tags e Download */}
            <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5 group-hover:border-white/10">
                <div className="flex gap-1.5 flex-wrap overflow-hidden h-6 md:h-auto">
                    {sound.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 group-hover:border-[#F24405]/20 group-hover:text-gray-300 transition-colors whitespace-nowrap">
                            {tag}
                        </span>
                    ))}
                </div>

                <a
                    href={sound.file_url}
                    download
                    className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[#F24405] hover:text-white text-gray-400 transition-all text-xs font-bold border border-white/5 hover:shadow-[0_0_15px_rgba(242,68,5,0.4)] active:scale-95 ml-2"
                >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Baixar</span>
                </a>
            </div>
        </div>
    )
}

