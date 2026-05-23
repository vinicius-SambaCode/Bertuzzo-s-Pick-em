import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { calculateMatchPoints, calculatePenaltyBonus } from "@/lib/scoring"
import { createAuditLog } from "@/lib/utils"
import { z } from "zod"

const schema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  penaltyWinner: z.string().optional().nullable(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !["ADMIN", "FISCAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const data = schema.parse(body)

  const match = await prisma.match.update({
    where: { id },
    data: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      penaltyWinner: data.penaltyWinner ?? null,
      status: "FINISHED",
    },
  })

  const predictions = await prisma.prediction.findMany({ where: { matchId: id } })

  let updated = 0
  for (const pred of predictions) {
    const matchPoints = calculateMatchPoints(
      { homeScorePred: pred.homeScorePred, awayScorePred: pred.awayScorePred },
      { homeScore: data.homeScore, awayScore: data.awayScore }
    )
    const penaltyBonus = calculatePenaltyBonus(
      { homeScorePred: pred.homeScorePred, awayScorePred: pred.awayScorePred, penaltyWinnerPred: pred.penaltyWinnerPred },
      { homeScore: data.homeScore, awayScore: data.awayScore, penaltyWinner: data.penaltyWinner }
    )
    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points: matchPoints + penaltyBonus, calculatedAt: new Date() },
    })
    updated++
  }

  await createAuditLog({
    userId: session.user.id,
    action: "MATCH_RESULT_SET",
    entityType: "Match",
    entityId: id,
    details: { homeScore: data.homeScore, awayScore: data.awayScore, predictionsUpdated: updated },
  })

  return NextResponse.json({ match, predictionsUpdated: updated })
}
