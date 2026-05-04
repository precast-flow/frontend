import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

export type BreadcrumbSegment = {
  labelKey: string
  /** Relative path (örn. `/tanimlar`) — yoksa düz metin */
  to?: string
}

type Props = {
  segments: BreadcrumbSegment[]
  className?: string
}

export function AppModuleBreadcrumb({ segments, className = 'mb-0' }: Props) {
  const { t } = useI18n()
  if (segments.length === 0) return null

  return (
    <nav aria-label={t('project.breadcrumbAria')} className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          return (
            <li key={`${seg.labelKey}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
              {isLast ? (
                <span className="font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
                  {t(seg.labelKey)}
                </span>
              ) : seg.to ? (
                <Link
                  to={seg.to}
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
                >
                  {t(seg.labelKey)}
                </Link>
              ) : (
                <span className="font-medium text-slate-600 dark:text-slate-300">{t(seg.labelKey)}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
