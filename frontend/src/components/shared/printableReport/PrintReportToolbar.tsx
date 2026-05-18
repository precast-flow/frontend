import { FileDown, Printer } from 'lucide-react'
import { eiSplitHeaderButtonPassive } from '../../elementIdentity/ElementIdentityPieceCodesLikeSplit'

type Props = {
  printLabel: string
  pdfLabel: string
  pdfHint?: string
  onPrint: () => void
}

const btn = `${eiSplitHeaderButtonPassive} px-2.5 py-1.5`

export function PrintReportToolbar({ printLabel, pdfLabel, pdfHint, onPrint }: Props) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
      <button type="button" onClick={onPrint} className={btn}>
        <Printer className="size-3.5 shrink-0" aria-hidden />
        {printLabel}
      </button>
      <button type="button" onClick={onPrint} title={pdfHint} className={btn}>
        <FileDown className="size-3.5 shrink-0" aria-hidden />
        {pdfLabel}
      </button>
    </div>
  )
}
