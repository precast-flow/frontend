import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import {
  lineTotal,
  quotes as allQuotes,
  statusLabel,
  type Quote,
  type QuoteStatus,
} from '../../data/quotesMock'
import { useI18n } from '../../i18n/I18nProvider'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

const QUOTE_LIST_PAGE_SIZE = 8

const detailTabDefs = [
  { id: 'ozet', label: 'Özet' },
  { id: 'kalemler', label: 'Kalemler' },
  { id: 'onay', label: 'Onay geçmişi' },
  { id: 'surumler', label: 'Sürümler' },
  { id: 'dokumanlar', label: 'Dokümanlar' },
  { id: 'notlar', label: 'Notlar' },
] as const

type DetailTabId = (typeof detailTabDefs)[number]['id']

const ALL_STATUSES: QuoteStatus[] = ['taslak', 'onay_bekliyor', 'onayli', 'red']

function statusPill(status: QuoteStatus) {
  const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1'
  switch (status) {
    case 'taslak':
      return `${base} bg-white/35 text-slate-800 ring-white/35 dark:bg-white/12 dark:text-slate-100`
    case 'onay_bekliyor':
      return `${base} bg-amber-200/50 text-amber-900 ring-amber-300/60 dark:bg-amber-400/20 dark:text-amber-100`
    case 'onayli':
      return `${base} bg-emerald-200/55 text-emerald-900 ring-emerald-300/60 dark:bg-emerald-400/20 dark:text-emerald-100`
    case 'red':
      return `${base} bg-red-200/45 text-red-900 ring-red-300/70 dark:bg-red-400/15 dark:text-red-200`
  }
}

function formatMoney(n: number, currency: string) {
  try {
    return `${currency}${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
  } catch {
    return `${currency}${n}`
  }
}

function totalFromLines(quote: Quote) {
  let sum = 0
  for (const line of quote.lines) {
    const t = lineTotal(line)
    if (t == null) continue
    sum += t
  }
  return sum
}

export function QuoteModuleView({ onNavigate: _onNavigate }: Props) {
  void _onNavigate
  const { t } = useI18n()
  const navigate = useNavigate()
  const detailPanelRef = useRef<HTMLElement | null>(null)
  const rows = useMemo(() => allQuotes, [])

  const [selectedId, setSelectedId] = useState(allQuotes[0]!.id)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<QuoteStatus[]>([])
  const [detailTab, setDetailTab] = useState<DetailTabId>('ozet')
  const [listPage, setListPage] = useState(1)

  const activeFilterCount = statusFilter.length

  const filtered = useMemo(() => {
    if (!statusFilter.length) return rows
    return rows.filter((r) => statusFilter.includes(r.status))
  }, [rows, statusFilter])

  const listTotalPages = Math.max(1, Math.ceil(filtered.length / QUOTE_LIST_PAGE_SIZE))
  const listPageSlice = useMemo(() => {
    const start = (listPage - 1) * QUOTE_LIST_PAGE_SIZE
    return filtered.slice(start, start + QUOTE_LIST_PAGE_SIZE)
  }, [filtered, listPage])

  useEffect(() => {
    setListPage(1)
  }, [statusFilter])

  useEffect(() => {
    setListPage((p) => Math.min(p, listTotalPages))
  }, [listTotalPages])

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((c) => c.id === selectedId)) {
      setSelectedId(filtered[0]!.id)
    }
  }, [filtered, selectedId])

  const selected = useMemo(
    () =>
      filtered.length ? (filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null) : null,
    [filtered, selectedId],
  )

  useEffect(() => {
    if (!detailPanelRef.current) return
    detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' })
  }, [detailTab, selected?.id])

  const toggleStatus = (s: QuoteStatus) => {
    setStatusFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  to="/planlama"
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
                >
                  {t('nav.sidebar.section.planning')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className="font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
                {t('nav.quote')}
              </li>
            </ol>
          </nav>
        </div>

        <div className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="okan-project-split-grid grid h-full min-h-0 gap-2.5 lg:grid-cols-2">
            <section className="okan-project-split-list okan-split-list-active-lift flex min-h-0 flex-col overflow-hidden p-3">
              <div className="mb-3 flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-2">
                <h2 className="min-w-0 text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                  Teklifler
                </h2>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    aria-expanded={filtersOpen}
                    className="okan-liquid-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                  >
                    <Filter className="size-4 shrink-0 opacity-80" aria-hidden />
                    <span>Filtrele</span>
                    {activeFilterCount > 0 ? (
                      <span className="rounded-full bg-sky-500/25 px-1.5 py-0.5 text-xs font-bold tabular-nums text-sky-900 dark:bg-sky-400/20 dark:text-sky-100">
                        {activeFilterCount}
                      </span>
                    ) : null}
                    <ChevronDown
                      className={`size-4 shrink-0 opacity-70 transition ${filtersOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                </div>
              </div>

              {filtersOpen ? (
                <div
                  className="mb-4 shrink-0 space-y-3 rounded-xl border border-slate-200/50 bg-white/45 p-3.5 dark:border-slate-600/40 dark:bg-slate-900/35"
                  role="region"
                  aria-label="Teklif filtreleri"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Durum
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleStatus(s)}
                        className={[
                          'rounded-full px-3 py-2 text-left text-sm font-semibold leading-snug transition',
                          statusFilter.includes(s) ? 'okan-liquid-pill-active text-slate-900' : 'okan-liquid-btn-secondary',
                        ].join(' ')}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                  {statusFilter.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStatusFilter([])}
                      className="okan-liquid-btn-secondary w-full px-3 py-2 text-sm font-semibold sm:w-auto"
                    >
                      Tüm durumlar
                    </button>
                  ) : null}
                </div>
              ) : null}

              {filtered.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">Filtreye uygun teklif yok.</p>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                    {listPageSlice.map((row) => (
                      <li
                        key={row.id}
                        className={[
                          'flex min-h-0 shrink-0 items-stretch gap-1.5 rounded-lg border border-slate-200/50 bg-white/70 px-2 py-1.5 dark:border-slate-700/50 dark:bg-slate-900/35',
                          selected?.id === row.id ? 'okan-project-list-row--active' : '',
                        ].join(' ')}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(row.id)}
                          aria-current={selected?.id === row.id ? 'true' : undefined}
                          className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:hover:bg-slate-900/40"
                        >
                          <p className="font-mono text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                            {row.number}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">{row.customer}</p>
                          <p className="mt-1.5">
                            <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                          </p>
                        </button>
                        <button
                          type="button"
                          title="Tam teklif detayı"
                          onClick={() => navigate(`/teklif-detay/${row.id}`, { state: { fromList: true } })}
                          className="inline-flex shrink-0 items-center gap-0.5 self-center rounded-md px-1.5 py-1 text-[11px] font-medium leading-none text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                        >
                          Detay
                          <ChevronRight className="size-3 opacity-70" strokeWidth={2} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {filtered.length > QUOTE_LIST_PAGE_SIZE ? (
                    <nav
                      aria-label="Teklif listesi sayfaları"
                      className="mt-1 flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/35 pt-2.5 dark:border-slate-600/35"
                    >
                      <button
                        type="button"
                        disabled={listPage <= 1}
                        onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        className="okan-liquid-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
                        Önceki
                      </button>
                      <span className="min-w-0 truncate text-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        Sayfa {listPage} / {listTotalPages}
                        <span className="text-slate-500 dark:text-slate-400"> ({filtered.length})</span>
                      </span>
                      <button
                        type="button"
                        disabled={listPage >= listTotalPages}
                        onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                        className="okan-liquid-btn-secondary inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
                      >
                        Sonraki
                        <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                      </button>
                    </nav>
                  ) : null}
                </div>
              )}
            </section>

            <aside
              ref={detailPanelRef}
              className="okan-project-split-aside flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3 lg:pl-2"
            >
              {selected ? (
                <div key={selected.id} className="okan-project-detail-column flex min-h-0 min-w-0 flex-1 flex-col">
                  <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 lg:max-w-3xl">
                    <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Seçili teklif
                      </p>
                      <h3 className="mt-1.5 font-mono text-lg font-semibold leading-tight text-slate-900 sm:text-xl dark:text-slate-50">
                        {selected.number}
                      </h3>
                      <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300">
                        {selected.customer} · {selected.project}
                      </p>
                      <p className="mt-1.5">
                        <span className={statusPill(selected.status)}>{statusLabel(selected.status)}</span>
                        <span className="ms-2 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                          {formatMoney(selected.total, selected.currency)}
                        </span>
                      </p>
                    </header>

                    <div className="sticky top-0 z-10 flex w-full shrink-0 justify-center pt-0.5">
                      <div
                        className="okan-liquid-pill-track flex max-w-full gap-1 overflow-x-auto rounded-full p-1"
                        role="tablist"
                        aria-label="Seçili teklif sekmeleri"
                        aria-orientation="horizontal"
                      >
                        {detailTabDefs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`quote-detail-tab-${tab.id}`}
                            aria-selected={detailTab === tab.id}
                            aria-controls="quote-detail-panel"
                            tabIndex={detailTab === tab.id ? 0 : -1}
                            onClick={() => setDetailTab(tab.id)}
                            className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                              detailTab === tab.id
                                ? 'okan-liquid-pill-active okan-project-tab-active text-slate-900 dark:text-slate-50'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      key={detailTab}
                      id="quote-detail-panel"
                      role="tabpanel"
                      aria-labelledby={`quote-detail-tab-${detailTab}`}
                      className="okan-project-tab-panel min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-0.5 text-center sm:px-1"
                    >
                      {detailTab === 'ozet' ? (
                        <div className="flex flex-col divide-y divide-slate-200/25 dark:divide-white/10">
                          <div className="space-y-4 pb-4 pt-0">
                            {selected.thresholdWarning ? (
                              <p className="mx-auto max-w-lg text-sm text-amber-800 dark:text-amber-200">
                                {selected.thresholdWarning}
                              </p>
                            ) : null}
                            <dl className="mx-auto grid max-w-sm grid-cols-2 justify-items-center gap-x-6 gap-y-4 text-base sm:max-w-md sm:gap-x-10">
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Sürüm</dt>
                                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">{selected.version}</dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Aktif adım</dt>
                                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">
                                  {selected.activeStepLabel}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Geçerlilik</dt>
                                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50">
                                  {selected.validityDate}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Şablon</dt>
                                <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {selected.approvalTemplateName}
                                </dd>
                              </div>
                            </dl>
                            <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-700 dark:text-slate-200">
                              {selected.versionNote || 'Açıklama yok.'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Kalem toplamı:{' '}
                              <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                                {formatMoney(totalFromLines(selected), selected.currency)}
                              </span>
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {detailTab === 'kalemler' ? (
                        <div className="text-left">
                          {selected.lines.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Teklif kalemi yok.</p>
                          ) : (
                            <ul className="mx-auto max-w-2xl divide-y divide-slate-200/25 dark:divide-white/10" role="list">
                              {selected.lines.map((line) => {
                                const lt = lineTotal(line)
                                return (
                                  <li
                                    key={line.id}
                                    className="flex flex-col gap-1 py-3 text-sm first:pt-0 sm:flex-row sm:items-baseline sm:justify-between"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-mono text-xs font-medium text-slate-900 dark:text-slate-50">
                                        {line.code}
                                      </p>
                                      <p className="text-slate-700 dark:text-slate-200">{line.description}</p>
                                      <p className="text-xs text-slate-500">
                                        {line.qty ?? '—'} {line.unit}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-right sm:ps-4">
                                      <p className="text-xs text-slate-500">
                                        Birim: {line.unitPrice.toLocaleString('tr-TR')}
                                      </p>
                                      <p className="font-medium tabular-nums text-slate-900 dark:text-slate-50">
                                        {lt != null ? lt.toLocaleString('tr-TR') : '—'}
                                      </p>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'onay' ? (
                        <div className="text-left">
                          {selected.approvalHistory.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300">Onay geçmişi yok.</p>
                          ) : (
                            <ul className="mx-auto max-w-lg divide-y divide-slate-200/20 text-left dark:divide-white/10">
                              {selected.approvalHistory.map((h) => (
                                <li
                                  key={h.id}
                                  className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:items-start sm:gap-3"
                                >
                                  <span className="w-32 shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                                    {h.when}
                                  </span>
                                  <span className="min-w-0 flex-1 text-sm text-slate-800 dark:text-slate-200">
                                    <span className="font-medium text-slate-900 dark:text-slate-50">{h.action}</span> — {h.actor}{' '}
                                    <span className="text-slate-500">({h.role})</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}

                      {detailTab === 'surumler' ? (
                        <div className="flex flex-col gap-4 text-left sm:mx-auto sm:max-w-lg">
                          {(['v1', 'v2'] as const).map((k) => (
                            <div
                              key={k}
                              className="border-b border-slate-200/25 pb-4 last:border-0 last:pb-0 dark:border-white/10"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {k}
                              </p>
                              <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                                {selected.versionSnapshots[k].versionNote}
                              </p>
                              <p className="mt-2 font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                                {formatMoney(selected.versionSnapshots[k].total, selected.currency)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {detailTab === 'dokumanlar' ? (
                        <ul className="mx-auto max-w-lg divide-y divide-slate-200/25 text-left dark:divide-white/10" role="list">
                          <li className="flex flex-col items-center gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <span className="min-w-0 text-center text-sm font-medium text-slate-800 sm:text-left dark:text-slate-100">
                              {selected.number}-teklif.pdf
                            </span>
                            <button
                              type="button"
                              className="okan-liquid-btn-secondary shrink-0 px-2.5 py-1.5 text-xs font-semibold"
                            >
                              Aç
                            </button>
                          </li>
                          <li className="flex flex-col items-center gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <span className="min-w-0 text-center text-sm font-medium text-slate-800 sm:text-left dark:text-slate-100">
                              {selected.number}-hesap.xlsx
                            </span>
                            <button
                              type="button"
                              className="okan-liquid-btn-secondary shrink-0 px-2.5 py-1.5 text-xs font-semibold"
                            >
                              Aç
                            </button>
                          </li>
                        </ul>
                      ) : null}

                      {detailTab === 'notlar' ? (
                        <div className="text-left text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          <p>
                            Bu teklif <strong className="text-slate-900 dark:text-slate-50">{selected.version}</strong>{' '}
                            sürümü ile kayıtlı. Aktif adım: {selected.activeStepLabel}.
                          </p>
                          <p className="mt-3 text-slate-600 dark:text-slate-300">
                            İç not: Müşteri tarafından sevkiyat planına göre revizyon ihtimali bulunuyor (mock).
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">Teklif seçin.</p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
