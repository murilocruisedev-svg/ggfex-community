import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { User, Bell } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar - Fixed */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col pl-64 transition-all duration-300">

                {/* Admin Header */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-white/5 h-16 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-white">Administration Panel</h2>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-white relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 space-y-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
