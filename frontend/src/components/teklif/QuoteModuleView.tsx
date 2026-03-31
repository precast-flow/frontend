import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ExternalLink,
  FileText,
  FolderOpen,
  GitBranch,
  PanelRight,
} from 'lucide-react'
import {
  lineTotal,
  quotes as initialQuotes,
  statusLabel,
  type Quote,
  type QuoteLine,
  type QuoteStatus,
} from '../../data/quotesMock'
import { openProjectsForQuote, projectById } from '../../data/projectsMock'
import { getFilesForProject } from '../../data/projectPageBie02Mock'
import { QuoteApprovalDrawer } from './QuoteApprovalDrawer'

type DetailMode = 'current' | 'v1' | 'v2'

type Props = {
  onNavigate: (moduleId: string) => void
}

function statusPill(status: QuoteStatus) {
  const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1'
  switch (status) {
    case 'taslak':
      return `${base} bg-gray-100 text-gray-800 ring-gray-300/90 dark:bg-gray-900 dark:text-gray-100`
    case 'onay_bekliyor':
      return `${base} bg-gray-200/90 text-gray-900 ring-gray-400/80 dark:text-gray-50`
    case 'onayli':
      return `${base} bg-gray-300/80 text-gray-900 ring-gray-500/70 dark:text-gray-50`
    case 'red':
      return `${base} bg-gray-50 text-red-800 ring-red-300/80 dark:bg-gray-950/90`
  }
}

function formatMoney(n: number, currency: string) {
  try {
    return `${currency}${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
  } catch {
    return `${currency}${n}`
  }
}

export function QuoteModuleView({ onNavigate }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlProjectApplied = useRef(false)
  const [items, setItems] = useState<Quote[]>(initialQuotes)
  const [selectedId, setSelectedId] = useState<string | null>(initialQuotes[0]?.id ?? null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [detailMode, setDetailMode] = useState<DetailMode>('current')
  const [timelineNotice, setTimelineNotice] = useState<string | null>(null)

  useEffect(() => {
    const pid = searchParams.get('project')
    if (!pid || urlProjectApplied.current) return
    const match = items.find((q) => q.projectId === pid)
    if (match) {
      setSelectedId(match.id)
      urlProjectApplied.current = true
    }
  }, [searchParams, items])

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null)
      return
    }
    setSelectedId((id) => {
      if (id && items.some((q) => q.id === id)) return id
      return items[0]!.id
    })
  }, [items])

  const selected = items.find((q) => q.id === selectedId) ?? null

  useEffect(() => {
    if (!selected) return
    if (selected.lines.length > 0) setDetailMode('current')
    else setDetailMode('v2')
  }, [selected?.id])

  const displayLines = useMemo((): QuoteLine[] => {
    if (!selected) return []
    if (detailMode === 'current') return selected.lines
    const snap = selected.versionSnapshots[detailMode]
    return snap.lines.length > 0 ? snap.lines : selected.lines
  }, [selected, detailMode])

  const displayNote = useMemo(() => {
    if (!selected) return ''
    if (detailMode === 'current') return selected.versionNote
    return selected.versionSnapshots[detailMode].versionNote
  }, [selected, detailMode])

  const computedTotal = useMemo(() => {
    if (!selected) return null
    if (detailMode === 'current') return selected.total
    const snap = selected.versionSnapshots[detailMode]
    if (snap.lines.length > 0) return snap.total
    return selected.total
  }, [selected, detailMode])

  const lineErrors = useMemo(() => displayLines.filter((l) => l.error), [displayLines])

  const computedLineSum = useMemo(() => {
    let sum = 0
    for (const l of displayLines) {
      const t = lineTotal(l)
      if (t == null) return null
      sum += t
    }
    return sum
  }, [displayLines])

  const handleApprove = () => {
    if (!selected) return
    setItems((prev) =>
      prev.map((q) => (q.id === selected.id ? { ...q, status: 'onayli' as const } : q)),
    )
    setDrawerOpen(false)
  }

  const handleReject = () => {
    if (!selected) return
    setItems((prev) =>
      prev.map((q) => (q.id === selected.id ? { ...q, status: 'red' as const } : q)),
    )
    setDrawerOpen(false)
  }

  const linkedProject = selected ? projectById(selected.projectId) : undefined
  const openProjects = useMemo(() => openProjectsForQuote(), [])
  const projectFiles = selected ? getFilesForProject(selected.projectId) : []

  const setQuoteProjectId = (quoteId: string, projectId: string) => {
    const p = projectById(projectId)
    if (!p) return
    setItems((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, projectId, project: p.name } : q)),
    )
  }

  const saveDraftWithTimelineNote = () => {
    if (!selected) return
    if (!selected.projectId) return
    const p = projectById(selected.projectId)
    const code = p?.code ?? selected.projectId
    setTimelineNotice(
      `Proje zaman çizelgesine düşecek olay (mock): «Teklif taslak kaydedildi — ${selected.number} · ${code}».`,
    )
    window.setTimeout(() => setTimelineNotice(null), 7000)
  }

  return (
    <div className="gm-glass-arch-detail flex min-h-0 flex-1 flex-col gap-4">
      <QuoteApprovalDrawer
        open={drawerOpen}
        quote={selected}
        onClose={() => setDrawerOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {pdfOpen ? (
        <div className="gm-glass-modal-shell fixed inset-0 z-[85] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-gray-900/35 backdrop-blur-[2px]"
            aria-label="Kapat"
            onClick={() => setPdfOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl bg-gray-100 p-6 shadow-neo-out dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-modal-title"
          >
            <h2 id="pdf-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              PDF önizleme (P1)
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Gerçek PDF oluşturma yok; baskı düzeni ve logo yerleşimi üretim sürümünde.
            </p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-400">
              [ A4 önizleme yer tutucu ]
            </div>
            <button
              type="button"
              onClick={() => setPdfOpen(false)}
              className="mt-4 w-full rounded-xl bg-gray-800 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
            >
              Kapat
            </button>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-200">bie-03:</strong> Teklif satırı bir{' '}
        <strong>açık projeye</strong> bağlanmalıdır; yan panelde proje özeti ve proje ofisi dosyalarına bağlantı (bie-02
        mock listesi).
      </p>

      {timelineNotice ? (
        <div
          className="rounded-xl border border-emerald-200/90 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-950 shadow-neo-in dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          {timelineNotice}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <section
          className="gm-glass-list-panel flex max-h-[min(52vh,480px)] flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm lg:col-span-5 lg:max-h-none dark:bg-gray-900"
          aria-labelledby="quote-list-h"
        >
          <h2 id="quote-list-h" className="mb-2 px-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
            Teklifler
          </h2>
          <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200/60 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-950/40">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-300">
                  <th className="px-3 py-2.5">No</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Proje</th>
                  <th className="px-3 py-2.5">Müşteri</th>
                  <th className="px-3 py-2.5 text-right">Tutar</th>
                  <th className="px-3 py-2.5">Durum</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Geçerlilik</th>
                  <th className="px-3 py-2.5">Aktif adım</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => {
                  const active = row.id === selectedId
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-gray-200/70 dark:border-gray-700/70 ${
                        i % 2 === 1 ? 'bg-gray-50 dark:bg-gray-950/50' : ''
                      } ${active ? 'bg-gray-100 ring-1 ring-inset ring-gray-300/80 dark:bg-gray-900 dark:ring-gray-600/80' : 'hover:bg-gray-100 hover:shadow-sm dark:hover:bg-gray-900/80'}`}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td className="px-3 py-2.5 font-mono text-xs font-medium text-gray-900 dark:text-gray-50">
                        {row.number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-gray-700 dark:text-gray-200">
                        {projectById(row.projectId)?.code ?? '—'}
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-2.5 text-gray-800 dark:text-gray-100">
                        {row.customer}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-gray-900 dark:text-gray-50">
                        {formatMoney(row.total, row.currency)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
                        {row.validityDate}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2.5 text-xs text-gray-700 dark:text-gray-200">
                        {row.activeStepLabel}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-3 lg:col-span-7" aria-label="Teklif detayı">
          {selected ? (
            <>
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                <strong className="font-semibold">UX (mock):</strong> Proje olmadan teklif açılması üretimde
                genellikle <strong>kapalıdır</strong>; istisna roller için ayrı izin tanımlanır (burada zorunlu bağ
                kuralı).
              </div>

              {selected.status === 'onayli' ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200/90 bg-gray-50 px-3 py-2.5 dark:border-gray-700/80 dark:bg-gray-950/60">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    Onaylı teklif — üretim öncesi mühendislik iş emrini başlat (bie-04).
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/is-baslat?quote=${selected.id}`)}
                    className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                  >
                    İş başlat
                  </button>
                </div>
              ) : null}

              {selected.thresholdWarning ? (
                <div
                  className="rounded-xl border border-sky-200/90 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 shadow-neo-in dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100"
                  role="status"
                >
                  <strong className="font-semibold">P2 — Eşik:</strong> {selected.thresholdWarning}
                </div>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-3 xl:col-span-8">
                  <div className="gm-glass-detail-hero rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">{selected.number}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selected.customer}</p>
                    <label className="mt-3 block">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Bağlı proje (zorunlu — açık projeler)
                      </span>
                      <select
                        value={selected.projectId}
                        onChange={(e) => setQuoteProjectId(selected.id, e.target.value)}
                        className="mt-1 w-full max-w-md rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
                      >
                        {openProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                      <span className="text-gray-500 dark:text-gray-400">Proje adı:</span> {selected.project}
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('approval-flow')}
                      className="mt-2 inline-flex items-center gap-1.5 text-left text-xs font-medium text-gray-700 underline decoration-gray-400 underline-offset-2 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                      <GitBranch className="size-3.5 shrink-0" aria-hidden />
                      Onay şablonu: <span className="font-semibold">{selected.approvalTemplateName}</span> (mvp-02)
                    </button>
                  </div>
                  <div className="text-right">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Sürüm (P1)
                    </label>
                    <select
                      value={detailMode}
                      onChange={(e) => setDetailMode(e.target.value as DetailMode)}
                      className="mt-1 rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
                    >
                      {selected.lines.length > 0 ? (
                        <option value="current">Güncel ({selected.version})</option>
                      ) : null}
                      <option value="v1">v1</option>
                      <option value="v2">v2</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Toplam (seçili sürüm)</p>
                    <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
                      {computedTotal != null ? formatMoney(computedTotal, selected.currency) : '—'}
                    </p>
                  </div>
                </div>
                  </div>

              {detailMode !== 'current' && selected.versionSnapshots.v1.lines.length > 0 && selected.versionSnapshots.v2.lines.length > 0 ? (
                <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Sürüm özeti (diff — P1)
                  </h3>
                  <p className="mt-2 text-sm text-gray-800 dark:text-gray-100">
                    <span className="font-mono">v1 → v2</span>: {selected.versionSnapshots.v2.versionNote}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Tutar v1: {formatMoney(selected.versionSnapshots.v1.total, selected.currency)} · v2:{' '}
                    {formatMoney(selected.versionSnapshots.v2.total, selected.currency)}
                  </p>
                </div>
              ) : null}

              {lineErrors.length > 0 ? (
                <div
                  className="flex items-start gap-2 rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-in dark:bg-gray-900"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-700 dark:text-red-400" aria-hidden />
                  <div className="text-sm">
                    <p className="font-semibold text-red-800 dark:text-red-300">Eksik veya hatalı kalem</p>
                    <p className="text-gray-700 dark:text-gray-200">
                      {lineErrors.length} satır düzeltilmeden onaya gönderilemez (örnek kural).
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="min-h-0 flex-1 rounded-2xl bg-gray-100 p-1 shadow-neo-in dark:bg-gray-900">
                <div className="max-h-[min(40vh,360px)] overflow-auto rounded-xl bg-gray-50 lg:max-h-none dark:bg-gray-950/50">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200/90 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-700/90 dark:text-gray-300">
                        <th className="px-3 py-2.5">Kod</th>
                        <th className="px-3 py-2.5">Açıklama</th>
                        <th className="px-3 py-2.5 text-right">Miktar</th>
                        <th className="px-3 py-2.5">Birim</th>
                        <th className="px-3 py-2.5 text-right">Birim fiyat</th>
                        <th className="px-3 py-2.5 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayLines.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-gray-600 dark:text-gray-300">
                            Bu sürümde kalem yok.
                          </td>
                        </tr>
                      ) : (
                        displayLines.map((line: QuoteLine, idx: number) => (
                          <LineRow key={`${line.id}-${idx}`} line={line} zebra={idx % 2 === 1} />
                        ))
                      )}
                    </tbody>
                    {displayLines.length > 0 ? (
                      <tfoot>
                        <tr className="border-t border-gray-200/90 bg-gray-100 text-sm font-semibold text-gray-900 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-50">
                          <td colSpan={5} className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                            Hesaplanan ara toplam
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            {computedLineSum == null ? '—' : formatMoney(computedLineSum, selected.currency)}
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
                <p className="px-2 py-2 text-[11px] text-gray-500 dark:text-gray-400">
                  {displayNote}
                </p>
              </div>

              <div className="rounded-xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Onay geçmişi
                </h3>
                {selected.approvalHistory.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Henüz kayıt yok.</p>
                ) : (
                  <ol className="mt-3 space-y-3 border-l-2 border-gray-300 pl-4 dark:border-gray-600">
                    {selected.approvalHistory.map((h) => (
                      <li key={h.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-gray-400 ring-4 ring-gray-100 dark:bg-gray-500 dark:ring-gray-900" />
                        <p className="font-medium text-gray-900 dark:text-gray-50">
                          {h.action} · {h.actor}{' '}
                          <span className="text-gray-500 dark:text-gray-400">({h.role})</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{h.when}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={saveDraftWithTimelineNote}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900"
                >
                  Taslak kaydet
                </button>
                <button
                  type="button"
                  disabled={lineErrors.length > 0}
                  className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
                >
                  Onaya gönder
                </button>
                <button
                  type="button"
                  onClick={() => setPdfOpen(true)}
                  className="rounded-xl border border-gray-400/90 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:text-gray-100 dark:hover:bg-gray-950/80 dark:ring-offset-gray-900"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText className="size-4" aria-hidden />
                    PDF önizle
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900"
                >
                  <PanelRight className="size-4" aria-hidden />
                  Versiyon & onay
                </button>
              </div>
                </div>

                <aside
                  className="space-y-3 xl:col-span-4 xl:sticky xl:top-4 xl:self-start"
                  aria-label="Proje özeti — bie-03"
                >
                  <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Proje özeti (kayıttan)
                    </h3>
                    {linkedProject ? (
                      <>
                        <p className="mt-2 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">
                          {linkedProject.code}
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">{linkedProject.name}</p>
                        <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-300">Yapı yeri</p>
                        <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">{linkedProject.siteAddress}</p>
                        <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-300">Kapsam</p>
                        <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">{linkedProject.scopeShort}</p>
                        <button
                          type="button"
                          onClick={() => navigate(`/proje?project=${linkedProject.id}`)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 px-3 py-2.5 text-xs font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
                        >
                          <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                          Proje sayfasına git
                        </button>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                        Geçerli bir proje bağlantısı yok — açık proje seçin.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <FolderOpen className="size-4" aria-hidden />
                      Proje ofisi dosyaları (bie-02 mock)
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {projectFiles.length === 0 ? (
                        <li className="text-gray-500 dark:text-gray-400">Dosya yok.</li>
                      ) : (
                        projectFiles.map((f) => (
                          <li key={f.id}>
                            <button
                              type="button"
                              className="text-left font-mono text-xs text-gray-800 underline decoration-gray-400 underline-offset-2 hover:text-gray-950 dark:text-gray-100"
                              title="Gerçek dosya açılmaz — prototip"
                            >
                              {f.name} <span className="text-gray-500">(rev {f.rev})</span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 dark:border-gray-700/90 dark:bg-gray-900/80">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Onay akışı önizlemesi (P2 · mvp-02)
                    </h3>
                    <ol className="mt-3 space-y-2 text-sm text-gray-800 dark:text-gray-100">
                      <li className="flex gap-2">
                        <span className="font-mono text-xs text-gray-500">1</span>
                        Satış müdürü — <span className="text-emerald-700 dark:text-emerald-400">tamam (mock)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-mono text-xs text-gray-500">2</span>
                        Finans — <span className="font-medium">aktif: {selected.activeStepLabel}</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-mono text-xs text-gray-500">3</span>
                        Genel müdür yardımcısı — beklemede
                      </li>
                    </ol>
                    <button
                      type="button"
                      onClick={() => onNavigate('approval-flow')}
                      className="mt-3 text-xs font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 dark:text-gray-300"
                    >
                      Tasarımcıda aç →
                    </button>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">Listeden teklif seçin.</p>
          )}
        </section>
      </div>
    </div>
  )
}

function LineRow({ line, zebra }: { line: QuoteLine; zebra: boolean }) {
  const t = lineTotal(line)
  const bad = Boolean(line.error)
  return (
    <tr
      className={`border-b border-gray-200/70 dark:border-gray-700/70 ${zebra ? 'bg-gray-50 dark:bg-gray-950/40' : ''} ${bad ? 'bg-red-50/40 ring-1 ring-inset ring-red-200/80 dark:bg-red-950/20' : ''}`}
    >
      <td className="px-3 py-2.5 font-mono text-xs text-gray-800 dark:text-gray-100">{line.code}</td>
      <td className="px-3 py-2.5 text-gray-800 dark:text-gray-100">
        {line.description}
        {bad ? (
          <span className="mt-1 block text-xs font-semibold text-red-800 dark:text-red-300">{line.error}</span>
        ) : null}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-gray-900 dark:text-gray-50">
        {line.qty == null ? '—' : line.qty}
      </td>
      <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{line.unit}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-gray-800 dark:text-gray-100">
        {line.unitPrice.toLocaleString('tr-TR')}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-gray-900 dark:text-gray-50">
        {t == null ? '—' : t.toLocaleString('tr-TR')}
      </td>
    </tr>
  )
}
