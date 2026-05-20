import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  LocateFixed,
  MapPin,
  RefreshCw,
  Sun,
  Wind,
} from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  fetchWeatherForLocation,
  weatherCodeGroup,
  weatherLocationFromSettings,
  WEATHER_CITY_PRESETS,
  type WeatherSnapshot,
} from '../../../data/weatherApi'
import type { WidgetInstance } from '../types'

type Props = { widget: WidgetInstance }

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const group = weatherCodeGroup(code)
  const cls = className ?? 'size-10'
  switch (group) {
    case 'clear':
      return <Sun className={`${cls} text-amber-400`} strokeWidth={1.5} aria-hidden />
    case 'fog':
      return <CloudFog className={`${cls} text-slate-400`} strokeWidth={1.5} aria-hidden />
    case 'rain':
      return <CloudRain className={`${cls} text-sky-500`} strokeWidth={1.5} aria-hidden />
    case 'snow':
      return <CloudSnow className={`${cls} text-cyan-300`} strokeWidth={1.5} aria-hidden />
    case 'storm':
      return <CloudLightning className={`${cls} text-violet-500`} strokeWidth={1.5} aria-hidden />
    default:
      return <Cloud className={`${cls} text-slate-400`} strokeWidth={1.5} aria-hidden />
  }
}

function formatDayLabel(dateIso: string, t: (k: string) => string) {
  const d = new Date(`${dateIso}T12:00:00`)
  const today = new Date()
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  if (isToday) return t('dashboard.weather.today')
  return d.toLocaleDateString('tr-TR', { weekday: 'short' })
}

function displayLabel(data: WeatherSnapshot, t: (k: string) => string) {
  if (data.locationMode === 'preset' && data.city) {
    return t(WEATHER_CITY_PRESETS[data.city].labelKey)
  }
  return data.displayName
}

export function WidgetWeather({ widget }: Props) {
  const { t } = useI18n()
  const location = useMemo(
    () => weatherLocationFromSettings(widget.settings),
    [
      widget.settings.weatherLocationMode,
      widget.settings.weatherCity,
      widget.settings.weatherRegion,
      widget.settings.weatherLat,
      widget.settings.weatherLon,
      widget.settings.weatherPlaceName,
    ],
  )

  const [data, setData] = useState<WeatherSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchWeatherForLocation(location))
    } catch {
      setError(t('dashboard.weather.error'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [location, t])

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
          {t('dashboard.weather.retry')}
        </button>
      </div>
    )
  }

  if (!data) return null

  const conditionKey = `dashboard.weather.condition.${weatherCodeGroup(data.weatherCode)}`
  const placeLabel = displayLabel(data, t)
  const isGeo = data.locationMode === 'geolocation'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-gradient-to-br from-sky-500/15 via-transparent to-cyan-500/10">
      <div className="relative flex shrink-0 items-start justify-between gap-2 px-2 pt-1">
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-[var(--glass-text-primary)]">
            {isGeo ? (
              <LocateFixed className="size-3.5 shrink-0 text-sky-600 dark:text-cyan-400" aria-hidden />
            ) : (
              <MapPin className="size-3.5 shrink-0 text-sky-600 dark:text-cyan-400" aria-hidden />
            )}
            <span className="truncate">{placeLabel}</span>
          </p>
          <p className="text-[11px] text-[var(--glass-text-muted)]">{t(conditionKey)}</p>
        </div>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/40 dark:hover:bg-white/10"
          onClick={() => void load()}
          disabled={loading}
          aria-label={t('dashboard.weather.refresh')}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3 px-2 py-1">
        <WeatherIcon code={data.weatherCode} />
        <div>
          <p className="text-3xl font-light tabular-nums tracking-tight text-[var(--glass-text-primary)]">
            {Math.round(data.temperature)}
            <span className="text-lg font-normal text-[var(--glass-text-muted)]">°</span>
          </p>
          <p className="text-[11px] tabular-nums text-[var(--glass-text-muted)]">
            {t('dashboard.weather.minMax', {
              min: String(Math.round(data.tempMin)),
              max: String(Math.round(data.tempMax)),
            })}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 px-2 pb-1">
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/40 px-2 py-0.5 text-[11px] dark:bg-white/10">
          <Droplets className="size-3 text-sky-600 dark:text-cyan-400" aria-hidden />
          %{data.humidity}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/40 px-2 py-0.5 text-[11px] dark:bg-white/10">
          <Wind className="size-3 text-slate-500" aria-hidden />
          {Math.round(data.windKmh)} km/s
        </span>
      </div>

      <ul className="mt-auto flex min-h-0 gap-1 overflow-x-auto border-t border-slate-200/40 px-1.5 py-1.5 dark:border-white/10">
        {data.daily.slice(0, 4).map((day) => (
          <li
            key={day.date}
            className="flex min-w-[3.25rem] flex-1 flex-col items-center rounded-lg bg-white/35 px-1 py-1 dark:bg-white/8"
          >
            <span className="text-[10px] font-medium text-[var(--glass-text-muted)]">
              {formatDayLabel(day.date, t)}
            </span>
            <WeatherIcon code={day.code} className="size-5" />
            <span className="text-[10px] font-semibold tabular-nums text-[var(--glass-text-primary)]">
              {Math.round(day.tempMax)}°
            </span>
            <span className="text-[9px] tabular-nums text-[var(--glass-text-muted)]">
              {Math.round(day.tempMin)}°
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
