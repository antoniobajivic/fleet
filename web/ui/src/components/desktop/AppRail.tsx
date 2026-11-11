import { useLocation } from 'wouter'
import { AppWindowIcon, BotIcon, LayoutGridIcon, MessagesSquareIcon, PlusIcon } from 'lucide-react'

import { HostShellButtons } from '@/components/desktop/HostShellButtons'
import { FocusToggle } from '@/components/FocusToggle'
import { ModuleButtons, ModuleRailItems, RailItem } from '@/components/ModuleNav'
import { StatusDot } from '@/components/StatusDot'
import { UsageMeters } from '@/components/UsageMeters'
import { Button } from '@/components/ui/button'
import type { SessionListState } from '@/hooks/useSessionList'
import { isSetAsideFilter, visibleStatusFilters, type StatusFilterId } from '@/lib/sessions'
import { withHint } from '@/lib/shortcuts'

/**
 * The desktop app's left rail, Slack style: New, this host's 5h and weekly usage and the status
 * counts on top, then Sessions, Bots (their screen), the Slack / Apps session filters and the
 * work modules, Operator last, and the helpers at the foot (a terminal per host, focus, settings). Starts below the desktop app's traffic lights.
 */
export function AppRail({ list, now, onNew }: { list: SessionListState; now: number; onNew: () => void }) {
  const { fleet, summary, status, setStatus, view } = list
  const [location, navigate] = useLocation()
  const onSessions = location === '/' || location.startsWith('/s/')
  const counts = fleet ? view.counts : null
  const shown = new Set(visibleStatusFilters(counts, status).map((f) => f.id))
  const kind = (id: StatusFilterId) => () => {
    setStatus(id)
    if (!onSessions) navigate('/')
  }

  return (
    <nav
      aria-label="Modules"
      data-tauri-drag-region="deep"
      className="titlebar-rail flex w-[5.25rem] shrink-0 flex-col items-center gap-3 overflow-y-auto border-r bg-card px-1.5 pt-3 pb-3"
    >
      <Button size="icon-lg" aria-label="New session" title={withHint('New session', 'new')} onClick={onNew} className="shrink-0 rounded-xl">
        <PlusIcon />
      </Button>

      {fleet ? (
        <a
          href="#/usage"
          aria-label="Usage limits"
          className="flex w-full flex-col gap-1 rounded-md px-1 py-1 text-[0.625rem] outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <UsageMeters host={fleet.self} now={now} meterClassName="w-full justify-between" />
        </a>
      ) : null}

      {fleet ? (
        <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground tabular-nums" aria-label="Status summary">
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
        <RailItem label="Sessions" icon={<LayoutGridIcon />} active={onSessions && !isSetAsideFilter(status)} onClick={kind('all')} />
        <RailItem label="Bots" title={withHint('Bots: schedules, runs and their live sessions', 'jobs')} icon={<BotIcon />} count={counts?.scheduled} href="#/bots" active={location === '/bots'} />
        <RailItem label="Slack" title="Sessions linked to Slack" icon={<MessagesSquareIcon />} count={counts?.slack} active={onSessions && status === 'slack'} onClick={kind('slack')} />
        {shown.has('embedded') ? (
          <RailItem label="Apps" title="Sessions started from an app's Fleet panel" icon={<AppWindowIcon />} count={counts?.embedded} active={onSessions && status === 'embedded'} onClick={kind('embedded')} />
        ) : null}
        <ModuleRailItems />
      </div>

      <div className="mt-auto flex w-full flex-col items-center gap-1.5 border-t pt-3">
        <HostShellButtons />
        <FocusToggle size="icon-sm" />
        <ModuleButtons size="icon-sm" group="utility" exclude={['usage']} />
      </div>
    </nav>
  )
}
