"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  Code2,
  TrendingUp,
  Briefcase,
  Users,
  PlusCircle,
  LogOut,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  role: "candidate" | "recruiter"
  userId: string
  userName: string
}

const candidateNav = (userId: string): NavItem[] => [
  { href: `/candidate/${userId}`, label: "Profile Overview", icon: <User size={16} /> },
  { href: `/candidate/${userId}/skills`, label: "Skill Breakdown", icon: <Code2 size={16} /> },
  { href: `/candidate/${userId}/improvement`, label: "Improvement Plan", icon: <TrendingUp size={16} /> },
]

const recruiterNav = (userId: string): NavItem[] => [
  { href: `/recruiter/${userId}`, label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: `/recruiter/${userId}/jobs`, label: "Job Listings", icon: <Briefcase size={16} /> },
  { href: `/recruiter/${userId}/candidates`, label: "Candidates", icon: <Users size={16} /> },
  { href: `/recruiter/${userId}/jobs/new`, label: "Create Job", icon: <PlusCircle size={16} /> },
]

export function Sidebar({ role, userId, userName }: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === "candidate" ? candidateNav(userId) : recruiterNav(userId)

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
          <Zap size={14} className="text-primary-foreground" />
        </div>
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">Veridex</span>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-xs font-medium uppercase tracking-widest text-sidebar-foreground/40">
          {role === "candidate" ? "Candidate" : "Recruiter"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-sidebar-border flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-sidebar-foreground">{userName}</p>
          <p className="text-xs text-sidebar-foreground/50 capitalize">{role}</p>
        </div>
        <Link
          href="/"
          className="p-1.5 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title="Switch role"
        >
          <LogOut size={14} />
        </Link>
      </div>
    </aside>
  )
}
