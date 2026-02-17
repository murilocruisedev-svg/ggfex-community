
import AdminStats from '@/components/features/AdminStats';
import { Music, Upload, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            {/* 1. Header de Boas vindas */}
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-400 mt-2 text-lg">Visão geral do desempenho da sua comunidade. 🚀</p>
                </div>

                <div className="flex gap-3">
                    <Link href="/" target="_blank" className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 text-sm font-medium transition-colors text-gray-300">
                        Ver Site ao Vivo
                    </Link>
                    <button className="flex items-center gap-2 bg-[#F24405] hover:bg-[#D93D04] text-white font-bold py-2.5 px-6 rounded-xl transition-transform hover:scale-105 shadow-lg shadow-orange-500/20">
                        <Upload className="w-4 h-4" />
                        Novo Upload
                    </button>
                </div>
            </div>

            {/* 2. Métricas Reais (Componente que busca no Supabase) */}
            <AdminStats />

            {/* 3. Acesso Rápido / Atalhos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Card de Atalho: Áudios */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-8 hover:border-[#F24405]/30 transition-colors group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F24405]/5 rounded-full blur-3xl group-hover:bg-[#F24405]/10 transition-colors -mr-10 -mt-10" />

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#F24405]/10 flex items-center justify-center text-[#F24405]">
                            <Music className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Gerenciar Biblioteca</h3>
                    </div>
                    <p className="text-gray-400 mb-6">Adicione, edite ou remova efeitos sonoros da plataforma. Organize por categorias e tags.</p>
                    <Link href="/painel/audios" className="text-[#F24405] font-medium group-hover:underline flex items-center gap-1">
                        Acessar Áudios →
                    </Link>
                </div>

                {/* Card de Atalho: Usuários */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-colors group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors -mr-10 -mt-10" />

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Gestão de Membros</h3>
                    </div>
                    <p className="text-gray-400 mb-6">Veja quem são seus assinantes ativos, verifique status de pagamento e gerencie acessos.</p>
                    <Link href="/painel/users" className="text-blue-400 font-medium group-hover:underline flex items-center gap-1">
                        Ver Usuários →
                    </Link>
                </div>
            </div>

            {/* 4. Tabela de Recentes (Placeholder de Vendas Recentes) */}
            <div className="mt-8 bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Últimas Atividades</h3>
                    <button className="text-xs text-gray-500 hover:text-white transition-colors">Ver histórico completo</button>
                </div>
                <div className="p-12 text-center text-gray-500 italic">
                    Nenhuma atividade recente registrada ainda.
                </div>
            </div>
        </div>
    );
}
