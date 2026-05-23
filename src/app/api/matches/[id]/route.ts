import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { createAuditLog } from "@/lib/utils"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  })
  if (!match) return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 })
  return NextResponse.json(match)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }
  const body = await req.json()
  const match = await prisma.match.update({
    where: { id },
    data: body,
    include: { homeTeam: true, awayTeam: true },
  })
  await createAuditLog({ userId: session.user.id, action: "MATCH_UPDATE", entityType: "Match", entityId: id })
  return NextResponse.json(match)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }
  await prisma.match.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
