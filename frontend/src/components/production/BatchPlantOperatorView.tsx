import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertOctagon, CheckCircle, Gauge, ImageIcon, Pause, Play } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  BATCH_CURRENT_JOB,
  BATCH_PREVIOUS_POUR_SEED,
  type BatchPlantPhase,
  type PreviousPourSummary,
} from '../../data/batchPlantOperatorMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-2xl border-0 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnBase =
  'rounded-2xl px-5 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:ring-offset-gray-900'

/** Tek primary: koyu dolgu; diğerleri neo-secondary */
const btnPrimary = `${btnBase} bg-gray-900 text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`
const btnSecondary = `${btnBase} bg-gray-100 text-gray-900 shadow-neo-out-sm hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700`
const btnTertiary = `${btnBase} border border-gray-300/90 bg-transparent text-gray-800 hover:bg-gray-100/80 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800/80`

export function BatchPlantOperatorView() {
  const { t } = useI18n()
  const { contextDetail, selectedFactory, selectedCodes } = useFactoryContext()
  const [roleOperator, setRoleOperator] = useState(true)
  const [phase, setPhase] = useState<BatchPlantPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [handoverNote, setHandoverNote] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [previousPour, setPreviousPour] = useState<PreviousPourSummary>(BATCH_PREVIOUS_POUR_SEED)
  const [toast, setToast] = useState<string | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const canEdit = roleOperator

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  useEffect(() => {
    if (phase !== 'pouring') {
      clearTick()
      return
    }
    tickRef.current = window.setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : Math.min(95, p + 4)))
    }, 700)
    return () => clearTick()
  }, [phase, clearTick])

  const m3Done = phase === 'idle' && progress === 0 ? 0 : (BATCH_CURRENT_JOB.m3Target * progress) / 100
  const m3Remain = Math.max(0, BATCH_CURRENT_JOB.m3Target - m3Done)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  const onStart = () => {
    if (!canEdit) return
    setPhase('pouring')
    setProgress(0)
  }

  const onPause = () => {
    if (!canEdit) return
    setPhase('paused')
    clearTick()
  }

  const onResume = () => {
    if (!canEdit) return
    setPhase('pouring')
  }

  const onComplete = () => {
    if (!canEdit) return
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const display = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    setPreviousPour({
      orderNo: BATCH_CURRENT_JOB.orderNo,
      partShort: BATCH_CURRENT_JOB.partLabel.split('·')[0]?.trim() ?? BATCH_CURRENT_JOB.partLabel,
      m3: String(BATCH_CURRENT_JOB.m3Target).replace('.', ','),
      recipeCode: BATCH_CURRENT_JOB.recipeCode,
      finishedAtDisplay: display,
    })
    setPhase('idle')
    setProgress(0)
    showToast(t('batchPlant.toastComplete'))
  }

  const onReport = () => {
    if (!canEdit) return
    showToast(t('batchPlant.toastReport'))
  }

  const factoryHint = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  const completePrimary = phase === 'pouring'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-100">prod-06:</strong> {t('batchPlant.intro')}{' '}
        <span className="text-gray-500">{contextDetail}</span> · <strong>{factoryHint}</strong>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 shadow-neo-in dark:bg-gray-950/70">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
          <input
            type="checkbox"
            className="size-4 rounded accent-gray-800 dark:accent-gray-200"
            checked={roleOperator}
            onChange={(e) => setRoleOperator(e.target.checked)}
          />
          <Gauge className="size-4" aria-hidden />
          {t('batchPlant.roleOperator')}
        </label>
        {!roleOperator ? (
          <p className="max-w-xl text-xs text-amber-800 dark:text-amber-200">{t('batchPlant.roleReadOnly')}</p>
        ) : null}
      </div>

      {/* P0 — sıradaki iş kartı */}
      <section className="overflow-hidden rounded-3xl bg-gray-100 shadow-neo-out dark:bg-gray-900/85">
        <div className="grid gap-0 md:grid-cols-[1fr_min(40%,20rem)]">
          <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('batchPlant.cardKicker')}
            </p>
            <p className="font-mono text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 md:text-4xl">
              {BATCH_CURRENT_JOB.orderNo}
            </p>
            <p className="text-xl font-medium leading-snug text-gray-800 dark:text-gray-100 md:text-2xl">
              {BATCH_CURRENT_JOB.partLabel}
            </p>
            <div className="flex flex-wrap gap-6 text-lg tabular-nums text-gray-800 dark:text-gray-100">
              <div>
                <span className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('batchPlant.m3Target')}
                </span>
                <span className="text-2xl font-bold">{String(BATCH_CURRENT_JOB.m3Target).replace('.', ',')} m³</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  {t('batchPlant.m3Remain')}
                </span>
                <span className="text-2xl font-bold">{m3Remain.toFixed(1).replace('.', ',')} m³</span>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50/80 px-4 py-3 shadow-neo-in dark:bg-gray-950/60">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('batchPlant.recipeTitle')}</p>
              <p className="mt-1 font-mono text-lg font-semibold text-gray-900 dark:text-gray-50">{BATCH_CURRENT_JOB.recipeCode}</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{BATCH_CURRENT_JOB.recipeSummary}</p>
            </div>
          </div>
          <div
            className="flex min-h-[12rem] flex-col items-center justify-center gap-2 border-t border-gray-200/80 bg-gray-200/40 p-6 dark:border-gray-700/80 dark:bg-gray-950/40 md:border-l md:border-t-0"
            aria-hidden
          >
            <div className="flex size-28 items-center justify-center rounded-2xl bg-gray-300/80 shadow-neo-in dark:bg-gray-800/80">
              <ImageIcon className="size-14 text-gray-500 dark:text-gray-400" strokeWidth={1.25} />
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">{t('batchPlant.visualPlaceholder')}</p>
          </div>
        </div>

        {/* P0 — ilerleme */}
        <div className="border-t border-gray-200/90 px-6 py-5 dark:border-gray-700/90">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>{t('batchPlant.progressLabel')}</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div
            className="h-5 overflow-hidden rounded-full bg-gray-200 shadow-neo-in dark:bg-gray-800"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-gray-700 to-gray-900 transition-[width] duration-300 ease-out dark:from-gray-200 dark:to-gray-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* P0 — dört aksiyon; yalnızca biri primary (startResumePrimary | completePrimary) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {phase === 'idle' ? (
          <button type="button" disabled={!canEdit} className={btnPrimary} onClick={onStart}>
            <Play className="mr-2 inline size-5 align-text-bottom" aria-hidden />
            {t('batchPlant.btnStart')}
          </button>
        ) : phase === 'paused' ? (
          <button type="button" disabled={!canEdit} className={btnPrimary} onClick={onResume}>
            <Play className="mr-2 inline size-5 align-text-bottom" aria-hidden />
            {t('batchPlant.btnResume')}
          </button>
        ) : (
          <button type="button" disabled className={btnSecondary}>
            <Play className="mr-2 inline size-5 align-text-bottom opacity-50" aria-hidden />
            {t('batchPlant.btnStart')}
          </button>
        )}
        <button
          type="button"
          disabled={!canEdit || phase !== 'pouring'}
          className={btnSecondary}
          onClick={onPause}
        >
          <Pause className="mr-2 inline size-5 align-text-bottom" aria-hidden />
          {t('batchPlant.btnPause')}
        </button>
        <button
          type="button"
          disabled={!canEdit || phase === 'idle'}
          className={completePrimary ? btnPrimary : btnSecondary}
          onClick={onComplete}
        >
          <CheckCircle className="mr-2 inline size-5 align-text-bottom" aria-hidden />
          {t('batchPlant.btnComplete')}
        </button>
        <button type="button" disabled={!canEdit} className={btnTertiary} onClick={onReport}>
          <AlertOctagon className="mr-2 inline size-5 align-text-bottom" aria-hidden />
          {t('batchPlant.btnReport')}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('batchPlant.primaryRuleHint')}</p>

      {/* P1 — vardiya devir notu + son döküm */}
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('batchPlant.handoverLabel')}
          </span>
          <textarea
            className={`${inset} min-h-[7rem] resize-y disabled:opacity-50`}
            placeholder={t('batchPlant.handoverPlaceholder')}
            value={handoverNote}
            onChange={(e) => setHandoverNote(e.target.value)}
            disabled={!canEdit}
          />
        </label>
        <div className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('batchPlant.previousTitle')}
          </p>
          <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100">
            {t('batchPlant.previousLine', {
              order: previousPour.orderNo,
              part: previousPour.partShort,
              m3: previousPour.m3,
              code: previousPour.recipeCode,
              at: previousPour.finishedAtDisplay,
            })}
          </p>
        </div>
      </div>

      {/* P2 — QR / barkod */}
      <section className="rounded-2xl border border-dashed border-gray-300/90 bg-gray-50/80 px-4 py-4 dark:border-gray-600 dark:bg-gray-950/50">
        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('batchPlant.qrTitle')}</p>
        <input
          type="text"
          className={`${inset} mt-2 font-mono text-sm`}
          placeholder={t('batchPlant.qrPlaceholder')}
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          disabled={!canEdit}
          autoComplete="off"
        />
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('batchPlant.qrHint')}</p>
      </section>

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
