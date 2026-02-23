import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="flex flex-col items-center gap-0">
                {/* Main text */}
                <div
                    className="flex items-baseline leading-none"
                    style={{ fontFamily: "'Michroma', 'Rajdhani', sans-serif" }}
                >
                    <span className="text-white font-bold tracking-wider" style={{ fontSize: 'inherit' }}>
                        GFE
                    </span>
                    <span
                        className="font-bold tracking-wider"
                        style={{
                            fontSize: 'inherit',
                            background: 'linear-gradient(135deg, #c8d4ff 0%, #4a6cf7 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        X
                    </span>
                </div>

                {/* Subtle futuristic line */}
                <div className="relative w-full flex items-center" style={{ marginTop: '-1px' }}>
                    <div
                        className="flex-1 h-[1.5px] rounded-full"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, #2040e8 50%, #3b5bff 100%)' }}
                    />
                    <div className="relative mx-0.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3b5bff]" />
                    </div>
                    <div
                        className="flex-1 h-[1.5px] rounded-full"
                        style={{ background: 'linear-gradient(90deg, #3b5bff 0%, #7b94ff 50%, transparent 100%)' }}
                    />
                </div>
            </div>
        </div>
    );
}
