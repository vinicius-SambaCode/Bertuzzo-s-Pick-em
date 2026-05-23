"use client"

import { useQuery } from "@tanstack/react-query"
import { getInitials } from "@/lib/utils"

type RankEntry = {
  position: number
  userId: string
  name: string
  avatarUrl: string | null
  totalPoints: number
  exactScores: number
  correctDiffs: number
  correctResults: number
  totalPredictions: number
}

function Medal({ pos }: { pos: number }) {
  if (pos === 1) return <span className="text-2xl">🥇</span>
  if (pos === 2) return <span className="text-2xl">🥈</span>
  if (pos === 3) return <span className="text-2xl">🥉</span>
  return <span className="text-sm font-bold text-text-muted w-8 text-center">#{pos}</span>
}

export default function RankingPage() {
  const { data: ranking = [], isLoading } = useQuery<RankEntry[]>({
    queryKey: ["ranking"],
    queryFn: () => fetch("/api/ranking").then((r) => r.json()),
    refetchInterval: 60_000,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Ranking 🏆</h1>
        <p className="text-text-muted text-sm mt-1">Classificação geral • Atualizado a cada minuto</p>
      </div>

      {/* Podium */}
      {top3.length >= 1 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider text-center mb-6">🏆 Pódio</h2>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            {top3[1] && (
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                     style={{ background: "linear-gradient(135deg,#9ca3af,#d1d5db)", color: "#0A0F1E" }}>
                  {top3[1].avatarUrl ? <img src={top3[1].avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" /> : getInitials(top3[1].name)}
                </div>
                <p className="text-sm font-bold text-text-base text-center truncate max-w-[100px]">{top3[1].name}</p>
                <div className="w-full rounded-t-xl pt-4 pb-2 text-center" style={{ background: "#1A2540", minHeight: "80px" }}>
                  <p className="text-2xl font-black" style={{ color: "#C0C0C0" }}>🥈</p>
                  <p className="text-lg font-black text-text-base">{top3[1].totalPoints}</p>
                  <p className="text-xs text-text-muted">pts</p>
                </div>
              </div>
            )}
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-4"
                   style={{ background: "linear-gradient(135deg,#C5A028,#E8C040)", color: "#0A0F1E", outline: "4px solid #FFDF00", outlineOffset: "2px" }}>
                {top3[0].avatarUrl ? <img src={top3[0].avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" /> : getInitials(top3[0].name)}
              </div>
              <p className="text-sm font-bold text-text-base text-center truncate max-w-[110px]">{top3[0].name}</p>
              <div className="w-full rounded-t-xl pt-4 pb-2 text-center" style={{ background: "#243354", minHeight: "100px" }}>
                <p className="text-2xl font-black" style={{ color: "#FFDF00" }}>🥇</p>
                <p className="text-2xl font-black" style={{ color: "#FFDF00" }}>{top3[0].totalPoints}</p>
                <p className="text-xs text-text-muted">pts</p>
              </div>
            </div>
            {/* 3rd */}
            {top3[2] && (
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                     style={{ background: "linear-gradient(135deg,#92400e,#b45309)", color: "#fff" }}>
                  {top3[2].avatarUrl ? <img src={top3[2].avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" /> : getInitials(top3[2].name)}
                </div>
                <p className="text-sm font-bold text-text-base text-center truncate max-w-[100px]">{top3[2].name}</p>
                <div className="w-full rounded-t-xl pt-4 pb-2 text-center" style={{ background: "#1A2540", minHeight: "60px" }}>
                  <p className="text-2xl font-black" style={{ color: "#CD7F32" }}>🥉</p>
                  <p className="text-lg font-black text-text-base">{top3[2].totalPoints}</p>
                  <p className="text-xs text-text-muted">pts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1A2540", borderBottom: "1px solid #243354" }}>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">#</th>
                <th className="text-left px-4 py-3 text-text-muted font-semibold">Jogador</th>
                <th className="text-center px-4 py-3 text-text-muted font-semibold">Pts</th>
                <th className="text-center px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">🎯</th>
                <th className="text-center px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">👍</th>
                <th className="text-center px-4 py-3 text-text-muted font-semibold hidden md:table-cell">✓</th>
                <th className="text-center px-4 py-3 text-text-muted font-semibold hidden md:table-cell">Total</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, i) => (
                <tr key={entry.userId}
                    className="transition-colors hover:bg-surface-700"
                    style={{ borderBottom: "1px solid #1A2540" }}>
                  <td className="px-4 py-3">
                    <Medal pos={entry.position} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                           style={{ background: i === 0 ? "linear-gradient(135deg,#C5A028,#E8C040)" : "linear-gradient(135deg,#243354,#2D4070)", color: i === 0 ? "#0A0F1E" : "#E8F0FF" }}>
                        {entry.avatarUrl
                          ? <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                          : getInitials(entry.name)}
                      </div>
                      <span className="font-medium text-text-base">{entry.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-black text-lg" style={{ color: i === 0 ? "#FFDF00" : "#E8F0FF" }}>
                    {entry.totalPoints}
                  </td>
                  <td className="px-4 py-3 text-center text-yellow-400 font-bold hidden sm:table-cell">{entry.exactScores}</td>
                  <td className="px-4 py-3 text-center text-green-400 font-bold hidden sm:table-cell">{entry.correctDiffs}</td>
                  <td className="px-4 py-3 text-center text-blue-400 font-bold hidden md:table-cell">{entry.correctResults}</td>
                  <td className="px-4 py-3 text-center text-text-muted hidden md:table-cell">{entry.totalPredictions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ranking.length === 0 && (
          <p className="text-center text-text-muted py-12">Nenhum palpite registrado ainda</p>
        )}
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-bold text-text-muted mb-3">Legenda de Pontuação</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { pts: 10, label: "Placar exato", color: "text-yellow-400", icon: "🎯" },
            { pts: 7, label: "Diferença correta", color: "text-green-400", icon: "👍" },
            { pts: 5, label: "Resultado correto", color: "text-blue-400", icon: "✓" },
            { pts: 0, label: "Resultado errado", color: "text-gray-500", icon: "✗" },
          ].map((r) => (
            <div key={r.pts} className="rounded-lg p-3 text-center" style={{ background: "#1A2540" }}>
              <p className="text-lg">{r.icon}</p>
              <p className={`text-lg font-black ${r.color}`}>{r.pts} pts</p>
              <p className="text-xs text-text-subtle mt-0.5">{r.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
