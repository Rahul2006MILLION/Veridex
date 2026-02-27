import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const profile = await sql`
    SELECT id FROM candidate_profiles WHERE user_id = ${userId}
  `
  if (profile.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const candidateId = profile[0].id

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
  return NextResponse.json(skills)
}
