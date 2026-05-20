import { useState } from 'react'
import { AppDialog, AppDialogButton, AppDialogFooter, appDialogFieldClass, appDialogLabelClass } from '../../shared/AppDialog'
import { useI18n } from '../../../i18n/I18nProvider'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  onConfirm: (copies: number) => void
}

export function PrintCopyCountDialog({ open, title, onClose, onConfirm }: Props) {
  const { t } = useI18n()
  const [copies, setCopies] = useState(1)

  if (!open) return null

  return (
    <AppDialog
      open
      title={title}
      closeLabel={t('qualityShared.close')}
      onClose={onClose}
      size="sm"
      footer={
        <AppDialogFooter>
          <AppDialogButton variant="secondary" onClick={onClose}>
            {t('qualityShared.cancel')}
          </AppDialogButton>
          <AppDialogButton
            variant="primary"
            onClick={() => {
              onConfirm(Math.min(50, Math.max(1, copies)))
              onClose()
            }}
          >
            {t('qualityInput.printRegistry')}
          </AppDialogButton>
        </AppDialogFooter>
      }
    >
      <label className={appDialogLabelClass}>
        {t('qualityInput.registryCardCopies')}
        <input
          type="number"
          min={1}
          max={50}
          value={copies}
          onChange={(e) => setCopies(Number(e.target.value) || 1)}
          className={appDialogFieldClass}
        />
      </label>
    </AppDialog>
  )
}
