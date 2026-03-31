import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  reportCatalog,
  reportCategories,
  reportResultRows,
  savedViewChips,
  type ReportDef,
  type ReportResultRow,
} from '../../data/reportingMock'

const protrude =
  'rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm ring-1 ring-gray-200/80 md:p-5 dark:bg-gray-900 dark:ring-gray-700/70'
const protrudeSm = 'rounded-xl bg-gray-100 px-3 py-2 shadow-neo-out-sm ring-1 ring-gray-200/70 dark:bg-gray-900 dark:ring-gray-700/70'
const insetWell = 'rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900'

function groupByCategory(reports: ReportDef[]) {
  const map = new Map<string, ReportDef[]>()
  for (const c of reportCategories) map.set(c.id, [])
  for (const r of reports) {
    map.get(r.category)?.push(r)
  }
  return reportCategories.map((c) => ({ ...c, items: map.get(c.id) ?? [] }))
}

export function ReportingModuleView() {
  const { factories } = useFactoryContext()
  const [selectedId, setSelectedId] = useState(reportCatalog[0]!.id)
  const [ran, setRan] = useState(true)
  const [drawerRow, setDrawerRow] = useState<ReportResultRow | null>(null)
  const [dateFrom, setDateFrom] = useState('2026-03-18')
  const [dateTo, setDateTo] = useState('2026-03-24')
  const [factoryCode, setFactoryCode] = useState(() => factories[0]?.code ?? '')

  useEffect(() => {
    if (!factories.some((f) => f.code === factoryCode)) {
      setFactoryCode(factories[0]?.code ?? '')
    }
  }, [factories, factoryCode])
  const [saveName, setSaveName] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const grouped = useMemo(() => groupByCategory(reportCatalog), [])
  const selected = reportCatalog.find((r) => r.id === selectedId) ?? reportCatalog[0]!

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }

  const handleSaveView = () => {
    const name = saveName.trim() || `Görünüm · ${selected.name}`
    showToast(`Kayıtlı görünüm kaydedildi: “${name}” (mock).`)
    setSaveName('')
  }

  const handleExportCsv = () => {
    showToast('CSV indirme başlatıldı — rapor_export.csv (mock).')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {toast ? (
        <div
          className="flex items-center justify-between gap-3 rounded-xl bg-gray-100 px-4 py-3 shadow-neo-out-sm dark:bg-gray-900"
          role="status"
        >
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
          >
            Kapat
          </button>
        </div>
      ) : null}

      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">mvp-13:</strong> Rapor merkezi — fabrika filtresi mock; sol katalogda
        üç özet rapor; sonuçta inset grafik + on satır tablo.
      </p>

      <div className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/50 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            Kayıtlı görünümler (P1)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {savedViewChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setSelectedId(chip.reportId)
                  setRan(true)
                }}
                className={`${protrudeSm} text-xs font-semibold text-gray-800 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-100 dark:hover:text-gray-50`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block min-w-0 sm:max-w-[12rem]">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Görünüm adı</span>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="örn. Haftalık İstanbul"
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in placeholder:text-gray-500 dark:bg-gray-900 dark:text-gray-50"
            />
          </label>
          <button
            type="button"
            onClick={handleSaveView}
            className={`${protrudeSm} shrink-0 text-xs font-semibold text-gray-800 dark:text-gray-100`}
          >
            Kaydet
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <aside className={`lg:col-span-4 xl:col-span-3 ${protrude} flex flex-col`}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-gray-50">Rapor kataloğu</h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Üretim · Sevkiyat · Kalite özeti (P0).</p>
          <div className="mt-4 flex max-h-[min(52vh,28rem)] flex-col gap-3 overflow-y-auto pr-1">
            {grouped.map((cat, idx) => (
              <div key={cat.id}>
                {idx > 0 ? (
                  <div className="mb-3 h-px rounded-full bg-gray-200 shadow-neo-in dark:bg-gray-700/80" aria-hidden />
                ) : null}
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {cat.label}
                </p>
                <ul className="flex flex-col gap-2">
                  {cat.items.map((rep) => {
                    const active = rep.id === selectedId
                    return (
                      <li key={rep.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(rep.id)}
                          className={`w-full rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                            active
                              ? 'bg-gray-50 shadow-neo-out-sm ring-2 ring-gray-800 dark:bg-gray-950/80 dark:ring-gray-300'
                              : 'bg-gray-100 shadow-neo-in hover:shadow-neo-in dark:bg-gray-900/80'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">{rep.name}</span>
                          <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-300">{rep.description}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col gap-4 lg:col-span-8 xl:col-span-9">
          <div className={insetWell}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block min-w-0">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Başlangıç</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1 w-full rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Bitiş</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                  />
                </label>
                <label className="block min-w-0 sm:col-span-2 lg:col-span-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Fabrika</span>
                  <select
                    value={factoryCode}
                    onChange={(e) => setFactoryCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                  >
                    {factories.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={() => setRan(true)}
                className="shrink-0 rounded-xl bg-gray-800 px-6 py-3 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
              >
                Çalıştır
              </button>
            </div>
            <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
              Filtre: <span className="font-mono">{factoryCode}</span> · {dateFrom} — {dateTo} (mock).
            </p>
          </div>

          <section className={`${protrude} min-h-0 flex-1`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Sonuç</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selected.name}</p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className={`${protrudeSm} self-start text-xs font-semibold text-gray-800 dark:text-gray-100`}
              >
                CSV dışa aktar (P2)
              </button>
            </div>

            {!ran ? (
              <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">Parametreleri seçip Çalıştır’a basın.</p>
            ) : (
              <>
                <div className="mt-5 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Grafik (inset placeholder)
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Örnek seri: değer / dönem — gerçek grafik entegrasyonu yok (P0).
                  </p>
                  <div
                    className="mt-4 flex h-36 items-end justify-between gap-1 rounded-xl border border-dashed border-gray-400/70 bg-gray-100 px-2 pb-2 pt-4 dark:border-gray-600/70 dark:bg-gray-900/60"
                    aria-hidden
                  >
                    {[42, 55, 38, 62, 48, 70, 52].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gray-400/90 dark:bg-gray-600/90"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl shadow-neo-in">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200/90 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-gray-700/90 dark:bg-gray-950/80 dark:text-gray-300">
                          <th className="px-4 py-3">Boyut</th>
                          <th className="px-4 py-3">Dönem</th>
                          <th className="px-4 py-3 text-right">Değer</th>
                          <th className="px-4 py-3 text-right">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportResultRows.map((row, i) => (
                          <tr
                            key={row.id}
                            className={`cursor-pointer border-b border-gray-200/60 transition hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-950/80 ${
                              i % 2 === 1 ? 'bg-gray-50/80 dark:bg-gray-950/40' : ''
                            }`}
                            onClick={() => setDrawerRow(row)}
                            title="Drill-down (P1)"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">{row.dimension}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{row.period}</td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                              {row.value}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{row.trend}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="border-t border-gray-200/80 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700/80 dark:bg-gray-950/50 dark:text-gray-400">
                    10 satır mock veri — satıra tıklayınca özet drawer (P1).
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {drawerRow ? (
        <div className="gm-glass-drawer-root fixed inset-0 z-[70] flex justify-end">
          <button
            type="button"
            className="gm-glass-drawer-backdrop absolute inset-0 border-0 p-0"
            aria-label="Detayı kapat"
            onClick={() => setDrawerRow(null)}
          />
          <aside
            className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden rounded-l-3xl bg-gray-100 p-5 shadow-neo-out dark:bg-gray-900 md:m-3 md:rounded-3xl"
            aria-label="Satır detayı"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Drill-down</h2>
              <button
                type="button"
                onClick={() => setDrawerRow(null)}
                className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 shadow-neo-out-sm hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
                aria-label="Kapat"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm ring-1 ring-gray-200/80 dark:bg-gray-950/80 dark:ring-gray-700/70">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Boyut</dt>
                    <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{drawerRow.dimension}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Dönem</dt>
                    <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{drawerRow.period}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Değer / trend</dt>
                    <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">
                      {drawerRow.value} · {drawerRow.trend}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-4 rounded-xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/80">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">Özet</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-gray-100">{drawerRow.drillNote}</p>
              </div>
              <p className="pt-6 text-xs text-gray-500 dark:text-gray-400">
                Fabrika: <span className="font-mono">{factoryCode}</span> — alt kırılım entegrasyonda.
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
