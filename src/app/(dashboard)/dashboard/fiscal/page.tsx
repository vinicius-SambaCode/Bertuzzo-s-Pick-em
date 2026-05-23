"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { formatDateTime, stageLabel } from "@/lib/utils"
import { TeamFlag } from "@/components/TeamFlag"

export default function FiscalPage() {
  const qc = useQueryClient()
  const { data: matches = [] } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetch("/api/matches").then((r) => r.json()),
  })
  const { data: reviews = [] } = useQuery({
    queryKey: ["fiscal-reviews"],
    queryFn: () => fetch("/api/fiscal").then((r) => r.json()),
  })

  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState("approved")
  const [notes, setNotes] = useState("")

  const mutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/fiscal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => {
      toast.success("Revisão registrada! ✅")
      qc.invalidateQueries({ queryKey: ["fiscal-reviews"] })
      setSelected(null); setNotes("")
    },
  })

  const finishedMatches = matches.filter((m: any) => m.status === "FINISHED")
  const reviewMap = Object.fromEntries((reviews as any[]).map((r: any) => [r.matchId, r]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Painel Fiscal 🔍</h1>
        <p className="text-text-muted text-sm">Revise e audite os resultados lançados</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Partidas Finalizadas", value: finishedMatches.length, color: "#009C3B" },
          { label: "Revisadas", value: (reviews as any[]).filter((r: any) => r.status === "approved").length, color: "#FFDF00" },
          { label: "Sinalizadas", value: (reviews as any[]).filter((r: any) => r.status === "flagged").length, color: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-text-muted text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="font-bold mb-4">Partidas para Revisão</h2>
        {finishedMatches.length === 0 ? (
          <p className="text-text-muted text-sm">Nenhuma partida finalizada para revisar</p>
        ) : (
          <div className="space-y-2">
            {finishedMatches.map((m: any) => {
              const review = reviewMap[m.id]
              return (
                <div key={m.id} className="p-4 rounded-xl" style={{ background: "#1A2540" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium flex items-center gap-1.5 flex-wrap">
                        <TeamFlag code={m.homeTeam?.code} name={m.homeTeam?.name} size="sm" />
                        {m.homeTeam?.name}
                        <span className="font-black text-yellow-400">{m.homeScore}–{m.awayScore}</span>
                        {m.awayTeam?.name}
                        <TeamFlag code={m.awayTeam?.code} name={m.awayTeam?.name} size="sm" />
                      </p>
                      <p className="text-xs text-text-subtle mt-0.5">{stageLabel(m.stage)} • {formatDateTime(m.matchDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {review && (
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${review.status === "approved" ? "text-green-400" : "text-red-400"}`}
                              style={{ background: review.status === "approved" ? "rgba(0,156,59,.2)" : "rgba(239,68,68,.2)" }}>
                          {review.status === "approved" ? "✅ Aprovado" : "🚩 Sinalizado"}
                        </span>
                      )}
                      <button onClick={() => setSelected(selected === m.id ? null : m.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold"
                              style={{ background: "rgba(0,156,59,.2)", color: "#4ade80" }}>
                        {selected === m.id ? "Cancelar" : "Revisar"}
                      </button>
                    </div>
                  </div>
                  {selected === m.id && (
                    <div className="mt-4 space-y-3 border-t pt-3" style={{ borderColor: "#243354" }}>
                      <div className="flex gap-3">
                        {["approved","flagged"].map((s) => (
                          <button key={s} onClick={() => setStatus(s)}
                                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                                  style={{ background: status === s ? (s === "approved" ? "#009C3B" : "#dc2626") : "#243354", color: "#fff" }}>
                            {s === "approved" ? "✅ Aprovar" : "🚩 Sinalizar"}
                          </button>
                        ))}
                      </div>
                      <input value={notes} onChange={(e) => setNotes(e.target.value)}
                             placeholder="Observações (opcional)"
                             className="w-full px-3 py-2 rounded-xl text-text-base text-sm outline-none"
                             style={{ background: "#243354", border: "1px solid #2D4070" }} />
                      <button onClick={() => mutation.mutate({ matchId: m.id, status, notes })}
                              className="w-full py-2 rounded-xl font-bold text-white text-sm"
                              style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}>
                        Registrar Revisão
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
