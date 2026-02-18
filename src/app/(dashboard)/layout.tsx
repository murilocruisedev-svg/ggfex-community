'use client';

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Menu, X } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <AuthGuard>
            <div className="h-screen w-full bg-background text-foreground flex overflow-hidden">

                {/* Desktop Sidebar (Static) */}
                <div className="hidden md:block w-64 flex-none border-r border-white/5 h-full bg-[#050505]">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar (Slide-over) */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-64 h-full transform transition-transform duration-300 ease-in-out bg-[#050505] shadow-2xl border-r border-white/5 md:hidden
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <Sidebar />
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content Area (Scrollable) */}
                <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                    {/* Header Padrão */}
                    <div className="flex-none w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-20 sticky top-0">
                        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
                    </div>

                    {/* Conteúdo Scrollável */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full scroll-smooth">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
