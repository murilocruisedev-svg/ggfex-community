export function Logo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <text
                x="50%"
                y="45"
                textAnchor="middle"
                fill="white"
                style={{ font: 'bold 45px sans-serif', letterSpacing: '2px' }}
            >
                GFEX
            </text>
            <rect x="30" y="52" width="140" height="3" fill="#3B82F6" />
            <circle cx="100" cy="53.5" r="3" fill="#3B82F6" />
        </svg>
    );
}
