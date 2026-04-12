import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  JobContext,
  MaterialAssembly,
  MaterialItem,
  PieceMarkTemplate,
  ProductionPiece,
  StandardMaterialRow,
} from './types'
import {
  initialJobs,
  initialMaterialAssemblies,
  initialMaterialItems,
  initialProductionPieces,
  initialTemplates,
} from './mptsMockData'
import { useI18n } from '../../i18n/I18nProvider'

export type ToastMessage = { id: string; type: 'success' | 'error' | 'info'; text: string }

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

type MptsContextValue = {
  toast: ToastMessage | null
  pushToast: (t: Omit<ToastMessage, 'id'>) => void
  dismissToast: () => void

  jobs: JobContext[]
  selectedJobId: string
  setSelectedJobId: (id: string) => void

  materialItems: MaterialItem[]
  setMaterialItems: React.Dispatch<React.SetStateAction<MaterialItem[]>>
  saveMaterialItem: (item: MaterialItem) => void
  deleteMaterialItem: (id: string) => void

  materialAssemblies: MaterialAssembly[]
  setMaterialAssemblies: React.Dispatch<React.SetStateAction<MaterialAssembly[]>>
  saveMaterialAssembly: (a: MaterialAssembly) => void
  deleteMaterialAssembly: (id: string) => void

  templates: PieceMarkTemplate[]
  setTemplates: React.Dispatch<React.SetStateAction<PieceMarkTemplate[]>>
  saveTemplate: (t: PieceMarkTemplate) => void
  deleteTemplate: (id: string) => void
  cloneTemplate: (id: string) => void

  productionPieces: ProductionPiece[]
  setProductionPieces: React.Dispatch<React.SetStateAction<ProductionPiece[]>>
  saveProductionPiece: (p: ProductionPiece) => void
  addPieceFromTemplate: (input: {
    jobId: string
    phase: string
    plant: string
    product: string
    templateId: string
    pieceMark: string
    qty: number
  }) => void
  addEmptyPiece: (jobId: string) => void

  getTemplateById: (id: string | undefined) => PieceMarkTemplate | undefined
  getMaterialItemById: (id: string) => MaterialItem | undefined
  getAssemblyById: (id: string) => MaterialAssembly | undefined
}

const MptsContext = createContext<MptsContextValue | null>(null)

export function MptsProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [selectedJobId, setSelectedJobId] = useState(initialJobs[0]!.id)
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>(() =>
    initialMaterialItems.map((x) => ({ ...x, customFields: [...x.customFields] })),
  )
  const [materialAssemblies, setMaterialAssemblies] = useState<MaterialAssembly[]>(() =>
    initialMaterialAssemblies.map((a) => ({
      ...a,
      lines: a.lines.map((l) => ({ ...l })),
    })),
  )
  const [templates, setTemplates] = useState<PieceMarkTemplate[]>(() =>
    initialTemplates.map((t) => ({
      ...t,
      header: { ...t.header, addWork: [...t.header.addWork] },
      materialItems: t.materialItems.map((m) => ({ ...m })),
      materialAssemblies: t.materialAssemblies.map((m) => ({ ...m })),
      costs: t.costs.map((c) => ({ ...c })),
    })),
  )
  const [productionPieces, setProductionPieces] = useState<ProductionPiece[]>(() =>
    initialProductionPieces.map((p) => ({
      ...p,
      header: { ...p.header, addWork: [...p.header.addWork] },
      instances: p.instances.map((i) => ({ ...i, aw: [...i.aw] })),
      standardMaterial: p.standardMaterial.map((s) => ({ ...s })),
      jobSpecificMaterial: p.jobSpecificMaterial.map((j) => ({ ...j })),
    })),
  )

  const pushToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    setToast({ ...msg, id: uid('toast') })
    window.setTimeout(() => setToast(null), 4000)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const saveMaterialItem = useCallback(
    (item: MaterialItem) => {
      setMaterialItems((prev) => {
        const ix = prev.findIndex((x) => x.id === item.id)
        if (ix === -1) return [...prev, item]
        const n = [...prev]
        n[ix] = item
        return n
      })
      pushToast({ type: 'success', text: t('mpts.toast.materialSaved') })
    },
    [pushToast, t],
  )

  const deleteMaterialItem = useCallback(
    (id: string) => {
      setMaterialItems((prev) => prev.filter((x) => x.id !== id))
      pushToast({ type: 'info', text: t('mpts.toast.materialRemoved') })
    },
    [pushToast, t],
  )

  const saveMaterialAssembly = useCallback(
    (a: MaterialAssembly) => {
      setMaterialAssemblies((prev) => {
        const ix = prev.findIndex((x) => x.id === a.id)
        if (ix === -1) return [...prev, { ...a, lines: a.lines.map((l) => ({ ...l })) }]
        const n = [...prev]
        n[ix] = { ...a, lines: a.lines.map((l) => ({ ...l })) }
        return n
      })
      pushToast({ type: 'success', text: t('mpts.toast.assemblySaved') })
    },
    [pushToast, t],
  )

  const deleteMaterialAssembly = useCallback(
    (id: string) => {
      setMaterialAssemblies((prev) => prev.filter((x) => x.id !== id))
      pushToast({ type: 'info', text: t('mpts.toast.assemblyRemoved') })
    },
    [pushToast, t],
  )

  const saveTemplate = useCallback(
    (template: PieceMarkTemplate) => {
      setTemplates((prev) => {
        const ix = prev.findIndex((x) => x.id === template.id)
        const row = {
          ...template,
          header: { ...template.header, addWork: [...template.header.addWork] },
          materialItems: template.materialItems.map((m) => ({ ...m })),
          materialAssemblies: template.materialAssemblies.map((m) => ({ ...m })),
          costs: template.costs.map((c) => ({ ...c })),
        }
        if (ix === -1) return [...prev, row]
        const n = [...prev]
        n[ix] = row
        return n
      })
      pushToast({ type: 'success', text: t('mpts.toast.templateSaved') })
    },
    [pushToast, t],
  )

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((x) => x.id !== id))
      pushToast({ type: 'info', text: t('mpts.toast.templateDeleted') })
    },
    [pushToast, t],
  )

  const cloneTemplate = useCallback(
    (id: string) => {
      const src = templates.find((x) => x.id === id)
      if (!src) return
      const nid = uid('tpl')
      const clone: PieceMarkTemplate = {
        ...src,
        id: nid,
        pieceMark: `${src.pieceMark}-COPY`,
        description: `${src.description} (copy)`,
        header: {
          ...src.header,
          pieceMark: `${src.header.pieceMark}-COPY`,
          rev: 'A',
          addWork: [...src.header.addWork],
        },
        materialItems: src.materialItems.map((m) => ({ ...m, id: uid('tm') })),
        materialAssemblies: src.materialAssemblies.map((m) => ({ ...m, id: uid('ta') })),
        costs: src.costs.map((c) => ({ ...c, id: uid('c') })),
      }
      setTemplates((prev) => [...prev, clone])
      pushToast({ type: 'success', text: t('mpts.toast.templateCloned') })
    },
    [templates, pushToast, t],
  )

  const getTemplateById = useCallback(
    (id: string | undefined) => templates.find((t) => t.id === id),
    [templates],
  )

  const getMaterialItemById = useCallback(
    (id: string) => materialItems.find((m) => m.id === id),
    [materialItems],
  )

  const getAssemblyById = useCallback(
    (id: string) => materialAssemblies.find((m) => m.id === id),
    [materialAssemblies],
  )

  const addPieceFromTemplate = useCallback(
    (input: {
      jobId: string
      phase: string
      plant: string
      product: string
      templateId: string
      pieceMark: string
      qty: number
    }) => {
      const tpl = templates.find((t) => t.id === input.templateId)
      if (!tpl) {
        pushToast({ type: 'error', text: t('mpts.toast.templateNotFound') })
        return
      }
      const sm: StandardMaterialRow[] = tpl.materialItems.map((m) => ({
        id: uid('sm'),
        category: m.category,
        materialNum: m.materialNum,
        embedLabel: m.embedLabel,
        description: m.description,
        qty: m.qty * input.qty,
        prevQty: m.qty * input.qty,
        actualQty: m.qty * input.qty,
        prevActualQty: m.qty * input.qty,
        weight: m.weight * input.qty,
        unit: m.unit,
        bendType: m.bendType,
        dimLength: m.dimLength,
        fromTemplate: true,
      }))
      const pid = uid('pp')
      const piece: ProductionPiece = {
        id: pid,
        jobId: input.jobId,
        templateId: input.templateId,
        phase: input.phase,
        plant: input.plant,
        productCategory: tpl.productCategory,
        productCode: tpl.productCode,
        crossSection: tpl.crossSection,
        pieceMark: input.pieceMark,
        qty: input.qty,
        drawingStatus: 'Draft',
        header: {
          jobId: input.jobId,
          location: input.plant,
          phase: input.phase,
          productCategory: tpl.productCategory,
          productType: tpl.productCategory,
          crossSection: tpl.crossSection,
          pieceMark: input.pieceMark,
          qty: input.qty,
          drawingStatus: 'Draft',
          dateIssued: '',
          lengthFt: tpl.header.lengthFt,
          lengthIn: tpl.header.lengthIn,
          lengthFrac: tpl.header.lengthFrac,
          widthFt: tpl.header.widthFt,
          widthIn: tpl.header.widthIn,
          widthFrac: tpl.header.widthFrac,
          depthFt: tpl.header.depthFt,
          depthIn: tpl.header.depthIn,
          depthFrac: tpl.header.depthFrac,
          weight: tpl.header.weight * input.qty,
          note: `From template ${tpl.pieceMark}`,
          rev: tpl.header.rev,
          revText: tpl.header.revText,
          revDate: tpl.header.revDate,
          returnLegs: tpl.header.returnLegs,
          structCy: tpl.header.structCy * input.qty,
          archCy: tpl.header.archCy * input.qty,
          totalCy: (tpl.header.structCy + tpl.header.archCy) * input.qty,
          releaseStr: tpl.header.releaseStr,
          day28Release: tpl.header.day28Release,
          structSf: tpl.header.structSf * input.qty,
          archSf: tpl.header.archSf * input.qty,
          totalSf: (tpl.header.structSf + tpl.header.archSf) * input.qty,
          braceType: tpl.header.braceType,
          braceQty: tpl.header.braceQty,
          drawnBy: '',
          dateDrawn: '',
          checkedBy: '',
          dateChecked: '',
          addWork: [...tpl.header.addWork],
        },
        instances: [],
        standardMaterial: sm,
        jobSpecificMaterial: [],
      }
      setProductionPieces((prev) => [...prev, piece])
      pushToast({ type: 'success', text: t('mpts.toast.pieceFromTemplate') })
    },
    [templates, pushToast, t],
  )

  const addEmptyPiece = useCallback(
    (jobId: string) => {
      const pid = uid('pp')
      const piece: ProductionPiece = {
        id: pid,
        jobId,
        templateId: null,
        phase: 'Phase 1',
        plant: 'IST-HAD',
        productCategory: '—',
        productCode: '—',
        crossSection: '—',
        pieceMark: `PM-NEW-${pid.slice(-4)}`,
        qty: 1,
        drawingStatus: 'Draft',
        header: {
          jobId,
          location: 'IST-HAD',
          phase: 'Phase 1',
          productCategory: '—',
          productType: '—',
          crossSection: '—',
          pieceMark: `PM-NEW-${pid.slice(-4)}`,
          qty: 1,
          drawingStatus: 'Draft',
          dateIssued: '',
          lengthFt: 0,
          lengthIn: 0,
          lengthFrac: '0/0',
          widthFt: 0,
          widthIn: 0,
          widthFrac: '0/0',
          depthFt: 0,
          depthIn: 0,
          depthFrac: '0/0',
          weight: 0,
          note: '',
          rev: 'A',
          revText: '',
          revDate: '',
          returnLegs: 0,
          structCy: 0,
          archCy: 0,
          totalCy: 0,
          releaseStr: '',
          day28Release: '',
          structSf: 0,
          archSf: 0,
          totalSf: 0,
          braceType: '',
          braceQty: 0,
          drawnBy: '',
          dateDrawn: '',
          checkedBy: '',
          dateChecked: '',
          addWork: [false, false, false, false, false, false],
        },
        instances: [],
        standardMaterial: [],
        jobSpecificMaterial: [],
      }
      setProductionPieces((prev) => [...prev, piece])
      pushToast({ type: 'success', text: t('mpts.toast.emptyPieceAdded') })
    },
    [pushToast, t],
  )

  const saveProductionPiece = useCallback(
    (p: ProductionPiece) => {
      setProductionPieces((prev) => {
        const ix = prev.findIndex((x) => x.id === p.id)
        const row = {
          ...p,
          header: { ...p.header, addWork: [...p.header.addWork] },
          instances: p.instances.map((i) => ({ ...i, aw: [...i.aw] })),
          standardMaterial: p.standardMaterial.map((s) => ({ ...s })),
          jobSpecificMaterial: p.jobSpecificMaterial.map((j) => ({ ...j })),
        }
        if (ix === -1) return [...prev, row]
        const n = [...prev]
        n[ix] = row
        return n
      })
      pushToast({ type: 'success', text: t('mpts.toast.productionSaved') })
    },
    [pushToast, t],
  )

  const value = useMemo(
    () => ({
      toast,
      pushToast,
      dismissToast,
      jobs: initialJobs,
      selectedJobId,
      setSelectedJobId,
      materialItems,
      setMaterialItems,
      saveMaterialItem,
      deleteMaterialItem,
      materialAssemblies,
      setMaterialAssemblies,
      saveMaterialAssembly,
      deleteMaterialAssembly,
      templates,
      setTemplates,
      saveTemplate,
      deleteTemplate,
      cloneTemplate,
      productionPieces,
      setProductionPieces,
      saveProductionPiece,
      addPieceFromTemplate,
      addEmptyPiece,
      getTemplateById,
      getMaterialItemById,
      getAssemblyById,
    }),
    [
      toast,
      pushToast,
      dismissToast,
      selectedJobId,
      materialItems,
      materialAssemblies,
      templates,
      productionPieces,
      saveMaterialItem,
      deleteMaterialItem,
      saveMaterialAssembly,
      deleteMaterialAssembly,
      saveTemplate,
      deleteTemplate,
      cloneTemplate,
      saveProductionPiece,
      addPieceFromTemplate,
      addEmptyPiece,
      getTemplateById,
      getMaterialItemById,
      getAssemblyById,
    ],
  )

  return <MptsContext.Provider value={value}>{children}</MptsContext.Provider>
}

export function useMpts() {
  const ctx = useContext(MptsContext)
  if (!ctx) throw new Error('useMpts requires MptsProvider')
  return ctx
}
