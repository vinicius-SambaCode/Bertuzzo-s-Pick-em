"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard, Target, Trophy, Wallet, User, ShieldCheck,
  Users, Calendar, ClipboardCheck, Mail, LogOut, Menu, X,
  Grid3x3, Settings, BarChart3
} from "lucide-react"
import { getInitials } from "@/lib/utils"
import { Copa2026Logo } from "@/components/Copa2026Logo"
import { ThemeToggle } from "@/components/ThemeProvider"
import { useState } from "react"

const navItems = [
  { href: "/dashboard",                label: "Dashboard",   icon: LayoutDashboard, roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/grupos",         label: "Grupos",      icon: Grid3x3,          roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/palpites",       label: "Palpites",    icon: Target,           roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/ranking",        label: "Ranking",     icon: Trophy,           roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/financeiro",     label: "Financeiro",  icon: Wallet,           roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/perfil",         label: "Meu Perfil",  icon: User,             roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/fiscal",         label: "Fiscal",      icon: ShieldCheck,      roles: ["ADMIN","FISCAL"], divider: true },
  { href: "/dashboard/admin",          label: "Admin",       icon: Settings,         roles: ["ADMIN"] },
  { href: "/dashboard/admin/usuarios", label: "Usuários",    icon: Users,            roles: ["ADMIN"] },
  { href: "/dashboard/admin/partidas", label: "Partidas",    icon: Calendar,         roles: ["ADMIN"] },
  { href: "/dashboard/admin/resultados",label:"Resultados",  icon: ClipboardCheck,   roles: ["ADMIN"] },
  { href: "/dashboard/admin/auditoria",label: "Auditoria",   icon: BarChart3,        roles: ["ADMIN"] },
  { href: "/dashboard/admin/email",    label: "Emails",      icon: Mail,             roles: ["ADMIN"] },
]

const roleColor: Record<string, string> = { ADMIN: "#FFCD00", FISCAL: "#003DA5", PLAYER: "#009B3A" }
const roleLabel: Record<string, string> = { ADMIN: "Admin",   FISCAL: "Fiscal",  PLAYER: "Jogador" }

function NavItem({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: any; active: boolean
}) {
  return (
    <Link href={href}
          className="flex items-center gap-3 px-3 rounded-xl transition-all"
          style={{
            minHeight: 44,
            color: active ? "#009B3A" : "var(--t2)",
            background: active ? "rgba(0,155,58,0.1)" : "transparent",
            borderLeft: active ? "2px solid #009B3A" : "2px solid transparent",
          }}>
      <Icon size={17} style={{ color: active ? "#009B3A" : "var(--t3)", flexShrink: 0 }} />
      <span className="font-heading font-bold uppercase text-xs tracking-wider"
            style={{ color: active ? "#009B3A" : "var(--t2)" }}>
        {label}
      </span>
    </Link>
  )
}

function SidebarContent() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role ?? "PLAYER"
  const visible = navItems.filter((i) => i.roles.includes(role))

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border)" }}>

      {/* Logo */}
      <div className="px-4 py-5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard">
          <Copa2026Logo size="sm" subtitle="Copa Bertuzzo" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {visible.map((item, i) => {
          const prev = visible[i - 1]
          const divider = item.divider && prev && !prev.divider
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <div key={item.href}>
              {divider && <div className="my-2 mx-2" style={{ height: 1, background: "var(--border)" }} />}
              <NavItem href={item.href} label={item.label} icon={item.icon} active={active} />
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ background: "var(--bg-3)" }}>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0"
               style={{ background: `rgba(${roleColor[role]},0.15)`, border: `1px solid ${roleColor[role]}44` }}>
            {session?.user?.avatarUrl
              ? <img src={session.user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <span style={{ color: roleColor[role] }}>{getInitials(session?.user?.name ?? "U")}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-heading font-bold uppercase tracking-wide truncate" style={{ color: "var(--t1)" }}>
              {session?.user?.name}
            </p>
            <p className="text-[10px] font-heading uppercase tracking-wider" style={{ color: roleColor[role] }}>
              {roleLabel[role]}
            </p>
          </div>
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="touch-target rounded-lg transition-colors flex-shrink-0"
            style={{ color: "var(--t3)", minHeight: 44, minWidth: 44 }}
            title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="lg:hidden fixed top-4 left-4 z-50 btn-icon" onClick={() => setOpen((v) => !v)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}
      <aside className={`lg:hidden fixed left-0 top-0 bottom-0 z-40 w-64 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
