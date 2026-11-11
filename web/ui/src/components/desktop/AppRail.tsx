import { PlusIcon } from 'lucide-react'

import { HostShellButtons } from '@/components/desktop/HostShellButtons'
import { FocusToggle } from '@/components/FocusToggle'
import { ModuleButtons, ModuleRailItems } from '@/components/ModuleNav'
import { StatusDot } from '@/components/StatusDot'
import { UsageMeters } from '@/components/UsageMeters'
import { Button } from '@/components/ui/button'
import type { SessionListState } from '@/hooks/useSessionList'
import { withHint } from '@/lib/shortcuts'

/**
 * The desktop app's left rail, Slack style: New and the status counts on top, then Sessions and
 * the work modules, and at the bottom what is always worth a glance (this host's 5h and weekly
 * usage) plus the helpers (a terminal per host, focus, settings). Starts below the desktop app's
 * traffic lights.
 */
export function AppRail({ list, now, onNew }: { list: SessionListState; now: number; onNew: () => void }) {
  const { fleet, summary } = list
  return (
    <nav
      aria-label="Modules"
      data-tauri-drag-region="deep"
      className="titlebar-rail flex w-[4.5rem] shrink-0 flex-col items-center gap-3 overflow-y-auto border-r bg-card px-1.5 pt-3 pb-3"
    >
      <Button size="icon-lg" aria-label="New session" title={withHint('New session', 'new')} onClick={onNew} className="shrink-0 rounded-xl">
        <PlusIcon />
      </Button>

      {fleet ? (
        <div className="flex flex-col items-center gap-1 text-[0.6875rem] text-muted-foreground tabular-nums" aria-label="Status summary">
          {summary.waiting > 0 ? (
            <span className="flex items-center gap-1 font-semibold text-status-waiting" title="Needs you">
              <StatusDot status="waiting" className="size-2" />
              {summary.waiting}
            </span>
          ) : null}
          <span className="flex items-center gap-1" title="Busy">
            <StatusDot status="busy" className="size-2" />
            {summary.busy}
          </span>
          <span className="flex items-center gap-1" title="Idle">
            <StatusDot status="idle" className="size-2" />
            {summary.idle}
          </span>
        </div>
      ) : null}

      <div className="flex w-full flex-col items-center gap-1.5 border-t pt-3">
        <ModuleRailItems />
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-1.5 border-t pt-3">
        {fleet ? (
          <a
            href="#/usage"
            aria-label="Usage limits"
            className="grid w-full grid-cols-2 gap-1 rounded-md py-1 text-[0.625rem] outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <UsageMeters host={fleet.self} now={now} meterClassName="flex-col gap-0.5" />
          </a>
        ) : null}
        <HostShellButtons />
        <FocusToggle size="icon-sm" />
        <ModuleButtons size="icon-sm" group="utility" exclude={['usage']} />
      </div>
    </nav>
  )
}
