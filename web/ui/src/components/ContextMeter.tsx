import type { ContextUsage } from '@/api/types'
import { ctxLevel, ctxSummary, type CtxLevel } from '@/lib/format'
import { CTX_FILL, CTX_TEXT } from '@/lib/styles'
import { cn } from '@/lib/utils'

/** Tiny meter: an optional label, a 4-cell-wide bar and the percentage, coloured by band. */
export function Meter({ pct, level, title, label, className }: { pct: number; level: CtxLevel; title: string; label?: string; className?: string }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-1 tabular-nums', CTX_TEXT[level], className)}
      title={title}
      aria-label={title}
    >
      {label ? <span aria-hidden>{label}</span> : null}
      <span className="relative h-1.5 w-5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className={cn('absolute inset-y-0 left-0 rounded-full', CTX_FILL[level])} style={{ width: `${Math.min(100, pct)}%` }} />
      </span>
      {pct}%
    </span>
  )
}

/** Context-window meter. */
export function ContextMeter({ context: c, label, className }: { context?: ContextUsage | null; label?: string; className?: string }) {
  if (!c || !Number.isFinite(c.pct)) return null
  const pct = Math.max(0, Math.round(c.pct))
  const title = [`Context ${ctxSummary(c)}`, c.model].filter(Boolean).join(' · ')
  return <Meter pct={pct} level={ctxLevel(pct)} title={title} label={label} className={className} />
}
