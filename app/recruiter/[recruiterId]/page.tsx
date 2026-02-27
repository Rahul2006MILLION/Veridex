import sql from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBadge, ScoreBadge } from "@/components/badges"
import { Briefcase, Users, TrendingUp, ArrowRight } from "lucide-react"

export default async function RecruiterDashboard({
  params,
}: {
  params: Promise<{ recruiterId: string }>
}) {
  const { recruiterId } = await params
  const users = await sql`SELECT * FROM users WHERE id = ${recruiterId}`
  if (users.length === 0) notFound()
  const user = users[0]

  const jobs = await sql`
    SELECT j.*, COUNT(mr.id) AS match_count
    FROM jobs j
    LEFT JOIN match_results mr ON mr.job_id = j.id
    WHERE j.recruiter_id = ${recruiterId}
    GROUP BY j.id
    ORDER BY j.created_at DESC
  `

  const candidates = await sql`
    SELECT cp.*, u.name, u.email
    FROM candidate_profiles cp
    JOIN users u ON u.id = cp.user_id
    ORDER BY cp.overall_score DESC
    LIMIT 5
  `

  const totalMatches = await sql`
    SELECT COUNT(*) AS total FROM match_results mr
    JOIN jobs j ON j.id = mr.job_id
    WHERE j.recruiter_id = ${recruiterId}
  `

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Hiring intelligence dashboard — Veridex
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={12} />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-foreground">{jobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Users size={12} />
              Candidates Indexed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-foreground">{candidates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={12} />
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-foreground">
              {Number(totalMatches[0]?.total ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Jobs list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
            <Link
              href={`/recruiter/${recruiterId}/jobs/new`}
              className="text-xs text-primary hover:underline"
            >
              + New Job
            </Link>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs created yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    href={`/recruiter/${recruiterId}/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(job.match_count)} matches
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top candidates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Top Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {candidates.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/candidate/${c.user_id}`}
                  className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={Number(c.overall_score)} />
                    <RiskBadge level={c.risk_score} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
