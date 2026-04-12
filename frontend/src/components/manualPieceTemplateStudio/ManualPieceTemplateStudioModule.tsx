import { Navigate, Route, Routes } from 'react-router-dom'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import { MPTS_BASE_PATH } from './constants'
import { MptsProvider } from './MptsContext'
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

export function ManualPieceTemplateStudioModule({ onCloseModule }: Props) {
  return (
    <div className="okan-liquid-root flex min-h-0 min-h-[28rem] flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
        <div className="okan-liquid-blob okan-liquid-blob--c" />
      </div>
      <div className="okan-liquid-content relative z-[1] flex min-h-0 flex-1 flex-col gap-4">
        <MptsProvider>
          <Routes>
            <Route element={<MptsLayout />}>
              <Route
                index
                element={<Navigate to={`${MPTS_BASE_PATH}/catalog/material-items`} replace />}
              />
              <Route path="catalog/material-items" element={<MaterialItemsListPage onCloseModule={onCloseModule} />} />
              <Route path="catalog/material-items/new" element={<MaterialItemFormPage onCloseModule={onCloseModule} />} />
              <Route path="catalog/material-items/:id/edit" element={<MaterialItemFormPage onCloseModule={onCloseModule} />} />
              <Route path="catalog/material-assemblies" element={<MaterialAssembliesListPage onCloseModule={onCloseModule} />} />
              <Route path="catalog/material-assemblies/new" element={<MaterialAssemblyFormPage onCloseModule={onCloseModule} />} />
              <Route path="catalog/material-assemblies/:id/edit" element={<MaterialAssemblyFormPage onCloseModule={onCloseModule} />} />
              <Route path="templates/piece-mark-templates" element={<PieceMarkTemplatesListPage onCloseModule={onCloseModule} />} />
              <Route path="templates/piece-mark-templates/:templateId" element={<PieceMarkTemplateDetailPage onCloseModule={onCloseModule} />} />
              <Route path="production/piece-marks" element={<ProductionPieceMarksListPage onCloseModule={onCloseModule} />} />
              <Route path="production/pieces/:pieceId/edit" element={<EditProductionPiecePage onCloseModule={onCloseModule} />} />
            </Route>
          </Routes>
        </MptsProvider>
      </div>
    </div>
  )
}

export { MPTS_BASE_PATH }
