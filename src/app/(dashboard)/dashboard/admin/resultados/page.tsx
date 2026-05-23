"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { formatDateTime, stageLabel } from "@/lib/utils"
import { TeamFlag } from "@/components/TeamFlag"

export default function AdminResultadosPage() {
  const qc = useQueryClient()
  const { data: matches = [] } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetch("/api/matches").then((r) => r.json()),
  })

  const [selected, setSelected] = useState<string | null>(null)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [penaltyWinner, setPenaltyWinner] = useState("")
  const [saving, setSaving] = useState(false)

  const scheduledMatches = matches.filter((m: any) => m.status !== "FINISHED")
  const finishedMatches = matches.filter((m: any) => m.status === "FINISHED")

  async function submitResult() {
    if (!selected) return
    const h = parseInt(homeScore), a = parseInt(awayScore)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { toast.error("Placar inválido"); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/matches/${selected}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore: h, awayScore: a, penaltyWinner: penaltyWinner || null }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(`Resultado registrado! ${data.predictionsUpdated} palpites calculados ✅`)
      qc.invalidateQueries({ queryKey: ["matches"] })
      setSelected(null); setHomeScore(""); setAwayScore(""); setPenaltyWinner("")
    } finally { setSaving(false) }
  }

  const selectedMatch = matches.find((m: any) => m.id === selected)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Lançar Resultados ✅</h1>
        <p className="text-text-muted text-sm">Registre os resultados das partidas e calcule pontos</p>
      </div>

      {/* Pending matches */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-bold mb-4">Partidas Aguardando Resultado</h2>
        {scheduledMatches.length === 0 ? (
          <p className="text-text-muted text-sm">Todas as partidas têm resultado</p>
        ) : (
          <div className="space-y-2">
            {scheduledMatches.map((m: any) => (
              <button
                key={m.id}
                onClick={() => { setSelected(m.id); setHomeScore(""); setAwayScore(""); setPenaltyWinner("") }}
                className={`w-full text-left p-3 rounded-xl transition-all ${selected === m.id ? "ring-1" : "hover:bg-surface-700"}`}
                style={{ background: selected === m.id ? "#243354" : "#1A2540" }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm flex items-center gap-1.5">
                    <TeamFlag code={m.homeTeam?.code} name={m.homeTeam?.name} size="xs" />
                    {m.homeTeam?.name} × {m.awayTeam?.name}
                    <TeamFlag code={m.awayTeam?.code} name={m.awayTeam?.name} size="xs" />
                  </span>
                  <span className="text-xs text-text-subtle">{formatDateTime(m.matchDate)}</span>
                </div>
                <span className="text-xs text-text-muted mt-0.5">{stageLabel(m.stage)}{m.groupName ? ` · Grupo ${m.groupName}` : ""}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result form */}
      {selected && selectedMatch && (
        <div className="glass rounded-xl p-5 space-y-4">
          <h2 className="font-bold">Resultado: {(selectedMatch as any).homeTeam?.name} × {(selectedMatch as any).awayTeam?.name}</h2>
          <div className="flex items-center gap-6 justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TeamFlag code={(selectedMatch as any).homeTeam?.code} name={(selectedMatch as any).homeTeam?.name} size="lg" />
              </div>
              <p className="text-xs text-text-muted mb-2">{(selectedMatch as any).homeTeam?.name}</p>
              <input className="score-input" type="number" min={0} max={99}
                     value={homeScore} onChange={(e) => setHomeScore(e.target.value)} placeholder="0" />
            </div>
            <span className="text-2xl font-bold text-text-muted">×</span>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TeamFlag code={(selectedMatch as any).awayTeam?.code} name={(selectedMatch as any).awayTeam?.name} size="lg" />
              </div>
              <p className="text-xs text-text-muted mb-2">{(selectedMatch as any).awayTeam?.name}</p>
              <input className="score-input" type="number" min={0} max={99}
                     value={awayScore} onChange={(e) => setAwayScore(e.target.value)} placeholder="0" />
            </div>
          </div>
          {(selectedMatch as any).stage !== "GROUP_STAGE" && homeScore === awayScore && homeScore !== "" && (
            <div>
              <label className="block text-sm text-text-muted mb-1.5">Vencedor nos Pênaltis (se empate no 90')</label>
              <select value={penaltyWinner} onChange={(e) => setPenaltyWinner(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none appearance-none"
                      style={{ background: "#1A2540", border: "1px solid #243354" }}>
                <option value="">Sem pênaltis</option>
                <option value={(selectedMatch as any).homeTeam?.code}>{(selectedMatch as any).homeTeam?.flagEmoji} {(selectedMatch as any).homeTeam?.name}</option>
                <option value={(selectedMatch as any).awayTeam?.code}>{(selectedMatch as any).awayTeam?.flagEmoji} {(selectedMatch as any).awayTeam?.name}</option>
              </select>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={submitResult} disabled={saving}
                    className="flex-1 py-3 rounded-xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}>
              {saving ? "Registrando e calculando pontos..." : "✅ Registrar Resultado"}
            </button>
            <button onClick={() => setSelected(null)} className="px-4 py-3 rounded-xl font-bold"
                    style={{ background: "#243354", color: "#99AABB" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Finished matches */}
      {finishedMatches.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h2 className="font-bold mb-4">Partidas Finalizadas ({finishedMatches.length})</h2>
          <div className="space-y-2">
            {finishedMatches.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#1A2540" }}>
                <span className="text-sm flex items-center gap-1.5">
                  <TeamFlag code={m.homeTeam?.code} name={m.homeTeam?.name} size="xs" />
                  {m.homeTeam?.name} × {m.awayTeam?.name}
                  <TeamFlag code={m.awayTeam?.code} name={m.awayTeam?.name} size="xs" />
                </span>
                <span className="font-black text-yellow-400">{m.homeScore}–{m.awayScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
