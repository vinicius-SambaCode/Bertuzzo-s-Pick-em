import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex overflow-hidden" style={{ height: "100dvh", background: "var(--bg-1)" }}>

      {/* Sidebar desktop */}
      <Sidebar />

      {/* Conteúdo principal */}
      <main
        className="flex-1 overflow-y-auto lg:pb-0"
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <BottomNav role={session.user.role} />
    </div>
  )
}
