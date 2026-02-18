"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { WebGLShader } from "@/components/ui/WebGLShader";

// Schema de validação
const formSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // State do Fluxo de Login
    // 'email' = Digitando Email
    // 'password' = Digitando Senha (Admin)
    // 'otp' = Digitando Código (Membro)
    const [step, setStep] = useState<'email' | 'password' | 'otp'>('email');
    const [email, setEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        resolver: zodResolver(
            step === 'otp'
                ? z.object({ otp: z.string().min(6, "O código deve ter 6 dígitos") })
                : step === 'password'
                    ? z.object({ password: z.string().min(6, "Mínimo 6 caracteres") })
                    : z.object({ email: z.string().email("Email inválido") })
        ),
    });

    // 1. Verificar Email e Decidir Fluxo
    async function handleCheckEmail(data: any) {
        setIsLoading(true);
        setError(null);
        try {
            const inputEmail = data.email?.toLowerCase().trim();
            setEmail(inputEmail);

            // Busca usuário no DB para ver role
            const { data: user, error: dbError } = await supabase
                .from('users')
                .select('role')
                .eq('email', inputEmail)
                .single();

            if (dbError || !user) {
                // Se não achar, assume que é membro novo (tenta OTP direto ou erro?)
                // Melhor assumir OTP para não vazar quem existe
                console.log("Usuário não encontrado no banco público, tentando OTP genérico.");
                await sendOtp(inputEmail);
                return;
            }

            if (user.role === 'admin') {
                // É Admin: Pede Senha
                setStep('password');
            } else {
                // É Membro: Manda Código
                await sendOtp(inputEmail);
            }

        } catch (err: any) {
            setError(err.message || "Erro ao verificar email.");
        } finally {
            setIsLoading(false);
        }
    }

    // 2. Enviar OTP (Supabase Nativo)
    async function sendOtp(emailToSend: string) {
        const { error } = await supabase.auth.signInWithOtp({
            email: emailToSend,
            options: {
                shouldCreateUser: false // Só loga se existir (ou true se quisermos liberar cadastro via login)
            }
        });

        if (error) {
            throw error;
        }

        setStep('otp');
    }

    // 3. Login com Senha (Admin - Lógica Antiga Custom)
    async function handleLoginPassword(data: any) {
        setIsLoading(true);
        try {
            const { data: userData, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            const user = userData as any;

            if (dbError || !user) throw new Error("Usuário não encontrado.");

            const isValid = (data.password === user.password_hash) || (user.password_hash === 'TEMP_PASS_BYPASS');

            if (!isValid) throw new Error("Senha incorreta.");

            // Sucesso Admin
            await createSessionCookies(user);
            router.push("/painel");

        } catch (err: any) {
            setError(err.message || "Erro no login.");
        } finally {
            setIsLoading(false);
        }
    }

    // 4. Login com OTP (Membro)
    async function handleLoginOtp(data: any) {
        setIsLoading(true);
        try {
            const { data: sessionData, error } = await supabase.auth.verifyOtp({
                email,
                token: data.otp,
                type: 'email',
            });

            if (error) throw error;
            if (!sessionData.user) throw new Error("Erro ao verificar sessão.");

            // Buscar dados completos do usuário para cookie customizado
            // (Para manter compatibilidade com o resto do app)
            const { data: fullUser } = await supabase.from('users').select('*').eq('email', email).single();

            // Se o usuário existe no Auth mas não na tabela users (ex: criado agora), 
            // usar dados do Auth ou criar fallback
            const userForCookie = fullUser || {
                id: sessionData.user.id,
                email: sessionData.user.email,
                role: 'member', // Default
                full_name: sessionData.user.user_metadata?.full_name || 'Membro',
                avatar_url: '',
                status: 'active'
            };

            await createSessionCookies(userForCookie);
            router.push("/");

        } catch (err: any) {
            console.error(err);
            setError("Código inválido ou expirado.");
        } finally {
            setIsLoading(false);
        }
    }

    // Helper: Criar Cookies Custom (Mantendo lógica original do projeto)
    async function createSessionCookies(user: any) {
        const token = btoa(JSON.stringify({ userId: user.id, role: user.role }));
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        document.cookie = `sb-custom-token=${encodeURIComponent(token)}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;

        const safeUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user?.full_name,
            avatar_url: user?.avatar_url,
            status: user?.status
        };
        document.cookie = `sb-custom-user=${encodeURIComponent(JSON.stringify(safeUser))}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;
    }

    // Submit Geral
    const onFormSubmit = (data: any) => {
        if (step === 'email') handleCheckEmail(data);
        else if (step === 'password') handleLoginPassword(data);
        else if (step === 'otp') handleLoginOtp(data);
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex items-center justify-center p-4">

            {/* Background Effects */}
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
                            {step === 'otp' ? 'Código de Acesso' : step === 'password' ? 'Área Administrativa' : 'Bem-vindo(a)!'}
                        </h1>
                        <p className="text-[#888] text-sm md:text-base font-medium">
                            {step === 'otp'
                                ? `Enviamos um código para ${email}`
                                : step === 'password'
                                    ? 'Digite sua senha de administrador'
                                    : 'Digite seu e-mail para entrar'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

                    <div className="space-y-4">
                        {/* Passo 1: Email */}
                        {step === 'email' && (
                            <div className="relative group animate-fade-in">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#F24405] transition-colors" />
                                </div>
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="seu@email.com"
                                    autoFocus
                                    className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-medium"
                                />
                                {errors.email && <p className="text-red-400 text-xs pl-2 pt-1">Email inválido</p>}
                            </div>
                        )}

                        {/* Passo 2: Senha (Admin) */}
                        {step === 'password' && (
                            <div className="relative group animate-fade-in">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#F24405] transition-colors" />
                                </div>
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha de Admin"
                                    autoFocus
                                    className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {errors.password && <p className="text-red-400 text-xs pl-2 pt-1">{errors.password.message as string}</p>}
                            </div>
                        )}

                        {/* Passo 2: OTP (Membro) */}
                        {step === 'otp' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="relative group">
                                    <input
                                        {...register("otp")}
                                        type="text"
                                        placeholder="Digite o código (ex: 123456)"
                                        maxLength={6}
                                        autoFocus
                                        className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl text-center text-2xl tracking-[0.5em] text-white placeholder-gray-700 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-bold"
                                    />
                                    {errors.otp && <p className="text-red-400 text-xs pl-2 pt-1 text-center">Código inválido</p>}
                                </div>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setValue('otp', ''); }}
                                        className="text-xs text-gray-500 hover:text-white underline"
                                    >
                                        Mudar email / Reenviar
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Botão de Ação */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] bg-gradient-to-r from-[#F24405] to-[#FF8558] hover:opacity-90 rounded-full font-bold text-white text-base shadow-[0_0_30px_rgba(242,68,5,0.4)] hover:shadow-[0_0_50px_rgba(242,68,5,0.6)] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            step === 'email' ? "Continuar" : "Entrar"
                        )}
                    </button>

                    {/* Footer / Voltar */}
                    {step !== 'email' && (
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { setStep('email'); setError(null); }}
                                className="text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                ← Voltar
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                </form>
            </div>

            {/* Footer Bottom */}
            <div className="absolute bottom-6 flex items-center gap-2 opacity-50 z-10">
                <span className="text-xs text-white font-medium pl-2">©2024 GGFEX Community.</span>
            </div>
        </div>
    );
}
