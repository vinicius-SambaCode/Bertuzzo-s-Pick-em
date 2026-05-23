import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { buildRanking } from "@/lib/scoring"

export async function GET() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      predictions: {
        where: { points: { not: null } },
        select: { points: true, createdAt: true },
      },
      tournamentPrediction: {
        select: { championPoints: true, topScorerPoints: true },
      },
    },
  })

  const entries = users.map((user) => {
    const matchPoints = user.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0)
    const tourPoints = (user.tournamentPrediction?.championPoints ?? 0) + (user.tournamentPrediction?.topScorerPoints ?? 0)
    const totalPoints = matchPoints + tourPoints

    const exactScores = user.predictions.filter((p) => p.points === 10).length
    const correctDiffs = user.predictions.filter((p) => p.points === 7).length
    const correctResults = user.predictions.filter((p) => p.points === 5).length
    const totalPredictions = user.predictions.length

    const times = user.predictions.map((p) => new Date(p.createdAt).getTime())
    const avgPredictionTime = times.length ? times.reduce((a, b) => a + b, 0) / times.length : Date.now()

    return {
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      totalPoints,
      exactScores,
      correctDiffs,
      correctResults,
      totalPredictions,
      avgPredictionTime,
    }
  })

  const ranked = buildRanking(entries)
  return NextResponse.json(ranked)
}
