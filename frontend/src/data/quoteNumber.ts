import type { Quote } from './quotesMock'

/** T-YYYY-#### formatında benzersiz teklif numarası (mock). */
export function generateUniqueQuoteNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear()
  const prefix = `T-${year}-`
  let max = 0
  for (const num of existingNumbers) {
    if (!num.startsWith(prefix)) continue
    const tail = parseInt(num.slice(prefix.length), 10)
    if (!Number.isNaN(tail)) max = Math.max(max, tail)
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

export function collectAllQuoteNumbers(quotes: Quote[]): string[] {
  return quotes.map((q) => q.number)
}
