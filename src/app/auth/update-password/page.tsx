'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { WebGLShader } from "@/components/ui/WebGLShader";

const formSchema = z.object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Monitora a sessão para validar o link
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                // Sessão válida! O link funcionou.
                return;
            }

            // Se não tem sessão, escuta a mudança de estado (o link #access_token processa assincronamente)
            const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                    if (session) setError(null); // Link válido
                }
            });

            // Se após 3s não tiver sessão, assume inválido
            setTimeout(async () => {
                const { data: finalCheck } = await supabase.auth.getSession();
                if (!finalCheck.session) {
                    setError("Link inválido ou expirado. Peça um novo convite.");
                }
            }, 3000);

            return () => {
                authListener.subscription.unsubscribe();
            };
        };

        checkSession();
    }, []);

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
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao salvar senha.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen w-full bg-[#050505] relative flex items-center justify-center p-4">
                <div className="absolute inset-0 z-0"><WebGLShader /></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 pointer-events-none" />

                <div className="w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 relative z-10 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Senha Atualizada!</h1>
                    <p className="text-gray-400">Você será redirecionado...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0"><WebGLShader /></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 pointer-events-none" />

            <div className="w-full max-w-[480px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 relative z-10 shadow-2xl">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Definir Nova Senha</h1>
                    <p className="text-[#888] text-sm font-medium">
                        Crie uma senha segura para acessar sua conta.
                    </p>
                </div>

                {error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center mb-6">
                        {error}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#1F51FF]" />
                            </div>
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Nova Senha"
                                className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#1F51FF]/50 transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            {errors.password && <p className="text-red-400 text-xs pl-2 pt-1">{errors.password.message as string}</p>}
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#1F51FF]" />
                            </div>
                            <input
                                {...register("confirmPassword")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirme a Senha"
                                className="w-full h-[56px] bg-[#111] border border-white/5 rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#1F51FF]/50 transition-all"
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-xs pl-2 pt-1">{errors.confirmPassword.message as string}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[52px] bg-gradient-to-r from-[#1F51FF] to-[#4a6cf7] hover:opacity-90 rounded-full font-bold text-white text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Senha"}
                        </button>

                    </form>
                )}
            </div>
        </div>
    );
}
