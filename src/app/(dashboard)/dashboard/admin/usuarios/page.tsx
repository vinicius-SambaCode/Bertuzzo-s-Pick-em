"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { roleLabel, getInitials } from "@/lib/utils"

type User = {
  id: string; name: string; email: string; role: string
  avatarUrl: string | null; isActive: boolean; createdAt: string
  _count: { predictions: number }
}

export default function AdminUsuariosPage() {
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "PLAYER" })

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error)
        return d
      }),
    onSuccess: () => { toast.success("Usuário criado! ✅"); qc.invalidateQueries({ queryKey: ["admin-users"] }); setShowForm(false); setForm({ name: "", email: "", password: "", role: "PLAYER" }) },
    onError: (e: any) => toast.error(e.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) }).then((r) => r.json()),
    onSuccess: () => { toast.success("Usuário atualizado"); qc.invalidateQueries({ queryKey: ["admin-users"] }) },
  })

  const roleChangeMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }).then((r) => r.json()),
    onSuccess: () => { toast.success("Role atualizada!"); qc.invalidateQueries({ queryKey: ["admin-users"] }) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Usuários 👥</h1>
          <p className="text-text-muted text-sm">{users.length} usuários cadastrados</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
                className="px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}>
          + Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 space-y-4">
          <h2 className="font-bold">Adicionar Jogador</h2>
          {[
            { key: "name", label: "Nome", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "password", label: "Senha", type: "password" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm text-text-muted mb-1">{label}</label>
              <input
                type={type} value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none"
                style={{ background: "#1A2540", border: "1px solid #243354" }}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-text-muted mb-1">Role</label>
            <select
              value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-text-base outline-none appearance-none"
              style={{ background: "#1A2540", border: "1px solid #243354" }}
            >
              <option value="PLAYER">Jogador</option>
              <option value="FISCAL">Fiscal</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)}
                    className="px-4 py-2 rounded-xl font-bold text-white text-sm"
                    style={{ background: "linear-gradient(135deg,#007A2D,#009C3B)" }}>
              Criar Usuário
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl font-bold text-sm"
                    style={{ background: "#243354", color: "#99AABB" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1A2540", borderBottom: "1px solid #243354" }}>
                <th className="text-left px-4 py-3 text-text-muted">Usuário</th>
                <th className="text-center px-4 py-3 text-text-muted">Role</th>
                <th className="text-center px-4 py-3 text-text-muted hidden md:table-cell">Palpites</th>
                <th className="text-center px-4 py-3 text-text-muted">Status</th>
                <th className="text-center px-4 py-3 text-text-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-700 transition-colors" style={{ borderBottom: "1px solid #1A2540" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                           style={{ background: "linear-gradient(135deg,#243354,#2D4070)" }}>
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-text-base">{u.name}</p>
                        <p className="text-xs text-text-subtle">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={u.role}
                      onChange={(e) => roleChangeMutation.mutate({ id: u.id, role: e.target.value })}
                      className="text-xs px-2 py-1 rounded-lg outline-none appearance-none"
                      style={{ background: "#243354", color: u.role === "ADMIN" ? "#FFDF00" : u.role === "FISCAL" ? "#60a5fa" : "#4ade80", border: "none" }}
                    >
                      <option value="PLAYER">Jogador</option>
                      <option value="FISCAL">Fiscal</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted hidden md:table-cell">{u._count.predictions}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.isActive ? "text-green-400" : "text-red-400"}`}
                          style={{ background: u.isActive ? "rgba(0,156,59,.2)" : "rgba(239,68,68,.2)" }}>
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMutation.mutate({ id: u.id, isActive: !u.isActive })}
                      className="text-xs px-3 py-1 rounded-lg font-medium"
                      style={{ background: u.isActive ? "rgba(239,68,68,.15)" : "rgba(0,156,59,.15)", color: u.isActive ? "#f87171" : "#4ade80" }}
                    >
                      {u.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
