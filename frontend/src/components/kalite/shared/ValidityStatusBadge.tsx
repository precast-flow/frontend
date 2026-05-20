import { useI18n } from '../../../i18n/I18nProvider'
import { computeValidityStatus, type LabTestValidityStatus } from '../../../data/quality/qualityManagementTypes'

type Props = {
  startDate: string
  endDate: string
  className?: string
}

function badgeClass(status: LabTestValidityStatus): string {
  const base = 'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1'
  if (status === 'active') {
    return `${base} bg-emerald-500/12 text-emerald-800 ring-emerald-500/25 dark:text-emerald-100`
  }
  if (status === 'expired') {
    return `${base} bg-rose-500/12 text-rose-800 ring-rose-500/25 dark:text-rose-100`
  }
  return `${base} bg-sky-500/12 text-sky-800 ring-sky-500/25 dark:text-sky-100`
}

export function ValidityStatusBadge({ startDate, endDate, className = '' }: Props) {
  const { t } = useI18n()
  const status = computeValidityStatus(startDate, endDate)
  const labelKey =
    status === 'active'
      ? 'qualityLab.validity.active'
      : status === 'expired'
        ? 'qualityLab.validity.expired'
        : 'qualityLab.validity.planned'
  return (
    <span className={`${badgeClass(status)} ${className}`.trim()}>{t(labelKey)}</span>
  )
}
