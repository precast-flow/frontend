/** Ürün projeler arası taşıma — yalnızca frontend mock akışı */

export type ProductTransferReasonKey =
  | 'excess'
  | 'scrap'
  | 'defective'
  | 'wrong_project'
  | 'surplus_need'
  | 'reuse'
  | 'other'

export const PRODUCT_TRANSFER_REASON_ORDER: ProductTransferReasonKey[] = [
  'excess',
  'scrap',
  'defective',
  'wrong_project',
  'surplus_need',
  'reuse',
  'other',
]

export type ProductTransferLogEntry = {
  id: string
  at: string
  fromProjectId: string
  toProjectId: string
  toProjectLabel: string
  productIds: string[]
  productSummaries: string[]
  reason: ProductTransferReasonKey
  reasonNote?: string
}

export function transferReasonI18nKey(reason: ProductTransferReasonKey): string {
  return `elementIdentity.transfer.reason.${reason}`
}
