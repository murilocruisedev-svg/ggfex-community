'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, User, MoreVertical, ShieldCheck, ShieldAlert, Lock, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface UserData {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role?: string
    created_at: string
}

export default function AdminsPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Estados para Menu e Modais
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null)

    const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')

    // Estado do Modal Novo Admin
    const [showNewAdminModal, setShowNewAdminModal] = useState(false)
    const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' })

    const [actionLoading, setActionLoading] = useState(false)

    // Detecção de clique fora para fechar menu
    const menuRef = useRef<HTMLDivElement>(null)

    const handleCreateAdmin = async () => {
        if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
            alert('Preencha todos os campos!');
            return;
        }
        setActionLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: {
                    action: 'create_admin',
                    newEmail: newAdminData.email,
                    newPassword: newAdminData.password,
                    newName: newAdminData.name
                }
            })

            if (error) {
                // Tenta extrair a mensagem de erro da resposta, se possível
                let errorMessage = error.message;
                try {
                    if (error instanceof Error && 'context' in error) {
                        // @ts-ignore
                        const body = await error.context.json();
                        errorMessage = body.error || errorMessage;
                    }
                } catch (e) { /* ignore */ }

                throw new Error(errorMessage);
            }

            alert('Novo Administrador criado com sucesso!');
            setShowNewAdminModal(false);
            setNewAdminData({ name: '', email: '', password: '' });
            fetchAdmins();

        } catch (error: any) {
            console.error(error);
            alert(`Erro ao criar admin: ${error.message || JSON.stringify(error)}`);
        } finally {
            setActionLoading(false);
        }
    }

    useEffect(() => {
        fetchAdmins()

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        }
        function handleScroll() {
            setOpenMenuId(null);
        }

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [])

    async function fetchAdmins() {
        setLoading(true)
        try {
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'list_users' }
            })

            if (error) throw error

            if (data && data.users) {
                // Filtra APENAS ADMINS
                const admins = data.users.filter((user: any) => user.role === 'admin');
                setUsers(admins)
            } else {
                setUsers([])
            }

        } catch (error) {
            console.error('Erro ao buscar admins:', error)
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>, userId: string) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + 5,
            left: rect.left - 150
        });
        setOpenMenuId(openMenuId === userId ? null : userId);
    };

    const handleDeleteAdmin = async (userId: string) => {
        if (!confirm("Tem certeza que deseja EXCLUIR PERMANENTEMENTE este administrador? Essa ação não pode ser desfeita.")) return;

        setActionLoading(true);
        try {
            const { error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'delete_user', userId }
            })

            if (error) throw error

            setUsers(users.filter(u => u.id !== userId)); // Remove da lista visualmente
            setOpenMenuId(null);
            alert('Conta de administrador excluída permanentemente.');

        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error.message || JSON.stringify(error)}`);
        } finally {
            setActionLoading(false);
        }
    }

    const handleChangePassword = async () => {
        if (!showPasswordModal || !newPassword) return;
        setActionLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'update_password', userId: showPasswordModal, newPassword: newPassword }
            })

            if (error) throw error

            alert('Senha atualizada com sucesso!');
            setShowPasswordModal(null);
            setNewPassword('');

        } catch (error: any) {
            console.error(error);
            alert(`Erro Detalhado: ${error.message || JSON.stringify(error)}`);
        } finally {
            setActionLoading(false);
        }
    }

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )

    const activeUser = users.find(u => u.id === openMenuId);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white bg-[#0A0A0A]">

            {/* CABEÇALHO */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif italic mb-1 flex items-center gap-2">
                        Gerenciar Administradores
                        <ShieldCheck className="w-6 h-6 text-[#1F51FF]" />
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Total de {users.length} administradores.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowNewAdminModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1F51FF] hover:bg-[#D93D04] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        NOVO ADMIN
                    </button>
                </div>
            </div>

            {/* BARRA DE BUSCA */}
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar admin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#1F51FF]/50 focus:ring-1 focus:ring-[#1F51FF]/50 transition-all shadow-input"
                />
            </div>

            {/* TABELA */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl pb-4 min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-[#1F51FF] border-t-transparent rounded-full animate-spin mb-4"></div>
                        Carregando...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <User className="w-12 h-12 mb-4 opacity-20" />
                        <p>Nenhum administrador encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Desde</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-semibold text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-[#1F51FF] text-xs font-bold overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name || 'Admin'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (user.full_name?.[0] || user.email[0]).toUpperCase()
                                                    )}
                                                </div>
                                                {user.full_name || 'Admin'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.created_at ? format(new Date(user.created_at), "d MMM, yyyy", { locale: ptBR }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => handleMenuClick(e, user.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    openMenuId === user.id ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PORTAL DO MENU FLUTUANTE */}
            {openMenuId && activeUser && menuPosition && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: menuPosition.top,
                        left: menuPosition.left,
                        zIndex: 9999
                    }}
                    className="w-48 bg-[#151515] border border-white/10 rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95"
                >
                    <div className="px-3 py-2 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase">
                        Admin: {activeUser.full_name?.split(' ')[0]}
                    </div>

                    <button
                        onClick={() => { setShowPasswordModal(activeUser.id); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                        <Lock className="w-3.5 h-3.5" /> Alterar Senha
                    </button>

                    <button
                        onClick={() => handleDeleteAdmin(activeUser.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/5 mt-1"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir Admin
                    </button>

                </div>
            )}

            {/* Modal Alterar Senha */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Lock className="w-5 h-5 text-[#1F51FF]" /> Alterar Senha
                            </h3>
                            <button onClick={() => setShowPasswordModal(null)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nova Senha</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#1F51FF] outline-none"
                                    placeholder="Digite a nova senha..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={actionLoading || !newPassword}
                                className="w-full py-3 bg-[#1F51FF] hover:bg-[#D93D04] text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                            >
                                {actionLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal NOVO ADMIN */}
            {showNewAdminModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#1F51FF]" /> Novo Administrador
                            </h3>
                            <button onClick={() => setShowNewAdminModal(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#1F51FF] outline-none"
                                    placeholder="Ex: João Silva"
                                    value={newAdminData.name}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email de Acesso</label>
                                <input
                                    type="email"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#1F51FF] outline-none"
                                    placeholder="email@admin.com"
                                    value={newAdminData.email}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Senha Inicial</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#1F51FF] outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                    value={newAdminData.password}
                                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleCreateAdmin}
                                disabled={actionLoading || !newAdminData.email || !newAdminData.password}
                                className="w-full py-3 bg-[#1F51FF] hover:bg-[#D93D04] text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading ? 'Criando...' : (
                                    <>
                                        <User className="w-4 h-4" /> Criar Usuário Admin
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
