'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { Camera, Save, Loader2, User, Mail } from 'lucide-react'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Carregar dados iniciais
    useEffect(() => {
        async function loadProfile() {
            setLoading(true)

            // 1. Tenta pegar do Auth Oficial
            let { data: { user: authUser } } = await supabase.auth.getUser()

            // 2. Se não achar, tenta Cookie (Fallback)
            if (!authUser) {
                try {
                    const cookieMatch = document.cookie.match(/sb-custom-user=([^;]+)/);
                    if (cookieMatch) {
                        authUser = JSON.parse(decodeURIComponent(cookieMatch[1]));
                    }
                } catch (e) { console.error(e) }
            }

            if (authUser) {
                // Tenta pegar dados atualizados do banco (nome e foto)
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                setUser(authUser)
                if (profile) {
                    setFullName(profile.full_name || authUser.user_metadata?.full_name || '')
                    setAvatarUrl(profile.avatar_url)
                }
            }
            setLoading(false)
        }

        loadProfile()
    }, [])

    // Função de Upload de Foto
    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return
            }

            setSaving(true)
            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${uuidv4()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // 1. Upload para o Storage 'avatars' (Bucket PÚBLICO)
            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Pegar URL Pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)

        } catch (error: any) {
            alert('Erro ao fazer upload da imagem: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    // Salvar Alterações no Banco
    const handleSaveProfile = async () => {
        if (!user) return
        setSaving(true)

        try {
            const updates = {
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            }

            // Atualiza na tabela pública 'users'
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error

            alert('Perfil atualizado com sucesso!')
            window.location.reload() // Recarrega para atualizar Sidebar

        } catch (error: any) {
            alert('Erro ao atualizar perfil: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#F24405]" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Minha Conta</h1>
            <p className="text-gray-400 mb-8">Gerencie suas informações pessoais e aparência na comunidade.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Coluna Esquerda: Foto */}
                <div className="md:col-span-1">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                        <div className="relative group cursor-pointer w-32 h-32" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#111] ring-2 ring-[#F24405]/20 bg-[#050505] flex items-center justify-center relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-600" />
                                )}

                                {/* Overlay de Upload (Sempre visível no hover) */}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                            />
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-lg">{fullName || 'Usuário'}</h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-[#F24405] hover:text-[#D93D04] font-bold uppercase tracking-wider mt-2"
                            >
                                Alterar Foto
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Formulário */}
                <div className="md:col-span-2">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-8 space-y-6">

                        {/* Email (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Nome Completo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <User className="w-4 h-4" /> Nome de Exibição
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome publico"
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F24405] outline-none transition-all focus:ring-1 focus:ring-[#F24405]"
                            />
                        </div>

                        {/* Botão Salvar */}
                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 bg-[#F24405] hover:bg-[#D93D04] text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
