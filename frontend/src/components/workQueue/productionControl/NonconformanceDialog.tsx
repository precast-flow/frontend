import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  pendingPlacementToDialogMarker,
  RESPONSIBLE_UNIT_OPTIONS,
  type MarkerKind,
  type PendingMarkerPlacement,
  type QualityMarker,
  type ResponsibleUnit,
} from '../../../data/productionQualityControl'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { PmStyleDialog } from '../../shared/PmStyleDialog'

type Props = {
  open: boolean
  item: WorkQueueItem
  /** Mevcut işaret düzenleme */
  marker?: QualityMarker
  /** Yeni işaret — kayıt onaylanana kadar çizimde yok */
  pendingPlacement?: PendingMarkerPlacement
  gl: boolean
  onClose: () => void
  onSave: (input: {
    description: string
    responsibleUnit: ResponsibleUnit
    photos: { objectUrl: string; fileName: string }[]
  }) => void
}

function dialogTitleKey(kind: MarkerKind): string {
  if (kind === 'warning') return 'unitWorkQueue.qualityMarker.warningDialogTitle'
  return 'unitWorkQueue.nonconformance.dialogTitle'
}

export function NonconformanceDialog({
  open,
  item,
  marker,
  pendingPlacement,
  gl,
  onClose,
  onSave,
}: Props) {
  const { t } = useI18n()
  const displayMarker = useMemo(
    () =>
      marker ??
      (pendingPlacement
        ? pendingPlacementToDialogMarker(pendingPlacement, item.id)
        : null),
    [marker, pendingPlacement, item.id],
  )
  const isWarning = displayMarker?.kind === 'warning'
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState<ResponsibleUnit>('production')
  const [photos, setPhotos] = useState<{ objectUrl: string; fileName: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !displayMarker) return
    setDescription(displayMarker.note ?? '')
    setUnit('production')
    setPhotos(
      (displayMarker.notePhotos ?? []).map((p) => ({
        objectUrl: p.objectUrl,
        fileName: p.fileName,
      })),
    )
    setError(null)
  }, [open, displayMarker])

  if (!open || !displayMarker) return null

  const inputCls = gl
    ? 'w-full rounded-lg border border-black/15 bg-white/80 px-3 py-2 text-sm text-black dark:border-white/15 dark:bg-slate-900/60 dark:text-white'
    : 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/50'

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return
    const next = [...photos]
    for (const file of Array.from(files)) {
      next.push({ objectUrl: URL.createObjectURL(file), fileName: file.name })
    }
    setPhotos(next)
  }

  const handleSave = () => {
    if (!description.trim()) {
      setError(
        isWarning
          ? t('unitWorkQueue.qualityMarker.warningErrorDescription')
          : t('unitWorkQueue.nonconformance.errorDescription'),
      )
      return
    }
    if (!isWarning && !unit) {
      setError(t('unitWorkQueue.nonconformance.errorUnit'))
      return
    }
    onSave({
      description: description.trim(),
      responsibleUnit: unit,
      photos,
    })
    onClose()
  }

  return (
    <PmStyleDialog
      title={t(dialogTitleKey(displayMarker.kind))}
      subtitle={`${item.orderNo} · ${item.productName ?? item.title}`}
      closeLabel={t('unitWorkQueue.close')}
      onClose={onClose}
      variant={gl ? 'glass' : 'default'}
      maxWidthClass="max-w-lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold dark:border-white/15"
            onClick={onClose}
          >
            {t('unitWorkQueue.nonconformance.cancel')}
          </button>
          <button
            type="button"
            className={
              isWarning
                ? 'rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700'
                : 'rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700'
            }
            onClick={handleSave}
          >
            {t('unitWorkQueue.nonconformance.save')}
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-left">
        {isWarning ? (
          <p className="rounded-lg bg-amber-500/12 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
            {t('unitWorkQueue.qualityMarker.warningDialogHint')}
          </p>
        ) : null}
        <p className="text-xs text-black/60 dark:text-white/65">
          {t('unitWorkQueue.nonconformance.markerPosition', {
            x: String(Math.round(displayMarker.xPct)),
            y: String(Math.round(displayMarker.yPct)),
          })}
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-black/70 dark:text-white/75">
            {t('unitWorkQueue.nonconformance.description')} *
          </span>
          <textarea
            className={`${inputCls} min-h-[5rem] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isWarning
                ? t('unitWorkQueue.qualityMarker.warningDescriptionPlaceholder')
                : undefined
            }
          />
        </label>
        {!isWarning ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-black/70 dark:text-white/75">
              {t('unitWorkQueue.nonconformance.responsibleUnit')} *
            </span>
            <select
              className={inputCls}
              value={unit}
              onChange={(e) => setUnit(e.target.value as ResponsibleUnit)}
            >
              {RESPONSIBLE_UNIT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div>
          <span className="mb-2 block text-xs font-semibold text-black/70 dark:text-white/75">
            {t('unitWorkQueue.nonconformance.photos')}
            {isWarning ? ` (${t('unitWorkQueue.qualityMarker.optional')})` : ''}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold dark:border-white/15"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="size-3.5" aria-hidden />
              {t('unitWorkQueue.nonconformance.uploadPhoto')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-3 py-2 text-xs font-semibold dark:border-white/15 sm:hidden"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="size-3.5" aria-hidden />
              {t('unitWorkQueue.nonconformance.takePhoto')}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
          {photos.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {photos.map((p) => (
                <li key={p.objectUrl}>
                  <img
                    src={p.objectUrl}
                    alt=""
                    className="size-16 rounded-lg border border-black/10 object-cover dark:border-white/10"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </PmStyleDialog>
  )
}
