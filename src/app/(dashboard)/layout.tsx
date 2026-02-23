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
            <div className="min-h-screen bg-[#050505] text-foreground relative">

                {/* Desktop Sidebar (FIXED) - Garantia absoluta que não move */}
                <div className="hidden md:block fixed top-0 left-0 w-64 h-screen border-r border-white/5 bg-[#050505] z-30">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar (Slide-over) */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-64 h-screen transform transition-transform duration-300 ease-in-out bg-[#050505] shadow-2xl border-r border-white/5 md:hidden
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

                {/* Main Content Area */}
                <div className="flex flex-col min-h-screen md:ml-64 transition-all duration-300">

                    {/* Header Fixo no Topo */}
                    <div className="fixed top-0 right-0 left-0 md:left-64 z-20 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
                        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
                    </div>

                    {/* Conteúdo Real - com padding-top pra compensar o header fixo */}
                    <main className="flex-1 p-4 md:p-6 w-full pt-20">
                        <div className="max-w-7xl mx-auto w-full pb-20">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
