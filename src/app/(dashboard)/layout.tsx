'use client';

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">

            {/* Sidebar (Mobile: Slide-in from Left / Desktop: Relative) */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 h-full transform transition-transform duration-300 ease-in-out bg-[#050505] shadow-2xl md:shadow-none border-r border-white/5
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <Sidebar />
            </div>

            {/* Overlay Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full">
                <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

                <main className="flex-1 p-3 md:p-6 w-full max-w-[100vw] overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
