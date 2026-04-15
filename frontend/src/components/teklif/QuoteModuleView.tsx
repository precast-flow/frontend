import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { quotes as initialQuotes, statusLabel, type QuoteStatus } from '../../data/quotesMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

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

export function QuoteModuleView({ onNavigate }: Props) {
  void onNavigate
  const navigate = useNavigate()
  const items = useMemo(() => initialQuotes, [])

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
      </div>

      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col gap-4">
        <section className="okan-liquid-panel flex min-h-0 flex-1 flex-col p-3" aria-labelledby="quote-list-h">
          <h2 id="quote-list-h" className="mb-2 px-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Teklifler
          </h2>

          <div className="okan-liquid-panel-nested min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead>
                <tr className="okan-liquid-table-thead text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  <th className="px-3 py-2.5">No</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Proje</th>
                  <th className="px-3 py-2.5">Müşteri</th>
                  <th className="px-3 py-2.5 text-right">Tutar</th>
                  <th className="px-3 py-2.5">Durum</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Geçerlilik</th>
                  <th className="px-3 py-2.5">Aktif adım</th>
                  <th className="px-3 py-2.5 text-right">Detay</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`okan-liquid-table-row border-b ${i % 2 === 1 ? 'bg-white/10 dark:bg-white/5' : ''}`}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs font-medium text-slate-900 dark:text-slate-50">
                      {row.number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                      {row.project}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2.5 text-slate-800 dark:text-slate-100">
                      {row.customer}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900 dark:text-slate-50">
                      {formatMoney(row.total, row.currency)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                      {row.validityDate}
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200">
                      {row.activeStepLabel}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/teklif-detay/${row.id}`, { state: { fromList: true } })}
                        className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold"
                      >
                        Teklif Detayını Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
