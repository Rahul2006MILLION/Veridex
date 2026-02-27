import sql from "@/lib/db"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { RiskBadge, ScoreBadge } from "@/components/badges"
import { ScoreRing } from "@/components/score-ring"
import { Github, ChevronRight } from "lucide-react"

export default async function RecruiterCandidatesPage({
  params,
}: {
  params: Promise<{ recruiterId: string }>
}) {
  await params

  const candidates = await sql`
    SELECT cp.*, u.name, u.email
    FROM candidate_profiles cp
    JOIN users u ON u.id = cp.user_id
    ORDER BY cp.overall_score DESC
  `

  const riskOrder = { Low: 0, Medium: 1, High: 2 } as const

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Candidates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All indexed candidates, sorted by overall score.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {candidates.map((c: any) => {
          const lastActive = new Date(c.last_active_date)
          const daysSince = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
          return (
            <Link key={c.id} href={`/candidate/${c.user_id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="py-4 flex items-center gap-5">
                  <ScoreRing score={Number(c.overall_score)} label="Score" size={56} strokeWidth={4} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <RiskBadge level={c.risk_score} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {c.github_username && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Github size={11} />
                          @{c.github_username}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Active{" "}
                        <span
                          className={
                            daysSince <= 14
                              ? "text-emerald-400"
                              : daysSince <= 60
                              ? "text-amber-400"
                              : "text-red-400"
                          }
                        >
                          {daysSince}d ago
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Completeness:{" "}
                        <span className="font-mono text-foreground">
                          {Number(c.data_completeness).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
