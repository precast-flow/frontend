import { useState } from 'react'
import { AppDialog, AppDialogButton, AppDialogFooter } from '../../shared/AppDialog'
import { useI18n } from '../../../i18n/I18nProvider'
import type { ParsedInputMaterialRow } from '../../../data/quality/qualityExcelIo'

type Props = {
  open: boolean
  rows: ParsedInputMaterialRow[]
  onClose: () => void
  onConfirm: (validRows: ParsedInputMaterialRow[]) => void
}

export function QualityExcelImportDialog({ open, rows, onClose, onConfirm }: Props) {
  const { t } = useI18n()
  const [selected, setSelected] = useState(() => new Set<number>())

  const validRows = rows.filter((r) => r.errors.length === 0)
  const invalidCount = rows.length - validRows.length

  const toggle = (rowIndex: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)
      return next
    })
  }

  const handleConfirm = () => {
    const pick =
      selected.size > 0
        ? validRows.filter((r) => selected.has(r.rowIndex))
        : validRows
    onConfirm(pick)
    onClose()
  }

  if (!open) return null

  return (
    <AppDialog
      open
      size="lg"
      title={t('qualityExcel.importPreviewTitle')}
      closeLabel={t('qualityShared.cancel')}
      onClose={onClose}
      footer={
        <AppDialogFooter>
          <AppDialogButton variant="secondary" onClick={onClose}>
            {t('qualityShared.cancel')}
          </AppDialogButton>
          <AppDialogButton
            variant="primary"
            onClick={handleConfirm}
            disabled={validRows.length === 0}
          >
            {t('qualityExcel.importConfirm', { count: String(validRows.length) })}
          </AppDialogButton>
        </AppDialogFooter>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t('qualityExcel.importSummary', {
          total: String(rows.length),
          valid: String(validRows.length),
          invalid: String(invalidCount),
        })}
      </p>
      <ul className="mt-3 max-h-[min(50vh,360px)] space-y-2 overflow-y-auto text-sm">
        {rows.map((r) => (
          <li
            key={r.rowIndex}
            className={[
              'rounded-lg border px-3 py-2',
              r.errors.length
                ? 'border-amber-300/70 bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-950/25'
                : 'border-slate-200/70 bg-slate-50/50 dark:border-slate-600/45 dark:bg-slate-900/30',
            ].join(' ')}
          >
            <div className="flex items-start gap-2">
              {r.errors.length === 0 ? (
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.size === 0 || selected.has(r.rowIndex)}
                  onChange={() => toggle(r.rowIndex)}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  {t('qualityExcel.rowLabel', { row: String(r.rowIndex) })} — {r.draft.name || '—'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {r.draft.systemMaterialCode} · {r.draft.supplierMaterialCode}
                </p>
                {r.errors.length > 0 ? (
                  <ul className="mt-1 list-disc pl-4 text-xs text-amber-900 dark:text-amber-100">
                    {r.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AppDialog>
  )
}
