import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

export type BreadcrumbSegment = {
  labelKey: string
  /** Relative path (örn. `/planlama`) — yoksa düz metin */
  to?: string
}

const linkClass =
  'font-medium text-black/75 underline-offset-2 transition hover:text-black hover:underline dark:text-white/75 dark:hover:text-white'

type Props = {
  segments: BreadcrumbSegment[]
}

export function AppModuleBreadcrumb({ segments }: Props) {
  const { t } = useI18n()
  if (segments.length === 0) return null

  return (
    <nav aria-label={t('project.breadcrumbAria')}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-black/60 dark:text-white/65">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          return (
            <li key={`${seg.labelKey}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
              {isLast ? (
                <span className="font-semibold text-black dark:text-white" aria-current="page">
                  {t(seg.labelKey)}
                </span>
              ) : seg.to ? (
                <Link to={seg.to} className={linkClass}>
                  {t(seg.labelKey)}
                </Link>
              ) : (
                <span className="font-medium text-black/75 dark:text-white/75">{t(seg.labelKey)}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
