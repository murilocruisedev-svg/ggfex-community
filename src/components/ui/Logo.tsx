import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    const logoUrl = "https://scontent.fcmp1-1.fna.fbcdn.net/v/t39.30808-6/640294972_122108791767229706_913032807331872645_n.jpg?stp=dst-jpg_s640x640_tt6&_nc_cat=109&ccb=1-7&_nc_sid=13d280&_nc_ohc=mxzYQBoAzaMQ7kNvwFtwMMF&_nc_oc=AdlI5rZodmxLt_37xddaWtqwSSxHf5DpdRxf-u2f_KPru6sv-nB59sv-jdLCU3Ov2H-1hHJhRwxcqHU7kppFqvs&_nc_zt=23&_nc_ht=scontent.fcmp1-1.fna&_nc_gid=3qLArp0AV2ERQPRrS0LzcQ&oh=00_AfvmMX_eUYsC1nr9FHIPwpLfD1gHSR9pICD7l0BnbFvqWA&oe=699FF1BB";

    return (
        <div className={cn("flex items-center justify-center overflow-hidden rounded-lg", className)}>
            <img
                src={logoUrl}
                alt="GFEX Logo"
                className="h-full w-auto object-contain mix-blend-screen brightness-125 contrast-125 grayscale invert"
                style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.2)' }}
            />
        </div>
    );
}
