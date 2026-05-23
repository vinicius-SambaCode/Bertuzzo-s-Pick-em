"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { formatCurrency, formatDate, paymentLabel, paymentColor } from "@/lib/utils"

type Financial = {
  id: string
  amount: string
  paymentStatus: string
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  user: { id: string; name: string; email: string; avatarUrl: string | null }
}

type FinancialData = {
  financials: Financial[]
  config: Record<string, string>
  totalPot: number
  totalPending: number
}

export default function FinanceiroPage() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const isAdmin = session?.user.role === "ADMIN"

  const { data, isLoading, error } = useQuery<FinancialData>({
    queryKey: ["financial"],
    queryFn: () => fetch("/api/financial").then((r) => r.json()),
    enabled: !!session && ["ADMIN","FISCAL"].includes(session.user.role ?? ""),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
      fetch(`/api/financial/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      }).then((r) => r.json()),
    onSuccess: () => { toast.success("Pagamento atualizado!"); qc.invalidateQueries({ queryKey: ["financial"] }) },
    onError: () => toast.error("Erro ao atualizar"),
  })

  if (!session || (session.user.role === "PLAYER")) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <p className="text-4xl mb-4">💰</p>
        <h2 className="text-xl font-bold text-text-base">Painel Financeiro</h2>
        <p className="text-text-muted mt-2">Apenas Administradores e Fiscais têm acesso ao financeiro.</p>
      </div>
    )
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totals = [
    { label: "Arrecadado", value: formatCurrency(data?.totalPot ?? 0), color: "#009C3B" },
    { label: "Pendente", value: formatCurrency(data?.totalPending ?? 0), color: "#FFDF00" },
    { label: "Total (100%)", value: formatCurrency((data?.totalPot ?? 0) + (data?.totalPending ?? 0)), color: "#E8F0FF" },
    { label: "1º Lugar (60%)", value: formatCurrency((data?.totalPot ?? 0) * 0.6), color: "#C5A028" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Financeiro 💰</h1>
        <p className="text-text-muted text-sm mt-1">Controle de apostas e pagamentos do bolão</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {totals.map((t) => (
          <div key={t.label} className="glass rounded-xl p-4">
            <p className="text-text-subtle text-xs uppercase tracking-wider">{t.label}</p>
            <p className="text-xl font-black mt-1" style={{ color: t.color }}>{t.value}</p>
          </div>
        ))}
      </div>

      {/* Prize distribution */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2">🏆 Premiação</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { pos: "1º", pct: "60%", color: "#FFDF00", medal: "🥇", val: (data?.totalPot ?? 0) * 0.6 },
            { pos: "2º", pct: "30%", color: "#C0C0C0", medal: "🥈", val: (data?.totalPot ?? 0) * 0.3 },
            { pos: "3º", pct: "10%", color: "#CD7F32", medal: "🥉", val: (data?.totalPot ?? 0) * 0.1 },
          ].map((p) => (
            <div key={p.pos} className="rounded-xl p-4 text-center" style={{ background: "#1A2540" }}>
              <p className="text-3xl">{p.medal}</p>
              <p className="font-black text-lg mt-1" style={{ color: p.color }}>{p.pct}</p>
              <p className="text-sm font-bold text-text-base mt-0.5">{formatCurrency(p.val)}</p>
              <p className="text-xs text-text-subtle">{p.pos} lugar</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payments table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: "#243354" }}>
          <h2 className="font-bold">Situação dos Pagamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1A2540" }}>
                <th className="text-left px-4 py-3 text-text-muted">Jogador</th>
                <th className="text-center px-4 py-3 text-text-muted">Valor</th>
                <th className="text-center px-4 py-3 text-text-muted">Status</th>
                <th className="text-center px-4 py-3 text-text-muted hidden sm:table-cell">Data Pagamento</th>
                {isAdmin && <th className="text-center px-4 py-3 text-text-muted">Ação</th>}
              </tr>
            </thead>
            <tbody>
              {(data?.financials ?? []).map((f) => (
                <tr key={f.id} className="hover:bg-surface-700 transition-colors" style={{ borderBottom: "1px solid #1A2540" }}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-text-base">{f.user.name}</span>
                    <p className="text-xs text-text-subtle">{f.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{formatCurrency(parseFloat(f.amount))}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${paymentColor(f.paymentStatus)}`}
                          style={{ background: "rgba(255,255,255,.05)" }}>
                      {paymentLabel(f.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">
                    {f.paidAt ? formatDate(f.paidAt) : "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-center">
                      {f.paymentStatus !== "PAID" && (
                        <button
                          onClick={() => updateMutation.mutate({ id: f.id, paymentStatus: "PAID" })}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white"
                          style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}
                        >
                          Marcar Pago
                        </button>
                      )}
                      {f.paymentStatus === "PAID" && (
                        <span className="text-xs text-green-400">✅ Pago</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
