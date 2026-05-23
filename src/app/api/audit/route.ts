import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const take = parseInt(searchParams.get("take") ?? "50")
  const skip = parseInt(searchParams.get("skip") ?? "0")

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      take,
      skip,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count(),
  ])

  return NextResponse.json({ logs, total })
}
