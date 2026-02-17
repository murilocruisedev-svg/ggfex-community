
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-[#000]">
                {/* Sidebar Fixa */}
                <AdminSidebar />

                {/* Área Principal de Conteúdo */}
                <main className="flex-1 ml-72 p-8 transition-all">
                    {/* Container para centralizar o conteúdo em tela muito grande */}
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
