import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  fetchTryExchangeRates,
  parseCurrencySymbols,
  type FxRatesSnapshot,
} from '../../../data/exchangeRatesApi'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  JPY: '🇯🇵',
  SAR: '🇸🇦',
  AED: '🇦🇪',
}

function formatRate(n: number) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

export function WidgetCurrency({ widget }: Props) {
  const { t } = useI18n()
  const symbols = parseCurrencySymbols(widget.settings.currencySymbols)
  const [data, setData] = useState<FxRatesSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const snap = await fetchTryExchangeRates(symbols)
      setData(snap)
    } catch {
      setError(t('dashboard.currency.error'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [symbols, t])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="size-5 animate-spin text-sky-500/70" aria-hidden />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center">
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          className="rounded-lg border border-slate-200/70 px-2 py-1 text-[11px] font-medium hover:bg-white/80 dark:border-white/10"
          onClick={() => void load()}
        >
          {t('dashboard.currency.retry')}
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
          <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <span>{t('dashboard.currency.vsTry')}</span>
        </div>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-white/10"
          onClick={() => void load()}
          disabled={loading}
          aria-label={t('dashboard.currency.refresh')}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
        </button>
      </div>

      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-y-auto pr-0.5">
        {data.pairs.map((pair) => (
          <li
            key={pair.code}
            className="flex items-center gap-2 rounded-lg border border-slate-200/50 bg-white/40 px-2.5 py-2 dark:border-white/8 dark:bg-white/4"
          >
            <span className="text-lg leading-none" aria-hidden>
              {CURRENCY_FLAGS[pair.code] ?? '💱'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-[var(--glass-text-primary)]">{pair.code}/TRY</p>
              <p className="text-[9px] text-[var(--glass-text-muted)]">
                {t('dashboard.currency.oneUnit', { code: String(pair.code) })}
              </p>
            </div>
            <p className="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--glass-text-primary)]">
              ₺{formatRate(pair.rate)}
            </p>
          </li>
        ))}
      </ul>

      <p className="shrink-0 text-center text-[9px] text-[var(--glass-text-muted)]">
        {t('dashboard.currency.updated', { date: data.date, source: data.source })}
      </p>
    </div>
  )
}
