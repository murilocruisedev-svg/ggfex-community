
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminStats() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        activeSubs: 0,
        audios: 0,
        revenue: 0,
    });

    useEffect(() => {
        async function fetchStats() {


            // 1. Contar Todos os Usuários (EXCETO ADMINS)
            const { count: userCount, error: userError } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true })
                .neq("role", "admin"); // Ignora Admins

            // 2. Contar Assinaturas Ativas (Somente Clientes Pagantes)
            const { count: subCount, error: subError } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true })
                .eq("subscription_status", "active")
                .neq("role", "admin"); // Garante que Admin nunca conta como assinante $$$

            // 3. Contar Áudios
            const { count: audioCount, error: audioError } = await supabase
                .from("sound_effects")
                .select("*", { count: "exact", head: true });

            // * Receita Estimada (Ex: R$ 29,90 * Assinantes Reais)
            const revenue = (subCount || 0) * 29.90;

            console.log("Stats debug:", { userCount, subCount, revenue, error: userError || subError });

            setStats({
                users: userCount || 0,
                activeSubs: subCount || 0,
                audios: audioCount || 0,
                revenue: revenue || 0,
            });
            setLoading(false);
        }

        fetchStats();
    }, []);

    if (loading) return <div className="text-white/50 animate-pulse">Carregando métricas...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Usuários Totais */}
            <div className="bg-[#111] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-[#1F51FF]/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <h3 className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">
                    Usuários Totais
                </h3>
                <p className="text-4xl font-bold text-white">{stats.users}</p>
            </div>

            {/* Assinantes Ativos */}
            <div className="bg-[#111] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                </div>
                <h3 className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">
                    Assinantes Ativos
                </h3>
                <p className="text-4xl font-bold text-green-400">{stats.activeSubs}</p>
            </div>

            {/* Áudios */}
            <div className="bg-[#111] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                </div>
                <h3 className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">
                    Áudios na Biblioteca
                </h3>
                <p className="text-4xl font-bold text-blue-400">{stats.audios}</p>
            </div>

            {/* Receita Estimada */}
            <div className="bg-[#111] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-yellow-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <h3 className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">
                    Receita Mensal (Est.)
                </h3>
                <p className="text-4xl font-bold text-yellow-400">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(stats.revenue)}
                </p>
            </div>
        </div>
    );
}
