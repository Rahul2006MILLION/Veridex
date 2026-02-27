"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react"
import Link from "next/link"

interface WeightConfig {
  backend_weight: number
  consistency_weight: number
  collaboration_weight: number
  recency_weight: number
  impact_weight: number
}

const defaultWeights: WeightConfig = {
  backend_weight: 0.25,
  consistency_weight: 0.20,
  collaboration_weight: 0.20,
  recency_weight: 0.20,
  impact_weight: 0.15,
}

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm text-muted-foreground w-36 shrink-0">{label}</Label>
      <div className="flex-1">
        <Slider
          min={0}
          max={100}
          step={5}
          value={[Math.round(value * 100)]}
          onValueChange={([v]) => onChange(v / 100)}
        />
      </div>
      <span className="text-sm font-mono text-foreground w-10 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

export default function CreateJobPage({
  params,
}: {
  params: { recruiterId: string }
}) {
  const { recruiterId } = params  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [minThreshold, setMinThreshold] = useState(60)
  const [weights, setWeights] = useState<WeightConfig>(defaultWeights)

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const isWeightValid = Math.abs(totalWeight - 1) < 0.02

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required."); return }
    if (!isWeightValid) { setError("Weights must sum to 100%."); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/recruiter/${recruiterId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          min_threshold: minThreshold,
          ...weights,
        }),
      })
      if (!res.ok) throw new Error("Failed to create job")
      const job = await res.json()
      router.push(`/recruiter/${recruiterId}/jobs/${job.id}`)
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href={`/recruiter/${recruiterId}/jobs`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Job Listings
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Create Job</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define the role and configure scoring weights for candidate matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Role Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label htmlFor="title" className="text-sm mb-1.5 block">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm mb-1.5 block">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, tech stack requirements, and expectations..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scoring Weights</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adjust how each dimension is weighted when scoring candidates.{" "}
              <span className={isWeightValid ? "text-emerald-400" : "text-amber-400"}>
                Total: {Math.round(totalWeight * 100)}%
              </span>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <WeightSlider
              label="Backend / Complexity"
              value={weights.backend_weight}
              onChange={(v) => setWeights((w) => ({ ...w, backend_weight: v }))}
            />
            <WeightSlider
              label="Consistency"
              value={weights.consistency_weight}
              onChange={(v) => setWeights((w) => ({ ...w, consistency_weight: v }))}
            />
            <WeightSlider
              label="Collaboration"
              value={weights.collaboration_weight}
              onChange={(v) => setWeights((w) => ({ ...w, collaboration_weight: v }))}
            />
            <WeightSlider
              label="Recency"
              value={weights.recency_weight}
              onChange={(v) => setWeights((w) => ({ ...w, recency_weight: v }))}
            />
            <WeightSlider
              label="Impact"
              value={weights.impact_weight}
              onChange={(v) => setWeights((w) => ({ ...w, impact_weight: v }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Minimum Threshold</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-1">
              <Slider
                min={0}
                max={100}
                step={5}
                value={[minThreshold]}
                onValueChange={([v]) => setMinThreshold(v)}
              />
            </div>
            <span className="text-sm font-mono text-foreground w-10 text-right">{minThreshold}</span>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="gap-2 self-end">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
          {loading ? "Creating..." : "Create Job"}
        </Button>
      </form>
    </div>
  )
}
