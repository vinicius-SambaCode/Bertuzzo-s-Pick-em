import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { z } from "zod"
import { createAuditLog } from "@/lib/utils"

const createSchema = z.object({
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  matchDate: z.string().datetime(),
  venue: z.string().optional(),
  stage: z.enum(["GROUP_STAGE","ROUND_OF_32","ROUND_OF_16","QUARTER_FINAL","SEMI_FINAL","THIRD_PLACE","FINAL"]),
  groupName: z.string().optional(),
  round: z.number().int().min(1),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage")
  const status = searchParams.get("status")
  const round = searchParams.get("round")

  const matches = await prisma.match.findMany({
    where: {
      ...(stage ? { stage: stage as any } : {}),
      ...(status ? { status: status as any } : {}),
      ...(round ? { round: parseInt(round) } : {}),
    },
    include: {
      homeTeam: { select: { id: true, name: true, code: true, flagEmoji: true } },
      awayTeam: { select: { id: true, name: true, code: true, flagEmoji: true } },
      _count: { select: { predictions: true } },
    },
    orderBy: { matchDate: "asc" },
  })
  return NextResponse.json(matches)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }
  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    if (data.homeTeamId === data.awayTeamId) {
      return NextResponse.json({ error: "Times não podem ser iguais" }, { status: 400 })
    }
    const match = await prisma.match.create({
      data: { ...data, matchDate: new Date(data.matchDate) },
      include: {
        homeTeam: { select: { name: true, code: true, flagEmoji: true } },
        awayTeam: { select: { name: true, code: true, flagEmoji: true } },
      },
    })
    await createAuditLog({ userId: session.user.id, action: "MATCH_CREATE", entityType: "Match", entityId: match.id })
    return NextResponse.json(match, { status: 201 })
  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
