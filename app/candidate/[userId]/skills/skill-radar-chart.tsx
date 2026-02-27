"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface Skill {
  name: string
  complexity_score: number
  consistency_score: number
  collaboration_score: number
  recency_score: number
  impact_score: number
}

export function SkillRadarChart({ skills }: { skills: Skill[] }) {
  // Average across all skills
  const avg = (key: keyof Skill) =>
    Math.round(
      skills.reduce((sum, s) => sum + Number(s[key]), 0) / skills.length
    )

  const data = [
    { subject: "Complexity", score: avg("complexity_score") },
    { subject: "Consistency", score: avg("consistency_score") },
    { subject: "Collaboration", score: avg("collaboration_score") },
    { subject: "Recency", score: avg("recency_score") },
    { subject: "Impact", score: avg("impact_score") },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            fontSize: "12px",
            color: "hsl(var(--foreground))",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
