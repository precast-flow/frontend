import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { en } from './locales/en'
import { tr } from './locales/tr'

export type Locale = 'tr' | 'en'

const LS_KEY = 'precast-locale'

const dictionaries: Record<Locale, Record<string, string>> = { tr, en }

function applyVars(template: string, vars?: Record<string, string>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '')
}

type I18nContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readInitialLocale(): Locale {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw === 'en' || raw === 'tr') return raw
  } catch {
    /* ignore */
  }
  return 'tr'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LS_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const primary = dictionaries[locale]
      const raw = primary[key] ?? dictionaries.tr[key] ?? key
      return applyVars(raw, vars)
    },
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'tr'
  }, [locale])

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
