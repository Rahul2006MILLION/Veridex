import sql from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBadge } from "@/components/badges"
import { TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react"

function getImprovementPlan(skills: any[], risk: string) {
  const lowScoreSkills = skills.filter((s) => Number(s.score) < 70)
  const highScoreSkills = skills.filter((s) => Number(s.score) >= 75)
  const decliningSkills = skills.filter((s) => {
    if (!s.history || s.history.length < 2) return false
    const h = s.history.sort((a: any, b: any) => a.month.localeCompare(b.month))
    return h[h.length - 1].score < h[0].score
  })

  const actions: { priority: "high" | "medium" | "low"; title: string; description: string }[] = []

  if (risk === "High") {
    actions.push({
      priority: "high",
      title: "Address Inactivity Signal",
      description:
        "Recent commit history is sparse. Push meaningful contributions to GitHub weekly to improve recency scores.",
    })
  }

  lowScoreSkills.forEach((s) => {
    actions.push({
      priority: "high",
      title: `Strengthen ${s.name} fundamentals`,
      description: `Current score ${Number(s.score).toFixed(0)}/100. Focus on building complexity and consistency through open-source contributions or side projects.`,
    })
  })

  decliningSkills.forEach((s) => {
    if (!lowScoreSkills.find((l) => l.id === s.id)) {
      actions.push({
        priority: "medium",
        title: `Reverse declining trend in ${s.name}`,
        description: `Score has been declining over recent months. Re-engage with regular practice, code reviews, or pair programming sessions.`,
      })
    }
  })

  highScoreSkills.forEach((s) => {
    actions.push({
      priority: "low",
      title: `Leverage ${s.name} strength`,
      description: `Score ${Number(s.score).toFixed(0)}/100 — consider contributing to high-visibility projects or mentoring others to boost collaboration and impact scores.`,
    })
  })

  return actions
}

export default async function ImprovementPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const profiles = await sql`
    SELECT cp.*, u.name FROM candidate_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.user_id = ${userId}
  `
  if (profiles.length === 0) notFound()
  const profile = profiles[0]

  const skills = await sql`
    SELECT s.*,
      json_agg(json_build_object('month', sh.month, 'score', sh.score) ORDER BY sh.month)
      FILTER (WHERE sh.id IS NOT NULL) AS history
    FROM skills s
    LEFT JOIN skill_history sh ON sh.skill_id = s.id
    WHERE s.candidate_id = ${profile.id}
    GROUP BY s.id
  `

  const actions = getImprovementPlan(skills, profile.risk_score)

  const priorityConfig = {
    high: {
      icon: <AlertTriangle size={14} />,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      label: "High Priority",
    },
    medium: {
      icon: <TrendingUp size={14} />,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      label: "Medium Priority",
    },
    low: {
      icon: <CheckCircle size={14} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "Strength to Leverage",
    },
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target size={18} className="text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Improvement Plan</h1>
        </div>
        <p className="text-muted-foreground text-sm text-pretty">
          Personalized actions based on your current skill signals and risk profile.
        </p>
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {actions.filter((a) => a.priority === "high").length} high priority actions
            </p>
          </div>
          <RiskBadge level={profile.risk_score} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {(["high", "medium", "low"] as const).map((priority) => {
          const config = priorityConfig[priority]
          const items = actions.filter((a) => a.priority === priority)
          if (items.length === 0) return null
          return (
            <div key={priority}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${config.color}`}>
                {config.label}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((action, i) => (
                  <Card key={i} className={`border ${config.bg}`}>
                    <CardHeader className="pb-1 pt-4">
                      <CardTitle className={`text-sm flex items-center gap-2 ${config.color}`}>
                        {config.icon}
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
