import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("avatar") as File | null
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })

  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Apenas imagens são aceitas" }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Arquivo muito grande (máx 2MB)" }, { status: 400 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const filename = `${session.user.id}-${Date.now()}.${ext}`
  const uploadsDir = path.join(process.cwd(), "public", "uploads")

  await mkdir(uploadsDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(path.join(uploadsDir, filename), Buffer.from(bytes))

  const avatarUrl = `/uploads/${filename}`
  await prisma.user.update({ where: { id: session.user.id }, data: { avatarUrl } })

  return NextResponse.json({ avatarUrl })
}
