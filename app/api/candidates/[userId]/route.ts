import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const rows = await sql`
    SELECT cp.*, u.name, u.email
    FROM candidate_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.user_id = ${userId}
  `
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(rows[0])
}
