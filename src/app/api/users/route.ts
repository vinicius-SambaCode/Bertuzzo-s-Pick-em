import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { z } from "zod"
import { createAuditLog } from "@/lib/utils"

const createSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Use letras minúsculas, números ou _"),
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(["ADMIN", "FISCAL", "PLAYER"]).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      avatarUrl: true, isActive: true, createdAt: true,
      _count: { select: { predictions: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const existingEmail    = await prisma.user.findUnique({ where: { email: data.email } })
    const existingUsername = await prisma.user.findUnique({ where: { username: data.username.toLowerCase() } })
    if (existingEmail)    return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    if (existingUsername) return NextResponse.json({ error: "Nome de login já em uso" }, { status: 400 })

    const session = await auth()
    const role = session?.user.role === "ADMIN" ? (data.role ?? "PLAYER") : "PLAYER"

    const hash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { username: data.username.toLowerCase(), name: data.name, email: data.email, password: hash, role },
      select: { id: true, username: true, name: true, email: true, role: true, createdAt: true },
    })

    // Create financial record
    const feeConfig = await prisma.systemConfig.findUnique({ where: { key: "entry_fee" } })
    const amount = parseFloat(feeConfig?.value ?? "100")
    await prisma.financial.create({ data: { userId: user.id, amount } })

    await createAuditLog({ userId: session?.user.id, action: "USER_CREATE", entityType: "User", entityId: user.id, details: { name: user.name, email: user.email, role } })

    return NextResponse.json(user, { status: 201 })
  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
