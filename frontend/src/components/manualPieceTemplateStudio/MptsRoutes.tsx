import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useMptsBasePath } from './MptsContext'
import { MptsLayout } from './MptsLayout'
import { MaterialItemFormPage } from './pages/MaterialItemFormPage'
import { MaterialItemsListPage } from './pages/MaterialItemsListPage'
import { MaterialAssemblyFormPage } from './pages/MaterialAssemblyFormPage'
import { MaterialAssembliesListPage } from './pages/MaterialAssembliesListPage'
import { PieceMarkTemplatesListPage } from './pages/PieceMarkTemplatesListPage'
import { PieceMarkTemplateDetailPage } from './pages/PieceMarkTemplateDetailPage'
import { ProductionPieceMarksListPage } from './pages/ProductionPieceMarksListPage'
import { EditProductionPiecePage } from './pages/EditProductionPiecePage'

type Props = {
  onCloseModule: () => void
}

function normalizePathname(p: string): string {
  const t = p.replace(/\/+$/, '')
  return t === '' ? '/' : t
}

function wrap(page: ReactNode) {
  return <MptsLayout>{page}</MptsLayout>
}

/**
 * Liste ekranları: pathname eşlemesi router eşleşmesinden bağımsız — RR7 iç içe/useRoutes
 * bazen null döndüğü için mühendislikte içerik boş kalıyordu.
 * Form/detay rotaları düz `<Routes>` + tam path ile kalır (`useParams` için gerekli).
 */
export function MptsRoutes({ onCloseModule }: Props) {
  const base = useMptsBasePath()
  const { pathname } = useLocation()
  const p = normalizePathname(pathname)

  if (p === normalizePathname(`${base}/catalog/material-items`)) {
    return wrap(<MaterialItemsListPage onCloseModule={onCloseModule} />)
  }
  if (p === normalizePathname(`${base}/catalog/material-assemblies`)) {
    return wrap(<MaterialAssembliesListPage onCloseModule={onCloseModule} />)
  }
  if (p === normalizePathname(`${base}/templates/piece-mark-templates`)) {
    return wrap(<PieceMarkTemplatesListPage onCloseModule={onCloseModule} />)
  }
  if (p === normalizePathname(`${base}/production/piece-marks`)) {
    return wrap(<ProductionPieceMarksListPage onCloseModule={onCloseModule} />)
  }

  return (
    <Routes>
      <Route
        path={`${base}/catalog/material-items/:id/edit`}
        element={wrap(<MaterialItemFormPage onCloseModule={onCloseModule} />)}
      />
      <Route
        path={`${base}/catalog/material-items/:id`}
        element={wrap(<MaterialItemFormPage onCloseModule={onCloseModule} />)}
      />
      <Route
        path={`${base}/catalog/material-assemblies/:id/edit`}
        element={wrap(<MaterialAssemblyFormPage onCloseModule={onCloseModule} />)}
      />
      <Route
        path={`${base}/catalog/material-assemblies/:id`}
        element={wrap(<MaterialAssemblyFormPage onCloseModule={onCloseModule} />)}
      />
      <Route
        path={`${base}/templates/piece-mark-templates/:templateId`}
        element={wrap(<PieceMarkTemplateDetailPage onCloseModule={onCloseModule} />)}
      />
      <Route
        path={`${base}/production/pieces/:pieceId/edit`}
        element={wrap(<EditProductionPiecePage onCloseModule={onCloseModule} />)}
      />
      <Route path={base} element={<Navigate to={`${base}/catalog/material-items`} replace />} />
      <Route path="*" element={<Navigate to={`${base}/catalog/material-items`} replace />} />
    </Routes>
  )
}
