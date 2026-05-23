import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { createAuditLog } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session || !["ADMIN","FISCAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const [financials, config] = await Promise.all([
    prisma.financial.findMany({
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.systemConfig.findMany({ where: { key: { in: ["entry_fee","prize_1st_percent","prize_2nd_percent","prize_3rd_percent"] } } }),
  ])

  const configMap = Object.fromEntries(config.map((c) => [c.key, c.value]))
  const totalPot = financials.filter((f) => f.paymentStatus === "PAID").reduce((sum, f) => sum + Number(f.amount), 0)
  const totalPending = financials.filter((f) => f.paymentStatus === "PENDING").reduce((sum, f) => sum + Number(f.amount), 0)

  return NextResponse.json({ financials, config: configMap, totalPot, totalPending })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const record = await prisma.financial.create({
    data: { userId: body.userId, amount: body.amount, notes: body.notes, paymentStatus: body.paymentStatus ?? "PENDING" },
    include: { user: { select: { id: true, name: true } } },
  })
  return NextResponse.json(record, { status: 201 })
}
