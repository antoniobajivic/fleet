import type { KeyboardEvent, Ref } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'

import { GroupsStatus } from '@/components/board/GroupsStatus'
import { SessionFilters } from '@/components/SessionFilters'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { ViewToggle } from '@/components/ViewToggle'
import type { GroupsState } from '@/hooks/useGroups'
import type { SessionListState } from '@/hooks/useSessionList'
import type { ViewMode } from '@/lib/groups'
import { ariaShortcut, shortcutHint } from '@/lib/shortcuts'

export interface TopBarProps {
  list: SessionListState
  now: number
  view: ViewMode
  onView: (v: ViewMode) => void
  searchRef: Ref<HTMLInputElement>
  /** ↑ / ↓ / Enter inside the search field drive the list / board cursor. */
  onSearchNav: (action: 'next' | 'prev' | 'open') => void
  /** The Board's last grouping run + Regroup (omitted on the List). */
  groups?: GroupsState
}

/**
 * The desktop top bar right of the rail (AppRail), the same over the Board and the List: session
 * filters, search, Board | List, the Board's grouping status.
 */
export function TopBar({ list, now, view, onView, searchRef, onSearchNav, groups }: TopBarProps) {
  const { query, setQuery, note } = list

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      onSearchNav(e.key === 'ArrowDown' ? 'next' : 'prev')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onSearchNav('open')
    } else if (e.key === 'Escape' && query) {
      // First Esc clears, the second leaves the field (window handler).
      e.preventDefault()
      e.stopPropagation()
      setQuery('')
    }
  }

  return (
    <header
      data-tauri-drag-region="deep"
      className="titlebar flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5"
    >
      <SessionFilters list={list} />

      <div className="relative w-64 min-w-40">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-dimmer" />
        <Input
          ref={searchRef}
          type="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Search name, title, cwd…"
          aria-label="Search sessions"
          aria-keyshortcuts={ariaShortcut('search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKeyDown}
          className="h-8 rounded-lg bg-card pr-9 pl-8 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-lg text-dimmer outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <XIcon className="size-4" />
          </button>
        ) : (
          <Kbd className="absolute top-1/2 right-2 -translate-y-1/2">{shortcutHint('search')}</Kbd>
        )}
      </div>

      <ViewToggle value={view} onChange={onView} />

      <div className="ml-auto flex min-w-0 items-center gap-2">
        {groups ? <GroupsStatus state={groups} now={now} quiet /> : null}
        {note.error ? <span className="hidden truncate text-[0.6875rem] text-destructive tabular-nums xl:inline">{note.text}</span> : null}
      </div>
    </header>
  )
}
