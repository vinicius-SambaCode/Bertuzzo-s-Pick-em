import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()
const force = process.argv.includes("--force")

// Convert Brazilian Standard Time (UTC-3) to UTC
function brt(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  const utcH = h + 3
  if (utcH >= 24) {
    return new Date(Date.UTC(y, m - 1, d + 1, utcH - 24, min))
  }
  return new Date(Date.UTC(y, m - 1, d, utcH, min))
}

// All 48 confirmed Copa do Mundo 2026 teams
const teams = [
  // GROUP A
  { name: "México", code: "MEX", flagEmoji: "🇲🇽", group: "A", continent: "CONCACAF" },
  { name: "África do Sul", code: "RSA", flagEmoji: "🇿🇦", group: "A", continent: "CAF" },
  { name: "Coreia do Sul", code: "KOR", flagEmoji: "🇰🇷", group: "A", continent: "AFC" },
  { name: "República Tcheca", code: "CZE", flagEmoji: "🇨🇿", group: "A", continent: "UEFA" },
  // GROUP B
  { name: "Canadá", code: "CAN", flagEmoji: "🇨🇦", group: "B", continent: "CONCACAF" },
  { name: "Bósnia-Herzegovina", code: "BIH", flagEmoji: "🇧🇦", group: "B", continent: "UEFA" },
  { name: "Qatar", code: "QAT", flagEmoji: "🇶🇦", group: "B", continent: "AFC" },
  { name: "Suíça", code: "SUI", flagEmoji: "🇨🇭", group: "B", continent: "UEFA" },
  // GROUP C
  { name: "Brasil", code: "BRA", flagEmoji: "🇧🇷", group: "C", continent: "CONMEBOL" },
  { name: "Marrocos", code: "MAR", flagEmoji: "🇲🇦", group: "C", continent: "CAF" },
  { name: "Haiti", code: "HAI", flagEmoji: "🇭🇹", group: "C", continent: "CONCACAF" },
  { name: "Escócia", code: "SCO", flagEmoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", continent: "UEFA" },
  // GROUP D
  { name: "Estados Unidos", code: "USA", flagEmoji: "🇺🇸", group: "D", continent: "CONCACAF" },
  { name: "Paraguai", code: "PAR", flagEmoji: "🇵🇾", group: "D", continent: "CONMEBOL" },
  { name: "Austrália", code: "AUS", flagEmoji: "🇦🇺", group: "D", continent: "AFC" },
  { name: "Turquia", code: "TUR", flagEmoji: "🇹🇷", group: "D", continent: "UEFA" },
  // GROUP E
  { name: "Alemanha", code: "GER", flagEmoji: "🇩🇪", group: "E", continent: "UEFA" },
  { name: "Curaçao", code: "CUW", flagEmoji: "🇨🇼", group: "E", continent: "CONCACAF" },
  { name: "Costa do Marfim", code: "CIV", flagEmoji: "🇨🇮", group: "E", continent: "CAF" },
  { name: "Equador", code: "ECU", flagEmoji: "🇪🇨", group: "E", continent: "CONMEBOL" },
  // GROUP F
  { name: "Holanda", code: "NED", flagEmoji: "🇳🇱", group: "F", continent: "UEFA" },
  { name: "Japão", code: "JPN", flagEmoji: "🇯🇵", group: "F", continent: "AFC" },
  { name: "Suécia", code: "SWE", flagEmoji: "🇸🇪", group: "F", continent: "UEFA" },
  { name: "Tunísia", code: "TUN", flagEmoji: "🇹🇳", group: "F", continent: "CAF" },
  // GROUP G
  { name: "Bélgica", code: "BEL", flagEmoji: "🇧🇪", group: "G", continent: "UEFA" },
  { name: "Egito", code: "EGY", flagEmoji: "🇪🇬", group: "G", continent: "CAF" },
  { name: "Irã", code: "IRN", flagEmoji: "🇮🇷", group: "G", continent: "AFC" },
  { name: "Nova Zelândia", code: "NZL", flagEmoji: "🇳🇿", group: "G", continent: "OFC" },
  // GROUP H
  { name: "Espanha", code: "ESP", flagEmoji: "🇪🇸", group: "H", continent: "UEFA" },
  { name: "Cabo Verde", code: "CPV", flagEmoji: "🇨🇻", group: "H", continent: "CAF" },
  { name: "Arábia Saudita", code: "KSA", flagEmoji: "🇸🇦", group: "H", continent: "AFC" },
  { name: "Uruguai", code: "URU", flagEmoji: "🇺🇾", group: "H", continent: "CONMEBOL" },
  // GROUP I
  { name: "França", code: "FRA", flagEmoji: "🇫🇷", group: "I", continent: "UEFA" },
  { name: "Senegal", code: "SEN", flagEmoji: "🇸🇳", group: "I", continent: "CAF" },
  { name: "Iraque", code: "IRQ", flagEmoji: "🇮🇶", group: "I", continent: "AFC" },
  { name: "Noruega", code: "NOR", flagEmoji: "🇳🇴", group: "I", continent: "UEFA" },
  // GROUP J
  { name: "Argentina", code: "ARG", flagEmoji: "🇦🇷", group: "J", continent: "CONMEBOL" },
  { name: "Argélia", code: "ALG", flagEmoji: "🇩🇿", group: "J", continent: "CAF" },
  { name: "Áustria", code: "AUT", flagEmoji: "🇦🇹", group: "J", continent: "UEFA" },
  { name: "Jordânia", code: "JOR", flagEmoji: "🇯🇴", group: "J", continent: "AFC" },
  // GROUP K
  { name: "Portugal", code: "POR", flagEmoji: "🇵🇹", group: "K", continent: "UEFA" },
  { name: "Congo DR", code: "COD", flagEmoji: "🇨🇩", group: "K", continent: "CAF" },
  { name: "Uzbequistão", code: "UZB", flagEmoji: "🇺🇿", group: "K", continent: "AFC" },
  { name: "Colômbia", code: "COL", flagEmoji: "🇨🇴", group: "K", continent: "CONMEBOL" },
  // GROUP L
  { name: "Inglaterra", code: "ENG", flagEmoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", continent: "UEFA" },
  { name: "Croácia", code: "CRO", flagEmoji: "🇭🇷", group: "L", continent: "UEFA" },
  { name: "Gana", code: "GHA", flagEmoji: "🇬🇭", group: "L", continent: "CAF" },
  { name: "Panamá", code: "PAN", flagEmoji: "🇵🇦", group: "L", continent: "CONCACAF" },
]

const systemConfigs = [
  { key: "entry_fee", value: "100.00", description: "Taxa de participação (R$)" },
  { key: "prize_1st_percent", value: "60", description: "% 1º lugar" },
  { key: "prize_2nd_percent", value: "30", description: "% 2º lugar" },
  { key: "prize_3rd_percent", value: "10", description: "% 3º lugar" },
  { key: "bonus_champion_points", value: "15", description: "Pts por campeão" },
  { key: "bonus_top_scorer_points", value: "10", description: "Pts por artilheiro" },
  { key: "bonus_penalty_points", value: "5", description: "Pts por pênaltis" },
  { key: "tournament_name", value: "Copa Bertuzzo 2026", description: "Nome do torneio" },
]

async function main() {
  console.log("🌱 Iniciando seed Copa Bertuzzo 2026...")

  if (force) {
    console.log("⚠️  Modo FORCE: limpando dados existentes...")
    await prisma.emailLog.deleteMany()
    await prisma.fiscalReview.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.prediction.deleteMany()
    await prisma.tournamentPrediction.deleteMany()
    await prisma.match.deleteMany()
    await prisma.team.deleteMany()
    await prisma.systemConfig.deleteMany()
    await prisma.financial.deleteMany()
    console.log("✅ Dados limpos")
  } else {
    const existing = await prisma.team.count()
    if (existing > 0) {
      console.log(`✅ Seed já realizado (${existing} times). Use --force para recriar.`)
      return
    }
  }

  // ── TEAMS ──────────────────────────────────────────────
  console.log("⚽ Inserindo 48 seleções...")
  const teamMap: Record<string, string> = {}
  for (const t of teams) {
    const created = await prisma.team.create({ data: t })
    teamMap[t.code] = created.id
  }
  console.log(`✅ ${teams.length} seleções inseridas`)

  // ── SYSTEM CONFIG ──────────────────────────────────────
  for (const c of systemConfigs) {
    await prisma.systemConfig.upsert({ where: { key: c.key }, update: {}, create: c })
  }
  console.log("✅ Configurações do sistema criadas")

  // Helper
  const match = (home: string, away: string, date: string, time: string, venue: string, group: string, round: number) => ({
    homeTeamId: teamMap[home],
    awayTeamId: teamMap[away],
    matchDate: brt(date, time),
    venue,
    stage: "GROUP_STAGE" as const,
    groupName: group,
    round,
  })

  // ── 72 GROUP STAGE MATCHES ─────────────────────────────
  console.log("📅 Inserindo 72 partidas da fase de grupos...")

  const matches = [
    // ── RODADA 1 ──────────────────────────────────────────
    // Group A
    match("MEX","RSA","2026-06-11","16:00","Cidade do México","A",1),
    match("KOR","CZE","2026-06-11","23:00","Guadalajara","A",1),
    // Group B
    match("CAN","BIH","2026-06-12","16:00","Toronto","B",1),
    match("QAT","SUI","2026-06-13","16:00","Área da Baía de São Francisco","B",1),
    // Group C
    match("BRA","MAR","2026-06-13","19:00","Nova York/Nova Jersey","C",1),
    match("HAI","SCO","2026-06-13","22:00","Boston","C",1),
    // Group D
    match("USA","PAR","2026-06-12","22:00","Los Angeles","D",1),
    match("AUS","TUR","2026-06-14","01:00","Vancouver","D",1),
    // Group E
    match("GER","CUW","2026-06-14","14:00","Houston","E",1),
    match("CIV","ECU","2026-06-14","20:00","Filadélfia","E",1),
    // Group F
    match("NED","JPN","2026-06-14","17:00","Dallas","F",1),
    match("SWE","TUN","2026-06-14","23:00","Monterrey","F",1),
    // Group G
    match("BEL","EGY","2026-06-15","16:00","Seattle","G",1),
    match("IRN","NZL","2026-06-15","22:00","Los Angeles","G",1),
    // Group H
    match("ESP","CPV","2026-06-15","13:00","Atlanta","H",1),
    match("KSA","URU","2026-06-15","19:00","Miami","H",1),
    // Group I
    match("FRA","SEN","2026-06-16","16:00","Nova York/Nova Jersey","I",1),
    match("IRQ","NOR","2026-06-16","19:00","Boston","I",1),
    // Group J
    match("ARG","ALG","2026-06-16","22:00","Kansas City","J",1),
    match("AUT","JOR","2026-06-17","01:00","Área da Baía de São Francisco","J",1),
    // Group K
    match("POR","COD","2026-06-17","14:00","Houston","K",1),
    match("UZB","COL","2026-06-17","23:00","Cidade do México","K",1),
    // Group L
    match("ENG","CRO","2026-06-17","17:00","Dallas","L",1),
    match("GHA","PAN","2026-06-17","20:00","Toronto","L",1),

    // ── RODADA 2 ──────────────────────────────────────────
    // Group A
    match("CZE","RSA","2026-06-18","13:00","Atlanta","A",2),
    match("MEX","KOR","2026-06-18","22:00","Guadalajara","A",2),
    // Group B
    match("SUI","BIH","2026-06-18","16:00","Los Angeles","B",2),
    match("CAN","QAT","2026-06-18","19:00","Vancouver","B",2),
    // Group C
    match("SCO","MAR","2026-06-19","19:00","Boston","C",2),
    match("BRA","HAI","2026-06-19","21:30","Filadélfia","C",2),
    // Group D
    match("USA","AUS","2026-06-19","16:00","Seattle","D",2),
    match("TUR","PAR","2026-06-20","00:00","Área da Baía de São Francisco","D",2),
    // Group E
    match("GER","CIV","2026-06-20","17:00","Toronto","E",2),
    match("ECU","CUW","2026-06-20","21:00","Kansas City","E",2),
    // Group F
    match("NED","SWE","2026-06-20","14:00","Houston","F",2),
    match("TUN","JPN","2026-06-21","01:00","Monterrey","F",2),
    // Group G
    match("BEL","IRN","2026-06-21","16:00","Los Angeles","G",2),
    match("NZL","EGY","2026-06-21","22:00","Vancouver","G",2),
    // Group H
    match("ESP","KSA","2026-06-21","13:00","Atlanta","H",2),
    match("URU","CPV","2026-06-21","19:00","Miami","H",2),
    // Group I
    match("FRA","IRQ","2026-06-22","18:00","Filadélfia","I",2),
    match("NOR","SEN","2026-06-22","21:00","Nova York/Nova Jersey","I",2),
    // Group J
    match("ARG","AUT","2026-06-22","14:00","Dallas","J",2),
    match("JOR","ALG","2026-06-23","00:00","Área da Baía de São Francisco","J",2),
    // Group K
    match("POR","UZB","2026-06-23","14:00","Houston","K",2),
    match("COL","COD","2026-06-23","23:00","Guadalajara","K",2),
    // Group L
    match("ENG","GHA","2026-06-23","17:00","Boston","L",2),
    match("PAN","CRO","2026-06-23","20:00","Toronto","L",2),

    // ── RODADA 3 ──────────────────────────────────────────
    // Group A
    match("CZE","MEX","2026-06-24","22:00","Cidade do México","A",3),
    match("RSA","KOR","2026-06-24","22:00","Monterrey","A",3),
    // Group B
    match("SUI","CAN","2026-06-24","16:00","Vancouver","B",3),
    match("BIH","QAT","2026-06-24","16:00","Seattle","B",3),
    // Group C
    match("SCO","BRA","2026-06-24","19:00","Miami","C",3),
    match("MAR","HAI","2026-06-24","19:00","Atlanta","C",3),
    // Group D
    match("TUR","USA","2026-06-25","23:00","Los Angeles","D",3),
    match("PAR","AUS","2026-06-25","23:00","Área da Baía de São Francisco","D",3),
    // Group E
    match("CUW","CIV","2026-06-25","17:00","Filadélfia","E",3),
    match("ECU","GER","2026-06-25","17:00","Nova York/Nova Jersey","E",3),
    // Group F
    match("JPN","SWE","2026-06-25","20:00","Dallas","F",3),
    match("TUN","NED","2026-06-25","20:00","Kansas City","F",3),
    // Group G
    match("EGY","IRN","2026-06-27","00:00","Seattle","G",3),
    match("NZL","BEL","2026-06-27","00:00","Vancouver","G",3),
    // Group H
    match("CPV","KSA","2026-06-26","21:00","Houston","H",3),
    match("URU","ESP","2026-06-26","21:00","Guadalajara","H",3),
    // Group I
    match("NOR","FRA","2026-06-26","16:00","Boston","I",3),
    match("SEN","IRQ","2026-06-26","16:00","Toronto","I",3),
    // Group J
    match("ALG","AUT","2026-06-27","23:00","Kansas City","J",3),
    match("JOR","ARG","2026-06-27","23:00","Dallas","J",3),
    // Group K
    match("COL","POR","2026-06-27","20:30","Miami","K",3),
    match("COD","UZB","2026-06-27","20:30","Atlanta","K",3),
    // Group L
    match("PAN","ENG","2026-06-27","18:00","Nova York/Nova Jersey","L",3),
    match("CRO","GHA","2026-06-27","18:00","Filadélfia","L",3),
  ]

  for (const m of matches) {
    await prisma.match.create({ data: m })
  }
  console.log(`✅ ${matches.length} partidas inseridas`)

  // ── USERS (only if not force or no admin exists) ────────
  const adminExists = await prisma.user.findUnique({ where: { username: "admin" } })
  if (!adminExists) {
    const adminPw = await bcrypt.hash("Admin@2026", 12)
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@copabertuzzo.local",
        name: "Administrador",
        password: adminPw,
        role: Role.ADMIN,
      },
    })
    const fiscalPw = await bcrypt.hash("Fiscal@2026", 12)
    const fiscal = await prisma.user.create({
      data: {
        username: "fiscal",
        email: "fiscal@copabertuzzo.local",
        name: "Fiscal Principal",
        password: fiscalPw,
        role: Role.FISCAL,
      },
    })
    await prisma.financial.create({ data: { userId: admin.id, amount: 100, paymentStatus: "WAIVED" } })
    await prisma.financial.create({ data: { userId: fiscal.id, amount: 100, paymentStatus: "WAIVED" } })
    console.log("✅ Admin (login: admin / Admin@2026) e Fiscal (login: fiscal / Fiscal@2026) criados")
  }

  // Financial records for existing players
  if (force) {
    const players = await prisma.user.findMany({ where: { isActive: true } })
    for (const p of players) {
      const hasFinancial = await prisma.financial.findFirst({ where: { userId: p.id } })
      if (!hasFinancial) {
        await prisma.financial.create({ data: { userId: p.id, amount: 100 } })
      }
    }
  }

  console.log("\n🏆 Seed concluído com sucesso!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("🌐 Acesse: http://localhost:3000")
  console.log("👤 Admin:  admin@copabertuzzo.local / Admin@2026")
  console.log("🔍 Fiscal: fiscal@copabertuzzo.local / Fiscal@2026")
  console.log("⚽ Times:  48 seleções nos Grupos A-L")
  console.log("📅 Jogos:  72 partidas da fase de grupos")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main().catch(console.error).finally(() => prisma.$disconnect())
