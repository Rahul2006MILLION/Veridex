import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ recruiterId: string; jobId: string }> }
) {
  const { jobId } = await params
  const rows = await sql`
    SELECT mr.*, u.name AS candidate_name, u.email AS candidate_email, cp.overall_score
    FROM match_results mr
    JOIN candidate_profiles cp ON cp.id = mr.candidate_id
    JOIN users u ON u.id = cp.user_id
    WHERE mr.job_id = ${jobId}
    ORDER BY mr.fit_score DESC
  `
  return NextResponse.json(rows)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ recruiterId: string; jobId: string }> }
) {
  const { jobId } = await params
  const body = await req.json()
  const { candidate_id, fit_score, risk_level, gap_summary } = body

  const id = `mr-${Date.now()}`
  const rows = await sql`
    INSERT INTO match_results (id, job_id, candidate_id, fit_score, risk_level, gap_summary)
    VALUES (${id}, ${jobId}, ${candidate_id}, ${fit_score}, ${risk_level}, ${gap_summary})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
