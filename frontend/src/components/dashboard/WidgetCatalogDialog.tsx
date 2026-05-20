import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useDashboard } from '../../context/DashboardContext'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'
import { DashboardSideDrawer } from './dashboardSideDrawer'
import { dashBtnSecondary } from './dashboardButtons'
import { beginCatalogDrag } from './catalogDragState'
import { setWidgetDragData } from './gridDropUtils'
import { WIDGET_CATALOG } from './widgetCatalog'
import { widgetIconFor } from './widgetIcons'
import type { WidgetCatalogEntry } from './types'
import type { WidgetType } from './types'

const CATEGORIES = [
  'dashboard.catalog.category.general',
  'dashboard.catalog.category.production',
  'dashboard.catalog.category.actions',
  'dashboard.catalog.category.lists',
  'dashboard.catalog.category.charts',
  'dashboard.catalog.category.other',
] as const

type CategoryKey = (typeof CATEGORIES)[number]
type CategoryFilter = 'all' | CategoryKey

const TYPE_LABEL: Record<WidgetType, string> = {
  notifications: 'dashboard.widget.notifications',
  actions: 'dashboard.widget.actions',
  list: 'dashboard.widget.list',
  chart: 'dashboard.widget.chart',
  kpi: 'dashboard.widget.kpi',
  gauge: 'dashboard.widget.gauge',
  heatmap: 'dashboard.widget.heatmap',
  funnel: 'dashboard.widget.funnel',
  topn: 'dashboard.widget.topn',
  calendar: 'dashboard.widget.calendar',
  activity: 'dashboard.widget.activity',
  quickActions: 'dashboard.widget.quickActions',
  markdown: 'dashboard.widget.text',
  text: 'dashboard.widget.text',
  clock: 'dashboard.widget.clock',
  map: 'dashboard.widget.map',
  moldStatus: 'dashboard.widget.moldStatus',
  iframe: 'dashboard.widget.iframe',
  weather: 'dashboard.widget.weather',
  currency: 'dashboard.widget.currency',
}

const filterChipClass = (active: boolean) =>
  [
    'shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold transition',
    active
      ? 'border-sky-400/50 bg-sky-500/12 text-sky-900 ring-1 ring-sky-500/25 dark:text-cyan-100'
      : `${dashBtnSecondary} !px-2 !py-1`,
  ].join(' ')

function normalizeSearch(s: string) {
  return s
    .trim()
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

type TileProps = {
  entry: WidgetCatalogEntry
  label: string
  onAdd: () => void
}

function CatalogTile({ entry, label, onAdd }: TileProps) {
  const Icon = widgetIconFor(entry.type)
  const disabled = entry.comingSoon
  const { t } = useI18n()

  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        draggable={!disabled}
        className={[
          'dash-catalog-tile group flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-center transition',
          disabled ? 'cursor-not-allowed opacity-45' : 'cursor-grab active:cursor-grabbing',
        ].join(' ')}
        onClick={() => {
          if (disabled) return
          onAdd()
        }}
        onDragStart={(e) => {
          if (disabled) {
            e.preventDefault()
            return
          }
          beginCatalogDrag({
            type: entry.type,
            w: entry.defaultW,
            h: entry.defaultH,
          })
          setWidgetDragData(e.dataTransfer, entry.type)
        }}
        aria-label={label}
      >
        <span
          className={[
            'flex size-9 items-center justify-center rounded-lg transition',
            disabled
              ? 'bg-slate-100/80 text-slate-400 dark:bg-white/5'
              : 'bg-slate-100/90 text-slate-600 group-hover:bg-sky-500/10 group-hover:text-sky-700 dark:bg-white/8 dark:text-slate-300 dark:group-hover:text-cyan-300',
          ].join(' ')}
        >
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="line-clamp-2 w-full px-0.5 text-[10px] font-semibold leading-tight text-[var(--glass-text-primary)]">
          {label}
        </span>
        {disabled ? (
          <span className="text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-400">
            {t('dashboard.catalog.soon')}
          </span>
        ) : null}
      </button>
    </li>
  )
}

export function WidgetCatalogDialog() {
  const { t } = useI18n()
  const { catalogOpen, setCatalogOpen, addWidget } = useDashboard()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    if (!catalogOpen) {
      setQuery('')
      setCategoryFilter('all')
    }
  }, [catalogOpen])

  const entriesByCategory = useMemo(() => {
    const q = normalizeSearch(query)
    const map = new Map<CategoryKey, WidgetCatalogEntry[]>()

    for (const cat of CATEGORIES) {
      if (categoryFilter !== 'all' && categoryFilter !== cat) continue

      const items = WIDGET_CATALOG.filter((e) => {
        if (e.categoryKey !== cat) return false
        if (!q) return true
        const label = normalizeSearch(t(TYPE_LABEL[e.type]))
        const typeKey = normalizeSearch(e.type)
        return label.includes(q) || typeKey.includes(q)
      })

      if (items.length > 0) map.set(cat, items)
    }

    return map
  }, [query, categoryFilter, t])

  const totalVisible = useMemo(() => {
    let n = 0
    for (const items of entriesByCategory.values()) n += items.length
    return n
  }, [entriesByCategory])

  const categoriesWithItems = useMemo(
    () => CATEGORIES.filter((cat) => WIDGET_CATALOG.some((e) => e.categoryKey === cat)),
    [],
  )

  return (
    <DashboardSideDrawer
      open={catalogOpen}
      closeOnOutsideClick={false}
      onClose={() => setCatalogOpen(false)}
      title={t('dashboard.catalog.title')}
      titleId="widget-catalog-title"
      closeLabel={t('dashboard.catalog.close')}
      maxWidthClass="max-w-[28rem]"
    >
      <div className="shrink-0 space-y-2 border-b border-slate-200/60 px-3 py-2.5 dark:border-white/10">
        <FilterToolbarSearch
          id="widget-catalog-search"
          value={query}
          onValueChange={setQuery}
          placeholder={t('dashboard.catalog.search')}
          ariaLabel={t('dashboard.catalog.searchAria')}
          className="!max-w-none !basis-auto"
          inputClassName="!text-xs"
        />
        <div
          className="flex gap-1 overflow-x-auto overscroll-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label={t('dashboard.catalog.filterGroup')}
        >
          <button
            type="button"
            className={filterChipClass(categoryFilter === 'all')}
            aria-pressed={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          >
            {t('dashboard.catalog.filterAll')}
          </button>
          {categoriesWithItems.map((cat) => (
            <button
              key={cat}
              type="button"
              className={filterChipClass(categoryFilter === cat)}
              aria-pressed={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
            >
              {t(cat)}
            </button>
          ))}
        </div>
        <p className="text-[10px] leading-snug text-[var(--glass-text-muted)]">
          {t('dashboard.catalog.dragHint')}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-auto px-3 py-3">
        {totalVisible === 0 ? (
          <p className="px-1 py-8 text-center text-xs text-[var(--glass-text-muted)]">
            {t('dashboard.catalog.noResults')}
          </p>
        ) : (
          CATEGORIES.map((cat) => {
            const items = entriesByCategory.get(cat)
            if (!items?.length) return null
            return (
              <section key={cat} className="mb-3 last:mb-0">
                {categoryFilter === 'all' ? (
                  <h3 className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
                    {t(cat)}
                  </h3>
                ) : null}
                <ul className="grid grid-cols-3 gap-2">
                  {items.map((entry) => (
                    <CatalogTile
                      key={entry.type}
                      entry={entry}
                      label={t(TYPE_LABEL[entry.type])}
                      onAdd={() => addWidget(entry.type)}
                    />
                  ))}
                </ul>
              </section>
            )
          })
        )}
      </div>
    </DashboardSideDrawer>
  )
}
