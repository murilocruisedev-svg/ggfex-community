
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Music, Trash2, Download, Play, Pause, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AudioItem {
    id: number;
    name: string;
    category_id: number;
    file_url: string;
    created_at: string;
    categories: {
        name: string;
    };
}

export default function AudiosPage() {
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState<number | null>(null);

    // Carregar Áudios
    async function fetchAudios() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("sound_effects")
                .select("*, categories(name)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) setAudios(data);
        } catch (error) {
            console.error("Erro ao buscar áudios:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAudios();
    }, []);

    // Deletar Áudio
    async function handleDelete(id: number, url: string) {
        if (!confirm("Tem certeza que deseja excluir este áudio?")) return;

        try {
            // 1. Deletar Arquivo do Storage (se possível extrair o path)
            // Ex: https://.../sound-effects/arquivo.mp3 -> arquivo.mp3
            const path = url.split("/sound-effects/").pop();
            if (path) {
                await supabase.storage.from("sound-effects").remove([path]);
            }

            // 2. Deletar do Banco
            const { error } = await supabase.from("sound_effects").delete().eq("id", id);
            if (error) throw error;

            // 3. Atualizar Lista
            setAudios(prev => prev.filter(a => a.id !== id));
            alert("Áudio excluído com sucesso.");
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao deletar áudio.");
        }
    }

    return (
        <div className="space-y-8 min-h-screen text-white">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Áudios</h1>
                    <p className="text-gray-400 mt-1">Gerencie e organize sua biblioteca de efeitos sonoros.</p>
                </div>
                <Link href="/painel/upload" className="flex items-center gap-2 bg-[#1F51FF] hover:bg-[#D93D04] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:scale-105">
                    <Plus className="w-5 h-5" />
                    Novo Upload
                </Link>
            </div>

            {/* Lista / Tabela */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 animate-pulse">Carregando biblioteca...</div>
                ) : audios.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                            <Music className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300">Nenhum áudio encontrado</h3>
                        <p className="text-gray-500 max-w-md">Você ainda não subiu nenhum efeito sonoro. Clique em "Novo Upload" para começar.</p>
                        <Link href="/painel/upload" className="text-[#1F51FF] font-bold hover:underline">
                            Começar Agora
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-gray-400 font-medium">
                                    <th className="p-6">Nome / Arquivo</th>
                                    <th className="p-6">Categoria</th>
                                    <th className="p-6">Data de Envio</th>
                                    <th className="p-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {audios.map(audio => (
                                    <tr key={audio.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#1F51FF] group-hover:bg-[#1F51FF] group-hover:text-white transition-colors">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-[#1F51FF] transition-colors">{audio.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{audio.file_url.split('/').pop()}</p>
                                                </div>
                                            </div>
                                            {/* Player Embutido (Simplificado) */}
                                            <audio
                                                controls
                                                src={audio.file_url}
                                                className="mt-3 w-64 h-8 opacity-50 hover:opacity-100 transition-opacity"
                                                preload="none"
                                            />
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-gray-300">
                                                {audio.categories?.name || "Sem Categoria"}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm text-gray-400">
                                            {format(new Date(audio.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={audio.file_url}
                                                    target="_blank"
                                                    download
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title="Baixar Original"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(audio.id, audio.file_url)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Excluir Definitivamente"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
