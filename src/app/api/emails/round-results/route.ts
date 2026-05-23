import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { sendEmail, roundResultsHtml } from "@/lib/email"
import { createAuditLog } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { round } = await req.json()

  const matches = await prisma.match.findMany({
    where: { round: parseInt(round), status: "FINISHED" },
    include: {
      homeTeam: { select: { name: true, code: true, flagEmoji: true } },
      awayTeam: { select: { name: true, code: true, flagEmoji: true } },
    },
  })

  if (!matches.length) return NextResponse.json({ error: "Nenhuma partida finalizada nesta rodada" }, { status: 400 })

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      predictions: {
        where: { matchId: { in: matches.map((m) => m.id) } },
        select: { matchId: true, homeScorePred: true, awayScorePred: true, points: true },
      },
    },
  })

  const ranking = await fetch(`${process.env.NEXTAUTH_URL}/api/ranking`).then((r) => r.json()).catch(() => [])

  let sent = 0
  let failed = 0

  for (const user of users) {
    const userRank = ranking.find((r: any) => r.userId === user.id)

    const matchData = matches.map((m) => {
      const pred = user.predictions.find((p) => p.matchId === m.id)
      return {
        homeTeam: m.homeTeam.name,
        homeFlag: m.homeTeam.flagEmoji ?? "",
        awayTeam: m.awayTeam.name,
        awayFlag: m.awayTeam.flagEmoji ?? "",
        homeScore: m.homeScore ?? 0,
        awayScore: m.awayScore ?? 0,
        userPrediction: pred ? `${pred.homeScorePred}x${pred.awayScorePred}` : "Sem palpite",
        pointsEarned: pred?.points ?? 0,
      }
    })

    const html = roundResultsHtml({
      userName: user.name,
      roundNumber: round,
      matches: matchData,
      rankPosition: userRank?.position ?? 0,
      totalPoints: userRank?.totalPoints ?? 0,
      appUrl: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    })

    const result = await sendEmail({
      to: user.email,
      subject: `⚽ Copa Bertuzzo 2026 — Resultados Rodada ${round}`,
      html,
    })

    await prisma.emailLog.create({
      data: {
        userId: user.id,
        type: "round_results",
        subject: `Resultados Rodada ${round}`,
        status: result.success ? "sent" : "failed",
        sentAt: result.success ? new Date() : null,
        error: result.success ? null : String(result.error),
      },
    })

    if (result.success) sent++; else failed++
  }

  await createAuditLog({ userId: session.user.id, action: "EMAIL_SENT", entityType: "EmailLog", details: { round, sent, failed } })
  return NextResponse.json({ sent, failed, total: users.length })
}
