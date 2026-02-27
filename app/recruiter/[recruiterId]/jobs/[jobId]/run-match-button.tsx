"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, Loader2 } from "lucide-react"

interface RunMatchButtonProps {
  jobId: string
  recruiterId: string
}

export function RunMatchButton({ jobId, recruiterId }: RunMatchButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function runMatch() {
    setLoading(true)
    try {
      // Fetch job weights
      const jobRes = await fetch(`/api/recruiter/${recruiterId}/jobs`)
      const jobs = await jobRes.json()
      const job = jobs.find((j: any) => j.id === jobId)
      if (!job) throw new Error("Job not found")

      // Fetch all candidates with skills
      const candRes = await fetch("/api/candidates")
      const candidates = await candRes.json()

      // Score each candidate
      for (const candidate of candidates) {
        const skillsRes = await fetch(`/api/candidates/${candidate.user_id}/skills`)
        const skills = await skillsRes.json()

        if (skills.length === 0) continue

        // Weighted average across skills
        const avgComplexity = skills.reduce((a: number, s: any) => a + Number(s.complexity_score), 0) / skills.length
        const avgConsistency = skills.reduce((a: number, s: any) => a + Number(s.consistency_score), 0) / skills.length
        const avgCollaboration = skills.reduce((a: number, s: any) => a + Number(s.collaboration_score), 0) / skills.length
        const avgRecency = skills.reduce((a: number, s: any) => a + Number(s.recency_score), 0) / skills.length
        const avgImpact = skills.reduce((a: number, s: any) => a + Number(s.impact_score), 0) / skills.length

        const fitScore =
          avgComplexity * Number(job.backend_weight) +
          avgConsistency * Number(job.consistency_weight) +
          avgCollaboration * Number(job.collaboration_weight) +
          avgRecency * Number(job.recency_weight) +
          avgImpact * Number(job.impact_weight)

        const riskLevel =
          fitScore >= 75 && Number(candidate.data_completeness) >= 85
            ? "Low"
            : fitScore >= 55
            ? "Medium"
            : "High"

        const gaps: string[] = []
        if (avgRecency < 50) gaps.push("Low recency — inactivity detected.")
        if (avgCollaboration < 60) gaps.push("Collaboration score below threshold.")
        if (avgComplexity < 60) gaps.push("Complexity gap in core skills.")
        if (fitScore < Number(job.min_threshold)) gaps.push("Overall fit below job minimum threshold.")
        const gapSummary = gaps.length ? gaps.join(" ") : "Strong overall fit. Minor gaps only."

        await fetch(`/api/recruiter/${recruiterId}/jobs/${jobId}/matches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_id: candidate.id,
            fit_score: Math.min(100, Math.round(fitScore * 10) / 10),
            risk_level: riskLevel,
            gap_summary: gapSummary,
          }),
        })
      }

      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={runMatch} disabled={loading} size="sm" className="gap-2 shrink-0">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
      {loading ? "Running..." : "Run Match"}
    </Button>
  )
}
