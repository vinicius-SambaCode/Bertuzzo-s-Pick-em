"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDateTime } from "@/lib/utils"
import { TeamFlag } from "@/components/TeamFlag"

type Team = { id: string; name: string; code: string; flagEmoji: string; group: string }
type Match = {
  id: string; matchDate: string; venue: string; groupName: string; round: number; status: string
  homeScore: number | null; awayScore: number | null
  homeTeam: { name: string; code: string; flagEmoji: string }
  awayTeam: { name: string; code: string; flagEmoji: string }
}

type TeamStats = {
  code: string; name: string; flag: string
  p: number; w: number; d: number; l: number
  gf: number; ga: number; gd: number; pts: number
}

function computeStandings(teams: Team[], matches: Match[]): TeamStats[] {
  const stats: Record<string, TeamStats> = {}
  for (const t of teams) {
    stats[t.code] = { code: t.code, name: t.name, flag: t.flagEmoji, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
  }
  for (const m of matches) {
    if (m.status !== "FINISHED" || m.homeScore == null || m.awayScore == null) continue
    const h = stats[m.homeTeam.code], a = stats[m.awayTeam.code]
    if (!h || !a) continue
    h.p++; a.p++
    h.gf += m.homeScore; h.ga += m.awayScore
    a.gf += m.awayScore; a.ga += m.homeScore
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga
    if (m.homeScore > m.awayScore) { h.w++; h.pts += 3; a.l++ }
    else if (m.homeScore < m.awayScore) { a.w++; a.pts += 3; h.l++ }
    else { h.d++; a.d++; h.pts++; a.pts++ }
  }
  return Object.values(stats).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
}

const GROUP_COLORS: Record<string, string> = {
  A: "#dc2626", B: "#ea580c", C: "#ca8a04", D: "#16a34a",
  E: "#0891b2", F: "#2563eb", G: "#7c3aed", H: "#db2777",
  I: "#be185d", J: "#0f766e", K: "#15803d", L: "#1d4ed8",
}

function GroupPanel({ group, teams, matches }: { group: string; teams: Team[]; matches: Match[] }) {
  const color = GROUP_COLORS[group] ?? "#009C3B"
  const standings = computeStandings(teams, matches)
  const gMatches = matches.filter((m) => m.groupName === group).sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())

  return (
    <div className="glass rounded-xl overflow-hidden" style={{ borderTop: `3px solid ${color}` }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: `${color}22` }}>
        <span className="text-lg font-black" style={{ color }}>GRUPO {group}</span>
        {/* Bandeiras dos 4 times do grupo */}
        <div className="ml-auto flex items-center gap-1">
          {teams.map((t) => <TeamFlag key={t.code} code={t.code} name={t.name} size="xs" />)}
        </div>
      </div>

      {/* Partidas */}
      <div className="divide-y" style={{ borderColor: "#1A2540" }}>
        {gMatches.map((m) => (
          <div key={m.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
            <span className="text-text-subtle text-xs w-24 shrink-0">{formatDateTime(m.matchDate)}</span>
            <div className="flex-1 flex items-center justify-between gap-1 min-w-0">
              <span className="truncate text-right flex-1 font-medium text-text-base flex items-center justify-end gap-1.5">
                <span className="truncate">{m.homeTeam.name}</span>
                <TeamFlag code={m.homeTeam.code} name={m.homeTeam.name} size="xs" />
              </span>
              {m.status === "FINISHED" && m.homeScore != null ? (
                <span className="font-black text-base shrink-0 px-2" style={{ color: "#FFCD00" }}>
                  {m.homeScore} – {m.awayScore}
                </span>
              ) : (
                <span className="text-text-muted shrink-0 px-2">×</span>
              )}
              <span className="truncate flex-1 font-medium text-text-base flex items-center gap-1.5">
                <TeamFlag code={m.awayTeam.code} name={m.awayTeam.name} size="xs" />
                <span className="truncate">{m.awayTeam.name}</span>
              </span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
              m.status === "FINISHED" ? "badge-finished" : m.status === "LIVE" ? "badge-live" : "badge-scheduled"
            }`}>
              {m.status === "FINISHED" ? "✓" : m.status === "LIVE" ? "🔴" : "R" + m.round}
            </span>
          </div>
        ))}
      </div>

      {/* Classificação */}
      <div style={{ borderTop: "1px solid #1A2540", background: "#0A0F1E" }}>
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-1 px-3 py-1.5 text-xs text-text-subtle">
          <span>Seleção</span>
          <span className="w-6 text-center">J</span>
          <span className="w-6 text-center">V</span>
          <span className="w-6 text-center">SG</span>
          <span className="w-6 text-center">GP</span>
          <span className="w-7 text-center font-bold">Pts</span>
        </div>
        {standings.map((t, i) => (
          <div key={t.code}
               className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-1 px-3 py-1.5 items-center"
               style={{ background: i < 2 ? `${color}11` : "transparent", borderTop: "1px solid #0F1729" }}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold w-3.5" style={{ color: i < 2 ? color : "#5A6F7E" }}>{i + 1}</span>
              <TeamFlag code={t.code} name={t.name} size="xs" />
              <span className="text-sm font-medium text-text-base truncate">{t.name}</span>
            </div>
            <span className="w-6 text-center text-xs text-text-muted">{t.p}</span>
            <span className="w-6 text-center text-xs text-text-muted">{t.w}</span>
            <span className="w-6 text-center text-xs" style={{ color: t.gd > 0 ? "#4ade80" : t.gd < 0 ? "#f87171" : "#99AABB" }}>
              {t.gd > 0 ? "+" : ""}{t.gd}
            </span>
            <span className="w-6 text-center text-xs text-text-muted">{t.gf}</span>
            <span className="w-7 text-center text-sm font-black" style={{ color: i < 2 ? color : "#E8F0FF" }}>{t.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GruposPage() {
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => fetch("/api/teams").then((r) => r.json()),
  })
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => fetch("/api/matches?stage=GROUP_STAGE").then((r) => r.json()),
    refetchInterval: 60_000,
  })

  const groupStageMatches = matches.filter((m) => m.groupName)
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"]
  const teamsByGroup = (g: string) => teams.filter((t) => t.group === g)

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Fase de Grupos 🏟️</h1>
        <p className="text-text-muted text-sm mt-1">12 grupos • 48 seleções • Copa do Mundo FIFA 2026</p>
      </div>

      {/* Rounds filter hint */}
      <div className="flex gap-2 flex-wrap">
        {[1,2,3].map((r) => {
          const rMatches = groupStageMatches.filter((m) => m.round === r)
          const done = rMatches.filter((m) => m.status === "FINISHED").length
          return (
            <div key={r} className="glass rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-text-muted">Rodada {r}</p>
              <p className="text-sm font-bold text-text-base">{done}/{rMatches.length}</p>
              <div className="h-1 rounded-full mt-1" style={{ background: "#243354" }}>
                <div className="h-1 rounded-full" style={{ background: "#009C3B", width: `${rMatches.length ? (done/rMatches.length)*100 : 0}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 12 Groups in 2-column grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <GroupPanel
            key={g}
            group={g}
            teams={teamsByGroup(g)}
            matches={groupStageMatches.filter((m) => m.groupName === g)}
          />
        ))}
      </div>
    </div>
  )
}
