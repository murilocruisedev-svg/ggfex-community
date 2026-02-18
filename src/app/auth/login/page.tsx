
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

// Schema de validação
const formSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);

        try {
            // Tenta Login via Function Customizada (Para ler do Banco Público)
            const { data, error } = await supabase.functions.invoke('auth-custom', {
                body: {
                    action: 'login',
                    email: values.email,
                    password: values.password
                }
            })

            if (error || !data || data.error) {
                console.error("Erro Function:", error || data?.error);
                throw new Error("Email ou senha incorretos.");
            }

            // SALVAR SESSÃO MANUALMENTE (Cookies)
            if (data.token) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);
                document.cookie = `sb-custom-token=${encodeURIComponent(data.token)}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;
                document.cookie = `sb-custom-user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax; Secure`;
            }

            // Sucesso! REDIRECIONAMENTO INTELIGENTE POR CARGO

            const userRole = data?.user?.role || 'member';

            if (userRole === 'admin') {
                router.push("/painel"); // Painel ADMIN
            } else {
                router.push("/"); // Comunidade (Membros)
            }

            router.refresh();

        } catch (err) {
            console.error(err);
            setError("Email ou senha incorretos.");
        } finally {
            setIsLoading(false);
        }
    }

    const [showPassword, setShowPassword] = useState(false); // Adicionado state para mostrar senha

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center p-4">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#F24405]/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#FF8558]/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Login Card */}
            <div className="w-full max-w-[480px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 relative z-10 shadow-2xl shadow-orange-900/20">

                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F24405] to-[#D93D04] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-500">
                        <span className="text-3xl font-bold text-white tracking-tighter">G</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            Bem-vindo de volta!
                        </h1>
                        <p className="text-[#888] text-sm md:text-base font-medium">
                            Faça login para acessar a comunidade
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Campos */}
                    <div className="space-y-4">

                        {/* Email Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#F24405] transition-colors" />
                            </div>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Digite seu E-mail"
                                className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-medium"
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-xs pl-2">{errors.email.message}</p>}

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#F24405] transition-colors" />
                            </div>
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite sua senha"
                                className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#F24405]/50 focus:ring-1 focus:ring-[#F24405]/50 transition-all font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-xs pl-2">{errors.password.message}</p>}

                    </div>

                    {/* Options Row */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="w-4 h-4 rounded border border-white/20 bg-transparent flex items-center justify-center group-hover:border-[#F24405] transition-colors">
                                {/* Checkbox simulado por enquanto ou nativo escondido */}
                                <input type="checkbox" className="hidden" />
                                <div className="w-2 h-2 bg-[#F24405] rounded-sm opacity-0 check-indicator transition-opacity" />
                            </div>
                            <span className="text-gray-500 group-hover:text-gray-400 transition-colors">Lembrar senha</span>
                        </label>
                        <a href="#" className="font-semibold text-white hover:text-[#F24405] transition-colors">
                            Esqueceu a senha?
                        </a>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
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

                    {/* Footer */}
                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-500 font-medium">
                            Não possui uma conta? {' '}
                            <button type="button" className="text-[#F24405] hover:text-[#FF8558] font-bold transition-colors">
                                Crie uma agora!
                            </button>
                        </p>
                    </div>

                </form>
            </div>

            {/* Footer Bottom */}
            <div className="absolute bottom-6 flex items-center gap-2 opacity-50">
                <span className="text-xs text-white font-medium pl-2">©2024 GGFEX Community. Todos os direitos reservados.</span>
            </div>

            <style jsx>{`
                .check-indicator {
                    display: none;
                }
                label:has(input:checked) .check-indicator {
                    display: block;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
