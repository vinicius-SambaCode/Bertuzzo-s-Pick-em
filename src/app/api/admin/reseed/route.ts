import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { execSync } from "child_process"

export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }
  try {
    execSync("npx tsx prisma/seed.ts --force", { stdio: "pipe", cwd: process.cwd() })
    return NextResponse.json({ ok: true, message: "Banco reconfigurado com dados da Copa 2026" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
