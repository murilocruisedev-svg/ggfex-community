'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Search, User, MoreVertical, ShieldCheck, ShieldAlert, Calendar, Lock, Ban, CheckCircle, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface UserData {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    subscription_status: string | null
    role?: string
    created_at: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

    // Estados para Menu e Modais
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null)

    const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchUsers()

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

    async function fetchUsers() {
        setLoading(true)

        try {
            // Tenta buscar via Edge Function (Bypass RLS)
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'list_users' }
            })

            if (error) throw error

            // A Edge Function retorna { users: [...] }
            if (data && data.users) {
                // Filtra APENAS quem NÃO É admin (Assinantes)
                const subscribers = data.users.filter((user: any) => user.role !== 'admin');
                setUsers(subscribers)
            } else {
                setUsers([])
            }

        } catch (error) {
            console.error('Erro ao buscar usuários (Fallback para DB):', error)

            // Fallback: Tenta buscar direto do banco (com filtro)
            const { data, error: dbError } = await supabase
                .from('users')
                .select('*')
                .neq('role', 'admin') // Exclui admins do fallback também
                .order('created_at', { ascending: false })

            if (!dbError) {
                setUsers(data || [])
            }
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

    const handleStatusChange = async (userId: string, newStatus: string) => {
        setActionLoading(true)
        const { error } = await supabase
            .from('users')
            .update({ subscription_status: newStatus })
            .eq('id', userId)

        if (error) {
            alert('Erro ao atualizar status: ' + error.message)
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, subscription_status: newStatus } : u))
            setOpenMenuId(null)
            alert(`Status atualizado para ${newStatus.toUpperCase()}`)
        }
        setActionLoading(false)
    }

    const handleChangeRole = async (userId: string, newRole: 'admin' | 'member') => {
        if (newRole === 'admin') {
            if (!confirm("Tem certeza que deseja promover este usuário a ADMIN? Ele terá acesso total ao painel.")) return;
        }

        setActionLoading(true);
        try {
            const { error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'update_role', userId, newRole }
            })

            if (error) throw error;

            // Se virou admin, sai dessa lista de assinantes
            if (newRole === 'admin') {
                setUsers(users.filter(u => u.id !== userId));
            } else {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }

            setOpenMenuId(null);
            alert(newRole === 'admin' ? 'Usuário promovido a ADMIN! Ele agora aparece na aba Administradores.' : 'Privilégios alterados.');

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
            // VOLTANDO PARA A FUNÇÃO OFICIAL (Agora que você arrumou no servidor!)
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'update_password', userId: showPasswordModal, newPassword: newPassword }
            })

            if (error) throw error;

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

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active'
                ? user.subscription_status === 'active'
                : user.subscription_status !== 'active'

        return matchesSearch && matchesStatus
    })

    const activeUser = users.find(u => u.id === openMenuId);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white bg-[#0A0A0A]">

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif italic mb-1 flex items-center gap-2">
                        Gerenciar Assinantes
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Total de {users.length} assinantes cadastrados.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'active', label: 'Ativos' },
                            { id: 'inactive', label: 'Inativos' }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setStatusFilter(filter.id as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    statusFilter === filter.id
                                        ? "bg-[#F24405] text-white shadow-lg shadow-orange-500/20"
                                        : "text-gray-500 hover:text-white"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* BARRA DE BUSCA */}
            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar por nome, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all shadow-input"
                />
            </div>

            {/* TABELA DE USUÁRIOS */}
            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl pb-4 min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-[#F24405] border-t-transparent rounded-full animate-spin mb-4"></div>
                        Carregando...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <User className="w-12 h-12 mb-4 opacity-20" />
                        <p>Nenhum assinante encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Cadastro</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 font-bold text-xs">
                                                            {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-white truncate group-hover:text-[#F24405] transition-colors max-w-[200px]" title={user.full_name || ''}>
                                                        {user.full_name || 'Sem nome'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate font-mono max-w-[200px]" title={user.email}>
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscription_status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <ShieldCheck className="w-3 h-3" /> ATIVO
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                                    <ShieldAlert className="w-3 h-3" /> {user.subscription_status?.toUpperCase() || 'INATIVO'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                {user.created_at ? format(new Date(user.created_at), "d MMM, yyyy", { locale: ptBR }) : '-'}
                                            </div>
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
                        Ações: {activeUser.full_name?.split(' ')[0]}
                    </div>

                    <button
                        onClick={() => { setShowPasswordModal(activeUser.id); setOpenMenuId(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                        <Lock className="w-3.5 h-3.5" /> Alterar Senha
                    </button>

                    <button
                        onClick={() => handleChangeRole(activeUser.id, 'admin')}
                        className="w-full text-left px-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center gap-2 transition-colors"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" /> Promover a Admin
                    </button>

                    <div className="mx-2 my-1 border-t border-white/5"></div>

                    {activeUser.subscription_status === 'active' ? (
                        <button
                            onClick={() => handleStatusChange(activeUser.id, 'canceled')}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                            <Ban className="w-3.5 h-3.5" /> Cancelar Acesso
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusChange(activeUser.id, 'active')}
                            className="w-full text-left px-4 py-2.5 text-sm text-green-400 hover:text-green-300 hover:bg-green-500/10 flex items-center gap-2 transition-colors"
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> Reativar Acesso
                        </button>
                    )}

                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors border-t border-white/5 mt-1">
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                </div>
            )}

            {/* Modal Alterar Senha */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Lock className="w-5 h-5 text-[#F24405]" /> Alterar Senha
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
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#F24405] outline-none"
                                    placeholder="Digite a nova senha..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={actionLoading || !newPassword}
                                className="w-full py-3 bg-[#F24405] hover:bg-[#D93D04] text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                            >
                                {actionLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
