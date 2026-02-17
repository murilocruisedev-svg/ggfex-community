'use client'

import { Search, User as UserIcon, Bell } from 'lucide-react'
import { useState } from 'react'

export function Header() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <header className="sticky top-0 z-40 bg-sidebar/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for sounds, effects..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4 pl-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full border border-gray-900"></span>
                </button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px] cursor-pointer">
                    <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>
        </header>
    )
}
