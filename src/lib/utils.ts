import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
}

export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

export function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: "Fase de Grupos",
    ROUND_OF_32: "Oitavas de Final",
    ROUND_OF_16: "Dezesseis-avos",
    QUARTER_FINAL: "Quartas de Final",
    SEMI_FINAL: "Semifinal",
    THIRD_PLACE: "3º Lugar",
    FINAL: "Final",
  }
  return map[stage] ?? stage
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: "Agendado", LIVE: "Ao Vivo", FINISHED: "Finalizado", CANCELLED: "Cancelado",
  }
  return map[status] ?? status
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = { ADMIN: "Administrador", FISCAL: "Fiscal", PLAYER: "Jogador" }
  return map[role] ?? role
}

export function paymentLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pendente", PAID: "Pago", OVERDUE: "Atrasado", WAIVED: "Isento",
  }
  return map[status] ?? status
}

export function paymentColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "text-yellow-400", PAID: "text-green-400",
    OVERDUE: "text-red-400", WAIVED: "text-blue-400",
  }
  return map[status] ?? "text-gray-400"
}

export async function createAuditLog(params: {
  userId?: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
}) {
  try {
    const { prisma } = await import("@/lib/db")
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action as any,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details as any,
      },
    })
  } catch {}
}
