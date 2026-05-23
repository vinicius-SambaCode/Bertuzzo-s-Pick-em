export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center relative"
         style={{
           minHeight: "100dvh",
           background: "var(--bg-1)",
           paddingTop: "max(env(safe-area-inset-top, 0px), 24px)",
           paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)",
         }}>
      {/* Gradiente sutil de fundo — Copa verde/escuro */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,155,58,0.08) 0%, transparent 70%)" }} />
      <div className="relative z-10 w-full max-w-[420px] px-4">
        {children}
      </div>
    </div>
  )
}
