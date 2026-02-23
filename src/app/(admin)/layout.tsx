'use client';

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Menu, X } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#000] relative">

                {/* Mobile Header Toggle */}
                <div className="md:hidden fixed top-4 right-4 z-[60]">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-[#F24405] text-white rounded-lg shadow-lg"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Sidebar Fixa (Responsiva) */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-72 h-full transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}>
                    <AdminSidebar />
                </div>

                {/* Overlay Mobile */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Área Principal de Conteúdo — scroll independente */}
                <main className="md:ml-72 h-screen overflow-y-auto p-4 md:p-8 transition-all overflow-x-hidden w-auto">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
