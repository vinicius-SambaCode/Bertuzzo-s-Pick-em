"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function AdminEmailPage() {
  const [round, setRound] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)

  async function sendEmails() {
    if (!round) { toast.error("Informe o número da rodada"); return }
    setSending(true)
    setResult(null)
    try {
      const res = await fetch("/api/emails/round-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: parseInt(round) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setResult(data)
      toast.success(`Emails enviados: ${data.sent}/${data.total} ✅`)
    } finally { setSending(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black">Enviar Emails 📧</h1>
        <p className="text-text-muted text-sm">Notifique todos os jogadores com os resultados da rodada</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-5">
        <div className="p-4 rounded-xl" style={{ background: "#1A2540", border: "1px solid #243354" }}>
          <h3 className="font-bold text-sm mb-2">ℹ️ O email incluirá:</h3>
          <ul className="text-text-muted text-sm space-y-1">
            <li>• Resultados de todas as partidas da rodada</li>
            <li>• Seus palpites e pontos ganhos em cada jogo</li>
            <li>• Posição atual no ranking</li>
            <li>• Total de pontos acumulados</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Número da Rodada</label>
          <input
            type="number" min={1} value={round} onChange={(e) => setRound(e.target.value)}
            placeholder="Ex: 1"
            className="w-full px-4 py-3 rounded-xl text-text-base outline-none"
            style={{ background: "#1A2540", border: "1px solid #243354" }}
          />
          <p className="text-xs text-text-subtle mt-1">Apenas partidas FINALIZADAS desta rodada serão incluídas</p>
        </div>

        <button
          onClick={sendEmails} disabled={sending}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ background: sending ? "#243354" : "linear-gradient(135deg,#002776,#009C3B)" }}
        >
          {sending ? "Enviando emails..." : "📧 Enviar Emails da Rodada"}
        </button>

        {result && (
          <div className="rounded-xl p-4" style={{ background: "rgba(0,156,59,.1)", border: "1px solid rgba(0,156,59,.3)" }}>
            <p className="font-bold text-green-400 mb-2">Resultado do Envio</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-black text-green-400">{result.sent}</p>
                <p className="text-xs text-text-muted">Enviados</p>
              </div>
              <div>
                <p className="text-2xl font-black text-red-400">{result.failed}</p>
                <p className="text-xs text-text-muted">Falhas</p>
              </div>
              <div>
                <p className="text-2xl font-black text-text-base">{result.total}</p>
                <p className="text-xs text-text-muted">Total</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
