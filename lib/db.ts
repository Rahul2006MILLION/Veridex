import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

type SqlQuery = NeonQueryFunction<false, false>

// Safe fallback that returns empty arrays instead of throwing
const fallbackSql = (async () => {
  console.warn(
    "[v0] DATABASE_URL is not set. Using fallback SQL — all queries will return [].\n" +
    "     Set DATABASE_URL in your environment to connect to Neon."
  )
  return []
}) as unknown as SqlQuery

// Only initialise neon when DATABASE_URL is present
const sql: SqlQuery = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : fallbackSql

export default sql
