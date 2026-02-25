
'use client'

import { Play, Pause, Download, Volume2 } from 'lucide-react'
import { useState, useRef, memo, useMemo } from 'react'
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
    isLocked?: boolean
}

export const AudioCard = memo(function AudioCard({ sound, isLocked = false }: AudioCardProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const togglePlay = (e: React.MouseEvent) => {
        // Prevent event bubbling to the card click if we add one later
        e.stopPropagation();

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

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (isLocked) {
            e.preventDefault()
            alert("🔒 Conteúdo Exclusivo!\n\nFaça login ou assine um plano Premium para baixar este efeito sonoro em alta qualidade.");
            return;
        }

        e.preventDefault();
        if (isDownloading) return;

        try {
            setIsDownloading(true);

            // 1. Fetch do arquivo (blob)
            const response = await fetch(sound.file_url);
            if (!response.ok) throw new Error("Erro ao baixar arquivo");

            const blob = await response.blob();

            // 2. Criar URL temporária
            const url = window.URL.createObjectURL(blob);

            // 3. Criar link temporário e clicar
            const link = document.createElement('a');
            link.href = url;
            // Tenta extrair o nome do arquivo da URL ou usa o nome do som
            const fileName = sound.name ? `${sound.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3` : 'audio.mp3';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // 4. Limpeza
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erro no download:", error);
            alert("Não foi possível iniciar o download. Tente novamente.");
        }

        // Memoize the random heights for the wave bars to prevent them from changing on every re-render
        const waveBarHeights = useMemo(() =>
            [...Array(24)].map(() => 20 + Math.random() * 30),
            []);

        return (
            <div
                className="group relative bg-[#131313] border border-white/5 rounded-2xl p-4 md:p-5 transition-all duration-500 hover:bg-[#181818] hover:border-[#1F51FF]/40 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(31,81,255,0.2)] flex flex-col justify-between h-full overflow-hidden active:scale-[0.99] mobile-tap-highlight-none ring-offset-2 ring-offset-[#050505] focus-within:ring-2 focus-within:ring-[#1F51FF]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Glow de Fundo no Hover com Animação */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1F51FF]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Efeito de brilho passando (Shimmer) no hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none" />

                <audio
                    ref={audioRef}
                    src={sound.file_url}
                    onEnded={() => setIsPlaying(false)}
                    preload="none"
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                />

                {/* Cabeçalho do Card */}
                <div className="relative z-10 flex items-start justify-between mb-4">
                    <div className="overflow-hidden pr-3">
                        <h3 className="font-bold text-white text-base md:text-lg truncate group-hover:text-[#1F51FF] transition-colors tracking-tight leading-tight cursor-default" title={sound.name}>
                            {sound.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate font-medium group-hover:text-gray-400 transition-colors">
                            {sound.description || "Cinematic SFX"}
                        </p>
                    </div>
                    <div className={cn(
                        "p-2.5 rounded-xl text-gray-400 transition-all duration-300 flex-shrink-0 border border-transparent",
                        isPlaying ? "bg-[#1F51FF]/10 text-[#1F51FF] border-[#1F51FF]/20" : "bg-black/40 group-hover:bg-white/10 group-hover:text-white"
                    )}>
                        {isPlaying ? (
                            <div className="flex gap-0.5 items-end justify-center h-4 w-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-1 bg-current rounded-full animate-[bounce_0.8s_infinite] origin-bottom" style={{ animationDelay: `${i * 0.1}s`, height: '60%' }} />
                                ))}
                            </div>
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </div>
                </div>

                {/* Área Visualizer / Player - SATISFYING CLICK AREA */}
                <div
                    className={cn(
                        "relative z-10 h-24 bg-[#080808] rounded-xl mb-5 flex items-center justify-center overflow-hidden border transition-all duration-500 group/player cursor-pointer",
                        isPlaying ? "border-[#1F51FF]/30 shadow-[inset_0_0_20px_rgba(31,81,255,0.1)]" : "border-white/5 group-hover:border-white/10"
                    )}
                    onClick={togglePlay}
                >

                    {/* Grid Decorativo Fundo */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-30" />

                    {/* Barras de Onda Animadas (Simuladas com CSS) */}
                    <div className="absolute inset-x-6 bottom-0 flex items-center justify-center gap-[2px] h-full opacity-60 pointer-events-none mix-blend-screen">
                        {waveBarHeights.map((height, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1 rounded-t-sm transition-all duration-300",
                                    isPlaying ? "bg-[#1F51FF] animate-[wave_1s_ease-in-out_infinite]" : "bg-white/5 group-hover/player:bg-white/10 h-3"
                                )}
                                style={{
                                    height: isPlaying ? undefined : `${height}%`,
                                    animationDelay: isPlaying ? `${Math.random() * -1}s` : undefined,
                                    animationDuration: isPlaying ? `${0.5 + Math.random() * 0.5}s` : undefined,
                                    willChange: isPlaying ? 'height' : 'auto'
                                }}
                            />
                        ))}
                    </div>

                    {/* Botão Play Central - THE CLICK TARGET */}
                    <button
                        onClick={togglePlay}
                        className={cn(
                            "relative z-20 h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border",
                            isPlaying
                                ? "bg-[#1F51FF] text-white border-[#1F51FF] shadow-[0_0_30px_rgba(31,81,255,0.4)] scale-110"
                                : "bg-white/5 backdrop-blur-sm text-white border-white/10 group-hover/player:scale-110 group-hover/player:bg-[#1F51FF] group-hover/player:border-[#1F51FF] group-hover/player:shadow-[0_0_20px_rgba(31,81,255,0.3)]"
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
                <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex gap-1.5 flex-wrap overflow-hidden h-6 md:h-auto">
                        {sound.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[9px] uppercase font-bold tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-[#1F51FF]/20 group-hover:text-gray-300 transition-colors whitespace-nowrap">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {isLocked ? (
                        <button
                            onClick={handleDownload}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all text-[10px] uppercase font-bold tracking-wide border border-red-500/20 ml-2 cursor-pointer hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                            title="Conteúdo bloqueado"
                        >
                            <span className="hidden md:inline">Bloqueado</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </button>
                    ) : (
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="group/btn flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#1F51FF] hover:text-white text-gray-400 transition-all text-[10px] uppercase font-bold tracking-wide border border-white/5 hover:border-[#1F51FF] hover:shadow-[0_0_15px_rgba(31,81,255,0.3)] active:scale-95 ml-2 disabled:opacity-50 disabled:cursor-wait"
                        >
                            <span className="hidden md:inline">{isDownloading ? 'Baixando...' : 'Download'}</span>
                            {isDownloading ? (
                                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                            )}
                        </button>
                    )}
                </div>

                <style jsx>{`
                @keyframes wave {
                    0%, 100% { height: 20%; }
                    50% { height: 80%; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
            </div>
        );
    });

