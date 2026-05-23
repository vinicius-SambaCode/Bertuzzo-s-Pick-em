"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDateTime } from "@/lib/utils"
import { useState } from "react"

const actionLabels: Record<string, string> = {
  USER_CREATE: "👤 Usuário criado",
  USER_UPDATE: "✏️ Usuário atualizado",
  USER_DELETE: "🗑️ Usuário desativado",
  USER_LOGIN: "🔑 Login",
  MATCH_CREATE: "📅 Partida criada",
  MATCH_UPDATE: "✏️ Partida atualizada",
  MATCH_RESULT_SET: "✅ Resultado lançado",
  PREDICTION_CREATE: "⚽ Palpite feito",
  PREDICTION_UPDATE: "✏️ Palpite atualizado",
  POINTS_CALCULATED: "🧮 Pontos calculados",
  FISCAL_REVIEW_CREATE: "🔍 Revisão fiscal",
  PAYMENT_UPDATE: "💰 Pagamento atualizado",
  EMAIL_SENT: "📧 Email enviado",
}

export default function AuditoriaPage() {
  const [skip, setSkip] = useState(0)
  const take = 50

  const { data, isLoading } = useQuery({
    queryKey: ["audit", skip],
    queryFn: () => fetch(`/api/audit?take=${take}&skip=${skip}`).then((r) => r.json()),
  })

  const logs = data?.logs ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Auditoria 🔍</h1>
        <p className="text-text-muted text-sm">{total} registros no total</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1A2540", borderBottom: "1px solid #243354" }}>
                <th className="text-left px-4 py-3 text-text-muted">Ação</th>
                <th className="text-left px-4 py-3 text-text-muted hidden md:table-cell">Usuário</th>
                <th className="text-left px-4 py-3 text-text-muted hidden lg:table-cell">Entidade</th>
                <th className="text-left px-4 py-3 text-text-muted">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-700 transition-colors" style={{ borderBottom: "1px solid #1A2540" }}>
                  <td className="px-4 py-3">
                    <span className="text-text-base">{actionLabels[log.action] ?? log.action}</span>
                    {log.details && (
                      <p className="text-xs text-text-subtle mt-0.5 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-text-muted">{log.user?.name ?? "Sistema"}</span>
                    {log.user && <p className="text-xs text-text-subtle">{log.user.email}</p>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-text-subtle text-xs">{log.entityType}{log.entityId ? ` #${log.entityId.slice(-6)}` : ""}</span>
                  </td>
                  <td className="px-4 py-3 text-text-subtle text-xs">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <p className="text-center text-text-muted py-12">Carregando...</p>}
          {!isLoading && logs.length === 0 && <p className="text-center text-text-muted py-12">Sem registros de auditoria</p>}
        </div>
        {total > take && (
          <div className="flex items-center justify-center gap-3 p-4 border-t" style={{ borderColor: "#243354" }}>
            <button onClick={() => setSkip(Math.max(0, skip - take))} disabled={skip === 0}
                    className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
                    style={{ background: "#243354", color: "#99AABB" }}>← Anterior</button>
            <span className="text-text-muted text-sm">{skip + 1}–{Math.min(skip + take, total)} de {total}</span>
            <button onClick={() => setSkip(skip + take)} disabled={skip + take >= total}
                    className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
                    style={{ background: "#243354", color: "#99AABB" }}>Próximo →</button>
          </div>
        )}
      </div>
    </div>
  )
}
