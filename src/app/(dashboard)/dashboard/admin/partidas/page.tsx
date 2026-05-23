"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { formatDateTime, stageLabel } from "@/lib/utils"
import { TeamFlag } from "@/components/TeamFlag"

type Team = { id: string; name: string; code: string; flagEmoji: string | null }

export default function AdminPartidasPage() {
  const qc = useQueryClient()
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetch("/api/matches").then((r) => r.json()),
  })
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: () => fetch("/api/teams").then((r) => r.json()),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    homeTeamId: "", awayTeamId: "", matchDate: "", venue: "",
    stage: "GROUP_STAGE", groupName: "", round: "1",
  })

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/matches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, round: parseInt(data.round) }) }).then(async (r) => {
        const d = await r.json(); if (!r.ok) throw new Error(d.error); return d
      }),
    onSuccess: () => { toast.success("Partida criada! ⚽"); qc.invalidateQueries({ queryKey: ["matches"] }); setShowForm(false) },
    onError: (e: any) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/matches/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Partida removida"); qc.invalidateQueries({ queryKey: ["matches"] }) },
  })

  const stages = ["GROUP_STAGE","ROUND_OF_32","ROUND_OF_16","QUARTER_FINAL","SEMI_FINAL","THIRD_PLACE","FINAL"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Partidas 📅</h1>
          <p className="text-text-muted text-sm">{matches.length} partidas cadastradas</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
                className="px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}>
          + Nova Partida
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 space-y-4">
          <h2 className="font-bold">Nova Partida</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {["homeTeamId","awayTeamId"].map((key, i) => (
              <div key={key}>
                <label className="block text-sm text-text-muted mb-1">{i === 0 ? "Time da Casa" : "Time Visitante"}</label>
                <select
                  value={(form as any)[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none appearance-none"
                  style={{ background: "#1A2540", border: "1px solid #243354" }}
                >
                  <option value="">Selecione...</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm text-text-muted mb-1">Data/Hora</label>
              <input type="datetime-local" value={form.matchDate}
                     onChange={(e) => setForm((p) => ({ ...p, matchDate: e.target.value }))}
                     className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none"
                     style={{ background: "#1A2540", border: "1px solid #243354", colorScheme: "dark" }} />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Estádio</label>
              <input value={form.venue} onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
                     placeholder="Ex: MetLife Stadium" className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none"
                     style={{ background: "#1A2540", border: "1px solid #243354" }} />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Fase</label>
              <select value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none appearance-none"
                      style={{ background: "#1A2540", border: "1px solid #243354" }}>
                {stages.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
              </select>
            </div>
            {form.stage === "GROUP_STAGE" && (
              <div>
                <label className="block text-sm text-text-muted mb-1">Grupo</label>
                <input value={form.groupName} onChange={(e) => setForm((p) => ({ ...p, groupName: e.target.value }))}
                       placeholder="A, B, C..." className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none"
                       style={{ background: "#1A2540", border: "1px solid #243354" }} />
              </div>
            )}
            <div>
              <label className="block text-sm text-text-muted mb-1">Rodada</label>
              <input type="number" min={1} value={form.round} onChange={(e) => setForm((p) => ({ ...p, round: e.target.value }))}
                     className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none"
                     style={{ background: "#1A2540", border: "1px solid #243354" }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate({ ...form, matchDate: new Date(form.matchDate).toISOString() })}
                    className="px-4 py-2 rounded-xl font-bold text-white text-sm"
                    style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}>
              Criar Partida
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "#243354", color: "#99AABB" }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1A2540", borderBottom: "1px solid #243354" }}>
                <th className="text-left px-4 py-3 text-text-muted">Partida</th>
                <th className="text-center px-4 py-3 text-text-muted hidden md:table-cell">Fase</th>
                <th className="text-center px-4 py-3 text-text-muted">Data</th>
                <th className="text-center px-4 py-3 text-text-muted">Status</th>
                <th className="text-center px-4 py-3 text-text-muted">Ação</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m: any) => (
                <tr key={m.id} className="hover:bg-surface-700" style={{ borderBottom: "1px solid #1A2540" }}>
                  <td className="px-4 py-3">
                    <span className="font-medium flex items-center gap-1.5 flex-wrap">
                      <TeamFlag code={m.homeTeam?.code} name={m.homeTeam?.name} size="sm" />
                      {m.homeTeam?.name} × {m.awayTeam?.name}
                      <TeamFlag code={m.awayTeam?.code} name={m.awayTeam?.name} size="sm" />
                    </span>
                    {(m.homeScore != null) && <span className="ml-2 font-black text-yellow-400">{m.homeScore}-{m.awayScore}</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted hidden md:table-cell text-xs">{stageLabel(m.stage)}{m.groupName ? ` G${m.groupName}` : ""}</td>
                  <td className="px-4 py-3 text-center text-text-muted text-xs">{formatDateTime(m.matchDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "FINISHED" ? "badge-finished" : m.status === "LIVE" ? "badge-live" : "badge-scheduled"}`}>
                      {m.status === "FINISHED" ? "Fim" : m.status === "LIVE" ? "Ao Vivo" : "Ag."}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { if (confirm("Remover partida?")) deleteMutation.mutate(m.id) }}
                            className="text-xs px-3 py-1 rounded-lg" style={{ background: "rgba(239,68,68,.15)", color: "#f87171" }}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {matches.length === 0 && <p className="text-center text-text-muted py-12">Nenhuma partida cadastrada</p>}
        </div>
      </div>
    </div>
  )
}
