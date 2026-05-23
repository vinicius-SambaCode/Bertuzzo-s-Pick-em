import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Email não configurado - GMAIL_USER ou GMAIL_APP_PASSWORD ausentes")
    return { success: false, error: "Email não configurado" }
  }
  try {
    await transporter.sendMail({
      from: `"Copa Bertuzzo 2026 ⚽" <${process.env.GMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao enviar email:", error.message)
    return { success: false, error: error.message }
  }
}

export function roundResultsHtml(data: {
  userName: string
  roundNumber: number
  matches: Array<{
    homeTeam: string
    homeFlag: string
    awayTeam: string
    awayFlag: string
    homeScore: number
    awayScore: number
    userPrediction: string
    pointsEarned: number
  }>
  rankPosition: number
  totalPoints: number
  appUrl: string
}): string {
  const rows = data.matches
    .map(
      (m) => `
      <tr style="border-bottom:1px solid #243354;">
        <td style="padding:10px;text-align:center;">${m.homeFlag} <strong>${m.homeTeam}</strong></td>
        <td style="padding:10px;text-align:center;font-size:22px;font-weight:bold;color:#FFDF00;">${m.homeScore} — ${m.awayScore}</td>
        <td style="padding:10px;text-align:center;"><strong>${m.awayTeam}</strong> ${m.awayFlag}</td>
        <td style="padding:10px;text-align:center;color:#99AABB;">${m.userPrediction}</td>
        <td style="padding:10px;text-align:center;font-weight:bold;color:${m.pointsEarned >= 10 ? "#FFDF00" : m.pointsEarned >= 7 ? "#009C3B" : m.pointsEarned >= 5 ? "#60a5fa" : "#6b7280"};">${m.pointsEarned} pts</td>
      </tr>`
    )
    .join("")

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0A0F1E;color:#E8F0FF;margin:0;padding:0;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#002776 0%,#009C3B 100%);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <div style="font-size:48px;margin-bottom:8px;">🏆</div>
        <h1 style="color:#FFDF00;margin:0;font-size:26px;">Copa Bertuzzo 2026</h1>
        <p style="color:#E8F0FF;margin:8px 0 0;opacity:0.9;">Resultados — Rodada ${data.roundNumber}</p>
      </div>
      <div style="background:#0F1729;padding:24px;border-radius:0 0 12px 12px;">
        <p>Olá, <strong>${data.userName}</strong>! 👋</p>
        <h2 style="color:#FFDF00;border-bottom:1px solid #243354;padding-bottom:8px;">🏟️ Jogos da Rodada</h2>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <div style="background:#1A2540;border-radius:8px;padding:20px;margin-top:24px;text-align:center;">
          <p style="margin:0;font-size:14px;color:#99AABB;">Sua posição no ranking</p>
          <p style="margin:4px 0;font-size:36px;font-weight:bold;color:#FFDF00;">#${data.rankPosition}</p>
          <p style="margin:0;color:#009C3B;font-size:18px;">${data.totalPoints} pontos acumulados</p>
        </div>
        <p style="text-align:center;margin-top:24px;">
          <a href="${data.appUrl}" style="background:#009C3B;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">Ver Ranking Completo →</a>
        </p>
        <p style="color:#5A6F7E;font-size:11px;text-align:center;margin-top:24px;">Copa Bertuzzo 2026 — Aplicação familiar privada</p>
      </div>
    </div>
  </body></html>`
}
