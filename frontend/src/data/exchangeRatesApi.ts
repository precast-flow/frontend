/**
 * TRY karşılığı döviz kurları — tarayıcıdan erişilebilir kaynaklar (CORS).
 * Öncelik: ExchangeRate-API (open.er-api.com) → doviz.dev → Frankfurter.
 */

export type FxPairRate = {
  code: string
  rate: number
  /** 1 {code} = {rate} TRY */
}

export type FxRatesSnapshot = {
  date: string
  pairs: FxPairRate[]
  fetchedAt: number
  source: string
}

const CACHE_MS = 15 * 60 * 1000
let cache: { key: string; data: FxRatesSnapshot; at: number } | null = null

const SUPPORTED = new Set([
  'USD',
  'EUR',
  'GBP',
  'CHF',
  'JPY',
  'SAR',
  'AED',
  'CAD',
  'AUD',
  'NOK',
  'SEK',
  'DKK',
])

function cacheKey(symbols: string[]) {
  return symbols.slice().sort().join(',')
}

function utcDateFromUnix(sec: number): string {
  return new Date(sec * 1000).toISOString().slice(0, 10)
}

function parseUtcDateHeader(raw: string | undefined): string {
  if (!raw) return new Date().toISOString().slice(0, 10)
  const m = raw.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/)
  if (!m) return new Date().toISOString().slice(0, 10)
  const months: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  }
  const mon = months[m[2]!]
  if (!mon) return new Date().toISOString().slice(0, 10)
  return `${m[3]}-${mon}-${m[1]!.padStart(2, '0')}`
}

function pairsFromUsdTable(
  symbols: string[],
  usdToTry: number,
  perUsd: Record<string, number>,
  date: string,
  source: string,
): FxRatesSnapshot {
  const pairs: FxPairRate[] = []
  for (const code of symbols) {
    if (code === 'USD') {
      pairs.push({ code, rate: usdToTry })
      continue
    }
    const foreignPerUsd = perUsd[code]
    if (foreignPerUsd == null || foreignPerUsd <= 0) {
      throw new Error(`FX ${code}: rate missing`)
    }
    pairs.push({ code, rate: usdToTry / foreignPerUsd })
  }
  return { date, pairs, fetchedAt: Date.now(), source }
}

/** https://www.exchangerate-api.com — CORS: * */
async function fetchOpenErApi(symbols: string[]): Promise<FxRatesSnapshot> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!res.ok) throw new Error(`open.er-api: ${res.status}`)
  const json = (await res.json()) as {
    result?: string
    base_code?: string
    time_last_update_unix?: number
    time_last_update_utc?: string
    conversion_rates?: Record<string, number>
  }
  if (json.result !== 'success' || !json.conversion_rates) {
    throw new Error('open.er-api: invalid payload')
  }
  const usdToTry = json.conversion_rates.TRY
  if (usdToTry == null || !Number.isFinite(usdToTry) || usdToTry <= 0) {
    throw new Error('open.er-api: TRY missing')
  }
  const date =
    json.time_last_update_unix != null
      ? utcDateFromUnix(json.time_last_update_unix)
      : parseUtcDateHeader(json.time_last_update_utc)
  return pairsFromUsdTable(symbols, usdToTry, json.conversion_rates, date, 'ExchangeRate-API')
}

/** https://doviz.dev — CORS: * (USD bazlı çapraz kur) */
async function fetchDovizDev(symbols: string[]): Promise<FxRatesSnapshot> {
  const res = await fetch('https://doviz.dev/v1/usd.json')
  if (!res.ok) throw new Error(`doviz.dev: ${res.status}`)
  const json = (await res.json()) as Record<string, number | string | object>
  const usdToTry = Number(json.USDTRY)
  if (!Number.isFinite(usdToTry) || usdToTry <= 0) throw new Error('doviz.dev: USDTRY missing')

  const meta = json._meta as { updated_at?: string } | undefined
  const date = meta?.updated_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)

  const perUsd: Record<string, number> = {}
  for (const code of symbols) {
    if (code === 'USD') continue
    const usdToCode = Number(json[`USD${code}`])
    if (Number.isFinite(usdToCode) && usdToCode > 0) perUsd[code] = usdToCode
  }

  return pairsFromUsdTable(symbols, usdToTry, perUsd, date, 'doviz.dev')
}

async function fetchFrankfurterOne(code: string): Promise<{ code: string; rate: number; date: string }> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(code)}&to=TRY`,
  )
  if (!res.ok) throw new Error(`frankfurter ${code}: ${res.status}`)
  const json = (await res.json()) as { date: string; rates: { TRY?: number } }
  const rate = json.rates.TRY
  if (rate == null || !Number.isFinite(rate)) throw new Error(`frankfurter ${code}: TRY missing`)
  return { code, rate, date: json.date }
}

async function fetchFrankfurter(symbols: string[]): Promise<FxRatesSnapshot> {
  const results = await Promise.all(symbols.map((code) => fetchFrankfurterOne(code)))
  return {
    date: results[0]?.date ?? new Date().toISOString().slice(0, 10),
    pairs: results.map(({ code, rate }) => ({ code, rate })),
    fetchedAt: Date.now(),
    source: 'Frankfurter (ECB)',
  }
}

const PROVIDERS: Array<{
  name: string
  fetch: (symbols: string[]) => Promise<FxRatesSnapshot>
}> = [
  { name: 'open.er-api', fetch: fetchOpenErApi },
  { name: 'doviz.dev', fetch: fetchDovizDev },
  { name: 'frankfurter', fetch: fetchFrankfurter },
]

export async function fetchTryExchangeRates(
  symbols: string[] = ['USD', 'EUR', 'GBP'],
): Promise<FxRatesSnapshot> {
  const normalized = symbols.filter((c) => SUPPORTED.has(c))
  const list = normalized.length > 0 ? normalized : ['USD', 'EUR', 'GBP']
  const key = cacheKey(list)

  if (cache && cache.key === key && Date.now() - cache.at < CACHE_MS) {
    return cache.data
  }

  const errors: string[] = []
  for (const provider of PROVIDERS) {
    try {
      const snapshot = await provider.fetch(list)
      cache = { key, data: snapshot, at: Date.now() }
      return snapshot
    } catch (e) {
      errors.push(`${provider.name}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  throw new Error(errors.join(' | ') || 'FX: all providers failed')
}

export function parseCurrencySymbols(raw?: string): string[] {
  const list = (raw ?? 'USD,EUR,GBP')
    .split(/[,;\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z]{3}$/.test(s) && SUPPORTED.has(s))
  return list.length > 0 ? list.slice(0, 6) : ['USD', 'EUR', 'GBP']
}
