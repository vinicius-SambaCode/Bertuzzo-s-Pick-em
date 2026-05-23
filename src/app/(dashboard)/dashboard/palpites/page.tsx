"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { formatDateTime, stageLabel } from "@/lib/utils"
import { getPointsLabel, getPointsColor } from "@/lib/scoring"
import { TeamFlag } from "@/components/TeamFlag"
import { Save, Pencil, Clock, Lock, CheckCircle2 } from "lucide-react"

type Match = {
  id: string; matchDate: string; venue: string | null; stage: string
  groupName: string | null; round: number; status: string
  homeScore: number | null; awayScore: number | null
  homeTeam: { id: string; name: string; code: string; flagEmoji: string }
  awayTeam: { id: string; name: string; code: string; flagEmoji: string }
}

const GROUP_COLORS: Record<string, string> = {
  A:"#D52B1E", B:"#F5690C", C:"#C8A228", D:"#009B3A",
  E:"#0891b2",  F:"#2563eb",  G:"#7B2FA0",  H:"#E91E8C",
  I:"#be185d",  J:"#0f766e",  K:"#15803d",  L:"#1d4ed8",
}

function DeadlineCountdown({ matchDate, stage }: { matchDate: string; stage: string }) {
  const [remaining, setRemaining] = useState("")

  useEffect(() => {
    const deadline = stage === "GROUP_STAGE"
      ? new Date(matchDate)
      : new Date(new Date(matchDate).getTime() - 2 * 60 * 60 * 1000)

    function update() {
      const diff = deadline.getTime() - Date.now()
      if (diff <= 0) { setRemaining("Encerrado"); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      if (d > 0) setRemaining(`${d}d ${h}h`)
      else if (h > 0) setRemaining(`${h}h ${m}m`)
      else setRemaining(`${m}m`)
    }
    update()
    const timer = setInterval(update, 30_000)
    return () => clearInterval(timer)
  }, [matchDate, stage])

  return (
    <span className="flex items-center gap-1" style={{ fontSize: 11, color: remaining === "Encerrado" ? "#f87171" : "var(--t3)" }}>
      <Clock size={11} />
      {remaining}
    </span>
  )
}

function MatchCard({ match, prediction, onSave }: {
  match: Match
  prediction?: { homeScorePred: number; awayScorePred: number; points?: number | null } | null
  onSave: (matchId: string, home: number, away: number) => Promise<void>
}) {
  const deadline = match.stage === "GROUP_STAGE"
    ? new Date(match.matchDate)
    : new Date(new Date(match.matchDate).getTime() - 2 * 60 * 60 * 1000)

  const isOpen = match.status === "SCHEDULED" && new Date() < deadline
  const hasPred = prediction != null
  const pts = prediction?.points
  const [home, setHome] = useState(prediction?.homeScorePred?.toString() ?? "")
  const [away, setAway] = useState(prediction?.awayScorePred?.toString() ?? "")
  const [saving, setSaving] = useState(false)
  const edited = home !== (prediction?.homeScorePred?.toString() ?? "") ||
                 away !== (prediction?.awayScorePred?.toString() ?? "")

  async function save() {
    const h = parseInt(home), a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { toast.error("Placar inválido"); return }
    setSaving(true)
    await onSave(match.id, h, a)
    setSaving(false)
  }

  return (
    <div className="card overflow-hidden"
         style={{ borderLeft: hasPred ? "3px solid #009B3A" : "3px solid var(--border)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2"
           style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-3)" }}>
        <span className={`badge ${
          match.status === "LIVE"      ? "badge-live" :
          match.status === "FINISHED"  ? "badge-finished" :
          match.status === "CANCELLED" ? "badge-cancelled" : "badge-scheduled"
        }`}>
          {match.status === "LIVE" ? "Ao Vivo" : match.status === "FINISHED" ? "Finalizado" : "Agendado"}
        </span>

        <div className="text-center">
          <p style={{ fontSize: 11, color: "var(--t2)" }}>{formatDateTime(match.matchDate)}</p>
          {match.venue && <p style={{ fontSize: 10, color: "var(--t3)" }}>{match.venue.split("(")[0].trim()}</p>}
        </div>

        {isOpen && <DeadlineCountdown matchDate={match.matchDate} stage={match.stage} />}
        {!isOpen && match.status === "SCHEDULED" && (
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#f87171" }}>
            <Lock size={11} /> Fechado
          </span>
        )}
        {match.status === "FINISHED" && hasPred && pts != null && (
          <span className={`font-heading font-black ${getPointsColor(pts)}`} style={{ fontSize: 13 }}>
            {pts} pts
          </span>
        )}
      </div>

      {/* Score area */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Time da casa */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="font-heading font-bold text-sm sm:text-base whitespace-nowrap" style={{ color: "var(--t1)" }}>
            {match.homeTeam.name}
          </span>
          <TeamFlag code={match.homeTeam.code} name={match.homeTeam.name} size="md" className="flex-shrink-0" />
        </div>

        {/* Placar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {match.status === "FINISHED" && match.homeScore != null ? (
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <span className="font-display" style={{ fontSize: 28, color: "#FFCD00" }}>{match.homeScore}</span>
                <span style={{ color: "var(--t3)" }}>–</span>
                <span className="font-display" style={{ fontSize: 28, color: "#FFCD00" }}>{match.awayScore}</span>
              </div>
              {hasPred && (
                <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                  Palpite: {prediction!.homeScorePred}–{prediction!.awayScorePred}
                </p>
              )}
              {pts != null && (
                <p className={`font-bold ${getPointsColor(pts)}`} style={{ fontSize: 12 }}>
                  {getPointsLabel(pts)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input className="score-input" type="number" min={0} max={99}
                     value={home} onChange={(e) => setHome(e.target.value)}
                     disabled={!isOpen} placeholder="–" />
              <span style={{ color: "var(--t3)", fontWeight: "bold" }}>×</span>
              <input className="score-input" type="number" min={0} max={99}
                     value={away} onChange={(e) => setAway(e.target.value)}
                     disabled={!isOpen} placeholder="–" />
            </div>
          )}
        </div>

        {/* Time visitante */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <TeamFlag code={match.awayTeam.code} name={match.awayTeam.name} size="md" className="flex-shrink-0" />
          <span className="font-heading font-bold text-sm sm:text-base whitespace-nowrap" style={{ color: "var(--t1)" }}>
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Ações CRUD — centralizadas abaixo */}
      {isOpen && (
        <div className="flex items-center justify-center gap-3 px-4 pb-4">
          {hasPred ? (
            <>
              <button
                onClick={save} disabled={saving || !edited}
                className="btn-icon success"
                title="Salvar alteração"
                style={{ opacity: (!edited || saving) ? 0.45 : 1, width: 44, height: 44 }}>
                <Save size={17} />
              </button>
              {edited && (
                <button
                  onClick={() => { setHome(prediction!.homeScorePred.toString()); setAway(prediction!.awayScorePred.toString()) }}
                  className="btn-icon"
                  title="Descartar alteração">
                  <Pencil size={17} style={{ color: "var(--t2)" }} />
                </button>
              )}
              {!edited && (
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#4ade80" }}>
                  <CheckCircle2 size={14} /> Palpite salvo
                </span>
              )}
            </>
          ) : (
            <button
              onClick={save} disabled={saving}
              className="btn btn-primary gap-2"
              style={{ opacity: saving ? 0.65 : 1 }}>
              <Save size={15} />
              {saving ? "Salvando..." : "Salvar Palpite"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const STAGE_ORDER = ["GROUP_STAGE","ROUND_OF_32","ROUND_OF_16","QUARTER_FINAL","SEMI_FINAL","THIRD_PLACE","FINAL"]

export default function PalpitesPage() {
  const qc = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<string>("A")

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["matches-all"],
    queryFn: () => fetch("/api/matches").then((r) => r.json()),
  })

  const { data: predictions = [] } = useQuery({
    queryKey: ["my-predictions"],
    queryFn: () => fetch("/api/predictions").then((r) => r.json()),
  })

  const mutation = useMutation({
    mutationFn: ({ matchId, home, away }: { matchId: string; home: number; away: number }) =>
      fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScorePred: home, awayScorePred: away }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d }),
    onSuccess: () => { toast.success("Palpite salvo!"); qc.invalidateQueries({ queryKey: ["my-predictions"] }) },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  })

  const predMap: Record<string, any> = Object.fromEntries(predictions.map((p: any) => [p.matchId, p]))
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"]
  const groupMatches = (g: string) => matches
    .filter((m) => m.groupName === g)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())

  const knockoutMatches = matches
    .filter((m) => m.stage !== "GROUP_STAGE")
    .sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage) || new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())

  const hasKnockout = knockoutMatches.length > 0

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "#009B3A", borderTopColor: "transparent" }} />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-black uppercase tracking-wide" style={{ fontSize: 26, color: "var(--t1)" }}>
          Meus Palpites
        </h1>
        <p style={{ color: "var(--t2)", fontSize: 13, marginTop: 2 }}>
          Copa do Mundo FIFA 2026 — {predictions.length} palpites registrados
        </p>
      </div>

      {/* Tabs de grupo — números centralizados */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {groups.map((g) => {
          const gm = groupMatches(g)
          const color = GROUP_COLORS[g]
          const active = activeFilter === g
          const done = gm.filter((m) => predMap[m.id]).length
          return (
            <button key={g} onClick={() => setActiveFilter(g)}
                    className="relative flex flex-col items-center rounded-xl transition-all"
                    style={{
                      minWidth: 48, minHeight: 52,
                      padding: "8px 12px",
                      background: active ? color : "var(--bg-2)",
                      border: `1px solid ${active ? color : "var(--border)"}`,
                      color: active ? "#fff" : color,
                    }}>
              <span className="font-display" style={{ fontSize: 22, lineHeight: 1 }}>{g}</span>
              <span style={{ fontSize: 9, opacity: 0.8 }}>{done}/{gm.length}</span>
            </button>
          )
        })}
        {hasKnockout && (
          <button onClick={() => setActiveFilter("KNOCKOUT")}
                  className="rounded-xl transition-all flex flex-col items-center"
                  style={{
                    minWidth: 56, minHeight: 52, padding: "8px 12px",
                    background: activeFilter === "KNOCKOUT" ? "#FFCD00" : "var(--bg-2)",
                    border: `1px solid ${activeFilter === "KNOCKOUT" ? "#FFCD00" : "var(--border)"}`,
                    color: activeFilter === "KNOCKOUT" ? "#111" : "#FFCD00",
                  }}>
            <span className="font-display" style={{ fontSize: 14, lineHeight: 1 }}>Elim.</span>
            <span style={{ fontSize: 9, opacity: 0.8 }}>{knockoutMatches.filter((m) => predMap[m.id]).length}/{knockoutMatches.length}</span>
          </button>
        )}
      </div>

      {/* Partidas do grupo selecionado */}
      {activeFilter !== "KNOCKOUT" && (
        <div>
          {[1,2,3].map((round) => {
            const ms = groupMatches(activeFilter).filter((m) => m.round === round)
            if (!ms.length) return null
            return (
              <div key={round} className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                       style={{ background: GROUP_COLORS[activeFilter] ?? "#009B3A" }}>
                    {round}
                  </div>
                  <span className="font-heading font-bold uppercase tracking-wider" style={{ fontSize: 12, color: "var(--t2)" }}>
                    Rodada {round} — Grupo {activeFilter}
                  </span>
                </div>
                <div className="space-y-3">
                  {ms.map((m) => (
                    <MatchCard key={m.id} match={m} prediction={predMap[m.id] ?? null}
                               onSave={(id, h, a) => mutation.mutateAsync({ matchId: id, home: h, away: a })} />
                  ))}
                </div>
              </div>
            )
          })}
          {groupMatches(activeFilter).length === 0 && (
            <p className="text-center py-10" style={{ color: "var(--t2)" }}>Nenhuma partida no Grupo {activeFilter}</p>
          )}
        </div>
      )}

      {/* Fases eliminatórias */}
      {activeFilter === "KNOCKOUT" && (
        <div className="space-y-6">
          {STAGE_ORDER.filter((s) => s !== "GROUP_STAGE").map((stage) => {
            const ms = knockoutMatches.filter((m) => m.stage === stage)
            if (!ms.length) return null
            return (
              <div key={stage}>
                <h2 className="font-heading font-black uppercase tracking-wider mb-3"
                    style={{ fontSize: 15, color: "var(--t1)" }}>
                  {stageLabel(stage)}
                </h2>
                <div className="space-y-3">
                  {ms.map((m) => (
                    <MatchCard key={m.id} match={m} prediction={predMap[m.id] ?? null}
                               onSave={(id, h, a) => mutation.mutateAsync({ matchId: id, home: h, away: a })} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
