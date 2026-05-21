import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Download, FileSpreadsheet, MoreHorizontal, Upload } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { eiSplitHeaderButtonPassive } from '../../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { TopNavMenuPortal } from '../../TopNavMenuPortal'
import {
  downloadInputMaterialTemplateExcel,
  exportConcreteRecipesExcel,
  exportInputMaterialsExcel,
  exportLabTestsExcel,
  exportQualityPlanExcel,
  parseInputMaterialsExcel,
  type ParsedInputMaterialRow,
} from '../../../data/quality/qualityExcelIo'
import type { ConcreteRecipe, LabTest, QualityInputMaterial, QualitySupplierOption } from '../../../data/quality/qualityManagementTypes'
import { QualityExcelImportDialog } from './QualityExcelImportDialog'

const menuItemClass =
  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-800 transition hover:bg-slate-100/90 dark:text-slate-100 dark:hover:bg-white/10'

type InputProps = {
  module: 'input_materials'
  materials: QualityInputMaterial[]
  suppliers: QualitySupplierOption[]
  onImportMaterials: (rows: ParsedInputMaterialRow[]) => void
}

type RecipeProps = {
  module: 'concrete_recipes'
  recipes: ConcreteRecipe[]
}

type LabProps = {
  module: 'lab_tests'
  tests: LabTest[]
}

type Props = InputProps | RecipeProps | LabProps

export function QualityExcelToolbar(props: Props) {
  const { t } = useI18n()
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [importRows, setImportRows] = useState<ParsedInputMaterialRow[]>([])
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const handleExport = () => {
    if (props.module === 'input_materials') {
      exportInputMaterialsExcel(props.materials, props.suppliers)
      return
    }
    if (props.module === 'concrete_recipes') {
      exportConcreteRecipesExcel(props.recipes)
      return
    }
    exportLabTestsExcel(props.tests)
  }

  const handleTemplate = () => {
    if (props.module === 'input_materials') {
      downloadInputMaterialTemplateExcel()
      return
    }
    if (props.module === 'lab_tests' || props.module === 'concrete_recipes') {
      exportQualityPlanExcel()
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || props.module !== 'input_materials') return
    const buf = await file.arrayBuffer()
    const parsed = parseInputMaterialsExcel(buf, props.suppliers)
    setImportRows(parsed)
    setImportOpen(true)
  }

  const runExport = () => {
    handleExport()
    closeMenu()
  }

  const runImport = () => {
    fileRef.current?.click()
    closeMenu()
  }

  const runTemplate = () => {
    handleTemplate()
    closeMenu()
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger`}
        className={eiSplitHeaderButtonPassive}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={`${menuId}-panel`}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <MoreHorizontal className="size-3.5 shrink-0" aria-hidden />
        <span>{t('qualityExcel.operations')}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition ${menuOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <TopNavMenuPortal
        open={menuOpen}
        anchorRef={triggerRef}
        panelRef={panelRef}
        id={`${menuId}-panel`}
        labelledBy={`${menuId}-trigger`}
        align="end"
        className="gm-glass-dropdown-panel gm-glass-context-menu-panel w-[min(100vw-1.5rem,14.5rem)] rounded-xl p-1.5 shadow-lg"
      >
        <p className="px-2.5 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--glass-text-muted)]">
          {t('qualityExcel.operationsMenu')}
        </p>
        <ul className="space-y-0.5" role="menu">
          <li role="none">
            <button type="button" role="menuitem" className={menuItemClass} onClick={runExport}>
              <Download className="size-3.5 shrink-0 opacity-70" aria-hidden />
              {t('qualityExcel.export')}
            </button>
          </li>
          {props.module === 'input_materials' ? (
            <li role="none">
              <button type="button" role="menuitem" className={menuItemClass} onClick={runImport}>
                <Upload className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {t('qualityExcel.import')}
              </button>
            </li>
          ) : null}
          <li role="none">
            <button type="button" role="menuitem" className={menuItemClass} onClick={runTemplate}>
              <FileSpreadsheet className="size-3.5 shrink-0 opacity-70" aria-hidden />
              {t('qualityExcel.template')}
            </button>
          </li>
        </ul>
      </TopNavMenuPortal>

      {props.module === 'input_materials' ? (
        <QualityExcelImportDialog
          open={importOpen}
          rows={importRows}
          onClose={() => setImportOpen(false)}
          onConfirm={(valid) => props.onImportMaterials(valid)}
        />
      ) : null}
    </>
  )
}
