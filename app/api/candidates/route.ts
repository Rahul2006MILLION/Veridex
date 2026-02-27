import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  const rows = await sql`
    SELECT cp.*, u.name, u.email
    FROM candidate_profiles cp
    JOIN users u ON u.id = cp.user_id
    ORDER BY cp.overall_score DESC
  `
  return NextResponse.json(rows)
}
