import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center overflow-hidden bg-white rounded-lg p-1", className)}>
            <img
                src="/logo.png"
                alt="GFEX Logo"
                className="h-full w-auto object-contain"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}

