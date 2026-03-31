import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, Factory, Link2, Lock, Upload } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  engWOKindPillClass,
  engWOPriorityLabelKey,
  engWOStatusLabelKey,
  engWOStatusPillClass,
  initialEngWorkOrdersBie06,
  MOCK_ENG_FACTORIES,
  type EngWORevision,
} from '../../data/engineeringWorkOrdersBie06Mock'
import type { EngFile } from '../../data/engineeringMock'
import { projectById } from '../../data/projectsMock'
import { ChecklistToggle } from './ChecklistToggle'
import { CreateProductionOrderModal } from './CreateProductionOrderModal'
import { NewRevisionModal } from './NewRevisionModal'

const defaultChecklist = {
  bom: false,
  ifc: false,
  qc: false,
  imza: false,
}

type ManualState = {
  betonClass: string
  toleranceNote: string
  warnAnchorage: boolean
  warnFatigue: boolean
}

const defaultManual = (): ManualState => ({
  betonClass: 'C35/45',
  toleranceNote: '',
  warnAnchorage: false,
  warnFatigue: false,
})

const tabs = [
  { id: 'dosyalar', labelKey: 'eng.bie06.tab.files' },
  { id: 'manuel', labelKey: 'eng.bie06.tab.manual' },
  { id: 'ozet', labelKey: 'eng.bie06.tab.summary' },
  { id: 'revizyonlar', labelKey: 'eng.bie06.tab.revisions' },
] as const

type TabId = (typeof tabs)[number]['id']

type Props = {
  onNavigate: (moduleId: string) => void
}

export function EngineeringModuleView({ onNavigate }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [rows, setRows] = useState(() =>
    initialEngWorkOrdersBie06.map((r) => ({
      ...r,
      files: r.files.map((f) => ({ ...f })),
      revisions: r.revisions.map((x) => ({ ...x })),
    })),
  )

  const [selectedId, setSelectedId] = useState(() => {
    const w = searchParams.get('wo')
    const ids = initialEngWorkOrdersBie06.map((x) => x.id)
    if (w && ids.includes(w)) return w
    return initialEngWorkOrdersBie06[0]!.id
  })
  const [detailTab, setDetailTab] = useState<TabId>('dosyalar')
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)
  const [revOpen, setRevOpen] = useState(false)
  const [poModalOpen, setPoModalOpen] = useState(false)
  const [timelineFlash, setTimelineFlash] = useState<string | null>(null)

  const [kindFilter, setKindFilter] = useState<'all' | 'A' | 'B'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const nextPrdRef = useRef(2056)

  const [checklistByWo, setChecklistByWo] = useState<Record<string, typeof defaultChecklist>>({})
  const [manualByWo, setManualByWo] = useState<Record<string, ManualState>>({})

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.set('wo', selectedId)
        return n
      },
      { replace: true },
    )
  }, [selectedId, setSearchParams])

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId],
  )

  const checklist = selected
    ? checklistByWo[selected.id] ?? defaultChecklist
    : defaultChecklist
  const manual = selected ? manualByWo[selected.id] ?? defaultManual() : defaultManual()

  const checklistComplete =
    checklist.bom && checklist.ifc && checklist.qc && checklist.imza

  useEffect(() => {
    setDetailTab('dosyalar')
    setPreviewFileId(null)
  }, [selectedId])

  const previewFile = useMemo(() => {
    if (!selected || !previewFileId) return null
    return selected.files.find((f) => f.id === previewFileId) ?? null
  }, [selected, previewFileId])

  const projectOptions = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of rows) {
      m.set(r.projectId, `${r.projectCode} · ${r.projectName}`)
    }
    return [...m.entries()]
  }, [rows])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (kindFilter !== 'all' && r.kind !== kindFilter) return false
      if (projectFilter !== 'all' && r.projectId !== projectFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      return true
    })
  }, [rows, kindFilter, projectFilter, statusFilter])

  const selectedProject = selected ? projectById(selected.projectId) : undefined
  const defaultFactoryForModal = selectedProject?.factoryCode ?? 'IST-HAD'

  const summaryForModal = selected
    ? `${selected.title}\n${selected.projectCode} · ${t(engWOPriorityLabelKey(selected.priority))}\n${t('eng.bie06.modal.summaryChecklist')}: ${checklistComplete ? t('eng.bie06.checklist.ok') : t('eng.bie06.checklist.open')}`
    : ''

  const handleConfirmProductionOrder = ({ factoryId, dueDate }: { factoryId: string; dueDate: string }) => {
    if (!selected) return
    const prd = `PRD-${nextPrdRef.current}`
    nextPrdRef.current += 1
    setRows((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? { ...r, status: 'uretim_emri_olusturuldu' as const, productionOrderId: prd }
          : r,
      ),
    )
    const facLabel = MOCK_ENG_FACTORIES.find((f) => f.id === factoryId)?.label ?? factoryId
    setTimelineFlash(
      t('eng.bie06.timelineFlash', {
        prd,
        project: selected.projectCode,
        factory: facLabel,
        due: dueDate,
      }),
    )
    window.setTimeout(() => setTimelineFlash(null), 12000)
  }

  const handleCompleteEngineering = () => {
    if (!selected) return
    setRows((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, status: 'tamamlandi' as const } : r)),
    )
  }

  const handleNewRevision = (note: string) => {
    if (!selected) return
    const newRev: EngWORevision = {
      id: `rev-${Date.now()}`,
      rev: bumpVersion(selected.versionLabel),
      at: new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }),
      actor: 'Mehmet D.',
      note: note || t('eng.bie06.rev.noNote'),
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              versionLabel: newRev.rev,
              revisions: [newRev, ...r.revisions],
              status: r.kind === 'B' && r.status === 'uretim_emri_olusturuldu' ? r.status : 'inceleniyor',
            }
          : r,
      ),
    )
  }

  const setChecklist = (patch: Partial<typeof defaultChecklist>) => {
    if (!selected) return
    setChecklistByWo((prev) => ({
      ...prev,
      [selected.id]: { ...(prev[selected.id] ?? defaultChecklist), ...patch },
    }))
  }

  const setManual = (patch: Partial<ManualState>) => {
    if (!selected) return
    setManualByWo((prev) => ({
      ...prev,
      [selected.id]: { ...(prev[selected.id] ?? defaultManual()), ...patch },
    }))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <CreateProductionOrderModal
        open={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        workOrderCode={selected?.code ?? ''}
        projectLine={
          selected ? `${selected.projectCode} · ${selected.projectName}` : ''
        }
        summaryText={summaryForModal}
        factories={MOCK_ENG_FACTORIES}
        defaultFactoryId={defaultFactoryForModal}
        onConfirm={handleConfirmProductionOrder}
      />
      <NewRevisionModal
        open={revOpen}
        packageLabel={selected ? `${selected.code} · ${selected.versionLabel}` : ''}
        onClose={() => setRevOpen(false)}
        onConfirm={handleNewRevision}
      />

      {timelineFlash ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-300/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-neo-out-sm dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p className="font-semibold">{t('eng.bie06.timelineTitle')}</p>
          <p className="mt-1">{timelineFlash}</p>
          {selected ? (
            <button
              type="button"
              onClick={() => navigate(`/proje?project=${selected.projectId}&tab=zaman`)}
              className="mt-2 text-sm font-semibold text-emerald-900 underline underline-offset-2 dark:text-emerald-200"
            >
              {t('eng.bie06.openProjectTimeline')}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm dark:bg-gray-900/80">
        <label className="min-w-[140px] flex-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('eng.bie06.filter.kind')}
          </span>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as 'all' | 'A' | 'B')}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">{t('eng.bie06.filter.kindAll')}</option>
            <option value="A">{t('eng.bie06.filter.kindA')}</option>
            <option value="B">{t('eng.bie06.filter.kindB')}</option>
          </select>
        </label>
        <label className="min-w-[180px] flex-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('eng.bie06.filter.project')}
          </span>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">{t('eng.bie06.filter.projectAll')}</option>
            {projectOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[160px] flex-1">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('eng.bie06.filter.status')}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="all">{t('eng.bie06.filter.statusAll')}</option>
            <option value="taslak">{t('eng.bie06.status.taslak')}</option>
            <option value="inceleniyor">{t('eng.bie06.status.inceleniyor')}</option>
            <option value="islemde">{t('eng.bie06.status.islemde')}</option>
            <option value="tamamlandi">{t('eng.bie06.status.tamamlandi')}</option>
            <option value="uretim_emri_olusturuldu">{t('eng.bie06.status.uretimEmriOlusturuldu')}</option>
          </select>
        </label>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <section
          className="flex max-h-[min(48vh,440px)] flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm lg:col-span-4 lg:max-h-none dark:bg-gray-900"
          aria-labelledby="eng-wo-list-h"
        >
          <h2 id="eng-wo-list-h" className="mb-2 px-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
            {t('eng.bie06.listTitle')}
          </h2>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredRows.map((w) => {
              const active = w.id === selectedId
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(w.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                      active
                        ? 'bg-gray-100 shadow-neo-in ring-1 ring-gray-300/70 dark:bg-gray-900 dark:ring-gray-600/70'
                        : 'bg-gray-100/80 shadow-neo-out-sm hover:shadow-neo-out dark:bg-gray-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={engWOKindPillClass(w.kind)}>{t(`eng.bie06.kind.${w.kind}`)}</span>
                      <span className={engWOStatusPillClass(w.status)}>{t(engWOStatusLabelKey(w.status))}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs font-bold text-gray-800 dark:text-gray-100">{w.code}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-50">{w.title}</p>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{w.projectCode}</p>
                  </button>
                </li>
              )
            })}
          </ul>
          {filteredRows.length === 0 ? (
            <p className="px-1 text-sm text-gray-500 dark:text-gray-400">{t('eng.bie06.empty')}</p>
          ) : null}
        </section>

        <section
          className="flex min-h-0 flex-col gap-4 rounded-2xl bg-gray-100 p-4 shadow-neo-out lg:col-span-8 dark:bg-gray-900"
          aria-label={t('eng.bie06.detailRegion')}
        >
          {selected ? (
            <>
              <div className="flex flex-col gap-3 border-b border-gray-200/90 pb-4 dark:border-gray-700/90 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={engWOKindPillClass(selected.kind)}>{t(`eng.bie06.kind.${selected.kind}`)}</span>
                    <span className={engWOStatusPillClass(selected.status)}>{t(engWOStatusLabelKey(selected.status))}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t(engWOPriorityLabelKey(selected.priority))} · {selected.versionLabel}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-50">{selected.title}</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-mono font-medium text-gray-800 dark:text-gray-100">{selected.code}</span>
                    {' · '}
                    {selected.projectCode} — {selected.projectName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-950 dark:text-gray-100"
                  >
                    <Upload className="size-4" aria-hidden />
                    {t('eng.bie06.upload')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevOpen(true)}
                    className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-950 dark:text-gray-100"
                  >
                    {t('eng.bie06.newRevision')}
                  </button>
                </div>
              </div>

              {selected.kind === 'A' ? (
                <div className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
                  {t('eng.bie06.bannerTypeA')}
                </div>
              ) : null}

              {selected.kind === 'B' && selected.status === 'islemde' ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 shadow-neo-in dark:bg-gray-950/80">
                  <p className="text-sm text-gray-700 dark:text-gray-200">{t('eng.bie06.hintCompleteEng')}</p>
                  <button
                    type="button"
                    onClick={handleCompleteEngineering}
                    className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                  >
                    {t('eng.bie06.ctaCompleteEng')}
                  </button>
                </div>
              ) : null}

              {selected.kind === 'B' && selected.status === 'tamamlandi' ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 shadow-neo-in dark:bg-gray-950/80">
                  <p className="text-sm text-gray-700 dark:text-gray-200">{t('eng.bie06.hintCreatePo')}</p>
                  <button
                    type="button"
                    onClick={() => setPoModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
                  >
                    <Factory className="size-4" aria-hidden />
                    {t('eng.bie06.ctaCreatePo')}
                  </button>
                </div>
              ) : null}

              {selected.kind === 'B' && selected.status === 'uretim_emri_olusturuldu' && selected.productionOrderId ? (
                <div className="rounded-xl border border-gray-300/80 bg-gray-50 px-4 py-3 text-sm text-gray-800 shadow-neo-in dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100">
                  <p>
                    {t('eng.bie06.prodOrderCreated')}:{' '}
                    <span className="font-mono font-bold">{selected.productionOrderId}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('mes')}
                    className="mt-2 text-sm font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
                  >
                    {t('eng.bie06.openMes')}
                  </button>
                </div>
              ) : null}

              <div
                className="flex gap-1 overflow-x-auto rounded-full bg-gray-100 p-1 shadow-neo-in dark:bg-gray-950/60"
                role="tablist"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 md:text-sm ${
                      detailTab === tab.id
                        ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                    }`}
                  >
                    {t(tab.labelKey)}
                  </button>
                ))}
              </div>

              {detailTab === 'dosyalar' ? (
                <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
                  <div className="min-h-0 overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/80">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-400">
                          <th className="px-3 py-2.5">{t('eng.bie06.table.name')}</th>
                          <th className="px-3 py-2.5">{t('eng.bie06.table.type')}</th>
                          <th className="px-3 py-2.5">{t('eng.bie06.table.by')}</th>
                          <th className="px-3 py-2.5">{t('eng.bie06.table.date')}</th>
                          <th className="px-3 py-2.5">{t('eng.bie06.table.lock')}</th>
                          <th className="w-24 px-3 py-2.5"> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.files.map((f) => (
                          <FileRow
                            key={f.id}
                            file={f}
                            previewLabel={t('eng.bie06.previewBtn')}
                            onPreview={() => setPreviewFileId(f.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      {t('eng.bie06.preview')}
                    </p>
                    <div className="flex min-h-[140px] flex-1 flex-col items-center justify-center rounded-xl bg-gray-200/80 p-3 text-center text-xs text-gray-500 shadow-neo-in dark:bg-gray-900 dark:text-gray-400">
                      {previewFile ? (
                        <>
                          <Eye className="mb-2 size-6 opacity-60" aria-hidden />
                          <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300">{previewFile.name}</span>
                          <span className="mt-1 text-[10px]">{t('eng.bie06.previewPlaceholder')}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="mb-2 size-6 opacity-40" aria-hidden />
                          {t('eng.bie06.previewPick')}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {detailTab === 'manuel' ? (
                <div className="space-y-4 rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('eng.bie06.manual.concrete')}</span>
                    <input
                      value={manual.betonClass}
                      onChange={(e) => setManual({ betonClass: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="C35/45"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('eng.bie06.manual.tolerance')}</span>
                    <textarea
                      value={manual.toleranceNote}
                      onChange={(e) => setManual({ toleranceNote: e.target.value })}
                      rows={3}
                      className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="—"
                    />
                  </label>
                  <div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('eng.bie06.manual.warnings')}</span>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center gap-2">
                        <input
                          id="w1"
                          type="checkbox"
                          checked={manual.warnAnchorage}
                          onChange={(e) => setManual({ warnAnchorage: e.target.checked })}
                          className="size-4 rounded accent-gray-800 dark:accent-gray-200"
                        />
                        <label htmlFor="w1" className="text-sm text-gray-800 dark:text-gray-100">
                          {t('eng.bie06.manual.warn1')}
                        </label>
                      </li>
                      <li className="flex items-center gap-2">
                        <input
                          id="w2"
                          type="checkbox"
                          checked={manual.warnFatigue}
                          onChange={(e) => setManual({ warnFatigue: e.target.checked })}
                          className="size-4 rounded accent-gray-800 dark:accent-gray-200"
                        />
                        <label htmlFor="w2" className="text-sm text-gray-800 dark:text-gray-100">
                          {t('eng.bie06.manual.warn2')}
                        </label>
                      </li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('eng.bie06.manual.footer')}</p>
                </div>
              ) : null}

              {detailTab === 'ozet' ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{t('eng.bie06.summaryTitle')}</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600 dark:text-gray-300">
                      <li>
                        {t('eng.bie06.summaryFiles')}: {selected.files.length}
                      </li>
                      <li>
                        {t('eng.bie06.summaryConcrete')}: {manual.betonClass}
                      </li>
                      <li>
                        {t('eng.bie06.summaryFlags')}:{' '}
                        {manual.warnAnchorage || manual.warnFatigue ? t('eng.bie06.summaryFlagsOn') : t('eng.bie06.summaryFlagsOff')}
                      </li>
                    </ul>
                  </div>
                  {selected.kind === 'B' ? (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        {t('eng.bie06.checklistTitle')}
                      </h3>
                      <div className="rounded-xl bg-gray-100 p-2 shadow-neo-in dark:bg-gray-950/60">
                        <ul className="space-y-1 rounded-lg bg-gray-50 py-1 dark:bg-gray-900/50">
                          <li>
                            <ChecklistToggle
                              checked={checklist.bom}
                              onChange={(v) => setChecklist({ bom: v })}
                              label={t('eng.bie06.checklist.bom')}
                            />
                          </li>
                          <li>
                            <ChecklistToggle
                              checked={checklist.ifc}
                              onChange={(v) => setChecklist({ ifc: v })}
                              label={t('eng.bie06.checklist.ifc')}
                            />
                          </li>
                          <li>
                            <ChecklistToggle
                              checked={checklist.qc}
                              onChange={(v) => setChecklist({ qc: v })}
                              label={t('eng.bie06.checklist.qc')}
                            />
                          </li>
                          <li>
                            <ChecklistToggle
                              checked={checklist.imza}
                              onChange={(v) => setChecklist({ imza: v })}
                              label={t('eng.bie06.checklist.imza')}
                            />
                          </li>
                        </ul>
                      </div>
                      <p className="mt-2 max-w-md text-[11px] font-medium text-amber-900 dark:text-amber-200/90">
                        {t('eng.bie06.checklistWarn')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t('eng.bie06.summaryTypeA')}</p>
                  )}
                </div>
              ) : null}

              {detailTab === 'revizyonlar' ? (
                <div className="min-h-0 overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/80">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-400">
                        <th className="px-3 py-2.5">{t('eng.bie06.rev.colRev')}</th>
                        <th className="px-3 py-2.5">{t('eng.bie06.rev.colAt')}</th>
                        <th className="px-3 py-2.5">{t('eng.bie06.rev.colActor')}</th>
                        <th className="px-3 py-2.5">{t('eng.bie06.rev.colNote')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.revisions.map((r) => (
                        <tr key={r.id} className="border-b border-gray-200/80 dark:border-gray-700/80">
                          <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">{r.rev}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">{r.at}</td>
                          <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{r.actor}</td>
                          <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-4 border-t border-gray-200/90 pt-4 text-xs text-gray-600 dark:border-gray-700/90 dark:text-gray-300">
                <p>
                  MES:{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('mes')}
                    className="font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
                  >
                    {t('eng.bie06.linkMes')}
                  </button>
                </p>
                {selected.parametricPlaceholder ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('parametric-3d')}
                    className="inline-flex items-center gap-1 font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
                  >
                    <Link2 className="size-3.5" aria-hidden />
                    {t('eng.bie06.parametricBridge', { family: selected.parametricPlaceholder })}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => navigate(`/proje?project=${selected.projectId}`)}
                  className="font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
                >
                  {t('eng.bie06.openProject')}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('eng.bie06.pick')}</p>
          )}
        </section>
      </div>
    </div>
  )
}

function FileRow({
  file,
  onPreview,
  previewLabel,
}: {
  file: EngFile
  onPreview: () => void
  previewLabel: string
}) {
  return (
    <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
      <td className="px-3 py-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium text-gray-900 dark:text-gray-50">{file.name}</span>
          {file.fileType === 'IFC' && file.integrationStatus === 'islenmedi' ? (
            <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
              P2 — IFC işlenmedi (gelecek entegrasyon)
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-300">{file.fileType}</td>
      <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{file.uploadedBy}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">{file.uploadedAt}</td>
      <td className="px-3 py-2.5">
        {file.locked ? (
          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400" title={file.lockReason}>
            <Lock className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="sr-only">{file.lockReason ?? 'Kilitli'}</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={onPreview}
          className="text-xs font-semibold text-gray-800 underline-offset-2 hover:underline dark:text-gray-200"
        >
          {previewLabel}
        </button>
      </td>
    </tr>
  )
}

function bumpVersion(v: string): string {
  const m = v.match(/^Rev\s+([A-Z])$/)
  if (m) {
    const n = m[1].charCodeAt(0) + 1
    return n <= 90 ? `Rev ${String.fromCharCode(n)}` : 'Rev Z+'
  }
  const m2 = v.match(/^v(\d+)\.(\d+)$/)
  if (m2) return `v${m2[1]}.${Number(m2[2]) + 1}`
  const m3 = v.match(/^v(\d+)$/)
  if (m3) return `v${Number(m3[1]) + 1}`
  return 'Rev B'
}
