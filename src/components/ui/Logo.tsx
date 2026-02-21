import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <div className="relative">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white flex items-baseline">
                    G<span className="text-white/90">F</span>
                    <span className="text-white">E</span>
                    <span className="text-blue-400">X</span>
                </h1>
                <div className="flex items-center mt-1 w-full px-1">
                    <div className="h-[3px] bg-blue-500 flex-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mx-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    <div className="h-[1px] bg-blue-400/50 flex-1 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
