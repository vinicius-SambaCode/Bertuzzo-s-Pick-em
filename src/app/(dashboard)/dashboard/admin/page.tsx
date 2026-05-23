"use client"

import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminPage() {
  const [reseeding, setReseeding] = useState(false)

  async function handleReseed() {
    if (!confirm("⚠️ Isso irá APAGAR todas as partidas e times e recriar com os dados oficiais da Copa 2026.\n\nPalpites existentes também serão removidos!\n\nConfirmar?")) return
    setReseeding(true)
    try {
      const res = await fetch("/api/admin/reseed", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success("✅ Banco reconfigurado com 48 times e 72 jogos da Copa 2026!")
    } catch { toast.error("Erro de conexão") }
    finally { setReseeding(false) }
  }

  const shortcuts = [
    { href: "/dashboard/admin/usuarios", label: "Usuários", icon: "👥", desc: "Gerenciar jogadores e roles" },
    { href: "/dashboard/admin/partidas", label: "Partidas", icon: "📅", desc: "Adicionar partidas avulsas" },
    { href: "/dashboard/admin/resultados", label: "Resultados", icon: "✅", desc: "Lançar placar das partidas" },
    { href: "/dashboard/admin/auditoria", label: "Auditoria", icon: "🔍", desc: "Log de todas as ações" },
    { href: "/dashboard/admin/email", label: "Emails", icon: "📧", desc: "Enviar resultados por email" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Painel Admin 🛠️</h1>
        <p className="text-text-muted text-sm">Controle total do sistema Copa Bertuzzo 2026</p>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href}
                className="glass rounded-xl p-4 hover:bg-surface-700 transition-all group">
            <p className="text-3xl mb-2">{s.icon}</p>
            <p className="font-bold text-text-base group-hover:text-green transition-colors">{s.label}</p>
            <p className="text-xs text-text-subtle mt-0.5">{s.desc}</p>
          </Link>
        ))}
      </div>

      {/* Data management */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h2 className="font-bold text-lg">⚙️ Gerenciamento de Dados</h2>

        <div className="rounded-xl p-4" style={{ background: "#1A2540", border: "1px solid #243354" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-text-base">🔄 Reconfigurar Copa 2026</p>
              <p className="text-text-muted text-sm mt-1">
                Apaga todos os times e partidas e recria com os dados oficiais da FIFA:<br />
                48 seleções confirmadas + 72 partidas da fase de grupos com datas e horários reais.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["48 seleções Grupos A-L","72 partidas","Datas e horários oficiais","Bandeiras e nomes em PT-BR"].map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,156,59,.15)", color: "#4ade80" }}>
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="shrink-0 px-5 py-3 rounded-xl font-bold text-white transition-all"
              style={{ background: reseeding ? "#243354" : "linear-gradient(135deg,#dc2626,#b91c1c)", minWidth: "140px" }}>
              {reseeding ? "Reconfigurando..." : "⚠️ Reconfigurar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
