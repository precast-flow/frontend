import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'precast-theme'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Yalnızca localStorage — OS / saat ile otomatik tema yok. Varsayılan: açık (beyaz) tema. */
function readStoredMode(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function applyModeToDocument(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode === 'dark' ? 'dark' : 'light'
  root.dataset.theme = mode
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode)

  /** İlk boyama ile senkron — flicker azaltır (index.html script ile uyumlu). */
  useLayoutEffect(() => {
    applyModeToDocument(mode)
  }, [mode])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  const toggle = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggle }}>{children}</ThemeContext.Provider>
  )
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeMode ThemeProvider dışında kullanılamaz')
  }
  return ctx
}
