import { useI18n } from '../../../i18n/I18nProvider'
import type { ConcreteRecipeStatus } from '../../../data/quality/qualityManagementTypes'

type Props = {
  status: ConcreteRecipeStatus
  className?: string
}

function badgeClass(status: ConcreteRecipeStatus): string {
  const base = 'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1'
  if (status === 'published') {
    return `${base} bg-emerald-500/12 text-emerald-800 ring-emerald-500/25 dark:text-emerald-100`
  }
  if (status === 'pending_approval') {
    return `${base} bg-amber-500/12 text-amber-900 ring-amber-500/25 dark:text-amber-100`
  }
  if (status === 'draft') {
    return `${base} bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-200`
  }
  return `${base} bg-slate-200/80 text-slate-600 ring-slate-300/80 dark:bg-slate-700 dark:text-slate-300`
}

export function RecipeStatusBadge({ status, className = '' }: Props) {
  const { t } = useI18n()
  const key =
    status === 'published'
      ? 'qualityRecipe.status.published'
      : status === 'pending_approval'
        ? 'qualityRecipe.status.pending'
        : status === 'draft'
          ? 'qualityRecipe.status.draft'
          : 'qualityRecipe.status.superseded'
  return <span className={`${badgeClass(status)} ${className}`.trim()}>{t(key)}</span>
}
