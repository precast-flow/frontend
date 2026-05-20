import { useEffect, useState } from 'react'
import { defaultIncludeKindsFromCounts } from '../../../data/qualityControlReport'
import { Check, AlertTriangle, X } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import type { QualityReportIncludeKinds } from '../../../data/qualityControlReport'
import type { MarkerKind } from '../../../data/productionQualityControl'
import { PmStyleDialog, AppDialogButton } from '../../shared/PmStyleDialog'

type Props = {
  open: boolean
  itemLabel: string
  counts: { pass: number; warning: number; error: number }
  gl: boolean
  replacingExisting?: boolean
  busy?: boolean
  onClose: () => void
  onConfirm: (include: QualityReportIncludeKinds) => void | Promise<void>
}

const KIND_META: { id: keyof QualityReportIncludeKinds; kind: MarkerKind; Icon: typeof Check }[] = [
  { id: 'pass', kind: 'pass', Icon: Check },
  { id: 'warning', kind: 'warning', Icon: AlertTriangle },
  { id: 'error', kind: 'error', Icon: X },
]

export function QualityReportComposeDialog({
  open,
  itemLabel,
  counts,
  gl: _gl,
  replacingExisting = false,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useI18n()
  const [include, setInclude] = useState<QualityReportIncludeKinds>(() =>
    defaultIncludeKindsFromCounts(counts),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setInclude(defaultIncludeKindsFromCounts(counts))
    setError(null)
  }, [open, counts.pass, counts.warning, counts.error])

  if (!open) return null

  const toggle = (key: keyof QualityReportIncludeKinds) => {
    setInclude((prev) => ({ ...prev, [key]: !prev[key] }))
    setError(null)
  }

  const selectedCount =
    (include.pass ? counts.pass : 0) +
    (include.warning ? counts.warning : 0) +
    (include.error ? counts.error : 0)

  const handleConfirm = () => {
    if (busy) return
    if (!include.pass && !include.warning && !include.error) {
      setError(t('unitWorkQueue.qcReport.composeErrorKinds'))
      return
    }
    if (selectedCount === 0) {
      setError(t('unitWorkQueue.qcReport.composeErrorEmpty'))
      return
    }
    void (async () => {
      await onConfirm(include)
      onClose()
    })()
  }

  const rowCls = (active: boolean, kind: MarkerKind) => {
    const base =
      'flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-left transition'
    if (kind === 'pass') {
      return `${base} ${active ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-black/12 dark:border-white/12'}`
    }
    if (kind === 'warning') {
      return `${base} ${active ? 'border-amber-500/40 bg-amber-500/10' : 'border-black/12 dark:border-white/12'}`
    }
    return `${base} ${active ? 'border-red-500/40 bg-red-500/10' : 'border-black/12 dark:border-white/12'}`
  }

  return (
    <PmStyleDialog
      open={open}
      title={t('unitWorkQueue.qcReport.composeTitle')}
      subtitle={itemLabel}
      closeLabel={t('unitWorkQueue.nonconformance.cancel')}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <AppDialogButton variant="secondary" disabled={busy} onClick={onClose}>
            {t('unitWorkQueue.nonconformance.cancel')}
          </AppDialogButton>
          <AppDialogButton variant="danger" disabled={busy} onClick={handleConfirm}>
            {busy
              ? t('unitWorkQueue.qcReport.composeGenerating')
              : t('unitWorkQueue.qcReport.composeConfirm')}
          </AppDialogButton>
        </>
      }
    >
      <p className="mb-3 text-sm text-black/75 dark:text-white/80">
        {t('unitWorkQueue.qcReport.composeHint')}
      </p>
      {replacingExisting ? (
        <p className="mb-3 rounded-lg bg-amber-500/12 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
          {t('unitWorkQueue.qcReport.composeReplaceHint')}
        </p>
      ) : null}
      <ul className="space-y-2">
        {KIND_META.map(({ id, kind, Icon }) => {
          const count = counts[id]
          const disabled = count === 0
          const active = include[id]
          return (
            <li key={id}>
              <label
                className={`${rowCls(active, kind)} ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  disabled={disabled}
                  onChange={() => !disabled && toggle(id)}
                />
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    kind === 'pass'
                      ? 'bg-emerald-500 text-white'
                      : kind === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-600 text-white'
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-black dark:text-white">
                    {t(`unitWorkQueue.qualityMarker.${kind === 'pass' ? 'pass' : kind === 'warning' ? 'warning' : 'error'}`)}
                  </span>
                  <span className="mt-0.5 block text-xs text-black/55 dark:text-white/60">
                    {t('unitWorkQueue.qcReport.composeMarkerCount', { count: String(count) })}
                  </span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      {error ? <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-300">{error}</p> : null}
      <p className="mt-3 text-center text-xs text-black/50 dark:text-white/55">
        {t('unitWorkQueue.qcReport.composeSelected', { count: String(selectedCount) })}
      </p>
    </PmStyleDialog>
  )
}

