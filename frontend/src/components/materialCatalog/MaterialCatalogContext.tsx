import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { loadMaterialCatalog, saveMaterialCatalog } from '../../materialCatalog/storage'
import type { MaterialDef } from '../../materialCatalog/types'

export type MaterialCatalogContextValue = {
  materials: MaterialDef[]
  setMaterials: (next: MaterialDef[]) => void
  upsertMaterial: (m: MaterialDef) => void
  removeMaterial: (id: string) => void
  getMaterialById: (id: string) => MaterialDef | undefined
}

const MaterialCatalogContext = createContext<MaterialCatalogContextValue | null>(null)

export function MaterialCatalogProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterialsState] = useState<MaterialDef[]>(() => loadMaterialCatalog())

  useEffect(() => {
    saveMaterialCatalog(materials)
  }, [materials])

  const setMaterials = useCallback((next: MaterialDef[]) => {
    setMaterialsState(next)
  }, [])

  const upsertMaterial = useCallback((m: MaterialDef) => {
    setMaterialsState((prev) => {
      const i = prev.findIndex((x) => x.id === m.id)
      if (i < 0) return [...prev, m]
      const copy = [...prev]
      copy[i] = m
      return copy
    })
  }, [])

  const removeMaterial = useCallback((id: string) => {
    setMaterialsState((prev) => {
      const hit = prev.find((x) => x.id === id)
      if (hit?.readonly) return prev
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const getMaterialById = useCallback(
    (id: string) => materials.find((x) => x.id === id),
    [materials],
  )

  const value = useMemo<MaterialCatalogContextValue>(
    () => ({ materials, setMaterials, upsertMaterial, removeMaterial, getMaterialById }),
    [materials, setMaterials, upsertMaterial, removeMaterial, getMaterialById],
  )

  return <MaterialCatalogContext.Provider value={value}>{children}</MaterialCatalogContext.Provider>
}

export function useMaterialCatalog(): MaterialCatalogContextValue {
  const ctx = useContext(MaterialCatalogContext)
  if (!ctx) throw new Error('useMaterialCatalog must be used within MaterialCatalogProvider')
  return ctx
}
