import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const pred = await prisma.tournamentPrediction.findUnique({
    where: { userId: session.user.id },
    include: {
      champion: { select: { id: true, name: true, code: true, flagEmoji: true } },
      topScorerTeam: { select: { id: true, name: true, code: true, flagEmoji: true } },
    },
  })
  return NextResponse.json(pred)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const pred = await prisma.tournamentPrediction.upsert({
    where: { userId: session.user.id },
    update: {
      championTeamId: body.championTeamId ?? null,
      topScorerName: body.topScorerName ?? null,
      topScorerTeamId: body.topScorerTeamId ?? null,
    },
    create: {
      userId: session.user.id,
      championTeamId: body.championTeamId ?? null,
      topScorerName: body.topScorerName ?? null,
      topScorerTeamId: body.topScorerTeamId ?? null,
    },
    include: {
      champion: { select: { name: true, code: true, flagEmoji: true } },
      topScorerTeam: { select: { name: true, code: true, flagEmoji: true } },
    },
  })
  return NextResponse.json(pred)
}
