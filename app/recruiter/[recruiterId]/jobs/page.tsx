import sql from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, PlusCircle } from "lucide-react"

export default async function JobsPage({
  params,
}: {
  params: Promise<{ recruiterId: string }>
}) {
  const { recruiterId } = await params
  const jobs = await sql`
    SELECT j.*, COUNT(mr.id) AS match_count
    FROM jobs j
    LEFT JOIN match_results mr ON mr.job_id = j.id
    WHERE j.recruiter_id = ${recruiterId}
    GROUP BY j.id
    ORDER BY j.created_at DESC
  `

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your active job postings.</p>
        </div>
        <Link
          href={`/recruiter/${recruiterId}/jobs/new`}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <PlusCircle size={14} />
          New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No jobs yet. Create your first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job: any) => (
            <Link key={job.id} href={`/recruiter/${recruiterId}/jobs/${job.id}`}>
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{job.title}</p>
                    {job.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-md">
                        {job.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Threshold: <span className="font-mono text-foreground">{job.min_threshold}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Matches: <span className="font-mono text-foreground">{Number(job.match_count)}</span>
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
