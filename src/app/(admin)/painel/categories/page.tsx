"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Trash2, Tag, Loader2, Folder } from "lucide-react";

interface Category {
    id: number;
    name: string;
    created_at: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [creating, setCreating] = useState(false);

    // Carregar categorias
    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            console.error("Erro ao carregar categorias:", error);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    }

    // Auxiliar para gerar slug
    function slugify(text: string) {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    }

    // Criar nova categoria
    async function handleCreateCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setCreating(true);
        try {
            const name = newCategory.trim();
            const slug = slugify(name);

            const { error } = await (supabase
                .from("categories") as any)
                .insert([{
                    name,
                    slug
                }]);

            if (error) throw error;

            setNewCategory("");
            fetchCategories(); // Recarrega a lista
        } catch (error: any) {
            alert("Erro ao criar categoria: " + error.message);
        } finally {
            setCreating(false);
        }
    }

    // Excluir categoria
    async function handleDeleteCategory(id: number) {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

        try {
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setCategories(categories.filter((cat) => cat.id !== id));
        } catch (error: any) {
            alert("Erro ao excluir. Verifique se não há áudios usando esta categoria.");
        }
    }

    return (
        <div className="p-8 text-white min-h-screen space-y-8">
            <h1 className="text-3xl font-bold font-serif italic mb-1 flex items-center gap-3">
                <Tag className="text-[#1F51FF] w-8 h-8" />
                Gerenciar Categorias
            </h1>

            {/* Formulário de Criação */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-xl max-w-2xl">
                <form onSubmit={handleCreateCategory} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-400 block">Nova Categoria</label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Ex: Cinematic, Terror, Transições..."
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#1F51FF] focus:ring-1 focus:ring-[#1F51FF] outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creating || !newCategory.trim()}
                        className="bg-[#1F51FF] hover:bg-[#D93D04] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Adicionar
                    </button>
                </form>
            </div>

            {/* Lista de Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-12 flex justify-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-[#111] rounded-2xl border border-white/5">
                        <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma categoria encontrada.</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-[#111] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                    <Folder className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-lg">{category.name}</span>
                            </div>

                            <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Excluir Categoria"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
