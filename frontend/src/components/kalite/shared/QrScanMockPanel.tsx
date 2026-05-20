import { useState } from 'react'
import { ScanLine } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { buildInputMaterialQrPayload } from '../../../data/quality/qualityQrPayload'

type Props = {
  onScan: (raw: string) => void
  errorMessage?: string | null
  compact?: boolean
}

export function QrScanMockPanel({ onScan, errorMessage, compact = false }: Props) {
  const { t } = useI18n()
  const [manual, setManual] = useState('')

  const submit = () => {
    const v = manual.trim()
    if (!v) return
    onScan(v)
    setManual('')
  }

  const simulate = () => {
    onScan(buildInputMaterialQrPayload('im-001'))
  }

  return (
    <div
      className={
        compact
          ? 'space-y-2 rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-600/60 dark:bg-slate-900/40'
          : 'space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-600/60 dark:bg-slate-900/50'
      }
    >
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <ScanLine className="size-4 shrink-0 text-sky-600" aria-hidden />
        {t('qualityQrScan.title')}
      </p>
      <div
        className="flex min-h-[4.5rem] items-center justify-center rounded-lg border border-dashed border-slate-300/90 bg-slate-100/60 text-center text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
        aria-hidden
      >
        {t('qualityQrScan.cameraHint')}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t('qualityQrScan.placeholder')}
          className="min-w-0 flex-1 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          {t('qualityQrScan.submit')}
        </button>
        <button
          type="button"
          onClick={simulate}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          {t('qualityQrScan.simulate')}
        </button>
      </div>
      {errorMessage ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
