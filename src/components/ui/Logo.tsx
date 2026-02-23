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

                {/* Line with center dot */}
                <div className="relative w-full flex items-center" style={{ marginTop: '-2px' }}>
                    <div
                        className="flex-1 h-[2px] rounded-full"
                        style={{ background: 'linear-gradient(90deg, #2040e8, #3b5bff)' }}
                    />
                    <div className="w-2 h-2 rounded-full bg-[#3b5bff] mx-1 shrink-0" />
                    <div
                        className="flex-1 h-[2px] rounded-full"
                        style={{ background: 'linear-gradient(90deg, #3b5bff, #7b94ff)' }}
                    />
                </div>
            </div>
        </div>
    );
}
