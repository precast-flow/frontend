import { Eye } from 'lucide-react'
import { useProductionRolePreview } from '../../context/ProductionRolePreviewContext'
import { getRoleMatrixRow } from '../../data/productionRoleMatrixMock'
import { useI18n } from '../../i18n/I18nProvider'

export function ProductionRolePreviewBanner() {
  const { t } = useI18n()
  const { previewRoleId, clearPreview } = useProductionRolePreview()
  if (!previewRoleId) return null
  const row = getRoleMatrixRow(previewRoleId)
  const roleLabel = row ? t(row.labelKey) : previewRoleId

  return (
    <div className="gm-glass-role-preview-banner flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/80 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-100">
      <div className="flex min-w-0 items-center gap-2">
        <Eye className="size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
        <p className="min-w-0 font-medium">
          <span className="sr-only">{t('rolePreview.bannerAria')}</span>
          {t('rolePreview.banner', { role: roleLabel })}
        </p>
      </div>
      <button
        type="button"
        onClick={clearPreview}
        className="shrink-0 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-amber-200 dark:text-gray-900 dark:hover:bg-white"
      >
        {t('rolePreview.bannerExit')}
      </button>
    </div>
  )
}
