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

                {/* Futuristic line with glowing dot */}
                <div className="relative w-full flex items-center" style={{ marginTop: '-2px' }}>
                    {/* Left line */}
                    <div className="relative flex-1 h-[2px] overflow-hidden rounded-full">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: 'linear-gradient(90deg, transparent 0%, #2040e8 40%, #3b5bff 100%)' }}
                        />
                        <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(59,91,255,0.4) 50%, rgba(59,91,255,0.8) 100%)', filter: 'blur(3px)' }}
                        />
                    </div>

                    {/* Center glowing dot */}
                    <div className="relative mx-1 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3b5bff] relative z-10" />
                        <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: '#3b5bff', opacity: 0.4 }}
                        />
                        <div
                            className="absolute -inset-1 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(59,91,255,0.6) 0%, transparent 70%)', filter: 'blur(4px)' }}
                        />
                    </div>

                    {/* Right line */}
                    <div className="relative flex-1 h-[2px] overflow-hidden rounded-full">
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: 'linear-gradient(90deg, #3b5bff 0%, #7b94ff 60%, transparent 100%)' }}
                        />
                        <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{ background: 'linear-gradient(90deg, rgba(59,91,255,0.8) 0%, rgba(123,148,255,0.4) 50%, transparent 100%)', filter: 'blur(3px)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
