import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { createAuditLog } from "@/lib/utils"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const record = await prisma.financial.update({
    where: { id },
    data: {
      paymentStatus: body.paymentStatus,
      paidAt: body.paymentStatus === "PAID" ? new Date() : null,
      notes: body.notes,
    },
    include: { user: { select: { name: true } } },
  })
  await createAuditLog({ userId: session.user.id, action: "PAYMENT_UPDATE", entityType: "Financial", entityId: id, details: { paymentStatus: body.paymentStatus } })
  return NextResponse.json(record)
}
