import { useMemo, useState } from 'react'
import { LocateFixed, MapPin } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import {
  citiesForRegion,
  GeolocationWeatherError,
  requestBrowserLocation,
  resolveWeatherCity,
  resolveWeatherRegion,
  WEATHER_CITY_PRESETS,
  WEATHER_REGIONS,
  type WeatherRegionKey,
} from '../../../data/weatherApi'
import type { WidgetSettings } from '../types'

type Props = {
  settings: WidgetSettings
  onPatch: (patch: Partial<WidgetSettings>) => void
}

export function WidgetWeatherSettingsFields({ settings, onPatch }: Props) {
  const { t } = useI18n()
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const mode = settings.weatherLocationMode === 'geolocation' ? 'geolocation' : 'preset'
  const region = resolveWeatherRegion(settings.weatherRegion)
  const city = resolveWeatherCity(settings.weatherCity)

  const cityOptions = useMemo(() => citiesForRegion(region), [region])

  const useMyLocation = async () => {
    setGeoLoading(true)
    setGeoError(null)
    try {
      const { lat, lon, placeName } = await requestBrowserLocation()
      onPatch({
        weatherLocationMode: 'geolocation',
        weatherLat: lat,
        weatherLon: lon,
        weatherPlaceName: placeName,
      })
    } catch (e) {
      const code = e instanceof GeolocationWeatherError ? e.code : 'unknown'
      const key =
        code === 'denied'
          ? 'dashboard.weather.geoDenied'
          : code === 'timeout'
            ? 'dashboard.weather.geoTimeout'
            : 'dashboard.weather.geoUnavailable'
      setGeoError(t(key))
    } finally {
      setGeoLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="mb-1.5 block text-xs font-medium text-[var(--glass-text-muted)]">
          {t('dashboard.weather.settingsSource')}
        </span>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200/70 p-0.5 dark:border-white/10">
          <button
            type="button"
            className={[
              'rounded-md px-2 py-1.5 text-xs font-semibold transition',
              mode === 'preset'
                ? 'bg-sky-600 text-white dark:bg-violet-600'
                : 'text-[var(--glass-text-muted)] hover:bg-slate-100 dark:hover:bg-white/10',
            ].join(' ')}
            onClick={() =>
              onPatch({
                weatherLocationMode: 'preset',
                weatherRegion: settings.weatherRegion ?? 'all',
                weatherCity: settings.weatherCity ?? 'istanbul',
              })
            }
          >
            {t('dashboard.weather.modePreset')}
          </button>
          <button
            type="button"
            className={[
              'rounded-md px-2 py-1.5 text-xs font-semibold transition',
              mode === 'geolocation'
                ? 'bg-sky-600 text-white dark:bg-violet-600'
                : 'text-[var(--glass-text-muted)] hover:bg-slate-100 dark:hover:bg-white/10',
            ].join(' ')}
            onClick={() => void useMyLocation()}
          >
            {t('dashboard.weather.modeGeo')}
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={geoLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/50 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-500/15 disabled:opacity-50 dark:border-cyan-400/40 dark:text-cyan-200 dark:hover:bg-cyan-500/10"
        onClick={() => void useMyLocation()}
      >
        {geoLoading ? (
          <LocateFixed className="size-4 animate-pulse" aria-hidden />
        ) : (
          <LocateFixed className="size-4" aria-hidden />
        )}
        {t('dashboard.weather.useMyLocation')}
      </button>

      {geoError ? (
        <p className="text-[11px] text-red-600 dark:text-red-400">{geoError}</p>
      ) : null}

      {mode === 'geolocation' && settings.weatherPlaceName ? (
        <p className="flex items-start gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1.5 text-[11px] text-emerald-800 dark:text-emerald-200">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{settings.weatherPlaceName}</span>
        </p>
      ) : null}

      {mode === 'preset' ? (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--glass-text-muted)]">
              {t('dashboard.weather.settingsRegion')}
            </span>
            <select
              className="rounded-lg border border-slate-200/80 bg-white/80 px-2 py-1.5 dark:border-white/15 dark:bg-white/10"
              value={region}
              onChange={(e) => {
                const nextRegion = e.target.value as WeatherRegionKey
                const cities = citiesForRegion(nextRegion)
                const nextCity = cities.includes(city) ? city : cities[0] ?? 'istanbul'
                onPatch({ weatherRegion: nextRegion, weatherCity: nextCity })
              }}
            >
              {(Object.keys(WEATHER_REGIONS) as WeatherRegionKey[]).map((id) => (
                <option key={id} value={id}>
                  {t(WEATHER_REGIONS[id].labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--glass-text-muted)]">
              {t('dashboard.weather.settingsCity')}
            </span>
            <select
              className="rounded-lg border border-slate-200/80 bg-white/80 px-2 py-1.5 dark:border-white/15 dark:bg-white/10"
              value={city}
              onChange={(e) => {
                const nextCity = e.target.value
                const preset = WEATHER_CITY_PRESETS[resolveWeatherCity(nextCity)]
                onPatch({
                  weatherLocationMode: 'preset',
                  weatherCity: nextCity,
                  weatherRegion: preset.region,
                })
              }}
            >
              {cityOptions.map((id) => (
                <option key={id} value={id}>
                  {t(WEATHER_CITY_PRESETS[id].labelKey)}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : null}
    </div>
  )
}
