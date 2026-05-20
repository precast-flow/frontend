import { AppDialog, AppDialogButton } from '../shared/AppDialog'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  projectName: string
}

/** Üretim emrine aktar öncesi doğrulama. */
export function ProjectMesModal({ open, onClose, onConfirm, projectName }: Props) {
  return (
    <AppDialog
      open={open}
      size="sm"
      title="Üretim emrine aktar"
      closeLabel="Kapat"
      onClose={onClose}
      footer={
        <>
          <AppDialogButton variant="secondary" onClick={onClose}>
            Vazgeç
          </AppDialogButton>
          <AppDialogButton
            variant="primary"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Onayla ve aktar
          </AppDialogButton>
        </>
      }
    >
      <p>
        <strong className="font-semibold text-slate-900">{projectName}</strong> için seçili elemanlar MES’e
        aktarılacak. Aşağıdaki kontrolleri onaylayın.
      </p>
      <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
          <input type="checkbox" defaultChecked className="mt-1 size-4 rounded border-slate-400" />
          <span>Mühendislik revizyonu imzalı (son rev.)</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
          <input type="checkbox" defaultChecked className="mt-1 size-4 rounded border-slate-400" />
          <span>BOM ve rota eşleşmesi doğrulandı</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
          <input type="checkbox" className="mt-1 size-4 rounded border-slate-400" />
          <span>Müşteri ek onayı (varsa)</span>
        </label>
      </div>
    </AppDialog>
  )
}
