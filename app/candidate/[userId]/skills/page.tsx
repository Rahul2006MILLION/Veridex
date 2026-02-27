import sql from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreBadge } from "@/components/badges"
import { SkillRadarChart } from "./skill-radar-chart"
import { SkillHistoryChart } from "./skill-history-chart"

export default async function SkillsPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const profiles = await sql`SELECT id FROM candidate_profiles WHERE user_id = ${userId}`
  if (profiles.length === 0) notFound()
  const candidateId = profiles[0].id

  const skills = await sql`
    SELECT s.*, 
      json_agg(
        json_build_object('month', sh.month, 'score', sh.score)
        ORDER BY sh.month
      ) FILTER (WHERE sh.id IS NOT NULL) AS history
    FROM skills s
    LEFT JOIN skill_history sh ON sh.skill_id = s.id
    WHERE s.candidate_id = ${candidateId}
    GROUP BY s.id
    ORDER BY s.score DESC
  `

  const dimensions = [
    { key: "complexity_score", label: "Complexity" },
    { key: "consistency_score", label: "Consistency" },
    { key: "collaboration_score", label: "Collaboration" },
    { key: "recency_score", label: "Recency" },
    { key: "impact_score", label: "Impact" },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Skill Breakdown</h1>
        <p className="text-muted-foreground text-sm mt-1 text-pretty">
          Detailed analysis of verified skills across 5 scoring dimensions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Radar Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRadarChart skills={skills} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Score Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {skills.slice(0, 1).map((skill: any) => (
                <div key={skill.id} className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {skill.name}
                  </p>
                  {dimensions.map((d) => (
                    <div key={d.key} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{d.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${skill[d.key]}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-foreground w-8 text-right">
                        {Number(skill[d.key]).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History charts per skill */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {skills
          .filter((s: any) => s.history && s.history.length > 0)
          .map((skill: any) => (
            <Card key={skill.id}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
                <ScoreBadge score={Number(skill.score)} />
              </CardHeader>
              <CardContent>
                <SkillHistoryChart history={skill.history} color={
                  Number(skill.score) >= 75 ? "#34d399" : Number(skill.score) >= 55 ? "#fbbf24" : "#f87171"
                } />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Full skill table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Skill</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Score</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Complexity</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Consistency</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Recency</th>
                  <th className="text-right py-2 pl-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Impact</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill: any) => (
                  <tr key={skill.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{skill.name}</td>
                    <td className="py-2.5 px-2 text-right">
                      <ScoreBadge score={Number(skill.score)} />
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-foreground">{Number(skill.complexity_score).toFixed(0)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-foreground">{Number(skill.consistency_score).toFixed(0)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs text-foreground">{Number(skill.recency_score).toFixed(0)}</td>
                    <td className="py-2.5 pl-2 text-right font-mono text-xs text-foreground">{Number(skill.impact_score).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
