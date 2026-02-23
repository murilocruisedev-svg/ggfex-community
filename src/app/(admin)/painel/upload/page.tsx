
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Upload, Music, Tag, Folder, FileAudio } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category_id: "",
        tags: "", // Separado por vírgula
    });
    const router = useRouter();

    // 1. Carregar Categorias Reais
    useEffect(() => {
        async function loadCategories() {
            const { data } = await supabase.from("categories").select("id, name");
            if (data) setCategories(data);
        }
        loadCategories();
    }, []);

    // 2. Lógica de Upload
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Por favor, selecione um arquivo de áudio.");
            return;
        }
        if (!formData.name || !formData.category_id) {
            alert("Preencha o nome e selecione uma categoria.");
            return;
        }

        try {
            setUploading(true);

            // 2.1 Renomear Arquivo para evitar conflitos (ex: timestamp-nome.mp3)
            // Sanitizar nome do arquivo
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
            const fileName = `${Date.now()}-${sanitizedName}`;

            // 2.2 Upload para o Storage (BUCKET 'sound-effects')
            const { error: uploadError } = await supabase.storage
                .from("sound-effects")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2.3 Obter URL Pública
            const { data: publicURLData } = supabase.storage
                .from("sound-effects")
                .getPublicUrl(fileName);

            const publicUrl = publicURLData.publicUrl;

            // 2.4 Salvar no Banco de Dados (Tabela 'sound_effects')
            const { error: dbError } = await supabase.from("sound_effects").insert({
                name: formData.name,
                description: formData.description,
                category_id: parseInt(formData.category_id),
                tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean), // Array Limpo
                file_url: publicUrl,
            });

            if (dbError) throw dbError;

            alert("Upload realizado com sucesso! 🎉");

            // Limpar formulário
            setFile(null);
            setFormData({ name: "", description: "", category_id: "", tags: "" });

            // Opcional: Redirecionar
            // router.push('/painel/audios'); 

        } catch (error: any) {
            console.error("Erro no upload:", error);
            alert(`Erro ao fazer upload: ${error.message || "Tente novamente."}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Upload className="text-[#1F51FF] w-8 h-8" />
                Novo Upload de Áudio
            </h1>

            <form
                onSubmit={handleUpload}
                className="bg-[#111] border border-white/10 rounded-xl p-8 shadow-2xl space-y-8"
            >
                {/* Área de Seleção de Arquivo (Drag & Drop visual) */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-400 uppercase tracking-wide">
                        Arquivo de Áudio (.mp3, .wav)
                    </label>

                    <div className="relative group border-2 border-dashed border-white/10 hover:border-[#1F51FF]/50 rounded-2xl p-12 text-center transition-all bg-[#0A0A0A] hover:bg-[#1F51FF]/5 cursor-pointer">
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const selectedFile = e.target.files[0];
                                    setFile(selectedFile);
                                    // Auto-preencher nome se vazio
                                    if (!formData.name) {
                                        setFormData(prev => ({
                                            ...prev,
                                            name: selectedFile.name.replace(/\.[^/.]+$/, "").replace(/-/g, " ")
                                        }));
                                    }
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {file ? (
                            <div className="flex flex-col items-center gap-4 animate-fade-in">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shadow-lg shadow-green-500/10">
                                    <FileAudio className="w-8 h-8" />
                                </div>
                                <div>
                                    <span className="font-bold text-lg block text-white">{file.name}</span>
                                    <span className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB - Pronto para envio</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-gray-500 group-hover:text-white transition-colors">
                                <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[#1F51FF]/20 flex items-center justify-center transition-colors">
                                    <Upload className="w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:text-[#1F51FF]" />
                                </div>
                                <div className="space-y-1">
                                    <span className="block font-medium">Clique para selecionar ou arraste o arquivo</span>
                                    <span className="block text-xs text-gray-600">Suporta MP3, WAV, OGG (Max 50MB)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Campos de Texto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Nome do Efeito / Música</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Impacto Cinematico Boom"
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white focus:border-[#1F51FF] focus:ring-1 focus:ring-[#1F51FF] outline-none transition-all placeholder:text-gray-700"
                            required
                        />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Folder className="w-4 h-4" /> Categoria
                        </label>
                        <div className="relative">
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white focus:border-[#1F51FF] focus:ring-1 focus:ring-[#1F51FF] outline-none transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Selecione uma categoria...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Tags (Separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="Ex: cinematico, transição, impacto, grave"
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white focus:border-[#1F51FF] focus:ring-1 focus:ring-[#1F51FF] outline-none transition-all placeholder:text-gray-700"
                        />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-gray-400">Descrição (Opcional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalhes técnicos ou criativos sobre o som..."
                            rows={3}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white focus:border-[#1F51FF] focus:ring-1 focus:ring-[#1F51FF] outline-none transition-all placeholder:text-gray-700 resize-none"
                        />
                    </div>
                </div>

                {/* Botão de Envio */}
                <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                        type="submit"
                        disabled={uploading}
                        className={`
                flex items-center gap-2 bg-[#1F51FF] hover:bg-[#D93D04] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${uploading ? "animate-pulse cursor-wait" : ""}
            `}
                    >
                        {uploading ? (
                            <>Enviando para o Servidor...</>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Publicar Áudio Agora
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
