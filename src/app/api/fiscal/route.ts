import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { createAuditLog } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session || !["ADMIN","FISCAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const reviews = await prisma.fiscalReview.findMany({
    include: {
      fiscal: { select: { name: true, email: true } },
      match: {
        include: {
          homeTeam: { select: { name: true, flagEmoji: true } },
          awayTeam: { select: { name: true, flagEmoji: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !["ADMIN","FISCAL"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const review = await prisma.fiscalReview.upsert({
    where: { fiscalId_matchId: { fiscalId: session.user.id, matchId: body.matchId } },
    update: { status: body.status, notes: body.notes },
    create: { fiscalId: session.user.id, matchId: body.matchId, status: body.status, notes: body.notes },
  })
  await createAuditLog({ userId: session.user.id, action: "FISCAL_REVIEW_CREATE", entityType: "FiscalReview", entityId: review.id, details: { matchId: body.matchId, status: body.status } })
  return NextResponse.json(review, { status: 201 })
}
