import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { createAuditLog } from "@/lib/utils"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const isAdmin = session.user.role === "ADMIN"
  const isSelf = session.user.id === id

  if (!isAdmin && !isSelf) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const updateData: Record<string, any> = {}

  if (body.name) updateData.name = body.name
  if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl

  if (isAdmin) {
    if (body.role) updateData.role = body.role
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive
  }

  if (body.password) {
    if (body.password.length < 6) return NextResponse.json({ error: "Senha muito curta" }, { status: 400 })
    updateData.password = await bcrypt.hash(body.password, 12)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true },
  })

  await createAuditLog({ userId: session.user.id, action: "USER_UPDATE", entityType: "User", entityId: id })
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  await prisma.user.update({ where: { id }, data: { isActive: false } })
  await createAuditLog({ userId: session.user.id, action: "USER_DELETE", entityType: "User", entityId: id })
  return NextResponse.json({ ok: true })
}
