import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ recruiterId: string }> }
) {
  const { recruiterId } = await params
  const rows = await sql`
    SELECT * FROM jobs
    WHERE recruiter_id = ${recruiterId}
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ recruiterId: string }> }
) {
  const { recruiterId } = await params
  const body = await req.json()
  const {
    title,
    description,
    backend_weight,
    consistency_weight,
    collaboration_weight,
    recency_weight,
    impact_weight,
    min_threshold,
  } = body

  const id = `job-${Date.now()}`
  const rows = await sql`
    INSERT INTO jobs (
      id, recruiter_id, title, description,
      backend_weight, consistency_weight, collaboration_weight,
      recency_weight, impact_weight, min_threshold
    ) VALUES (
      ${id}, ${recruiterId}, ${title}, ${description},
      ${backend_weight}, ${consistency_weight}, ${collaboration_weight},
      ${recency_weight}, ${impact_weight}, ${min_threshold}
    )
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
