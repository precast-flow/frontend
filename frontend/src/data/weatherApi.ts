/** Ücretsiz hava — Open-Meteo + isteğe bağlı konum (API anahtarı gerekmez) */

export type WeatherCityPreset =
  | 'istanbul'
  | 'ankara'
  | 'izmir'
  | 'bursa'
  | 'antalya'
  | 'adana'
  | 'konya'
  | 'gaziantep'
  | 'trabzon'
  | 'erzurum'

export type WeatherRegionKey =
  | 'all'
  | 'marmara'
  | 'ege'
  | 'icAnadolu'
  | 'akdeniz'
  | 'karadeniz'
  | 'doguAnadolu'
  | 'guneydogu'

export type WeatherLocationMode = 'preset' | 'geolocation'

export const WEATHER_CITY_PRESETS: Record<
  WeatherCityPreset,
  { labelKey: string; region: WeatherRegionKey; lat: number; lon: number }
> = {
  istanbul: { labelKey: 'dashboard.weather.city.istanbul', region: 'marmara', lat: 41.0082, lon: 28.9784 },
  bursa: { labelKey: 'dashboard.weather.city.bursa', region: 'marmara', lat: 40.1885, lon: 29.061 },
  izmir: { labelKey: 'dashboard.weather.city.izmir', region: 'ege', lat: 38.4192, lon: 27.1287 },
  ankara: { labelKey: 'dashboard.weather.city.ankara', region: 'icAnadolu', lat: 39.9334, lon: 32.8597 },
  konya: { labelKey: 'dashboard.weather.city.konya', region: 'icAnadolu', lat: 37.8746, lon: 32.4932 },
  antalya: { labelKey: 'dashboard.weather.city.antalya', region: 'akdeniz', lat: 36.8969, lon: 30.7133 },
  adana: { labelKey: 'dashboard.weather.city.adana', region: 'akdeniz', lat: 37.0, lon: 35.3213 },
  trabzon: { labelKey: 'dashboard.weather.city.trabzon', region: 'karadeniz', lat: 41.0027, lon: 39.7168 },
  erzurum: { labelKey: 'dashboard.weather.city.erzurum', region: 'doguAnadolu', lat: 39.9055, lon: 41.2658 },
  gaziantep: { labelKey: 'dashboard.weather.city.gaziantep', region: 'guneydogu', lat: 37.0662, lon: 37.3833 },
}

export const WEATHER_REGIONS: Record<WeatherRegionKey, { labelKey: string; cities: WeatherCityPreset[] }> = {
  all: {
    labelKey: 'dashboard.weather.region.all',
    cities: Object.keys(WEATHER_CITY_PRESETS) as WeatherCityPreset[],
  },
  marmara: { labelKey: 'dashboard.weather.region.marmara', cities: ['istanbul', 'bursa'] },
  ege: { labelKey: 'dashboard.weather.region.ege', cities: ['izmir'] },
  icAnadolu: { labelKey: 'dashboard.weather.region.icAnadolu', cities: ['ankara', 'konya'] },
  akdeniz: { labelKey: 'dashboard.weather.region.akdeniz', cities: ['antalya', 'adana'] },
  karadeniz: { labelKey: 'dashboard.weather.region.karadeniz', cities: ['trabzon'] },
  doguAnadolu: { labelKey: 'dashboard.weather.region.doguAnadolu', cities: ['erzurum'] },
  guneydogu: { labelKey: 'dashboard.weather.region.guneydogu', cities: ['gaziantep'] },
}

export type WeatherDayForecast = {
  date: string
  code: number
  tempMax: number
  tempMin: number
}

export type WeatherSnapshot = {
  displayName: string
  locationMode: WeatherLocationMode
  city?: WeatherCityPreset
  lat: number
  lon: number
  temperature: number
  humidity: number
  windKmh: number
  weatherCode: number
  tempMax: number
  tempMin: number
  daily: WeatherDayForecast[]
  fetchedAt: number
}

export type WeatherLocationInput =
  | { mode: 'preset'; city: WeatherCityPreset }
  | { mode: 'geolocation'; lat: number; lon: number; label?: string }

const CACHE_MS = 20 * 60 * 1000
const cache = new Map<string, { data: WeatherSnapshot; at: number }>()

type OpenMeteoResponse = {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

function cacheKey(loc: WeatherLocationInput) {
  if (loc.mode === 'preset') return `preset:${loc.city}`
  return `geo:${loc.lat.toFixed(3)},${loc.lon.toFixed(3)}`
}

export function isWeatherCityPreset(value: string): value is WeatherCityPreset {
  return value in WEATHER_CITY_PRESETS
}

export function resolveWeatherCity(raw?: string): WeatherCityPreset {
  const key = (raw ?? 'istanbul').toLowerCase()
  return isWeatherCityPreset(key) ? key : 'istanbul'
}

export function resolveWeatherRegion(raw?: string): WeatherRegionKey {
  const key = (raw ?? 'all') as WeatherRegionKey
  return key in WEATHER_REGIONS ? key : 'all'
}

export function citiesForRegion(region: WeatherRegionKey): WeatherCityPreset[] {
  return WEATHER_REGIONS[region].cities
}

export type WeatherSettingsSlice = {
  weatherLocationMode?: string
  weatherCity?: string
  weatherRegion?: string
  weatherLat?: number
  weatherLon?: number
  weatherPlaceName?: string
}

export function weatherLocationFromSettings(settings: WeatherSettingsSlice): WeatherLocationInput {
  if (
    settings.weatherLocationMode === 'geolocation' &&
    settings.weatherLat != null &&
    settings.weatherLon != null &&
    Number.isFinite(settings.weatherLat) &&
    Number.isFinite(settings.weatherLon)
  ) {
    return {
      mode: 'geolocation',
      lat: settings.weatherLat,
      lon: settings.weatherLon,
      label: settings.weatherPlaceName,
    }
  }
  return { mode: 'preset', city: resolveWeatherCity(settings.weatherCity) }
}

export async function fetchWeatherForLocation(loc: WeatherLocationInput): Promise<WeatherSnapshot> {
  const key = cacheKey(loc)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.data

  const lat = loc.mode === 'preset' ? WEATHER_CITY_PRESETS[loc.city].lat : loc.lat
  const lon = loc.mode === 'preset' ? WEATHER_CITY_PRESETS[loc.city].lon : loc.lon
  const timezone = loc.mode === 'geolocation' ? 'auto' : 'Europe/Istanbul'

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone,
    forecast_days: '5',
  })

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error(`Weather: ${res.status}`)

  const json = (await res.json()) as OpenMeteoResponse
  const daily: WeatherDayForecast[] = json.daily.time.slice(0, 5).map((date, i) => ({
    date,
    code: json.daily.weather_code[i] ?? 0,
    tempMax: json.daily.temperature_2m_max[i] ?? 0,
    tempMin: json.daily.temperature_2m_min[i] ?? 0,
  }))

  let displayName: string
  if (loc.mode === 'preset') {
    displayName = loc.city
  } else if (loc.label?.trim()) {
    displayName = loc.label.trim()
  } else {
    displayName = await reverseGeocodeLabel(lat, lon)
  }

  const snapshot: WeatherSnapshot = {
    displayName,
    locationMode: loc.mode,
    city: loc.mode === 'preset' ? loc.city : undefined,
    lat,
    lon,
    temperature: json.current.temperature_2m,
    humidity: json.current.relative_humidity_2m,
    windKmh: json.current.wind_speed_10m,
    weatherCode: json.current.weather_code,
    tempMax: daily[0]?.tempMax ?? json.current.temperature_2m,
    tempMin: daily[0]?.tempMin ?? json.current.temperature_2m,
    daily,
    fetchedAt: Date.now(),
  }

  cache.set(key, { data: snapshot, at: Date.now() })
  return snapshot
}

/** @deprecated — fetchWeatherForLocation kullanın */
export async function fetchWeather(city: WeatherCityPreset): Promise<WeatherSnapshot> {
  return fetchWeatherForLocation({ mode: 'preset', city })
}

type ReverseGeocodeResponse = {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
}

export async function reverseGeocodeLabel(lat: number, lon: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      localityLanguage: 'tr',
    })
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    )
    if (!res.ok) throw new Error('reverse failed')
    const json = (await res.json()) as ReverseGeocodeResponse
    const parts = [json.locality, json.city, json.principalSubdivision].filter(
      (p, i, arr) => p && arr.indexOf(p) === i,
    )
    if (parts.length > 0) return parts.join(', ')
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
  } catch {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
  }
}

export type GeolocationResult = {
  lat: number
  lon: number
  placeName: string
}

export class GeolocationWeatherError extends Error {
  code: 'denied' | 'unavailable' | 'timeout' | 'unknown'
  constructor(code: GeolocationWeatherError['code'], message?: string) {
    super(message)
    this.code = code
    this.name = 'GeolocationWeatherError'
  }
}

export function requestBrowserLocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeolocationWeatherError('unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const placeName = await reverseGeocodeLabel(lat, lon)
          resolve({ lat, lon, placeName })
        } catch {
          resolve({ lat, lon, placeName: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` })
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GeolocationWeatherError('denied'))
        } else if (err.code === err.TIMEOUT) {
          reject(new GeolocationWeatherError('timeout'))
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new GeolocationWeatherError('unavailable'))
        } else {
          reject(new GeolocationWeatherError('unknown'))
        }
      },
      { enableHighAccuracy: false, timeout: 14_000, maximumAge: 5 * 60_000 },
    )
  })
}

/** WMO weather code → görsel grup */
export function weatherCodeGroup(code: number): 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm' {
  if (code === 0) return 'clear'
  if (code >= 1 && code <= 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'rain'
  if (code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}
