import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <svg viewBox="0 0 400 140" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#a8b8ff" />
                        <stop offset="100%" stopColor="#7b8fff" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2845f7" />
                        <stop offset="50%" stopColor="#2845f7" />
                        <stop offset="100%" stopColor="#8ba0ff" />
                    </linearGradient>
                </defs>

                {/* G */}
                <text x="20" y="100" fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="110" fill="white" letterSpacing="-2">G</text>

                {/* F */}
                <text x="110" y="100" fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="110" fill="white" letterSpacing="-2">F</text>

                {/* E */}
                <text x="195" y="100" fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="110" fill="white" letterSpacing="-2">E</text>

                {/* X with gradient */}
                <text x="285" y="100" fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="110" fill="url(#xGradient)" letterSpacing="-2">X</text>

                {/* Blue horizontal line */}
                <line x1="25" y1="112" x2="380" y2="112" stroke="url(#lineGradient)" strokeWidth="2.5" />

                {/* Center dot on line */}
                <circle cx="200" cy="112" r="4" fill="#2845f7" />
            </svg>
        </div>
    );
}

