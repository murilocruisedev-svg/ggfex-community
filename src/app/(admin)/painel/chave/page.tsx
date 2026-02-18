'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ConfigurarChavePage() {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!key) return alert('Cole a chave primeiro!');

        setLoading(true);
        try {
            const response = await fetch('/api/admin/save-env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });

            const data = await response.json();

            if (data.success) {
                alert('Chave salva com sucesso! \n\n⚠️ AGORA VOCÊ PRECISA REINICIAR O SERVIDOR (Pare e rode npm run dev de novo).');
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (err: any) {
            alert('Erro: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
            <div className="max-w-xl w-full bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Configurar Chave Secreta</h1>
                        <p className="text-gray-400 text-sm">Cole a "service_role" key aqui para liberar funções avançadas.</p>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex gap-3 text-yellow-500 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>Essa chave é sensível. Só cole se você for o administrador do projeto. Pegue ela no painel da Supabase -> Settings -> API.</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-300">Cole a Chave SERVICE_ROLE (começa com 'ey...')</label>
                    <textarea
                        className="w-full h-32 bg-[#050505] border border-white/10 rounded-xl p-4 text-white font-mono text-xs focus:border-orange-500 outline-none resize-none"
                        placeholder="eyJh..."
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />

                    <button
                        onClick={handleSave}
                        disabled={loading || !key}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Chave e Configurar'}
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                        Ao clicar em Salvar, o arquivo .env.local será atualizado automaticamente.
                    </p>
                </div>
            </div>
        </div>
    );
}
