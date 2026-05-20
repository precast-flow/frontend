import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { splitTabPill } from '../shared/splitModuleStyles'

/** Kalite sağ panel — tam genişlik, yan boşluk yok (max-w kısıtı kullanılmaz). */
const qualityDetailHeaderClass =
  'shrink-0 border-b border-slate-200/25 pb-3 text-left dark:border-white/10'

export type QualityDetailTab = {
  id: string
  label: string
}

const QualityDetailGlContext = createContext(false)

function useQualityDetailGl() {
  return useContext(QualityDetailGlContext)
}

type Props = {
  gl: boolean
  entityKey: string
  panelIdPrefix: string
  selectedLabel: string
  title: string
  subtitle?: string
  headerActions?: ReactNode
  tabs: QualityDetailTab[]
  activeTab: string
  onTabChange: (id: string) => void
  children: ReactNode
}

/** CRM / proje detay sütunu: başlık, sekmeler, kaydırılabilir panel. */
export function QualityDetailColumn({
  gl,
  entityKey,
  panelIdPrefix,
  selectedLabel,
  title,
  subtitle,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  children,
}: Props) {
  const detailPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    detailPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeTab, entityKey])

  return (
    <QualityDetailGlContext.Provider value={gl}>
      <div
        ref={detailPanelRef}
        className="okan-project-detail-column flex h-full min-h-0 min-w-0 flex-1 flex-col"
      >
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
          <header className={qualityDetailHeaderClass}>
            <p className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
              {selectedLabel}
            </p>
            <h3 className="mt-1.5 text-xl font-semibold leading-tight text-black dark:text-white">{title}</h3>
            {subtitle ? (
              <p className="mt-1 text-sm leading-snug text-black/75 dark:text-white/80">{subtitle}</p>
            ) : null}
            {headerActions ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/10 pt-3 dark:border-white/10">
                {headerActions}
              </div>
            ) : null}
          </header>

          <div className="sticky top-0 z-10 flex w-full shrink-0 justify-start bg-transparent pt-1">
            <div
              className="flex w-full max-w-full flex-wrap justify-start gap-1 overflow-x-auto"
              role="tablist"
              aria-label={selectedLabel}
              aria-orientation="horizontal"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`${panelIdPrefix}-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${panelIdPrefix}-panel`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => onTabChange(tab.id)}
                  className={splitTabPill(activeTab === tab.id, { gl })}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div
            key={activeTab}
            id={`${panelIdPrefix}-panel`}
            role="tabpanel"
            aria-labelledby={`${panelIdPrefix}-tab-${activeTab}`}
            className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 pt-2"
          >
            <div className="flex w-full min-w-0 flex-col gap-5 text-left">{children}</div>
          </div>
        </div>
      </div>
    </QualityDetailGlContext.Provider>
  )
}

export function QualityDetailSection({
  title,
  action,
  children,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      {title || action ? (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          {title ? (
            <h4 className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
              {title}
            </h4>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function QualityDetailCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const gl = useQualityDetailGl()
  const cardCls = gl
    ? 'rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]'
    : 'rounded-2xl border border-slate-200/70 bg-white/50 p-4 shadow-sm dark:border-slate-600/50 dark:bg-slate-900/30'
  return <div className={[cardCls, className].filter(Boolean).join(' ')}>{children}</div>
}

/** Genel bilgi alanları — sol hizalı 2 sütun grid. */
export function QualityDetailFieldsGrid({ children }: { children: ReactNode }) {
  return (
    <QualityDetailCard>
      <dl className="grid w-full grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:gap-x-8">{children}</dl>
    </QualityDetailCard>
  )
}

export function QualityDetailField({
  label,
  value,
  span,
}: {
  label: string
  value: string
  span?: 'full'
}) {
  return (
    <div className={span === 'full' ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
      <dt className="text-xs font-medium text-black/55 dark:text-white/60">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-snug text-black dark:text-white">{value}</dd>
    </div>
  )
}

export function QualityDetailNote({ children }: { children: ReactNode }) {
  return (
    <QualityDetailCard>
      <p className="text-sm leading-relaxed text-black/80 dark:text-white/85">{children}</p>
    </QualityDetailCard>
  )
}

export function QualityDetailActions({ children }: { children: ReactNode }) {
  return <QualityDetailCard className="flex flex-col gap-3">{children}</QualityDetailCard>
}

type ListItem = { id: string; title: string; subtitle?: string; meta?: string }

export function QualityDetailList({
  items,
  emptyLabel,
}: {
  items: ListItem[]
  emptyLabel?: string
}) {
  const gl = useQualityDetailGl()
  if (items.length === 0) {
    return (
      <p className="py-2 text-sm text-black/55 dark:text-white/55">{emptyLabel ?? '—'}</p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className={
            gl
              ? 'rounded-xl border border-black/10 bg-black/[0.03] px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.04]'
              : 'rounded-xl border border-slate-200/70 bg-white/60 px-3.5 py-3 dark:border-slate-600/50 dark:bg-slate-900/40'
          }
        >
          <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-black dark:text-white">{item.title}</p>
            {item.meta ? (
              <span className="shrink-0 text-xs font-medium tabular-nums text-black/55 dark:text-white/60">
                {item.meta}
              </span>
            ) : null}
          </div>
          {item.subtitle ? (
            <p className="mt-1 text-sm leading-snug text-black/70 dark:text-white/75">{item.subtitle}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function QualityDetailResultsTable({
  rows,
  onValueChange,
}: {
  rows: { fieldId: string; label: string; value: string; unit?: string }[]
  onValueChange: (fieldId: string, value: string) => void
}) {
  const gl = useQualityDetailGl()
  const inputCls = gl
    ? 'glass-input w-full min-w-0 rounded-lg px-2.5 py-1.5 text-sm text-black dark:text-white'
    : 'w-full min-w-0 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-sm text-slate-900 dark:border-slate-600/60 dark:bg-slate-800/50 dark:text-slate-100'

  return (
    <QualityDetailCard className="overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
              Parametre
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
              Değer
            </th>
            <th className="w-16 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
              Birim
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.fieldId}
              className="border-t border-black/8 dark:border-white/8"
            >
              <td className="px-4 py-2.5 align-middle text-black/75 dark:text-white/80">{r.label}</td>
              <td className="px-4 py-2.5 align-middle">
                <input
                  className={inputCls}
                  value={r.value}
                  onChange={(e) => onValueChange(r.fieldId, e.target.value)}
                />
              </td>
              <td className="px-4 py-2.5 align-middle text-xs text-black/50 dark:text-white/55">
                {r.unit ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </QualityDetailCard>
  )
}
