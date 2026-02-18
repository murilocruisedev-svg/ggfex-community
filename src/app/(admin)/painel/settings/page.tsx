
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Camera, Loader2, Save, AlertCircle, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        async function getProfile() {
            setLoading(true);

            let foundUser = null;
            let foundProfile = null;

            // 1. Tenta pegar do Auth Oficial
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                foundUser = user;
                // Tenta pegar da tabela users primeiro
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                foundProfile = profile;
            } else {
                // 2. Fallback: Cookie Customizado
                try {
                    const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
                    if (cookieMatch) {
                        const userData = JSON.parse(decodeURIComponent(cookieMatch[1]));
                        if (userData && userData.id) {
                            foundUser = userData;
                            // Se o cookie já tiver dados de profile, ou se precisarmos buscar
                            // Idealmente, se tivermos o ID, podemos tentar buscar na tabela 'users' também,
                            // mas assumindo que o cookie tem o básico, usamos ele.
                            // Mas para garantir, tentamos buscar no banco se tivermos o ID do cookie
                            const { data: profile } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', userData.id)
                                .single();

                            foundProfile = profile || {
                                full_name: userData.full_name || userData.user_metadata?.full_name,
                                avatar_url: userData.avatar_url
                            };
                        }
                    }
                } catch (e) {
                    console.error("Erro ao ler cookie no Settings", e);
                }
            }

            if (foundUser) {
                setUserId(foundUser.id);
                setUser(foundUser);

                if (foundProfile) {
                    setFullName(foundProfile.full_name || foundUser.user_metadata?.full_name || '');
                    setAvatarUrl(foundProfile.avatar_url);
                } else {
                    setFullName(foundUser.user_metadata?.full_name || '');
                }
            }

            setLoading(false);
        }

        getProfile();
    }, []);

    const handleUpdateProfile = async () => {
        if (!userId) return;
        setSaving(true);

        try {
            const updates = {
                id: userId,
                email: user?.email,
                full_name: fullName,
            }

            // 1. Atualiza na tabela users (Usa update ao invés de upsert para evitar erro de tipo insert)
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId);
            if (error) throw error;

            // 2. Atualiza metadados do Auth (para fallback)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            if (authError) throw authError;

            // Feedback visual rápido (recarrega para atualizar sidebar)
            alert('Perfil atualizado com sucesso!');
            window.location.reload();

        } catch (error: any) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        if (!userId) return;

        try {
            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload para o bucket 'avatars'
            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                // Se o bucket não existir, tenta criar (embora o client n tenha permissão geralmente, vale o aviso)
                throw uploadError;
            }

            // 2. Pegar URL Pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Salvar URL no perfil do usuário
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    email: user?.email,
                    avatar_url: publicUrl,
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            alert('Foto de perfil atualizada!');
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            alert(`Erro no Upload: ${error.message || error.error_description || 'Erro desconhecido'}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-[#F24405]"><Loader2 className="animate-spin w-10 h-10" /></div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold font-serif italic mb-8 flex items-center gap-3">
                <Settings className="w-8 h-8 text-[#F24405]" />
                Meu Perfil
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Coluna da Esquerda - Avatar */}
                <div className="md:col-span-1">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#F24405]/20 shadow-[0_0_30px_-5px_rgba(242,68,5,0.3)] bg-[#050505] flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-700">{fullName?.[0]?.toUpperCase() || 'U'}</span>
                                )}
                            </div>

                            {/* Overlay de Upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium text-xs backdrop-blur-sm"
                            >
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="absolute mt-8">Alterar</span>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                className="hidden"
                                accept="image/*"
                                disabled={uploading}
                            />
                        </div>

                        <h2 className="text-lg font-bold text-white">{fullName || 'Usuário'}</h2>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>

                        {uploading && <p className="text-xs text-[#F24405] mt-4 animate-pulse">Enviando foto...</p>}
                    </div>
                </div>

                {/* Coluna da Direita - Dados */}
                <div className="md:col-span-2">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-white/5">
                            <User className="w-5 h-5 text-[#F24405]" />
                            <h3 className="text-lg font-bold">Informações Pessoais</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F24405] focus:ring-1 focus:ring-[#F24405] transition-all"
                                    placeholder="Como você quer ser chamado?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-[#050505]/50 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-[10px] text-gray-600 mt-1">O email não pode ser alterado.</p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="flex items-center px-6 py-3 bg-[#F24405] hover:bg-[#D93D04] text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                {saving ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}
