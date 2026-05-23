"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Copa2026Logo } from "@/components/Copa2026Logo"
import { User, Lock, LogIn } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        username: form.username.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      })
      if (res?.error) { toast.error("Login ou senha inválidos"); return }
      toast.success("Bem-vindo à Copa Bertuzzo!")
      router.push(callbackUrl)
      router.refresh()
    } finally { setLoading(false) }
  }

  const fields = [
    { key: "username", type: "text",     label: "Login",  icon: User,  ph: "seu_login" },
    { key: "password", type: "password", label: "Senha",  icon: Lock,  ph: "••••••••" },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ key, type, label, icon: Icon, ph }) => (
        <div key={key}>
          <label className="block font-heading font-bold uppercase tracking-widest mb-2"
                 style={{ fontSize: 11, color: "var(--t2)" }}>
            {label}
          </label>
          <div className="relative">
            <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--t3)" }} />
            <input
              type={type} required autoComplete={key}
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              placeholder={ph}
              className="input pl-11"
              style={{ fontSize: 16 }}
            />
          </div>
        </div>
      ))}

      <button type="submit" disabled={loading}
              className="btn btn-primary w-full gap-2 mt-1"
              style={{ opacity: loading ? 0.65 : 1 }}>
        {loading ? "Entrando..." : <><LogIn size={16} /> Entrar no Bolão</>}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="card p-7 sm:p-9">
      <div className="flex flex-col items-center mb-8">
        <Copa2026Logo size="md" subtitle="Copa Bertuzzo" />
        <p style={{ color: "var(--t2)", fontSize: 13, marginTop: 8, textAlign: "center" }}>
          🇧🇷 Bolão Família Bertuzzo — FIFA 2026
        </p>
      </div>

      <Suspense fallback={
        <div className="h-40 flex items-center justify-center">
          <div className="w-7 h-7 border-2 rounded-full animate-spin"
               style={{ borderColor: "#009B3A", borderTopColor: "transparent" }} />
        </div>
      }>
        <LoginForm />
      </Suspense>

      <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
        <p style={{ textAlign: "center", color: "var(--t2)", fontSize: 14 }}>
          Novo jogador?{" "}
          <Link href="/register"
                className="font-heading font-bold uppercase tracking-wider"
                style={{ color: "#009B3A", fontSize: 12 }}>
            Criar Conta
          </Link>
        </p>
      </div>
    </div>
  )
}
