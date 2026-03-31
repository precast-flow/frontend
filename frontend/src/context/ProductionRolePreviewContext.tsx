import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getRoleMatrixRow } from '../data/productionRoleMatrixMock'

type ProductionRolePreviewContextValue = {
  previewRoleId: string | null
  setPreviewRoleId: (id: string | null) => void
  clearPreview: () => void
}

const ProductionRolePreviewContext = createContext<ProductionRolePreviewContextValue | null>(null)

export function ProductionRolePreviewProvider({ children }: { children: ReactNode }) {
  const [previewRoleId, setPreviewRoleIdState] = useState<string | null>(null)

  const setPreviewRoleId = useCallback((id: string | null) => {
    if (id !== null && !getRoleMatrixRow(id)) return
    setPreviewRoleIdState(id)
  }, [])

  const clearPreview = useCallback(() => setPreviewRoleIdState(null), [])

  const value = useMemo(
    () => ({ previewRoleId, setPreviewRoleId, clearPreview }),
    [previewRoleId, setPreviewRoleId, clearPreview],
  )

  return (
    <ProductionRolePreviewContext.Provider value={value}>{children}</ProductionRolePreviewContext.Provider>
  )
}

export function useProductionRolePreview(): ProductionRolePreviewContextValue {
  const ctx = useContext(ProductionRolePreviewContext)
  if (!ctx) {
    throw new Error('useProductionRolePreview must be used within ProductionRolePreviewProvider')
  }
  return ctx
}

/** Provider yoksa `null` (ör. izole test). */
export function useProductionRolePreviewOptional(): ProductionRolePreviewContextValue | null {
  return useContext(ProductionRolePreviewContext)
}
