import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
  const teams = await prisma.team.findMany({ orderBy: [{ continent: "asc" }, { name: "asc" }] })
  return NextResponse.json(teams)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  const body = await req.json()
  const { id, ...data } = body
  const team = await prisma.team.update({ where: { id }, data })
  return NextResponse.json(team)
}
