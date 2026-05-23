"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Copa2026Logo } from "@/components/Copa2026Logo"
import { User, Mail, Lock, AtSign, UserPlus } from "lucide-react"

const fields = [
  { key: "username", type: "text",     label: "Login",           icon: AtSign, ph: "meu_login (sem espaços)",
    hint: "Será usado para entrar no sistema. Use letras, números ou _" },
  { key: "name",     type: "text",     label: "Nome Completo",   icon: User,   ph: "Seu nome" },
  { key: "email",    type: "email",    label: "Email",            icon: Mail,   ph: "seu@email.com",
    hint: "Para receber confirmações e resultados dos jogos" },
  { key: "password", type: "password", label: "Senha",            icon: Lock,   ph: "Mínimo 6 caracteres" },
  { key: "confirm",  type: "password", label: "Confirmar Senha",  icon: Lock,   ph: "Repita a senha" },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "", confirm: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error("Senhas não coincidem"); return }
    if (form.password.length < 6) { toast.error("Senha muito curta"); return }
    if (!/^[a-z0-9_]+$/.test(form.username)) {
      toast.error("Login: use apenas letras minúsculas, números ou _")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.toLowerCase().trim(),
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Erro ao criar conta"); return }
      toast.success("Conta criada! Faça login.")
      router.push("/login")
    } catch { toast.error("Erro de conexão") }
    finally { setLoading(false) }
  }

  return (
    <div className="card p-7 sm:p-9">
      <div className="flex flex-col items-center mb-7">
        <Copa2026Logo size="sm" subtitle="Copa Bertuzzo" />
        <p className="font-heading uppercase tracking-wider mt-2"
           style={{ fontSize: 11, color: "var(--t2)" }}>
          Criar Conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, type, label, icon: Icon, ph, ...rest }) => (
          <div key={key}>
            <label className="block font-heading font-bold uppercase tracking-widest mb-1.5"
                   style={{ fontSize: 11, color: "var(--t2)" }}>
              {label}
            </label>
            <div className="relative">
              <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--t3)" }} />
              <input
                type={type} required
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={ph}
                className="input pl-11"
                style={{ fontSize: 16 }}
              />
            </div>
            {"hint" in rest && (
              <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{(rest as any).hint}</p>
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}
                className="btn btn-primary w-full gap-2 mt-1"
                style={{ opacity: loading ? 0.65 : 1 }}>
          {loading ? "Criando conta..." : <><UserPlus size={16} /> Criar Conta</>}
        </button>
      </form>

      <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p style={{ textAlign: "center", color: "var(--t2)", fontSize: 14 }}>
          Já tem conta?{" "}
          <Link href="/login" className="font-heading font-bold uppercase tracking-wider"
                style={{ color: "#009B3A", fontSize: 12 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
