import Link from "next/link"
import sql from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { RiskBadge, ScoreBadge } from "@/components/badges"
import { Zap, ArrowRight, Users, Briefcase } from "lucide-react"

export default async function HomePage() {
  // Fetch demo users to populate the role selector
  const recruiters = await sql`SELECT * FROM users WHERE role = 'recruiter' LIMIT 3`
  const candidates = await sql`
    SELECT u.*, cp.overall_score, cp.risk_score
    FROM users u
    JOIN candidate_profiles cp ON cp.user_id = u.id
    WHERE u.role = 'candidate'
    ORDER BY cp.overall_score DESC
    LIMIT 3
  `

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
            <Zap size={14} className="text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">Veridex</span>
        </div>
        <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
          Demo Mode
        </span>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
          <Zap size={11} />
          Hiring Intelligence Platform
        </div>
        <h1 className="text-4xl font-bold text-foreground text-balance max-w-2xl leading-tight mb-4">
          Verify skills. Reduce risk.
          <br />
          <span className="text-primary">Hire with confidence.</span>
        </h1>
        <p className="text-muted-foreground text-base text-pretty max-w-lg leading-relaxed mb-12">
          Veridex scores candidates across five evidence-based dimensions, flags risk signals,
          and matches talent to roles using configurable scoring weights.
        </p>

        {/* Role selector */}
        <div className="w-full max-w-3xl grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Recruiter column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recruiter View
              </span>
            </div>
            {recruiters.map((r: any) => (
              <Link key={r.id} href={`/recruiter/${r.id}`}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer hover:bg-accent group">
                  <CardContent className="py-3.5 px-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.email}</p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Candidate column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Candidate View
              </span>
            </div>
            {candidates.map((c: any) => (
              <Link key={c.id} href={`/candidate/${c.id}`}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer hover:bg-accent group">
                  <CardContent className="py-3.5 px-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={Number(c.overall_score)} />
                      <RiskBadge level={c.risk_score} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-border px-8 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { label: "Skill Scoring Engine", desc: "5-dimension weighted scoring" },
            { label: "Risk Detection", desc: "Inactivity, gaps & staleness" },
            { label: "Job Matching", desc: "Configurable per-role weights" },
            { label: "Improvement Plans", desc: "Actionable candidate guidance" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-sm font-medium text-foreground">{f.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
