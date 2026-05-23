export type MatchResultInput = {
  homeScore: number
  awayScore: number
  penaltyWinner?: string | null
}

export type PredictionInput = {
  homeScorePred: number
  awayScorePred: number
  penaltyWinnerPred?: string | null
}

export function calculateMatchPoints(
  prediction: PredictionInput,
  result: MatchResultInput
): number {
  const { homeScorePred: ph, awayScorePred: pa } = prediction
  const { homeScore: rh, awayScore: ra } = result

  // Exact score: 10 pts
  if (ph === rh && pa === ra) return 10

  // Same goal difference (implies same result direction): 7 pts
  const predDiff = ph - pa
  const resDiff = rh - ra
  if (predDiff === resDiff) return 7

  // Same result (win/draw/loss): 5 pts
  const predSign = Math.sign(ph - pa)
  const resSign = Math.sign(rh - ra)
  if (predSign === resSign) return 5

  return 0
}

export function calculatePenaltyBonus(
  prediction: PredictionInput,
  result: MatchResultInput
): number {
  if (!prediction.penaltyWinnerPred || !result.penaltyWinner) return 0
  return prediction.penaltyWinnerPred === result.penaltyWinner ? 5 : 0
}

export function getPointsLabel(points: number): string {
  switch (points) {
    case 10: return "Placar exato 🎯"
    case 7:  return "Diferença correta 👍"
    case 5:  return "Resultado correto ✓"
    case 0:  return "Sem pontos"
    default: return `${points} pts`
  }
}

export function getPointsColor(points: number): string {
  if (points === 10) return "text-yellow-400"
  if (points >= 7)  return "text-green-400"
  if (points >= 5)  return "text-blue-400"
  return "text-gray-500"
}

export type RankingEntry = {
  userId: string
  name: string
  avatarUrl: string | null
  totalPoints: number
  exactScores: number
  correctDiffs: number
  correctResults: number
  totalPredictions: number
  avgPredictionTime: number
}

export function buildRanking(entries: RankingEntry[]): (RankingEntry & { position: number })[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores
    return a.avgPredictionTime - b.avgPredictionTime
  })
  return sorted.map((entry, i) => ({ ...entry, position: i + 1 }))
}
