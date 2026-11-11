import { useState } from 'react'

import { api } from '@/api/client'
import type { UsageLimit, UsageResponse } from '@/api/types'
import { Meter } from '@/components/ContextMeter'
import { usePoller } from '@/hooks/usePoller'
import { resetsLabel, usageLevel } from '@/lib/usage'

// The CLI caches for 60s (the endpoint rate-limits), so polling faster buys nothing.
const POLL_MS = 60_000

// Last answers, kept across remounts so switching sessions paints at once.
const last = new Map<string, UsageResponse>()

function LimitMeter({ limit: l, label, now, className }: { limit?: UsageLimit; label: string; now: number; className?: string }) {
  if (!l) return null
  const resets = resetsLabel(l.resets_at, now)
  const title = [`${l.label} ${Math.round(l.percent)}% used`, resets ? `resets ${resets}` : null].filter(Boolean).join(' · ')
  return <Meter pct={Math.max(0, Math.round(l.percent))} level={usageLevel(l)} title={title} label={label} className={className} />
}

/** The session's host's 5h and weekly subscription limits, for the session header. Nothing when unknown. */
export function UsageMeters({ host, now, meterClassName }: { host: string; now: number; meterClassName?: string }) {
  const [usage, setUsage] = useState(last.get(host) ?? null)

  usePoller(
    async (signal) => {
      try {
        const next = await api.usage(host, { signal })
        last.set(host, next)
        setUsage(next)
      } catch {
        // The Usage screen reports errors; the header just keeps its last numbers.
      }
    },
    POLL_MS,
  )

  return (
    <>
      <LimitMeter limit={usage?.limits.find((l) => l.kind === 'session')} label="5h" now={now} className={meterClassName} />
      <LimitMeter limit={usage?.limits.find((l) => l.kind === 'weekly_all')} label="week" now={now} className={meterClassName} />
    </>
  )
}
