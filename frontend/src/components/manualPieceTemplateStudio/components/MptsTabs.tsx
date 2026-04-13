import type { ReactNode } from 'react'

export type TabItem = { id: string; label: string }

/** Mühendislik Entegrasyonu ile aynı pill / segmented kontrol görünümü */
export function MptsTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div
      className="okan-liquid-pill-track flex w-full max-w-full gap-1 overflow-x-auto rounded-full p-1"
      role="tablist"
      aria-label="Sekmeler"
    >
      {tabs.map((t) => {
        const is = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={is}
            onClick={() => onChange(t.id)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:px-4 md:text-sm ${
              is
                ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/** Aktif sekme içeriği — üst düzey flex içinde kalan yüksekliği doldurur ve kaydırır */
export function MptsTabPanel({ active, id, children }: { active: string; id: string; children: ReactNode }) {
  if (active !== id) return null
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pr-1 [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  )
}
