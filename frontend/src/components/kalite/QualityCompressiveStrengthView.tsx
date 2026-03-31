import { useId, useMemo, useRef, useState } from 'react'
import { LineChart } from 'lucide-react'
import {
  INITIAL_COMPRESSIVE_ROWS,
  MOCK_SAMPLE_LINK_OPTIONS,
  type AgeDay,
  type CompressiveResultRow,
  type SpecimenShape,
} from '../../data/qualityCompressiveMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

function parseMpa(s: string): number | null {
  const n = Number.parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function QualityCompressiveStrengthView() {
  const { t } = useI18n()
  const baseId = useId()
  const rowIdRef = useRef(100)
  const [rows, setRows] = useState<CompressiveResultRow[]>(() => [...INITIAL_COMPRESSIVE_ROWS])

  const [sampleCode, setSampleCode] = useState<string>(MOCK_SAMPLE_LINK_OPTIONS[0])
  const [shape, setShape] = useState<SpecimenShape>('cube')
  const [ageDay, setAgeDay] = useState<AgeDay>(28)
  const [mpaStr, setMpaStr] = useState('')
  const [notBroken, setNotBroken] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [deviceId, setDeviceId] = useState('PRESS-LAB-02')
  const [calibNote, setCalibNote] = useState('Kalibrasyon: 2025-02-01 · geçerli')
  const [toast, setToast] = useState<string | null>(null)

  const chartPoints = useMemo(() => {
    const forSample = rows.filter((r) => r.sampleCode === sampleCode && !r.notBroken && !r.invalid)
    const pts: { age: number; mpa: number }[] = []
    for (const r of forSample) {
      const m = parseMpa(r.mpa)
      if (m != null) pts.push({ age: r.ageDay, mpa: m })
    }
    pts.sort((a, b) => a.age - b.age)
    return pts
  }, [rows, sampleCode])

  const addRow = () => {
    if (!notBroken && !mpaStr.trim() && !invalid) {
      setToast(t('qualityCompressive.toastNeedMpa'))
      window.setTimeout(() => setToast(null), 2400)
      return
    }
    const id = `cr-${rowIdRef.current++}`
    setRows((prev) => [
      ...prev,
      {
        id,
        sampleCode,
        shape,
        ageDay,
        mpa: notBroken ? '' : mpaStr,
        notBroken,
        invalid,
      },
    ])
    setMpaStr('')
    setNotBroken(false)
    setInvalid(false)
    setToast(t('qualityCompressive.toastSaved'))
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-04:</strong> {t('qualityCompressive.intro')}
      </p>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Form */}
        <div className="space-y-4 lg:col-span-5">
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityCompressive.formTitle')}</h3>

            <div className="mt-3 space-y-3">
              <label className="block" htmlFor={`${baseId}-sample`}>
                <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('qualityCompressive.field.sample')}
                </span>
                <select
                  id={`${baseId}-sample`}
                  className={`${inset} mt-1 font-mono`}
                  value={sampleCode}
                  onChange={(e) => setSampleCode(e.target.value)}
                >
                  {MOCK_SAMPLE_LINK_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block" htmlFor={`${baseId}-shape`}>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('qualityCompressive.field.shape')}
                  </span>
                  <select
                    id={`${baseId}-shape`}
                    className={`${inset} mt-1`}
                    value={shape}
                    onChange={(e) => setShape(e.target.value as SpecimenShape)}
                  >
                    <option value="cube">{t('qualityCompressive.shape.cube')}</option>
                    <option value="cylinder">{t('qualityCompressive.shape.cylinder')}</option>
                  </select>
                </label>
                <label className="block" htmlFor={`${baseId}-age`}>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {t('qualityCompressive.field.age')}
                  </span>
                  <select
                    id={`${baseId}-age`}
                    className={`${inset} mt-1`}
                    value={ageDay}
                    onChange={(e) => setAgeDay(Number(e.target.value) as AgeDay)}
                  >
                    <option value={7}>7</option>
                    <option value={28}>28</option>
                  </select>
                </label>
              </div>

              <label className="block" htmlFor={`${baseId}-mpa`}>
                <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('qualityCompressive.field.mpa')}
                </span>
                <input
                  id={`${baseId}-mpa`}
                  className={`${inset} mt-1 font-mono text-lg font-semibold`}
                  value={mpaStr}
                  onChange={(e) => setMpaStr(e.target.value)}
                  disabled={notBroken}
                  placeholder="37,2"
                  inputMode="decimal"
                />
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-400 text-gray-900 focus:ring-gray-400"
                    checked={notBroken}
                    onChange={(e) => {
                      setNotBroken(e.target.checked)
                      if (e.target.checked) setMpaStr('')
                    }}
                  />
                  {t('qualityCompressive.field.notBroken')}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-400 text-gray-900 focus:ring-gray-400"
                    checked={invalid}
                    onChange={(e) => setInvalid(e.target.checked)}
                  />
                  {t('qualityCompressive.field.invalid')}
                </label>
              </div>

              <button type="button" className={btnPrimary} onClick={addRow}>
                {t('qualityCompressive.addRow')}
              </button>
            </div>
          </section>

          {/* P1 — cihaz / kalibrasyon */}
          <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-950/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityCompressive.deviceTitle')}</h3>
            <label className="mt-3 block" htmlFor={`${baseId}-dev`}>
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityCompressive.field.deviceId')}
              </span>
              <input id={`${baseId}-dev`} className={`${inset} mt-1 font-mono`} value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
            </label>
            <label className="mt-2 block" htmlFor={`${baseId}-cal`}>
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityCompressive.field.calib')}
              </span>
              <textarea
                id={`${baseId}-cal`}
                rows={2}
                className={`${inset} mt-1 resize-none text-xs`}
                value={calibNote}
                onChange={(e) => setCalibNote(e.target.value)}
              />
            </label>
          </section>
        </div>

        {/* Tablo + grafik */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityCompressive.tableTitle')}</h3>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityCompressive.tableHint')}</p>
            <div className="mt-2 overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-950/70">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t('qualityCompressive.col.sample')}</th>
                    <th className="px-3 py-2 font-semibold">{t('qualityCompressive.col.shape')}</th>
                    <th className="px-3 py-2 font-semibold">{t('qualityCompressive.col.age')}</th>
                    <th className="px-3 py-2 font-semibold">{t('qualityCompressive.col.mpa')}</th>
                    <th className="px-3 py-2 font-semibold">{t('qualityCompressive.col.flags')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">{r.sampleCode}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{t(`qualityCompressive.shape.${r.shape}`)}</td>
                      <td className="px-3 py-2 tabular-nums text-gray-800 dark:text-gray-100">{r.ageDay}</td>
                      <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-50">
                        {r.notBroken ? (
                          <span className="text-gray-500 dark:text-gray-400">—</span>
                        ) : r.mpa ? (
                          `${r.mpa} MPa`
                        ) : (
                          <span className="text-amber-700 dark:text-amber-300">{t('qualityCompressive.pending')}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                        {r.notBroken || r.invalid ? (
                          <span className="flex flex-wrap gap-2">
                            {r.notBroken ? (
                              <span className="rounded-md bg-gray-200/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                {t('qualityCompressive.flag.notBroken')}
                              </span>
                            ) : null}
                            {r.invalid ? (
                              <span className="rounded-md bg-rose-100/90 px-1.5 py-0.5 text-[10px] font-medium text-rose-950 dark:bg-rose-950/50 dark:text-rose-100">
                                {t('qualityCompressive.flag.invalid')}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* P2 — yaş–dayanım placeholder */}
          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/80">
            <div className="flex items-center gap-2">
              <LineChart className="size-5 text-gray-500" strokeWidth={1.75} aria-hidden />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityCompressive.chartTitle')}</h3>
            </div>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              {t('qualityCompressive.chartHint', { code: sampleCode })}
            </p>
            <div
              className="relative mt-4 h-40 w-full rounded-xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/60"
              role="img"
              aria-label={t('qualityCompressive.chartAria')}
            >
              <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden>
                <line x1="20" y1="85" x2="180" y2="85" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" />
                <line x1="20" y1="85" x2="20" y2="15" stroke="currentColor" className="text-gray-400" strokeWidth="0.5" />
                {chartPoints.length >= 2 ? (
                  <polyline
                    fill="none"
                    stroke="rgb(5 150 105)"
                    strokeWidth="2"
                    points={chartPoints
                      .map((p) => {
                        const x = 20 + (p.age / 28) * 160
                        const y = 85 - Math.min(70, (p.mpa / 50) * 70)
                        return `${x},${y}`
                      })
                      .join(' ')}
                  />
                ) : chartPoints.length === 0 ? (
                  <text x="100" y="52" textAnchor="middle" className="fill-gray-400 text-[8px]">
                    —
                  </text>
                ) : null}
                {chartPoints.map((p, i) => {
                  const x = 20 + (p.age / 28) * 160
                  const y = 85 - Math.min(70, (p.mpa / 50) * 70)
                  return <circle key={i} cx={x} cy={y} r="3.5" className="fill-gray-900 dark:fill-gray-100" />
                })}
              </svg>
              <div className="pointer-events-none absolute bottom-1 left-4 right-4 flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                <span>7 {t('qualityCompressive.daySuffix')}</span>
                <span>28 {t('qualityCompressive.daySuffix')}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
