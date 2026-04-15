import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { lineTotal, quotes, statusLabel, type Quote, type QuoteLine, type QuoteStatus } from '../../data/quotesMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type TabId = 'ozet' | 'kalemler' | 'onay' | 'surumler' | 'dokumanlar' | 'notlar'

const tabs: { id: TabId; label: string }[] = [
  { id: 'ozet', label: 'Ozet' },
  { id: 'kalemler', label: 'Kalemler' },
  { id: 'onay', label: 'Onay Gecmisi' },
  { id: 'surumler', label: 'Surumler' },
  { id: 'dokumanlar', label: 'Dokumanlar' },
  { id: 'notlar', label: 'Notlar' },
]

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

function totalFromLines(lines: QuoteLine[]) {
  let sum = 0
  for (const line of lines) {
    const itemTotal = lineTotal(line)
    if (itemTotal == null) continue
    sum += itemTotal
  }
  return sum
}

function RowLine({ line, zebra }: { line: QuoteLine; zebra: boolean }) {
  return (
    <tr className={`okan-liquid-table-row border-b ${zebra ? 'bg-white/10 dark:bg-white/5' : ''}`}>
      <td className="px-3 py-2.5 font-mono text-xs text-slate-900 dark:text-slate-50">{line.code}</td>
      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-100">{line.description}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-200">{line.qty ?? '—'}</td>
      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{line.unit}</td>
      <td className="px-3 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-200">
        {line.unitPrice.toLocaleString('tr-TR')}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900 dark:text-slate-50">
        {lineTotal(line)?.toLocaleString('tr-TR') ?? '—'}
      </td>
    </tr>
  )
}

function OverviewTab({ quote }: { quote: Quote }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="okan-liquid-panel-nested p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Musteri</p>
        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{quote.customer}</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Proje</p>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{quote.project}</p>
      </div>
      <div className="okan-liquid-panel-nested p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Toplam Tutar</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {formatMoney(quote.total, quote.currency)}
        </p>
        <p className="mt-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Gecerlilik</p>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{quote.validityDate}</p>
      </div>
      <div className="okan-liquid-panel-nested p-4 md:col-span-2">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Aciklama</p>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{quote.versionNote || 'Not bulunmuyor.'}</p>
      </div>
    </div>
  )
}

function LinesTab({ quote }: { quote: Quote }) {
  return (
    <div className="okan-liquid-panel-nested overflow-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="okan-liquid-table-thead text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            <th className="px-3 py-2.5">Kod</th>
            <th className="px-3 py-2.5">Aciklama</th>
            <th className="px-3 py-2.5 text-right">Miktar</th>
            <th className="px-3 py-2.5">Birim</th>
            <th className="px-3 py-2.5 text-right">Birim Fiyat</th>
            <th className="px-3 py-2.5 text-right">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {quote.lines.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-slate-600 dark:text-slate-300">
                Teklif kalemi bulunmuyor.
              </td>
            </tr>
          ) : (
            quote.lines.map((line, index) => <RowLine key={line.id} line={line} zebra={index % 2 === 1} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

function ApprovalTab({ quote }: { quote: Quote }) {
  return (
    <div className="okan-liquid-panel-nested p-4">
      {quote.approvalHistory.length === 0 ? (
        <p className="text-sm text-slate-700 dark:text-slate-200">Onay gecmisi bulunmuyor.</p>
      ) : (
        <ol className="space-y-3 border-l-2 border-white/30 pl-4 dark:border-white/15">
          {quote.approvalHistory.map((history) => (
            <li key={history.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-400 ring-4 ring-white/40 dark:bg-slate-500 dark:ring-white/10" />
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {history.action} - {history.actor}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {history.role} - {history.when}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function VersionsTab({ quote }: { quote: Quote }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="okan-liquid-panel-nested p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">v1</p>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{quote.versionSnapshots.v1.versionNote}</p>
        <p className="mt-2 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {formatMoney(quote.versionSnapshots.v1.total, quote.currency)}
        </p>
      </div>
      <div className="okan-liquid-panel-nested p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">v2</p>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{quote.versionSnapshots.v2.versionNote}</p>
        <p className="mt-2 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
          {formatMoney(quote.versionSnapshots.v2.total, quote.currency)}
        </p>
      </div>
    </div>
  )
}

function DocumentsTab({ quote }: { quote: Quote }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="okan-liquid-panel-nested p-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Teklif PDF</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{quote.number}-teklif.pdf</p>
      </div>
      <div className="okan-liquid-panel-nested p-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Ek Hesap Dosyasi</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{quote.number}-hesap.xlsx</p>
      </div>
    </div>
  )
}

function NotesTab({ quote }: { quote: Quote }) {
  return (
    <div className="okan-liquid-panel-nested p-4">
      <p className="text-sm text-slate-800 dark:text-slate-100">
        Bu teklif {quote.version} surumu ile kayitli. Aktif adim: {quote.activeStepLabel}.
      </p>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
        Ic not: Musteri tarafindan sevkiyat planina gore revizyon ihtimali bulunuyor.
      </p>
    </div>
  )
}

export function QuoteDetailPage() {
  const navigate = useNavigate()
  const { quoteId } = useParams<{ quoteId: string }>()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabId>('ozet')

  const quote = useMemo(() => quotes.find((item) => item.id === quoteId) ?? null, [quoteId])

  if (location.state && !(location.state as { fromList?: boolean }).fromList) {
    return <Navigate to="/teklif" replace />
  }

  if (!quote) {
    return <Navigate to="/teklif" replace />
  }

  return (
    <div className="okan-liquid-root flex min-h-screen flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
      </div>

      <div className="okan-liquid-content relative z-[1] flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-4">
        <nav
          className="rounded-2xl border border-white/25 bg-white/25 px-4 py-2 text-xs text-slate-700 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50"
              >
                Ana Sayfa
              </button>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/teklif')}
                className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50"
              >
                Teklifler
              </button>
            </li>
            <li className="text-slate-400">/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-50">{quote.number}</li>
          </ol>
        </nav>

        <section className="okan-liquid-panel p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">{quote.number}</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{quote.customer}</p>
            </div>
            <div className="text-right">
              <span className={statusPill(quote.status)}>{statusLabel(quote.status)}</span>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Kalem Toplami</p>
              <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                {formatMoney(totalFromLines(quote.lines), quote.currency)}
              </p>
            </div>
          </div>
        </section>

        <section className="okan-liquid-panel flex min-h-0 flex-1 flex-col p-3">
          <div className="okan-liquid-pill-track mb-3 flex flex-wrap gap-2 p-1.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`${active ? 'okan-liquid-pill-active' : 'text-slate-700 dark:text-slate-200'} rounded-full px-3 py-1.5 text-xs font-semibold transition`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {activeTab === 'ozet' ? <OverviewTab quote={quote} /> : null}
            {activeTab === 'kalemler' ? <LinesTab quote={quote} /> : null}
            {activeTab === 'onay' ? <ApprovalTab quote={quote} /> : null}
            {activeTab === 'surumler' ? <VersionsTab quote={quote} /> : null}
            {activeTab === 'dokumanlar' ? <DocumentsTab quote={quote} /> : null}
            {activeTab === 'notlar' ? <NotesTab quote={quote} /> : null}
          </div>
        </section>
      </div>
    </div>
  )
}
