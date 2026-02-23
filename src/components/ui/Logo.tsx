import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center overflow-hidden", className)}>
            <img
                src="/logo.png"
                alt="GFEX Logo"
                className="h-full w-auto object-contain"
                style={{ filter: 'invert(1) hue-rotate(180deg)', mixBlendMode: 'screen' }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}

