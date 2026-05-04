import { Briefcase, ChevronsLeftRight, GripVertical } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { crmCustomers } from '../../data/crmCustomers'
import { projectManagementCardsMock, type ProjectCardItem, type ProjectStatus } from '../../data/projectManagementCardsMock'

const projectStatusLabel: Record<ProjectStatus, string> = {
  planlama: 'Planlama',
  devam: 'Devam',
  riskli: 'Riskli',
  beklemede: 'Beklemede',
  tamamlandi: 'Tamamlandı',
}

const priorityLabel: Record<ProjectCardItem['priority'], string> = {
  dusuk: 'Düşük',
  normal: 'Normal',
  yuksek: 'Yüksek',
  kritik: 'Kritik',
}

type CommercialTabId = 'ozet' | 'butce' | 'faturalar' | 'riskler'

export function CustomerProjectsCommercialPanel({ customerId }: { customerId: string }) {
  const customer = useMemo(() => crmCustomers.find((c) => c.id === customerId) ?? null, [customerId])

  const rows = useMemo(() => {
    if (!customer) return []
    return customer.projeler
      .map((p) => {
        const card = projectManagementCardsMock.find((c) => c.id === p.projectCardId) ?? null
        return { row: p, card }
      })
      .filter((x): x is { row: (typeof customer.projeler)[0]; card: ProjectCardItem } => x.card != null)
  }, [customer])

  const [selectedProjectCardId, setSelectedProjectCardId] = useState(() => rows[0]?.card.id ?? '')
  const [detailTab, setDetailTab] = useState<CommercialTabId>('ozet')
  const [splitRatio, setSplitRatio] = useState(40)
  const [isResizing, setIsResizing] = useState(false)
  const [isResizerHover, setIsResizerHover] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const splitRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!rows.length) return
    if (!rows.some((r) => r.card.id === selectedProjectCardId)) {
      setSelectedProjectCardId(rows[0]!.card.id)
    }
  }, [rows, selectedProjectCardId])

  const selected = useMemo(
    () => rows.find((r) => r.card.id === selectedProjectCardId)?.card ?? null,
    [rows, selectedProjectCardId],
  )

  useEffect(() => {
    if (!isResizing) return
    const onMouseMove = (event: MouseEvent) => {
      const host = splitRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      if (rect.width <= 0) return
      const next = ((event.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(55, Math.max(30, Number(next.toFixed(2)))))
    }
    const onMouseUp = () => setIsResizing(false)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing])

  const scrollPanelTop = () => {
    requestAnimationFrame(() => {
      panelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  if (!customer) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Müşteri bulunamadı.</p>
  }

  if (rows.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Bu müşteriye bağlı proje kartı yok (mock).</p>
  }

  return (
    <div
      ref={splitRef}
      className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden gap-0"
    >
      <section
        className="okan-project-split-list okan-split-list-active-lift flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3"
        style={{ width: `calc(${splitRatio}% - 5px)` }}
      >
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Proje listesi</h3>
        </div>
        <div className="mb-3 shrink-0" />
        <ul
          className="flex h-full min-h-0 flex-col gap-1 overflow-y-auto pr-1"
          role="list"
          aria-label="Müşteri projeleri"
        >
          {rows.map(({ row, card }) => {
            const st = projectStatusLabel[card.status]
            return (
              <li
                key={row.id}
                className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectCardId(card.id)
                    setDetailTab('ozet')
                    scrollPanelTop()
                  }}
                  aria-current={selectedProjectCardId === card.id ? 'true' : undefined}
                  className={[
                    'flex w-full items-stretch gap-2.5 px-3 py-2 text-left text-sm transition',
                    selectedProjectCardId === card.id
                      ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                      : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                  ].join(' ')}
                >
                  <div className="flex min-w-0 flex-1 gap-2">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/60">
                      <Briefcase className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 flex-col gap-0.5">
                      <span className="inline-flex w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {st}
                      </span>
                      <p className="mt-1 font-mono font-semibold text-slate-900 dark:text-slate-50">{card.code}</p>
                      <p className="truncate text-xs text-slate-600 dark:text-slate-300">{card.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Termin {card.dueDate} · {card.owner}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-[min(38%,7.5rem)] max-w-[7.5rem] shrink-0 flex-col justify-center gap-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                      <div
                        className="h-full rounded-full bg-sky-500/80"
                        style={{ width: `${card.progress}%` }}
                      />
                    </div>
                    <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-slate-600 dark:text-slate-300">
                      %{card.progress} ilerleme
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex">
        <button
          type="button"
          aria-label="Paneller arası genişliği ayarla"
          onMouseDown={() => setIsResizing(true)}
          onMouseEnter={() => setIsResizerHover(true)}
          onMouseLeave={() => setIsResizerHover(false)}
          className={[
            'group absolute inset-y-3 left-1/2 -translate-x-1/2 rounded-full border transition',
            isResizing || isResizerHover
              ? 'w-6 border-sky-300/70 bg-sky-100/70 dark:border-sky-500/60 dark:bg-sky-900/40'
              : 'w-3 border-slate-200/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/60',
          ].join(' ')}
        >
          <span className="pointer-events-none flex h-full items-center justify-center text-slate-500 dark:text-slate-300">
            {isResizing || isResizerHover ? (
              <ChevronsLeftRight className="size-3.5" />
            ) : (
              <GripVertical className="size-3.5" />
            )}
          </span>
        </button>
      </div>

      <aside
        ref={panelRef}
        className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2"
      >
        {selected ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Seçili proje
              </p>
              <h3 className="mt-1.5 font-mono text-xl font-semibold text-slate-900 dark:text-slate-50">{selected.code}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.name}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {projectStatusLabel[selected.status]} · Öncelik {priorityLabel[selected.priority]}
              </p>
            </header>

            <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-3">
              <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist" aria-label="Proje ticari sekmeler">
                {(
                  [
                    ['ozet', 'Özet'],
                    ['butce', 'Bütçe & sözleşme'],
                    ['faturalar', 'Faturalar'],
                    ['riskler', 'Riskler'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === id}
                    onClick={() => {
                      setDetailTab(id)
                      scrollPanelTop()
                    }}
                    className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                      detailTab === id
                        ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                        : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div
              role="tabpanel"
              className="okan-project-tab-panel mt-3 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-left sm:px-1"
            >
              {detailTab === 'ozet' ? (
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Takvim</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">
                      {selected.startDate} → {selected.dueDate}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Son güncelleme: {selected.updatedAt}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Operasyon özeti</p>
                    <p className="mt-1 text-slate-800 dark:text-slate-100">{selected.note}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sorumlu</p>
                    <p className="font-medium text-slate-900 dark:text-slate-50">{selected.owner}</p>
                  </div>
                </div>
              ) : null}

              {detailTab === 'butce' ? (
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 dark:border-slate-700/50 dark:bg-slate-900/35">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Sözleşme çerçevesi (mock)
                    </p>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-500">Sözleşme tutarı</dt>
                        <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">₺ — (ERP)</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Hakediş aşaması</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-50">%{selected.progress} ilerlemeye paralel (mock)</dd>
                      </div>
                    </dl>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bu sekme satış ve finans kullanıcıları içindir; teknik ürün listesi proje detayındaki “Ürün listesi”
                    sekmesindedir.
                  </p>
                </div>
              ) : null}

              {detailTab === 'faturalar' ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200/45 dark:border-slate-700/50">
                  <table className="w-full min-w-[320px] text-left text-xs">
                    <thead className="border-b border-slate-200/50 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Belge</th>
                        <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Tutar</th>
                        <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200/40 dark:border-slate-700/40">
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-100">Avans faturası (mock)</td>
                        <td className="px-3 py-2 tabular-nums text-slate-800 dark:text-slate-100">—</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">Ödendi</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-100">Hakediş-1 (mock)</td>
                        <td className="px-3 py-2 tabular-nums text-slate-800 dark:text-slate-100">—</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">Beklemede</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}

              {detailTab === 'riskler' ? (
                <div className="rounded-lg border border-slate-200/45 bg-white/65 p-3 text-sm dark:border-slate-700/50 dark:bg-slate-900/35">
                  {selected.status === 'riskli' ? (
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Riskli proje: operasyon notu ve termin takibi önceliklidir.
                    </p>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-200">Kritik risk bayrağı yok (mock).</p>
                  )}
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{selected.note}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}
