import { useEffect, useId, useMemo, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import { MOCK_POUR_QUICK_OPTIONS, type MockPourQuick } from '../../data/qualitySlumpQuickMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'rounded-2xl bg-gray-900 px-6 py-3.5 text-base font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const bigInput =
  'w-full rounded-2xl border-0 bg-gray-100 py-4 pl-4 pr-16 text-center text-5xl font-bold tabular-nums tracking-tight text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-50 md:text-6xl'

function defaultTimeValue(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function inSlumpBand(value: number, pour: MockPourQuick): boolean {
  return value >= pour.slumpMinMm && value <= pour.slumpMaxMm
}

export function QualitySlumpQuickView() {
  const { t } = useI18n()
  const baseId = useId()
  const { isFactoryInScope } = useFactoryContext()

  const pours = useMemo(() => {
    return MOCK_POUR_QUICK_OPTIONS.filter((p) => isFactoryInScope(p.factoryCode))
  }, [isFactoryInScope])

  const [pourId, setPourId] = useState(() => pours[0]?.id ?? '')
  const [orderOverride, setOrderOverride] = useState('')
  const [slumpStr, setSlumpStr] = useState('145')
  const [tempStr, setTempStr] = useState('')
  const [timeStr, setTimeStr] = useState(defaultTimeValue)
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [offlineNote, setOfflineNote] = useState('')
  const [savedToast, setSavedToast] = useState<string | null>(null)

  useEffect(() => {
    if (pours.length === 0) return
    if (!pours.some((p) => p.id === pourId)) {
      setPourId(pours[0].id)
    }
  }, [pours, pourId])

  const selectedPour = pours.find((p) => p.id === pourId) ?? pours[0] ?? null

  const slumpNum = Number.parseInt(slumpStr.replace(/\D/g, ''), 10)
  const slumpValid = Number.isFinite(slumpNum) && slumpNum > 0
  const outOfBand = selectedPour && slumpValid ? !inSlumpBand(slumpNum, selectedPour) : false

  const bandPct = (v: number, min: number, max: number) => {
    const span = max - min || 1
    return Math.min(100, Math.max(0, ((v - min) / span) * 100))
  }

  const onSave = () => {
    if (!selectedPour || !slumpValid) return
    setSavedToast(
      outOfBand ? t('qualitySlump.toastSavedWarn') : t('qualitySlump.toastSavedOk'),
    )
    window.setTimeout(() => setSavedToast(null), 2600)
  }

  if (pours.length === 0) {
    return (
      <p className="rounded-2xl bg-gray-100 px-4 py-6 text-center text-sm text-gray-600 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
        {t('qualitySlump.emptyFactory')}
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-03:</strong> {t('qualitySlump.intro')}
      </p>

      {/* P0 — döküm veya emir */}
      <div className="space-y-3">
        <label className="block" htmlFor={`${baseId}-pour`}>
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySlump.pourLabel')}
          </span>
          <select
            id={`${baseId}-pour`}
            className={`${inset} mt-1.5 font-medium`}
            value={pourId}
            onChange={(e) => setPourId(e.target.value)}
          >
            {pours.map((p) => (
              <option key={p.id} value={p.id}>
                {t(p.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="block" htmlFor={`${baseId}-order`}>
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySlump.orderAlt')}
          </span>
          <input
            id={`${baseId}-order`}
            className={`${inset} mt-1.5 font-mono`}
            value={orderOverride}
            onChange={(e) => setOrderOverride(e.target.value)}
            placeholder={selectedPour?.orderNo ?? 'MES-'}
            autoComplete="off"
          />
        </label>
      </div>

      {/* Limit bandı */}
      {selectedPour ? (
        <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
          <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySlump.bandTitle')}
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {t('qualitySlump.bandRecipe', {
              code: selectedPour.recipeCode,
              min: String(selectedPour.slumpMinMm),
              max: String(selectedPour.slumpMaxMm),
            })}
          </p>
          <div className="relative mt-4 h-3 w-full rounded-full bg-gray-200 shadow-neo-in dark:bg-gray-800">
            <div
              className="absolute inset-y-0 rounded-full bg-emerald-500/75 dark:bg-emerald-500/65"
              style={{
                left: `${(selectedPour.slumpMinMm / 250) * 100}%`,
                width: `${((selectedPour.slumpMaxMm - selectedPour.slumpMinMm) / 250) * 100}%`,
              }}
              title={`${selectedPour.slumpMinMm}–${selectedPour.slumpMaxMm} mm`}
            />
            {slumpValid ? (
              <div
                className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ${
                  outOfBand ? 'bg-rose-500' : 'bg-gray-900 dark:bg-gray-100'
                }`}
                style={{ left: `${bandPct(slumpNum, 0, 250)}%` }}
              />
            ) : null}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-gray-500 dark:text-gray-400">
            <span>0</span>
            <span>250 mm</span>
          </div>
        </div>
      ) : null}

      {outOfBand && selectedPour ? (
        <div
          className="rounded-2xl border border-amber-400/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {t('qualitySlump.warnOut', {
            min: String(selectedPour.slumpMinMm),
            max: String(selectedPour.slumpMaxMm),
          })}
        </div>
      ) : null}

      {/* Büyük slump */}
      <div>
        <label className="block text-center" htmlFor={`${baseId}-slump`}>
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySlump.slumpLabel')}
          </span>
        </label>
        <div className="relative mt-2">
          <input
            id={`${baseId}-slump`}
            inputMode="numeric"
            className={bigInput}
            value={slumpStr}
            onChange={(e) => setSlumpStr(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
            aria-invalid={outOfBand}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400 dark:text-gray-500">
            mm
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block" htmlFor={`${baseId}-temp`}>
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySlump.tempLabel')}
          </span>
          <input
            id={`${baseId}-temp`}
            inputMode="decimal"
            className={`${inset} mt-1.5`}
            value={tempStr}
            onChange={(e) => setTempStr(e.target.value)}
            placeholder="22"
          />
        </label>
        <label className="block" htmlFor={`${baseId}-time`}>
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('qualitySlump.timeLabel')}
          </span>
          <input
            id={`${baseId}-time`}
            type="time"
            className={`${inset} mt-1.5 font-mono`}
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
          />
        </label>
      </div>

      {/* P1 — fotoğraf */}
      <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center shadow-neo-in dark:border-gray-600 dark:bg-gray-950/60">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setPhotoName(f?.name ?? null)
          }}
        />
        <ImagePlus className="mx-auto size-8 text-gray-400 dark:text-gray-500" strokeWidth={1.25} aria-hidden />
        <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-100">{t('qualitySlump.photoTitle')}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {photoName ? photoName : t('qualitySlump.photoHint')}
        </p>
      </label>

      {/* P2 — offline */}
      <label className="block" htmlFor={`${baseId}-off`}>
        <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
          {t('qualitySlump.offlineTitle')}
        </span>
        <textarea
          id={`${baseId}-off`}
          rows={2}
          className={`${inset} mt-1.5 resize-none text-sm`}
          value={offlineNote}
          onChange={(e) => setOfflineNote(e.target.value)}
          placeholder={t('qualitySlump.offlinePh')}
        />
      </label>

      <button type="button" className={btnPrimary} onClick={onSave} disabled={!selectedPour || !slumpValid}>
        {t('qualitySlump.save')}
      </button>

      {savedToast ? (
        <div
          className="rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {savedToast}
        </div>
      ) : null}
    </div>
  )
}
