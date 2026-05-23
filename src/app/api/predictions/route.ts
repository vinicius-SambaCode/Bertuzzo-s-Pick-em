import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { z } from "zod"
import { createAuditLog } from "@/lib/utils"

const schema = z.object({
  matchId:           z.string(),
  homeScorePred:     z.number().int().min(0).max(99),
  awayScorePred:     z.number().int().min(0).max(99),
  penaltyWinnerPred: z.string().optional().nullable(),
})

/** Calcula o prazo limite para palpitar.
 *  Fase de grupos   → até o início da partida (0h antes)
 *  Fases seguintes  → até 2h antes da partida
 */
function getPredictionDeadline(matchDate: Date, stage: string): Date {
  if (stage === "GROUP_STAGE") {
    return matchDate // pode palpitar até o apito inicial
  }
  return new Date(matchDate.getTime() - 2 * 60 * 60 * 1000) // 2h antes
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId  = searchParams.get("userId") ?? session.user.id
  const matchId = searchParams.get("matchId")

  if (userId !== session.user.id && session.user.role === "PLAYER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const predictions = await prisma.prediction.findMany({
    where: {
      ...(userId  ? { userId  } : {}),
      ...(matchId ? { matchId } : {}),
    },
    include: {
      match: {
        include: {
          homeTeam: { select: { name: true, code: true, flagEmoji: true } },
          awayTeam: { select: { name: true, code: true, flagEmoji: true } },
        },
      },
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(predictions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const match = await prisma.match.findUnique({ where: { id: data.matchId } })
    if (!match) return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 })

    if (match.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Esta partida já iniciou ou foi finalizada" }, { status: 400 })
    }

    const deadline = getPredictionDeadline(match.matchDate, match.stage)
    const now = new Date()

    if (now >= deadline) {
      const isGroupStage = match.stage === "GROUP_STAGE"
      const msg = isGroupStage
        ? "Prazo encerrado — palpites fecham no início da partida"
        : "Prazo encerrado — palpites fecham 2 horas antes do jogo"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const prediction = await prisma.prediction.upsert({
      where: { userId_matchId: { userId: session.user.id, matchId: data.matchId } },
      update: {
        homeScorePred:     data.homeScorePred,
        awayScorePred:     data.awayScorePred,
        penaltyWinnerPred: data.penaltyWinnerPred ?? null,
      },
      create: {
        userId:            session.user.id,
        matchId:           data.matchId,
        homeScorePred:     data.homeScorePred,
        awayScorePred:     data.awayScorePred,
        penaltyWinnerPred: data.penaltyWinnerPred ?? null,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: "PREDICTION_CREATE",
      entityType: "Prediction",
      entityId: prediction.id,
      details: { matchId: data.matchId, homeScorePred: data.homeScorePred, awayScorePred: data.awayScorePred },
    })
    return NextResponse.json(prediction, { status: 201 })
  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
