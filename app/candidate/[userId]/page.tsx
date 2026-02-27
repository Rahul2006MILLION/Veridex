import sql from "@/lib/db"
import { notFound } from "next/navigation"
import { RiskBadge, ScoreBadge } from "@/components/badges"
import { ScoreRing } from "@/components/score-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Clock, Database, Activity } from "lucide-react"

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const profiles = await sql`
    SELECT cp.*, u.name, u.email
    FROM candidate_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.user_id = ${userId}
  `
  if (profiles.length === 0) notFound()
  const profile = profiles[0]

  const skills = await sql`
    SELECT * FROM skills WHERE candidate_id = ${profile.id}
    ORDER BY score DESC
  `

  const lastActive = new Date(profile.last_active_date)
  const daysSince = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground text-balance">{profile.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
          </div>
          <RiskBadge level={profile.risk_score} />
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <Card className="col-span-2 md:col-span-1 flex flex-col items-center justify-center py-6">
          <ScoreRing score={Number(profile.overall_score)} label="Overall" size={88} />
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Database size={12} />
              Data Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-foreground">
              {Number(profile.data_completeness).toFixed(0)}
              <span className="text-base text-muted-foreground font-normal">%</span>
            </p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${profile.data_completeness}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} />
              Last Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-foreground">
              {daysSince}
              <span className="text-base text-muted-foreground font-normal"> days</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {daysSince <= 14
                ? "Active contributor"
                : daysSince <= 60
                ? "Somewhat recent"
                : "Inactivity detected"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={12} />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <RiskBadge level={profile.risk_score} className="text-sm px-3 py-1" />
            <p className="text-xs text-muted-foreground mt-2">
              {profile.risk_score === "Low"
                ? "Strong signal profile"
                : profile.risk_score === "Medium"
                ? "Some signal gaps"
                : "Significant gaps detected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {skills.map((skill: any) => (
              <div key={skill.id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-28 shrink-0">
                  {skill.name}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      Number(skill.score) >= 75
                        ? "bg-emerald-400"
                        : Number(skill.score) >= 55
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
                <ScoreBadge score={Number(skill.score)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GitHub info */}
      {profile.github_username && (
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Github size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">GitHub:</span>
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline font-mono"
            >
              @{profile.github_username}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
