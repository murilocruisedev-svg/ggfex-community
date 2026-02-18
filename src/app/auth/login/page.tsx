

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { WebGLShader } from "@/components/ui/WebGLShader";

// Schema de validação simples
const formSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Digite sua senha"),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);

        try {
            // TENTATIVA 1: Login Oficial (Supabase Auth)
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (!authError && authData.user) {
                // Sucesso Oficial
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (userProfile) {
                    await createSessionCookies({
                        ...userProfile,
                        email: authData.user.email
                    });

                    if (userProfile.role === 'admin') router.push("/painel");
                    else router.push("/");
                    return;
                }
            }

            // TENTATIVA 2: Fallback para Admin Legacy (Se o Auth falhar)
            // Isso permite que o Admin antigo continue entrando mesmo sem estar no Auth
            console.log("Login Auth falhou, tentando modo legado para Admin...");

            const { data: legacyUser, error: legacyError } = await supabase
                .from('users')
                .select('*')
                .eq('email', data.email)
                .single();

            if (legacyError || !legacyUser) {
                throw new Error("Email ou senha incorretos.");
            }

            // Verifica se é Admin e se a senha bate (comparação simples do legado)
            if (legacyUser.role === 'admin') {
                if (legacyUser.password_hash === data.password) {
                    // SUCESSO LEGADO!
                    await createSessionCookies(legacyUser);
                    router.push("/painel");
                    return;
                }
            }

            throw new Error("Email ou senha incorretos.");

        } catch (err: any) {
            console.error("Erro no login:", err);
            setError(err.message || "Ocorreu um erro ao entrar.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper para Cookies (Mantido do código anterior)
    async function createSessionCookies(user: any) {
        const token = btoa(JSON.stringify({ userId: user.id, role: user.role }));
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        // Cookie de Token
        document.cookie = `sb-custom-token=${encodeURIComponent(token)}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;

        // Cookie de Usuário Seguro
        const safeUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user?.full_name,
            avatar_url: user?.avatar_url,
            status: user?.status || 'active'
        };
        document.cookie = `sb-custom-user=${encodeURIComponent(JSON.stringify(safeUser))}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0"><WebGLShader /></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 pointer-events-none" />

            {/* Login Card */}
            <div className="w-full max-w-[480px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 relative z-10 shadow-2xl shadow-orange-900/20">

                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F24405] to-[#D93D04] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-500">
                        <span className="text-3xl font-bold text-white tracking-tighter">G</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            Bem-vindo(a)
                        </h1>
                        <p className="text-[#888] text-sm md:text-base font-medium">
                            Entre para acessar a comunidade
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">

                        {/* Campo Email */}
                        <div className="relative group animate-fade-in">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#F24405] transition-colors" />
                            </div>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Seu e-mail"
                                autoFocus
                                className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-medium"
                            />
                            {errors.email && <p className="text-red-400 text-xs pl-2 pt-1">{errors.email.message as string}</p>}
                        </div>

                        {/* Campo Senha */}
                        <div className="relative group animate-fade-in">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#F24405] transition-colors" />
                            </div>
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Sua senha"
                                className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-medium"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            {errors.password && <p className="text-red-400 text-xs pl-2 pt-1">{errors.password.message as string}</p>}
                        </div>

                    </div>

                    {/* Botão Entrar */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] bg-gradient-to-r from-[#F24405] to-[#FF8558] hover:opacity-90 rounded-full font-bold text-white text-base shadow-[0_0_30px_rgba(242,68,5,0.4)] hover:shadow-[0_0_50px_rgba(242,68,5,0.6)] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Entrar"
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                </form>
            </div>

            <div className="absolute bottom-6 flex items-center gap-2 opacity-50 z-10">
                <span className="text-xs text-white font-medium pl-2">©2024 GGFEX Community.</span>
            </div>
        </div>
    );
}
