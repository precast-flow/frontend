import { MOCK_MANAGED_USERS } from './mockUsers'
import { MOCK_WORK_QUEUE_VIEWER_ID, resolveWorkQueueName, type WorkQueueItem } from './workQueueMock'
import type { Quote, QuoteLine } from './quotesMock'

export type QuoteTrackingOutcome = 'beklemede' | 'red' | 'donus_yapmiyor' | 'kabul' | 'revize'

export type QuoteRejectionReason = {
  id: string
  label: string
}

export const QUOTE_REJECTION_REASONS: QuoteRejectionReason[] = [
  { id: 'price', label: 'Fiyat uygun değil' },
  { id: 'timing', label: 'Teslim süresi uygun değil' },
  { id: 'spec', label: 'Teknik şartname uyuşmazlığı' },
  { id: 'competitor', label: 'Rakip teklif tercih edildi' },
  { id: 'budget', label: 'Bütçe iptali / erteleme' },
  { id: 'other', label: 'Diğer' },
]

export function quoteTrackingOutcomeLabel(outcome: QuoteTrackingOutcome): string {
  switch (outcome) {
    case 'beklemede':
      return 'Müşteri yanıtı bekleniyor'
    case 'red':
      return 'Red'
    case 'donus_yapmiyor':
      return 'Dönüş yapmıyor'
    case 'kabul':
      return 'Teklif kabul edildi'
    case 'revize':
      return 'Teklif revize'
  }
}

export function getSessionQuoteIssuer(): { userId: string; name: string } {
  const user = MOCK_MANAGED_USERS.find((u) => u.id === MOCK_WORK_QUEUE_VIEWER_ID)
  return {
    userId: MOCK_WORK_QUEUE_VIEWER_ID,
    name: user?.name ?? resolveWorkQueueName(MOCK_WORK_QUEUE_VIEWER_ID),
  }
}

export function todayIsoDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatQuoteDateTr(iso: string): string {
  const [y, m, day] = iso.split('-').map(Number)
  if (!y || !m || !day) return iso
  return `${String(day).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
}

export function buildEmptyQuoteLines(): QuoteLine[] {
  return [
    {
      id: `ln-${Date.now()}`,
      code: '',
      description: '',
      qty: 1,
      unit: 'ad',
      unitPrice: 0,
    },
  ]
}

export function buildWorkQueueItemForQuote(quote: Quote, workQueueId: string): WorkQueueItem {
  const issuer = quote.issuedByName ?? resolveWorkQueueName(quote.issuedByUserId ?? MOCK_WORK_QUEUE_VIEWER_ID)
  return {
    id: workQueueId,
    orderNo: `TK-${quote.number.replace(/^T-/, '')}`,
    title: `Teklif takibi — ${quote.number}`,
    summary: `${quote.customer} · ${quote.customerContactName ?? 'Yetkili'} · Sonuç bekleniyor`,
    detailBody: `${issuer} tarafından ${formatQuoteDateTr(quote.quoteDateIso ?? todayIsoDate())} tarihinde oluşturulan teklif için müşteri yanıtı kaydedin. Teklif no: ${quote.number}.`,
    kind: 'quote_followup',
    status: 'beklemede',
    priority: 'normal',
    targetUnit: 'crm',
    fromUnit: 'crm',
    toUnit: 'crm',
    assigneeUserId: quote.issuedByUserId ?? MOCK_WORK_QUEUE_VIEWER_ID,
    assignerUserId: quote.issuedByUserId ?? MOCK_WORK_QUEUE_VIEWER_ID,
    projectCode: quote.number,
    projectName: quote.customer,
    projectRouteId: null,
    factoryCode: 'IST-HAD',
    daysOnDesk: 0,
    lastUpdatedLabel: 'Az önce',
    dueToday: true,
    quoteId: quote.id,
  }
}

export function workQueueStatusForOutcome(outcome: QuoteTrackingOutcome): WorkQueueItem['status'] {
  if (outcome === 'beklemede' || outcome === 'revize') return 'islemde'
  if (outcome === 'donus_yapmiyor') return 'bloke'
  return 'tamamlandi'
}
