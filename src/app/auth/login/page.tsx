
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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

        // Login Nativo do Supabase
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (authError) {
            console.error("Erro no login:", authError);
            setError("Email ou senha incorretos.");
            setIsLoading(false);
            return;
        }

        if (data.session) {
            router.push("/painel");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F24405] to-[#D93D04] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6">
                        <span className="text-3xl font-bold text-white">G</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
                    <p className="text-gray-400">Entre para gerenciar a comunidade</p>
                </div>

                {/* Formulário */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <input
                                type="email"
                                placeholder="admin@ggfex.com"
                                {...register("email")}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-[#F24405] focus:ring-1 focus:ring-[#F24405] transition-all"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg h-12 px-4 text-white focus:outline-none focus:border-[#F24405] focus:ring-1 focus:ring-[#F24405] transition-all"
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Erro Geral */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Botão Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#F24405] hover:bg-[#D93D04] text-white font-bold h-12 rounded-lg text-lg shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...
                                </>
                            ) : (
                                "Entrar no Painel"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Esqueceu a senha? <a href="#" className="text-[#F24405] hover:underline">Recuperar acesso</a>
                </p>

            </div>
        </div>
    );
}
