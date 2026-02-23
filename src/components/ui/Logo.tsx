import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <svg viewBox="0 0 380 120" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="xGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c8d4ff" />
                        <stop offset="100%" stopColor="#4a6cf7" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2040e8" />
                        <stop offset="100%" stopColor="#7b94ff" />
                    </linearGradient>
                </defs>

                {/* GFEX - solid white text */}
                <text x="10" y="92" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="108" fill="#ffffff" letterSpacing="-4">GFE</text>

                {/* X with blue gradient */}
                <text x="262" y="92" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="108" fill="url(#xGrad)" letterSpacing="-4">X</text>

                {/* Solid blue line */}
                <line x1="10" y1="104" x2="370" y2="104" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />

                {/* Center dot */}
                <circle cx="190" cy="104" r="5" fill="#3b5bff" />
            </svg>
        </div>
    );
}
