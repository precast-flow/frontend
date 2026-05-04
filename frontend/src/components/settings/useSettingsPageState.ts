import { useCallback, useEffect, useState } from 'react'
import { initialNcrCatalog, type NcrCatalogRow } from '../../data/ncrCatalogMock'
import {
  LS_MODULE_SIM_STATE,
  LS_SHOW_MODULE_SIM,
  moduleSimOptions,
} from '../../data/futureLicenseMock'

export type SettingsTabId =
  | 'general'
  | 'factories'
  | 'notifications'
  | 'locale'
  | 'dictionaries'
  | 'future'
  | 'scenario'

export const SETTINGS_TAB_DEFS: { id: SettingsTabId; labelKey: string; hintKey: string }[] = [
  { id: 'general', labelKey: 'settings.tab.general', hintKey: 'settings.tab.generalHint' },
  { id: 'factories', labelKey: 'settings.tab.factories', hintKey: 'settings.tab.factoriesHint' },
  { id: 'notifications', labelKey: 'settings.tab.notifications', hintKey: 'settings.tab.notificationsHint' },
  { id: 'locale', labelKey: 'settings.tab.locale', hintKey: 'settings.tab.localeHint' },
  { id: 'dictionaries', labelKey: 'settings.tab.dictionaries', hintKey: 'settings.tab.dictionariesHint' },
  { id: 'future', labelKey: 'settings.tab.future', hintKey: 'settings.tab.futureHint' },
  { id: 'scenario', labelKey: 'settings.tab.scenario', hintKey: 'settings.tab.scenarioHint' },
]

export function useSettingsPageState() {
  const [tab, setTab] = useState<SettingsTabId>('general')

  const [compactTables, setCompactTables] = useState(false)
  const [openLinksNewTab, setOpenLinksNewTab] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [pushMes, setPushMes] = useState(true)
  const [pushDispatch, setPushDispatch] = useState(false)
  const [ncrRows] = useState<NcrCatalogRow[]>(() => initialNcrCatalog.map((r) => ({ ...r })))

  const [showModuleSim, setShowModuleSim] = useState(() => {
    try {
      return localStorage.getItem(LS_SHOW_MODULE_SIM) === '1'
    } catch {
      return false
    }
  })
  const [moduleSimState, setModuleSimState] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_MODULE_SIM_STATE)
      if (!raw) {
        return Object.fromEntries(moduleSimOptions.map((m) => [m.id, true])) as Record<string, boolean>
      }
      return { ...JSON.parse(raw) } as Record<string, boolean>
    } catch {
      return Object.fromEntries(moduleSimOptions.map((m) => [m.id, true])) as Record<string, boolean>
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_SHOW_MODULE_SIM, showModuleSim ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [showModuleSim])

  useEffect(() => {
    try {
      localStorage.setItem(LS_MODULE_SIM_STATE, JSON.stringify(moduleSimState))
    } catch {
      /* ignore */
    }
  }, [moduleSimState])

  const toggleModuleSim = useCallback((id: string, checked: boolean) => {
    setModuleSimState((prev) => ({ ...prev, [id]: checked }))
  }, [])

  return {
    tab,
    setTab,
    compactTables,
    setCompactTables,
    openLinksNewTab,
    setOpenLinksNewTab,
    emailDigest,
    setEmailDigest,
    pushMes,
    setPushMes,
    pushDispatch,
    setPushDispatch,
    ncrRows,
    showModuleSim,
    setShowModuleSim,
    moduleSimState,
    toggleModuleSim,
  }
}

export type SettingsPageState = ReturnType<typeof useSettingsPageState>
