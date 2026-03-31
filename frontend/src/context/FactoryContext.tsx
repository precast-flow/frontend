import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  cloneFactories,
  DEFAULT_FACTORY_CODE,
  findFactoryByCode,
  MOCK_FACTORIES,
  type MockFactory,
} from '../data/mockFactories'
import { useI18n } from '../i18n/I18nProvider'

const LS_FACTORIES_KEY = 'precast-mvp-factories-v1'

function loadFactoriesFromStorage(): MockFactory[] {
  try {
    const raw = localStorage.getItem(LS_FACTORIES_KEY)
    if (!raw) return cloneFactories(MOCK_FACTORIES)
    const parsed = JSON.parse(raw) as MockFactory[]
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneFactories(MOCK_FACTORIES)
    return parsed
  } catch {
    return cloneFactories(MOCK_FACTORIES)
  }
}

function persistFactories(list: MockFactory[]) {
  try {
    localStorage.setItem(LS_FACTORIES_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

type FactoryContextValue = {
  factories: MockFactory[]
  addFactory: (factory: MockFactory) => void
  updateFactory: (code: string, patch: Partial<MockFactory>) => void
  removeFactory: (code: string) => void
  selectedCode: string
  selectedFactory: MockFactory
  selectedCodes: string[]
  selectedFactories: MockFactory[]
  isFactoryInScope: (code: string) => boolean
  /** P1 — mock senkron zamanı (sabit prototip) */
  lastSyncLabel: string
  setSelectedCode: (code: string) => void
  setSelectedCodes: (codes: string[]) => void
  toggleSelectedCode: (code: string) => void
  factoryDrawerOpen: boolean
  openFactoryDrawer: () => void
  closeFactoryDrawer: () => void
  contextTitle: string
  contextDetail: string
}

const FactoryContext = createContext<FactoryContextValue | null>(null)

export function FactoryProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [factories, setFactories] = useState<MockFactory[]>(() => loadFactoriesFromStorage())
  const [selectedCode, setSelectedCode] = useState(DEFAULT_FACTORY_CODE)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([DEFAULT_FACTORY_CODE])
  const [factoryDrawerOpen, setFactoryDrawerOpen] = useState(false)

  useEffect(() => {
    persistFactories(factories)
  }, [factories])

  useEffect(() => {
    if (factories.length === 0) return
    const exists = factories.some((f) => f.code === selectedCode)
    if (!exists) {
      const next = factories.find((f) => f.active)?.code ?? factories[0]?.code
      if (next) setSelectedCode(next)
    }
  }, [factories, selectedCode])

  useEffect(() => {
    if (factories.length === 0) return
    const allowed = new Set(factories.map((f) => f.code))
    const valid = selectedCodes.filter((code) => allowed.has(code))
    const fallback = factories.find((f) => f.active)?.code ?? factories[0]?.code
    const next = valid.length > 0 ? valid : fallback ? [fallback] : []
    const changed =
      next.length !== selectedCodes.length || next.some((code, idx) => selectedCodes[idx] !== code)
    if (changed) setSelectedCodes(next)
    if (next[0] && next[0] !== selectedCode) setSelectedCode(next[0])
  }, [factories, selectedCode, selectedCodes])

  const addFactory = useCallback((factory: MockFactory) => {
    setFactories((prev) => {
      if (prev.some((f) => f.code === factory.code)) return prev
      return [...prev, factory]
    })
  }, [])

  const updateFactory = useCallback((code: string, patch: Partial<MockFactory>) => {
    setFactories((prev) => prev.map((f) => (f.code === code ? { ...f, ...patch } : f)))
  }, [])

  const removeFactory = useCallback((code: string) => {
    setFactories((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((f) => f.code !== code)
    })
  }, [])

  const selectedFactory = useMemo(() => {
    return findFactoryByCode(selectedCode, factories) ?? factories[0] ?? MOCK_FACTORIES[0]!
  }, [factories, selectedCode])

  const selectedFactories = useMemo(() => {
    const byCode = new Map(factories.map((f) => [f.code, f] as const))
    return selectedCodes.map((code) => byCode.get(code)).filter((f): f is MockFactory => Boolean(f))
  }, [factories, selectedCodes])

  const setSelectedCodeSingle = useCallback((code: string) => {
    setSelectedCode(code)
    setSelectedCodes([code])
  }, [])

  const setSelectedCodesSafe = useCallback(
    (codes: string[]) => {
      const allowed = new Set(factories.map((f) => f.code))
      const deduped: string[] = []
      for (const code of codes) {
        if (!allowed.has(code) || deduped.includes(code)) continue
        deduped.push(code)
      }
      const fallback = factories.find((f) => f.active)?.code ?? factories[0]?.code ?? selectedCode
      const next = deduped.length > 0 ? deduped : fallback ? [fallback] : []
      setSelectedCodes(next)
      if (next[0]) setSelectedCode(next[0])
    },
    [factories, selectedCode],
  )

  const toggleSelectedCode = useCallback(
    (code: string) => {
      setSelectedCodes((prev) => {
        const has = prev.includes(code)
        if (has && prev.length === 1) return prev
        const next = has ? prev.filter((c) => c !== code) : [...prev, code]
        if (next[0]) setSelectedCode(next[0])
        return next
      })
    },
    [],
  )

  const isFactoryInScope = useCallback((code: string) => selectedCodes.includes(code), [selectedCodes])

  const openFactoryDrawer = useCallback(() => setFactoryDrawerOpen(true), [])
  const closeFactoryDrawer = useCallback(() => setFactoryDrawerOpen(false), [])

  const value = useMemo<FactoryContextValue>(() => {
    const contextTitle =
      selectedFactories.length > 1
        ? t('topbar.factoryMultiSelected', { count: String(selectedFactories.length) })
        : selectedFactory.name
    const contextDetail =
      selectedFactories.length > 1
        ? selectedFactories.map((f) => `${f.code}`).join(', ')
        : `${selectedFactory.name} · ${selectedFactory.code} · ${selectedFactory.city}`

    return {
      factories,
      addFactory,
      updateFactory,
      removeFactory,
      selectedCode,
      selectedFactory,
      selectedCodes,
      selectedFactories,
      isFactoryInScope,
      lastSyncLabel: '14:32',
      setSelectedCode: setSelectedCodeSingle,
      setSelectedCodes: setSelectedCodesSafe,
      toggleSelectedCode,
      factoryDrawerOpen,
      openFactoryDrawer,
      closeFactoryDrawer,
      contextTitle,
      contextDetail,
    }
  }, [
    addFactory,
    isFactoryInScope,
    closeFactoryDrawer,
    factories,
    factoryDrawerOpen,
    openFactoryDrawer,
    removeFactory,
    selectedCode,
    selectedCodes,
    selectedFactories,
    selectedFactory,
    setSelectedCodeSingle,
    setSelectedCodesSafe,
    t,
    toggleSelectedCode,
    updateFactory,
  ])

  return <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>
}

export function useFactoryContext(): FactoryContextValue {
  const ctx = useContext(FactoryContext)
  if (!ctx) {
    throw new Error('useFactoryContext must be used within FactoryProvider')
  }
  return ctx
}
