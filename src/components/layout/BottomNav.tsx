"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Grid3x3, Target, Trophy, User,
  ShieldCheck, Settings, MoreHorizontal
} from "lucide-react"
import { useState } from "react"

type NavItem = { href: string; icon: any; label: string; roles: string[] }

const navItems: NavItem[] = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Início",    roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/grupos",   icon: Grid3x3,         label: "Grupos",    roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/palpites", icon: Target,          label: "Palpites",  roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/ranking",  icon: Trophy,          label: "Ranking",   roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/perfil",   icon: User,            label: "Perfil",    roles: ["ADMIN","FISCAL","PLAYER"] },
]

const extraItems: NavItem[] = [
  { href: "/dashboard/torneio",           icon: Trophy,        label: "Torneio",    roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/financeiro",        icon: ShieldCheck,   label: "Financeiro", roles: ["ADMIN","FISCAL","PLAYER"] },
  { href: "/dashboard/fiscal",            icon: ShieldCheck,   label: "Fiscal",     roles: ["ADMIN","FISCAL"] },
  { href: "/dashboard/admin",             icon: Settings,      label: "Admin",      roles: ["ADMIN"] },
  { href: "/dashboard/admin/usuarios",    icon: Settings,      label: "Usuários",   roles: ["ADMIN"] },
  { href: "/dashboard/admin/partidas",    icon: Settings,      label: "Partidas",   roles: ["ADMIN"] },
  { href: "/dashboard/admin/resultados",  icon: Settings,      label: "Resultados", roles: ["ADMIN"] },
]

export function BottomNav({ role = "PLAYER" }: { role?: string }) {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const visibleExtra = extraItems.filter((i) => i.roles.includes(role))
  const showMoreBtn = visibleExtra.length > 0

  function NavTab({ item }: { item: NavItem }) {
    const active = pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
    const Icon = item.icon

    return (
      <Link href={item.href}
            onClick={() => setShowMore(false)}
            /* min 44×44px tap target — Apple HIG & Material Design requirement */
            className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-all active:scale-95"
            style={{
              minHeight: "56px",
              minWidth: "44px",
              color: active ? "#009B3A" : "#505050",
            }}>
        <Icon size={22} strokeWidth={active ? 2.5 : 1.75}
              style={{ color: "inherit", flexShrink: 0 }} />
        <span style={{
          fontSize: "10px",
          fontFamily: "var(--font-barlow,'Barlow Condensed',sans-serif)",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "inherit",
          lineHeight: 1,
        }}>
          {item.label}
        </span>
      </Link>
    )
  }

  return (
    <>
      {/* ── "More" sheet overlay ─────────────────────────────────────── */}
      {showMore && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowMore(false)}
        />
      )}

      {/* ── "More" popup sheet ───────────────────────────────────────── */}
      {showMore && (
        <div className="lg:hidden fixed left-0 right-0 z-50 glass-card rounded-t-2xl overflow-hidden"
             style={{
               bottom: `calc(64px + env(safe-area-inset-bottom, 0px))`,
             }}>
          <div className="copa-stripe" />
          <div className="p-4">
            <p className="font-heading font-bold uppercase tracking-widest mb-3"
               style={{ fontSize: "11px", color: "#505050" }}>
              Mais Opções
            </p>
            <div className="grid grid-cols-3 gap-2">
              {visibleExtra.map((item) => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}
                        onClick={() => setShowMore(false)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95"
                        style={{
                          background: active ? "rgba(0,155,58,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? "rgba(0,155,58,0.25)" : "rgba(255,255,255,0.06)"}`,
                          color: active ? "#009B3A" : "#8A8A8A",
                          minHeight: "72px",
                        }}>
                    <Icon size={22} strokeWidth={1.75} />
                    <span style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-barlow,'Barlow Condensed',sans-serif)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation Bar ────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed left-0 right-0 bottom-0 z-50"
        style={{
          /* safe-area-inset-bottom: espaço para home indicator do iPhone */
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "rgba(4,4,4,0.94)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>

        {/* Animated multicolor top strip */}
        <div className="copa-stripe" style={{ height: "2px" }} />

        <div className="flex items-stretch justify-around px-1">
          {navItems.map((item) => (
            <NavTab key={item.href} item={item} />
          ))}

          {/* "More" button — only when user has extra items */}
          {showMoreBtn && (
            <button
              onClick={() => setShowMore((v) => !v)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-all active:scale-95"
              style={{
                minHeight: "56px",
                minWidth: "44px",
                color: showMore ? "#009B3A" : "#505050",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}>
              <MoreHorizontal size={22} strokeWidth={1.75} style={{ color: "inherit" }} />
              <span style={{
                fontSize: "10px",
                fontFamily: "var(--font-barlow,'Barlow Condensed',sans-serif)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "inherit",
                lineHeight: 1,
              }}>
                Mais
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
