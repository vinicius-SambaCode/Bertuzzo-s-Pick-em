import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import { Copa2026Logo } from "@/components/Copa2026Logo"
import { TeamFlag } from "@/components/TeamFlag"

async function getDashboardData(userId: string) {
  const [rankingRaw, myPreds, nextMatches, totalUsers, totalMatches, finishedMatches] = await Promise.all([
    prisma.prediction.groupBy({
      by: ["userId"],
      _sum: { points: true },
      where: { points: { not: null } },
      orderBy: { _sum: { points: "desc" } },
    }),
    prisma.prediction.count({ where: { userId } }),
    prisma.match.findMany({
      where: { status: "SCHEDULED", matchDate: { gte: new Date() } },
      include: {
        homeTeam: { select: { name: true, code: true, flagEmoji: true } },
        awayTeam: { select: { name: true, code: true, flagEmoji: true } },
        predictions: { where: { userId }, select: { homeScorePred: true, awayScorePred: true } },
      },
      orderBy: { matchDate: "asc" },
      take: 4,
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "FINISHED" } }),
  ])

  const myPoints = rankingRaw.find((r) => r.userId === userId)?._sum.points ?? 0
  const myRank = rankingRaw.findIndex((r) => r.userId === userId) + 1

  return { myPoints, myRank, myPreds, nextMatches, totalUsers, totalMatches, finishedMatches }
}

// Venue emoji mapping
const venueEmoji: Record<string, string> = {
  "Cidade do México": "🇲🇽", "Guadalajara": "🇲🇽", "Monterrey": "🇲🇽",
  "Vancouver": "🇨🇦", "Toronto": "🇨🇦",
  "Los Angeles": "🇺🇸", "Seattle": "🇺🇸", "San Francisco": "🇺🇸",
  "Dallas": "🇺🇸", "Houston": "🇺🇸", "Kansas City": "🇺🇸",
  "Atlanta": "🇺🇸", "Miami": "🇺🇸", "Boston": "🇺🇸",
  "Nova York": "🇺🇸", "Filadélfia": "🇺🇸", "Área da Baía": "🇺🇸",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null
  const data = await getDashboardData(session.user.id)

  const stats = [
    { label: "Minha Posição", value: data.myRank > 0 ? `#${data.myRank}` : "—", color: "#FFCD00" },
    { label: "Pontos", value: data.myPoints, color: "#009B3A" },
    { label: "Palpites", value: data.myPreds, color: "#00B5AD" },
    { label: "Jogadores", value: data.totalUsers, color: "#7B2FA0" },
  ]

  return (
    <div className="space-y-6">

      {/* ── HERO BANNER ─────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden"
           style={{ background: "linear-gradient(135deg, #050505 0%, #0D1F10 50%, #081525 100%)" }}>

        {/* Subtle rays in corner */}
        <div className="absolute -top-20 -right-20 w-64 h-64 opacity-15 pointer-events-none"
             style={{ background: "conic-gradient(from 0deg, #D52B1E, #F5690C, #FFCD00, #009B3A, #00B5AD, #003DA5, #7B2FA0, #E91E8C, #D52B1E)", borderRadius: "50%", filter: "blur(2px)" }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 opacity-10 pointer-events-none"
             style={{ background: "radial-gradient(circle, #009B3A, transparent)" }} />

        {/* Top stripe */}
        <div className="copa-stripe" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Copa2026Logo size="lg" subtitle="Copa Bertuzzo" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <p className="font-heading font-bold uppercase tracking-widest text-xs mb-2"
               style={{ color: "#009B3A" }}>
              FIFA World Cup 2026™
            </p>
            <p className="text-text-base text-base">
              Bem-vindo, <span className="font-heading font-black text-white">{session.user.name}</span>!
            </p>
            <p className="text-text-muted text-sm mt-1">
              🗓️ 11 Jun — 19 Jul 2026 &nbsp;·&nbsp; 🌍 EUA, Canadá e México &nbsp;·&nbsp; ⚽ 104 jogos
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <Link href="/dashboard/palpites"
                    className="btn-copa text-xs px-4 py-2.5">
                ⚽ Fazer Palpites
              </Link>
              <Link href="/dashboard/grupos"
                    className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#F2F2F2", border: "1px solid rgba(255,255,255,0.08)" }}>
                🏟️ Ver Grupos
              </Link>
              <Link href="/dashboard/ranking"
                    className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all"
                    style={{ background: "rgba(255,205,0,0.08)", color: "#FFCD00", border: "1px solid rgba(255,205,0,0.2)" }}>
                🏆 Ranking
              </Link>
            </div>
          </div>

          {/* Progress ring */}
          <div className="flex-shrink-0 text-center hidden md:block">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A1A1A" strokeWidth="2" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#009B3A" strokeWidth="2"
                        strokeDasharray={`${data.totalMatches ? (data.finishedMatches / data.totalMatches) * 100 : 0} 100`}
                        strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-display text-white">{data.finishedMatches}</p>
                <p className="text-[9px] font-heading uppercase tracking-wider" style={{ color: "#505050" }}>jogos</p>
              </div>
            </div>
            <p className="text-[10px] font-heading uppercase tracking-wider mt-1" style={{ color: "#505050" }}>
              de {data.totalMatches} partidas
            </p>
          </div>
        </div>

        {/* Bottom stripe */}
        <div className="copa-stripe" />
      </div>

      {/* ── STATS ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at 80% 20%, ${s.color}, transparent)` }} />
            <p className="font-heading font-bold uppercase text-[10px] tracking-widest mb-2"
               style={{ color: "#505050" }}>
              {s.label}
            </p>
            <p className="font-display text-4xl leading-none" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── NEXT MATCHES ────────────────────────────── */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between"
             style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="font-heading font-black uppercase tracking-wider">
            Próximas Partidas
          </p>
          <Link href="/dashboard/palpites"
                className="text-xs font-heading font-bold uppercase tracking-wider transition-colors"
                style={{ color: "#009B3A" }}>
            Ver Todos →
          </Link>
        </div>

        {data.nextMatches.length === 0 ? (
          <p className="text-text-muted text-center py-10 text-sm">Nenhuma partida agendada</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {data.nextMatches.map((m) => {
              const pred = m.predictions[0]
              const venueKey = Object.keys(venueEmoji).find((k) => m.venue?.includes(k))
              return (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-white/[0.02] transition-colors">
                  <div className="hidden sm:block w-32 flex-shrink-0">
                    <p className="text-xs font-heading uppercase" style={{ color: "#505050" }}>
                      {formatDateTime(m.matchDate)}
                    </p>
                    {m.venue && (
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: "#383838" }}>
                        {venueKey ? venueEmoji[venueKey] : ""} {m.venue.split("(")[0]}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                    <span className="text-sm font-heading font-bold text-right flex-1 truncate flex items-center justify-end gap-1.5">
                      <span className="truncate">{m.homeTeam.name}</span>
                      <TeamFlag code={m.homeTeam.code} name={m.homeTeam.name} size="sm" />
                    </span>
                    <span className="text-text-subtle font-display text-base flex-shrink-0 px-2">×</span>
                    <span className="text-sm font-heading font-bold flex-1 truncate flex items-center gap-1.5">
                      <TeamFlag code={m.awayTeam.code} name={m.awayTeam.name} size="sm" />
                      <span className="truncate">{m.awayTeam.name}</span>
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {pred ? (
                      <span className="font-heading font-black text-xs px-2.5 py-1.5 rounded-lg"
                            style={{ background: "rgba(0,155,58,0.12)", color: "#86efac", border: "1px solid rgba(0,155,58,0.2)" }}>
                        {pred.homeScorePred}–{pred.awayScorePred}
                      </span>
                    ) : (
                      <Link href="/dashboard/palpites"
                            className="font-heading font-black text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                            style={{ background: "rgba(255,205,0,0.08)", color: "#FFCD00", border: "1px solid rgba(255,205,0,0.15)" }}>
                        Palpitar
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── HOST CITIES ─────────────────────────────── */}
      <div className="glass-card rounded-xl p-5">
        <p className="font-heading font-black uppercase tracking-wider mb-4">
          🌍 16 Cidades-Sede
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { city: "Cidade do México", flag: "🇲🇽" }, { city: "Guadalajara", flag: "🇲🇽" }, { city: "Monterrey", flag: "🇲🇽" },
            { city: "Vancouver", flag: "🇨🇦" }, { city: "Toronto", flag: "🇨🇦" },
            { city: "Seattle", flag: "🇺🇸" }, { city: "San Francisco", flag: "🇺🇸" }, { city: "Los Angeles", flag: "🇺🇸" },
            { city: "Kansas City", flag: "🇺🇸" }, { city: "Dallas", flag: "🇺🇸" }, { city: "Houston", flag: "🇺🇸" },
            { city: "Atlanta", flag: "🇺🇸" }, { city: "Miami", flag: "🇺🇸" },
            { city: "Boston", flag: "🇺🇸" }, { city: "Nova York", flag: "🇺🇸" }, { city: "Filadélfia", flag: "🇺🇸" },
          ].map((s) => (
            <span key={s.city}
                  className="text-xs font-heading font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#8A8A8A", border: "1px solid rgba(255,255,255,0.05)" }}>
              {s.flag} {s.city}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
