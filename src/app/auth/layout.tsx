export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold font-heading text-white">
                        GGFEX <span className="text-primary">Community</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Sign in to your account
                    </p>
                </div>

                <div className="bg-card border border-white/10 rounded-xl p-8 shadow-2xl shadow-primary/5">
                    {children}
                </div>
            </div>
        </div>
    )
}
