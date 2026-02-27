import { Sidebar } from "@/components/sidebar"
import sql from "@/lib/db"
import { notFound } from "next/navigation"

export default async function RecruiterLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ recruiterId: string }>
}) {
  const { recruiterId } = await params
  const users = await sql`SELECT * FROM users WHERE id = ${recruiterId} AND role = 'recruiter'`
  if (users.length === 0) notFound()
  const user = users[0]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="recruiter" userId={recruiterId} userName={user.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
