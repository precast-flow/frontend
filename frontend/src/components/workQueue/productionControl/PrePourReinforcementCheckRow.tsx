import { useState } from 'react'
import { CheckCircle2, Circle, X } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useQualityManagement } from '../../../context/QualityManagementContext'
import { useWorkQueue } from '../../../context/WorkQueueContext'
import type { RebarMaterialScan } from '../../../data/productionWorkOrderFlow'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import { QrScanMockPanel } from '../../kalite/shared/QrScanMockPanel'

type Props = {
  item: WorkQueueItem
  done: boolean
  approved: boolean
  scans: RebarMaterialScan[]
  gl: boolean
  onToggle: () => void
}

export function PrePourReinforcementCheckRow({
  item,
  done,
  approved,
  scans,
  gl,
  onToggle,
}: Props) {
  const { t } = useI18n()
  const { scanRebarMaterial, removeRebarScan, replaceRebarScan } = useWorkQueue()
  const { findInputMaterial, supplierName } = useQualityManagement()
  const [scanError, setScanError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(scans.length > 0)
  const [replacingScanId, setReplacingScanId] = useState<string | null>(null)

  const handleScan = (raw: string) => {
    const result = replacingScanId
      ? replaceRebarScan(item.id, replacingScanId, raw, item)
      : scanRebarMaterial(item.id, raw, item)
    if (!result.ok && result.errorKey) {
      setScanError(t(result.errorKey))
      return
    }
    setScanError(null)
    setReplacingScanId(null)
    setExpanded(true)
  }

  const rowCls = done
    ? 'border-emerald-500/30 bg-emerald-500/8 dark:border-emerald-400/25'
    : gl
      ? 'border-black/12 dark:border-white/12'
      : 'border-slate-200/80 dark:border-slate-600/60'

  return (
    <li>
      <div className={`rounded-lg border transition ${rowCls} ${approved ? 'opacity-70' : ''}`}>
        <label
          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${approved ? 'pointer-events-none' : ''}`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={done}
            disabled={approved}
            onChange={onToggle}
          />
          {done ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Circle className="size-5 shrink-0 text-slate-300 dark:text-slate-500" />
          )}
          <span className="min-w-0 flex-1 text-left text-sm leading-snug text-slate-800 dark:text-slate-100">
            {t('unitWorkQueue.productionFlow.check.reinforcement')}
          </span>
          {scans.length > 0 ? (
            <span className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-100">
              {t('qualityQrScan.scannedCount', { count: String(scans.length) })}
            </span>
          ) : null}
          {!approved ? (
            <button
              type="button"
              className="shrink-0 text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
              onClick={(e) => {
                e.preventDefault()
                setExpanded((v) => !v)
              }}
            >
              QR
            </button>
          ) : null}
        </label>

        {expanded && !approved ? (
          <div className="space-y-2 border-t border-slate-200/80 px-3 py-3 dark:border-slate-600/60">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {replacingScanId ? t('qualityQrScan.replaceHint') : t('qualityQrScan.hintPrePour')}
            </p>
            <QrScanMockPanel compact onScan={handleScan} errorMessage={scanError} />
            {replacingScanId ? (
              <button
                type="button"
                className="text-xs text-slate-600 hover:underline dark:text-slate-400"
                onClick={() => {
                  setReplacingScanId(null)
                  setScanError(null)
                }}
              >
                {t('qualityShared.cancel')}
              </button>
            ) : null}
            {scans.length > 0 ? (
              <ul className="space-y-1.5">
                {scans.map((scan) => {
                  const mat = findInputMaterial(scan.inputMaterialId)
                  if (!mat) return null
                  const isReplacing = replacingScanId === scan.scanId
                  return (
                    <li
                      key={scan.scanId}
                      className={`flex items-start justify-between gap-2 rounded-md px-2 py-1.5 text-xs ${
                        isReplacing
                          ? 'ring-2 ring-sky-400/60 bg-sky-50/90 dark:bg-sky-950/30'
                          : 'bg-white/80 dark:bg-slate-800/80'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="font-semibold">{supplierName(mat.supplierId)}</span>
                        <span className="text-slate-500"> · </span>
                        <span className="font-mono">{mat.supplierMaterialCode}</span>
                        <span className="block text-slate-500">{mat.systemMaterialCode}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950/40"
                          onClick={() => {
                            setReplacingScanId(scan.scanId)
                            setScanError(null)
                          }}
                        >
                          {t('qualityQrScan.replace')}
                        </button>
                        <button
                          type="button"
                          className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          aria-label={t('qualityQrScan.remove')}
                          onClick={() => {
                            if (replacingScanId === scan.scanId) setReplacingScanId(null)
                            removeRebarScan(item.id, scan.scanId)
                          }}
                        >
                          <X className="size-4" />
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  )
}
