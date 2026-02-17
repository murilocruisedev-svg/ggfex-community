import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pl-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
