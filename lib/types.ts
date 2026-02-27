export type Role = "candidate" | "recruiter"
export type RiskLevel = "Low" | "Medium" | "High"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  image: string | null
  created_at: string
}

export interface CandidateProfile {
  id: string
  user_id: string
  github_username: string | null
  overall_score: number
  risk_score: RiskLevel
  data_completeness: number
  last_active_date: string
  // joined
  name?: string
  email?: string
}

export interface Skill {
  id: string
  candidate_id: string
  name: string
  score: number
  complexity_score: number
  consistency_score: number
  collaboration_score: number
  recency_score: number
  impact_score: number
  certification_bonus: number
}

export interface SkillHistory {
  id: string
  skill_id: string
  month: string
  score: number
}

export interface Job {
  id: string
  recruiter_id: string
  title: string
  description: string | null
  backend_weight: number
  consistency_weight: number
  collaboration_weight: number
  recency_weight: number
  impact_weight: number
  min_threshold: number
  created_at: string
}

export interface MatchResult {
  id: string
  job_id: string
  candidate_id: string
  fit_score: number
  risk_level: RiskLevel
  gap_summary: string | null
  // joined
  candidate_name?: string
  candidate_email?: string
  overall_score?: number
}
