import { quotes as MOCK_QUOTES, type Quote } from './quotesMock'

const STORAGE_KEY = 'crm:extra-quotes:v1'

function readExtra(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Quote[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeExtra(rows: Quote[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

export function loadAllQuotes(): Quote[] {
  const extra = readExtra()
  const mockIds = new Set(MOCK_QUOTES.map((q) => q.id))
  const merged = [...MOCK_QUOTES, ...extra.filter((q) => !mockIds.has(q.id))]
  return merged
}

export function getQuoteById(quoteId: string): Quote | undefined {
  return loadAllQuotes().find((q) => q.id === quoteId)
}

export function saveExtraQuote(quote: Quote): void {
  const extra = readExtra()
  const idx = extra.findIndex((q) => q.id === quote.id)
  if (idx >= 0) extra[idx] = quote
  else extra.unshift(quote)
  writeExtra(extra)
}

export function updateExtraQuote(quoteId: string, patch: Partial<Quote>): Quote | null {
  const extra = readExtra()
  const idx = extra.findIndex((q) => q.id === quoteId)
  if (idx < 0) return null
  const next = { ...extra[idx]!, ...patch }
  extra[idx] = next
  writeExtra(extra)
  return next
}

export function patchQuoteById(quoteId: string, patch: Partial<Quote>): Quote | null {
  const current = getQuoteById(quoteId)
  if (!current) return null
  const next = { ...current, ...patch }
  saveExtraQuote(next)
  return next
}
