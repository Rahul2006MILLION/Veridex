import { Sidebar } from "@/components/sidebar"
import sql from "@/lib/db"
import { notFound } from "next/navigation"

export default async function CandidateLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const users = await sql`SELECT * FROM users WHERE id = ${userId} AND role = 'candidate'`
  if (users.length === 0) notFound()
  const user = users[0]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="candidate" userId={userId} userName={user.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
