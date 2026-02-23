import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <svg viewBox="0 0 400 130" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="xGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e8ecff" />
                        <stop offset="40%" stopColor="#8fa4ff" />
                        <stop offset="100%" stopColor="#4a6cf7" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1a35e0" />
                        <stop offset="50%" stopColor="#3b5bff" />
                        <stop offset="100%" stopColor="#8ba4ff" />
                    </linearGradient>
                    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="4" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="lineGlow" x="-5%" y="-100%" width="110%" height="300%">
                        <feGaussianBlur stdDeviation="2" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Subtle background glow */}
                <ellipse cx="200" cy="75" rx="180" ry="60" fill="#1a35e0" opacity="0.04" />

                {/* GFE in white */}
                <text
                    x="15" y="100"
                    fontFamily="'Arial Black', 'Impact', 'Helvetica Neue', sans-serif"
                    fontWeight="900" fontSize="115" fill="white"
                    letterSpacing="-3"
                    filter="url(#textGlow)"
                >GFE</text>

                {/* X closer to GFE */}
                <text
                    x="270" y="100"
                    fontFamily="'Arial Black', 'Impact', 'Helvetica Neue', sans-serif"
                    fontWeight="900" fontSize="115" fill="url(#xGrad)"
                    letterSpacing="-3"
                    filter="url(#textGlow)"
                >X</text>

                {/* Glowing horizontal line */}
                <line x1="15" y1="114" x2="385" y2="114"
                    stroke="url(#lineGrad)" strokeWidth="2.5"
                    strokeLinecap="round" filter="url(#lineGlow)" />

                {/* Center dot with glow */}
                <circle cx="200" cy="114" r="5" fill="#3b5bff" filter="url(#dotGlow)" />
            </svg>
        </div>
    );
}

