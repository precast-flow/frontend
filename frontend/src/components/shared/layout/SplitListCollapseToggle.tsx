import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { eiSplitHeaderButtonPassive } from '../../elementIdentity/ElementIdentityPieceCodesLikeSplit'

type Props = {
  collapsed: boolean
  onToggle: () => void
  className?: string
}

export function SplitListCollapseToggle({ collapsed, onToggle, className = '' }: Props) {
  const { t } = useI18n()
  const label = collapsed ? t('splitLayout.expandList') : t('splitLayout.collapseList')

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={label}
      title={label}
      className={`${eiSplitHeaderButtonPassive} inline-flex size-8 items-center justify-center p-0 ${className}`}
    >
      {collapsed ? (
        <PanelLeftOpen className="size-4" aria-hidden />
      ) : (
        <PanelLeftClose className="size-4" aria-hidden />
      )}
    </button>
  )
}
