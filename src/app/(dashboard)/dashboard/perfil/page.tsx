"use client"

import { useSession } from "next-auth/react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { getInitials, roleLabel } from "@/lib/utils"

export default function PerfilPage() {
  const { data: session, update } = useSession()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(session?.user.name ?? "")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function saveProfile() {
    if (!name.trim()) { toast.error("Nome obrigatório"); return }
    if (password && password.length < 6) { toast.error("Senha muito curta"); return }
    if (password && password !== confirm) { toast.error("Senhas não coincidem"); return }

    setSaving(true)
    try {
      const body: any = { name }
      if (password) body.password = password

      const res = await fetch(`/api/users/${session?.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      await update({ name })
      toast.success("Perfil atualizado! ✅")
      setPassword(""); setConfirm("")
    } finally { setSaving(false) }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("avatar", file)
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      await update({ avatarUrl: data.avatarUrl })
      toast.success("Avatar atualizado! 🖼️")
    } finally { setUploading(false) }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black">Meu Perfil 👤</h1>
        <p className="text-text-muted text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold"
                 style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)", color: "#fff" }}>
              {session?.user.avatarUrl
                ? <img src={session.user.avatarUrl} alt="" className="w-20 h-20 object-cover" />
                : getInitials(session?.user.name ?? "U")}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: "#009C3B", border: "2px solid #0A0F1E" }}
              disabled={uploading}
            >
              {uploading ? "..." : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="font-bold text-lg text-text-base">{session?.user.name}</p>
            <p className="text-text-muted text-sm">{session?.user.email}</p>
            <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "rgba(0,156,59,.2)", color: "#4ade80" }}>
              {roleLabel(session?.user.role ?? "PLAYER")}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h2 className="font-bold">Dados Pessoais</h2>
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Nome completo</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-text-base outline-none transition-all"
            style={{ background: "#1A2540", border: "1px solid #243354" }}
            onFocus={(e) => (e.target.style.borderColor = "#009C3B")}
            onBlur={(e) => (e.target.style.borderColor = "#243354")}
          />
        </div>

        <h2 className="font-bold pt-2">Alterar Senha</h2>
        {(["Nova Senha", "Confirmar Nova Senha"] as const).map((label, i) => (
          <div key={label}>
            <label className="block text-sm text-text-muted mb-1.5">{label}</label>
            <input
              type="password" placeholder="Deixe em branco para não alterar"
              value={i === 0 ? password : confirm}
              onChange={(e) => i === 0 ? setPassword(e.target.value) : setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-text-base placeholder-text-subtle outline-none transition-all"
              style={{ background: "#1A2540", border: "1px solid #243354" }}
              onFocus={(e) => (e.target.style.borderColor = "#009C3B")}
              onBlur={(e) => (e.target.style.borderColor = "#243354")}
            />
          </div>
        ))}

        <button
          onClick={saveProfile} disabled={saving}
          className="w-full py-3 rounded-xl font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  )
}
