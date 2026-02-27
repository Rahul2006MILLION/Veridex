import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        level === "Low" && "bg-emerald-500/15 text-emerald-400",
        level === "Medium" && "bg-amber-500/15 text-amber-400",
        level === "High" && "bg-red-500/15 text-red-400",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          level === "Low" && "bg-emerald-400",
          level === "Medium" && "bg-amber-400",
          level === "High" && "bg-red-400"
        )}
      />
      {level} Risk
    </span>
  )
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const color =
    score >= 75
      ? "bg-emerald-500/15 text-emerald-400"
      : score >= 55
      ? "bg-amber-500/15 text-amber-400"
      : "bg-red-500/15 text-red-400"

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium",
        color,
        className
      )}
    >
      {score.toFixed(1)}
    </span>
  )
}
