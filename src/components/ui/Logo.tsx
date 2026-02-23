import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center overflow-hidden", className)}>
            <img
                src="/logo.png"
                alt="GFEX Logo"
                className="h-full w-auto object-contain"
                style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.4) contrast(1.1)' }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}

