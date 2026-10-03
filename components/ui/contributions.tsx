"use client"

import { useEffect, useState } from "react"
import { SiGithub } from "react-icons/si"
import { Skeleton } from "@/components/ui/skeleton"

type ContributionDay = {
  date: string
  count: number
  level: number
}

type RepoCount = {
  repo: string
  count: number
}

type PushEvent = {
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    commits?: unknown[]
    distinct_size?: number
    size?: number
  }
}

const LEVEL_CLASSES = [
  "bg-border",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
]

function levelClass(level: number) {
  return LEVEL_CLASSES[Math.min(Math.max(level, 0), 4)]
}

function formatTooltip(day: ContributionDay) {
  const label = new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  })
  if (day.count === 0) return `No contributions on ${label}`
  return `${day.count} contribution${day.count === 1 ? "" : "s"} on ${label}`
}

export function ContributionsGraph({ username }: { username: string }) {
  const [days, setDays] = useState<ContributionDay[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [repoByDate, setRepoByDate] = useState<Record<string, RepoCount[]>>({})
  const [tip, setTip] = useState<{
    x: number
    y: number
    title: string
    sub: string | null
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data: { contributions: ContributionDay[] }) => {
        if (!cancelled) setDays(data.contributions)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [username])

  useEffect(() => {
    let cancelled = false
    fetch(`https://api.github.com/users/${username}/events/public?per_page=100`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((events: PushEvent[]) => {
        if (cancelled) return
        const counts: Record<string, Record<string, number>> = {}
        for (const event of events) {
          if (event.type !== "PushEvent") continue
          const date = event.created_at.slice(0, 10)
          const repo = event.repo.name
          const n =
            event.payload.distinct_size ??
            event.payload.commits?.length ??
            event.payload.size ??
            1
          counts[date] ??= {}
          counts[date][repo] = (counts[date][repo] ?? 0) + n
        }
        const byDate: Record<string, RepoCount[]> = {}
        for (const [date, repos] of Object.entries(counts)) {
          byDate[date] = Object.entries(repos)
            .map(([repo, count]) => ({ repo, count }))
            .sort((a, b) => b.count - a.count)
        }
        setRepoByDate(byDate)
      })
      .catch(() => {

      })
    return () => {
      cancelled = true
    }
  }, [username])

  useEffect(() => {
    if (!tip) return
    const clear = () => setTip(null)
    window.addEventListener("scroll", clear, { capture: true, passive: true })
    return () =>
      window.removeEventListener("scroll", clear, { capture: true })
  }, [tip])

  if (failed) {
    return (
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        View contributions on GitHub
      </a>
    )
  }

  if (!days) {
    return <Skeleton className="h-27 w-full rounded-xl" />
  }

  const total = days.reduce((sum, day) => sum + day.count, 0)
  const leadingBlanks = new Date(`${days[0].date}T00:00:00`).getDay()

  return (
    <div>
      <div className="overflow-x-auto pb-1" onMouseLeave={() => setTip(null)}>
        <div className="grid w-max grid-flow-col grid-rows-7 gap-0.75">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <span key={`blank-${i}`} className="size-2.5" aria-hidden />
          ))}
          {days.map((day) => (
            <span
              key={day.date}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const repos = repoByDate[day.date] ?? []
                const sub =
                  repos.length === 0
                    ? null
                    : repos
                        .slice(0, 2)
                        .map((r) => r.repo)
                        .join(", ") +
                      (repos.length > 2 ? ` +${repos.length - 2} more` : "")
                const cx = rect.left + rect.width / 2
                setTip({
                  x: Math.min(
                    Math.max(cx, 140),
                    window.innerWidth - 140,
                  ),
                  y: rect.top,
                  title: formatTooltip(day),
                  sub,
                })
              }}
              className={`size-2.5 rounded-[2px] ${levelClass(day.level)}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {total.toLocaleString()} contributions in the last year
        </p>
      </div>
      {tip && (
        <div
          aria-hidden
          style={{ left: tip.x, top: tip.y - 8 }}
          className="pointer-events-none fixed z-100 flex -translate-x-1/2 -translate-y-full flex-col rounded-md bg-foreground px-2.5 py-1 text-xs whitespace-nowrap text-background shadow-lg"
        >
          <span>{tip.title}</span>
          {tip.sub && (
            <span className="flex items-center gap-1 opacity-70">
              <SiGithub className="size-3 shrink-0" aria-hidden />
              {tip.sub}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
