import { BarChart3, FileCode2, FileSpreadsheet, FileText, ScrollText, ShieldCheck } from 'lucide-react'

export const DOCUMENT_TYPE_ORDER = ['Sözleşme', 'Çizim', 'Model', 'Kalite', 'Rapor'] as const
export type DetailDocType = (typeof DOCUMENT_TYPE_ORDER)[number]

export type ExplorerDocument = {
  id: string
  type: DetailDocType
  name: string
  size: string
  ext: string
  uploadedAt: string
  uploadedBy: string
  revision: string
  note: string
  previewUrl: string
}

export function documentIcon(type: DetailDocType, ext: string) {
  if (ext === 'XLSX') return <FileSpreadsheet className="size-4" aria-hidden />
  if (type === 'Model') return <FileCode2 className="size-4" aria-hidden />
  if (type === 'Kalite') return <ShieldCheck className="size-4" aria-hidden />
  if (type === 'Rapor') return <BarChart3 className="size-4" aria-hidden />
  if (type === 'Sözleşme') return <ScrollText className="size-4" aria-hidden />
  return <FileText className="size-4" aria-hidden />
}
