'use client'

import { Search, User as UserIcon, Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
    onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 h-16 flex items-center gap-4 px-4 md:px-6 transition-all">

            {/* MOBILE: Modo Busca Ativo */}
            {mobileSearchOpen ? (
                <div className="flex items-center w-full gap-2 animate-fade-in md:hidden">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#F24405]" />
                        <input
                            type="text"
                            placeholder="O que você procura?"
                            autoFocus
                            className="w-full bg-[#111] border border-[#F24405]/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#F24405]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setMobileSearchOpen(false)}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            ) : (
                /* MOBILE: Modo Normal (Logo + Menu) */
                <div className="flex items-center justify-between w-full md:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onOpenMobileMenu}
                            className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-all"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-heading font-bold text-lg text-white">
                            GGFEX
                        </span>
                    </div>
                    <button
                        onClick={() => setMobileSearchOpen(true)}
                        className="p-2 text-gray-400 hover:text-[#F24405] active:scale-95 transition-colors"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* DESKTOP (Inalterado) */}
            <div className="hidden md:flex flex-1 max-w-xl w-full">
                <div className="relative group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#F24405] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar efeitos sonoros..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Ícones Desktop */}
            <div className="hidden md:flex items-center space-x-4 pl-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors relative hover:bg-white/5 rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#F24405] rounded-full border border-[#050505]"></span>
                </button>

                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#F24405] to-[#D93D04] p-[1px] cursor-pointer shadow-lg shadow-orange-900/20 hover:scale-105 transition-transform">
                    <div className="h-full w-full rounded-full bg-[#050505] flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-300" />
                    </div>
                </div>
            </div>
        </header>
    )
}
