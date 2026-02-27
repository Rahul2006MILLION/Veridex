import sql from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBadge, ScoreBadge } from "@/components/badges"
import { ArrowLeft, ChevronRight, Target, Sliders } from "lucide-react"
import { RunMatchButton } from "./run-match-button"

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ recruiterId: string; jobId: string }>
}) {
  const { recruiterId, jobId } = await params

  const jobs = await sql`SELECT * FROM jobs WHERE id = ${jobId} AND recruiter_id = ${recruiterId}`
  if (jobs.length === 0) notFound()
  const job = jobs[0]

  const matches = await sql`
    SELECT mr.*, u.name AS candidate_name, u.email AS candidate_email,
           cp.overall_score, cp.data_completeness, cp.user_id AS candidate_user_id
    FROM match_results mr
    JOIN candidate_profiles cp ON cp.id = mr.candidate_id
    JOIN users u ON u.id = cp.user_id
    WHERE mr.job_id = ${jobId}
    ORDER BY mr.fit_score DESC
  `

  const weights = [
    { label: "Backend / Complexity", value: Number(job.backend_weight) },
    { label: "Consistency", value: Number(job.consistency_weight) },
    { label: "Collaboration", value: Number(job.collaboration_weight) },
    { label: "Recency", value: Number(job.recency_weight) },
    { label: "Impact", value: Number(job.impact_weight) },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href={`/recruiter/${recruiterId}/jobs`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Job Listings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">{job.title}</h1>
          {job.description && (
            <p className="text-muted-foreground text-sm mt-1 max-w-xl text-pretty">{job.description}</p>
          )}
        </div>
        <RunMatchButton jobId={jobId} recruiterId={recruiterId} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        {/* Weight config */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sliders size={14} className="text-muted-foreground" />
              Scoring Weights
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {weights.map((w) => (
              <div key={w.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 shrink-0">{w.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${w.value * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-foreground w-8 text-right">
                  {(w.value * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Min Threshold</span>
              <span className="text-xs font-mono text-foreground font-semibold">
                {Number(job.min_threshold).toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Match stats */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target size={14} className="text-muted-foreground" />
              Match Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold font-mono text-foreground">{matches.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Matches</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold font-mono text-emerald-400">
                  {matches.filter((m: any) => m.risk_level === "Low").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Low Risk</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold font-mono text-red-400">
                  {matches.filter((m: any) => m.risk_level === "High").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">High Risk</p>
              </div>
            </div>
            {matches.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Top fit score:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {Number(matches[0].fit_score).toFixed(1)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match results table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Candidate Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No matches yet. Run a match to score candidates.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((match: any, idx: number) => (
                <Link
                  key={match.id}
                  href={`/candidate/${match.candidate_user_id}`}
                  className="flex items-start gap-4 p-4 rounded-md border border-border hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-mono shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{match.candidate_name}</p>
                      <ScoreBadge score={Number(match.fit_score)} />
                      <RiskBadge level={match.risk_level} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{match.candidate_email}</p>
                    {match.gap_summary && (
                      <p className="text-xs text-muted-foreground mt-1.5 text-pretty leading-relaxed">
                        {match.gap_summary}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-foreground transition-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
