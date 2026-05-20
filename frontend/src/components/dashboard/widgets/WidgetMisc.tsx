import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange,
  ClipboardList,
  Factory,
  FolderKanban,
  Truck,
  Users,
} from 'lucide-react'
import { useNotificationFeed } from '../../../context/NotificationFeedContext'
import { useDashboard } from '../../../context/DashboardContext'
import { moduleIdToPath } from '../../../data/navigation'
import { SHIFT_CALENDAR_SEED } from '../../../data/firmShiftCalendarMock'
import { chartDataForSource, heatmapCells, listDataForSource } from '../dashboardData'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

export function WidgetGauge({ widget }: Props) {
  const value = widget.settings.gaugeValue ?? 72
  const max = widget.settings.gaugeMax ?? 100
  const pct = Math.min(100, Math.round((value / max) * 100))
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <p className="text-2xl font-semibold tabular-nums text-[var(--glass-text-primary)]">{pct}%</p>
      <p className="text-xs text-[var(--glass-text-muted)]">
        {value} / {max}
      </p>
    </div>
  )
}

export function WidgetHeatmap() {
  const cells = useMemo(() => heatmapCells(), [])
  const max = Math.max(...cells.map((cell) => cell.value), 1)

  return (
    <div className="grid grid-cols-7 gap-1 p-1">
      {cells.map((cell) => (
        <div
          key={cell.day}
          title={`Gün ${cell.day}: ${cell.value}`}
          className="aspect-square rounded-md"
          style={{
            background: `rgba(14, 165, 233, ${0.15 + (cell.value / max) * 0.75})`,
          }}
        />
      ))}
    </div>
  )
}

export function WidgetFunnel({ widget }: Props) {
  const data = chartDataForSource(widget.settings.dataSource ?? 'quoteStages')
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <ul className="flex h-full flex-col justify-center gap-2 px-1">
      {data.map((row) => (
        <li key={row.label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 truncate text-xs text-[var(--glass-text-muted)]">{row.label}</span>
          <div
            className="h-7 rounded-lg bg-gradient-to-r from-sky-500/80 to-violet-500/60"
            style={{ width: `${Math.max(12, (row.value / max) * 100)}%` }}
          />
          <span className="text-xs font-medium tabular-nums">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function WidgetTopN({ widget }: Props) {
  const rows = listDataForSource(widget.settings.topnSource ?? 'workOrders', widget.settings.limit ?? 5)
  return (
    <ol className="dash-widget-scroll flex h-full flex-col gap-2">
      {rows.map((row, i) => (
        <li key={row.id} className="flex items-center gap-2 text-sm">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-bold text-sky-600 dark:text-sky-300">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{row.primary}</p>
            <p className="truncate text-xs text-[var(--glass-text-muted)]">{row.secondary}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function WidgetCalendar() {
  const shifts = SHIFT_CALENDAR_SEED.shiftRows
  return (
    <ul className="dash-widget-scroll grid h-full grid-cols-1 gap-2 text-xs sm:grid-cols-3">
      {shifts.map((d) => (
        <li
          key={d.id}
          className="rounded-xl border border-slate-200/60 bg-white/50 p-2 dark:border-white/10 dark:bg-white/5"
        >
          <p className="font-semibold text-[var(--glass-text-primary)]">{d.name}</p>
          <p className="mt-0.5 text-[var(--glass-text-muted)]">
            {d.start} – {d.end}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function WidgetActivity({ widget }: Props) {
  const { items } = useNotificationFeed()
  const limit = widget.settings.limit ?? 10
  return (
    <ul className="dash-widget-scroll relative flex h-full flex-col gap-0 border-l border-slate-200/70 pl-4 dark:border-white/15">
      {items.slice(0, limit).map((n) => (
        <li key={n.id} className="relative pb-3">
          <span className="absolute -left-[1.3rem] top-1 size-2 rounded-full bg-sky-500" />
          <p className="text-sm font-medium">{n.title}</p>
          <p className="text-xs text-[var(--glass-text-muted)]">{n.time}</p>
        </li>
      ))}
    </ul>
  )
}

const QUICK_LINKS = [
  { id: 'crm', icon: Users },
  { id: 'project', icon: FolderKanban },
  { id: 'unit-work-queue', icon: ClipboardList },
  { id: 'production-planning', icon: Factory },
  { id: 'dispatch-planning', icon: Truck },
  { id: 'general-planning', icon: CalendarRange },
] as const

export function WidgetQuickActions() {
  const navigate = useNavigate()
  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {QUICK_LINKS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/60 bg-white/50 p-2 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          onClick={() => navigate(moduleIdToPath(id))}
        >
          <Icon className="size-5 text-sky-600 dark:text-cyan-400" strokeWidth={1.75} />
          <span className="text-[10px] font-medium text-[var(--glass-text-muted)]">{id}</span>
        </button>
      ))}
    </div>
  )
}

export function WidgetMarkdown({ widget }: Props) {
  const { updateWidgetSettings } = useDashboard()
  const [local, setLocal] = useState(widget.settings.note ?? '')

  useEffect(() => {
    setLocal(widget.settings.note ?? '')
  }, [widget.settings.note])

  return (
    <textarea
      className="h-full w-full resize-none rounded-xl border-0 bg-transparent p-1 text-sm text-[var(--glass-text-primary)] outline-none placeholder:text-[var(--glass-text-muted)]"
      placeholder="Notunuzu yazın…"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => updateWidgetSettings(widget.id, { note: local })}
    />
  )
}

export function WidgetClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <p className="text-3xl font-semibold tabular-nums tracking-tight">
        {now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-sm text-[var(--glass-text-muted)]">
        {now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <p className="mt-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
        Sabah vardiyası
      </p>
    </div>
  )
}

export function WidgetMap() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-200/40 to-sky-500/10 p-4 dark:from-slate-800/40">
      <p className="text-sm font-medium text-[var(--glass-text-primary)]">Saha & sevkiyat haritası</p>
      <p className="text-center text-xs text-[var(--glass-text-muted)]">
        3 aktif şantiye · 2 sevkiyat rotası (mock)
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {['Kartal', 'Haliç', 'İzmit'].map((loc) => (
          <span key={loc} className="rounded-lg bg-white/70 px-2 py-1 text-[10px] font-medium dark:bg-white/10">
            {loc}
          </span>
        ))}
      </div>
    </div>
  )
}
