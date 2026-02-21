import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    // Busca a imagem da pasta /public/logo.png
    const logoUrl = "/logo.png";

    return (
        <div className={cn("flex items-center justify-center overflow-hidden", className)}>
            <img
                src={logoUrl}
                alt="GFEX Logo"
                className="h-full w-auto object-contain mix-blend-screen brightness-110 contrast-125 invert"
                style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                // Esconde a imagem quebrada se o arquivo logo.png ainda não estiver lá
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
}
