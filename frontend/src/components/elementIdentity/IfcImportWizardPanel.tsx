import { useCallback, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { ELEMENT_TYPES } from '../../elementIdentity/catalog/elementTypes'
import { TYPOLOGIES } from '../../elementIdentity/catalog/typologies'
import { mapIfcBatch, type MappedIfcResult } from '../../elementIdentity/ifc/ifcMapper'
import { MOCK_IFC_FILES, type MockIfcFile } from '../../elementIdentity/ifc/mockIfcData'
import { resolveInstanceMark } from '../../elementIdentity/firm/nameResolver'
import type { ProjectElement, SourceSystem } from '../../elementIdentity/types'
import { useElementIdentity } from './elementIdentityContextValue'

type Step = 1 | 2 | 3

type ReviewRow = MappedIfcResult & {
  included: boolean
  overriddenTypologyId: string | null
  overriddenElementTypeId: string | null
}

export function IfcImportWizardPanel({
  onNavigateToList,
}: {
  onNavigateToList: () => void
}) {
  const { t, locale } = useI18n()
  const {
    activeFirm,
    activeProject,
    activeTemplate,
    overrides,
    addProjectElements,
    allocateNextSequence,
  } = useElementIdentity()

  const [step, setStep] = useState<Step>(1)
  const [selectedFile, setSelectedFile] = useState<MockIfcFile | null>(null)
  const [sourceOverride, setSourceOverride] = useState<SourceSystem | null>(null)
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [elementTypeFilter, setElementTypeFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [importResult, setImportResult] = useState<{ count: number } | null>(null)

  const parseFile = useCallback((file: MockIfcFile) => {
    const mapped = mapIfcBatch(file.records)
    setRows(
      mapped.map((m) => ({
        ...m,
        included: m.matched,
        overriddenTypologyId: m.typologyId,
        overriddenElementTypeId: m.elementTypeId,
      })),
    )
    setStep(2)
  }, [])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const et = r.overriddenElementTypeId
      if (elementTypeFilter !== 'all' && et !== elementTypeFilter) return false
      if (
        search &&
        !r.record.ifcName.toLowerCase().includes(search.toLowerCase()) &&
        !r.record.rawGuid.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [rows, elementTypeFilter, search])

  const stats = useMemo(() => {
    const total = rows.length
    const auto = rows.filter((r) => r.matched && r.confidence === 'high').length
    const manual = rows.filter((r) => !r.matched || r.confidence !== 'high').length
    const included = rows.filter((r) => r.included).length
    const byType = new Map<string, number>()
    rows
      .filter((r) => r.included && r.overriddenElementTypeId)
      .forEach((r) => {
        const k = r.overriddenElementTypeId!
        byType.set(k, (byType.get(k) ?? 0) + 1)
      })
    return { total, auto, manual, included, byType }
  }, [rows])

  const updateRow = useCallback((idx: number, patch: Partial<ReviewRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }, [])

  const doImport = useCallback(() => {
    const toImport = rows.filter((r) => r.included && r.overriddenTypologyId && r.overriddenElementTypeId)
    const created: ProjectElement[] = []
    for (const r of toImport) {
      const seq = allocateNextSequence(activeProject.id, r.overriddenElementTypeId!)
      const el: ProjectElement = {
        id: `el-${crypto.randomUUID().slice(0, 8)}`,
        projectId: activeProject.id,
        firmId: activeFirm.id,
        elementTypeId: r.overriddenElementTypeId!,
        typologyId: r.overriddenTypologyId!,
        sourceSystem: sourceOverride ?? r.record.sourceSystem,
        sourceGuid: r.record.rawGuid,
        sourceName: r.record.ifcName,
        sourceFile: selectedFile?.fileName,
        dimensions: r.record.dimensions,
        sequence: seq,
        revision: 0,
        instanceMark: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const resolved = resolveInstanceMark({
        element: el,
        template: activeTemplate,
        firm: activeFirm,
        project: activeProject,
        overrides,
      })
      el.instanceMark = resolved.instanceMark
      created.push(el)
    }
    addProjectElements(created)
    setImportResult({ count: created.length })
    setStep(3)
  }, [
    rows,
    activeFirm,
    activeProject,
    activeTemplate,
    overrides,
    selectedFile,
    sourceOverride,
    allocateNextSequence,
    addProjectElements,
  ])

  return (
    <div className="flex flex-col gap-4">
      {/* Stepper */}
      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-900/60">
        {[1, 2, 3].map((s) => {
          const isActive = step === (s as Step)
          const isDone = step > (s as Step)
          const label =
            s === 1
              ? t('elementIdentity.ifc.step1')
              : s === 2
                ? t('elementIdentity.ifc.step2')
                : t('elementIdentity.ifc.step3')
          return (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
                    : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                ].join(' ')}
              >
                {isDone ? '✓' : s}
              </span>
              <span
                className={[
                  'text-xs font-medium',
                  isActive ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500',
                ].join(' ')}
              >
                {label}
              </span>
              {s < 3 && <span className="mx-2 h-px flex-1 bg-gray-300 dark:bg-gray-700" />}
            </div>
          )
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <section className="flex flex-col gap-4 rounded-2xl bg-pf-surface p-4 shadow-neo-out dark:bg-gray-800/90">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            CAD Dosyasını Yükle
          </h3>
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-900/70">
            <div className="mb-3 text-3xl opacity-60">📂</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('elementIdentity.ifc.dropZone')}
            </p>
            <p className="mt-1 text-[10px] text-gray-400">
              Desteklenen: .ifc .ifczip .xml .csv (mock)
            </p>
          </div>

          <label className="flex flex-col gap-2 text-xs">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {t('elementIdentity.ifc.mockFileLabel')}
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {MOCK_IFC_FILES.map((f) => (
                <button
                  key={f.fileName}
                  onClick={() => setSelectedFile(f)}
                  className={[
                    'flex items-center justify-between gap-2 rounded-xl p-3 text-left text-xs shadow-neo-out-sm transition',
                    selectedFile?.fileName === f.fileName
                      ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-900/50',
                  ].join(' ')}
                >
                  <span>
                    📄 <span className="font-mono">{f.fileName}</span>
                  </span>
                  <span className="text-[10px]">
                    {f.records.length} eleman · {f.sourceSystem}
                  </span>
                </button>
              ))}
            </div>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {t('elementIdentity.ifc.sourceSystem')}
              </span>
              <select
                value={sourceOverride ?? selectedFile?.sourceSystem ?? 'IFC_GENERIC'}
                onChange={(e) => setSourceOverride(e.target.value as SourceSystem)}
                className="rounded-xl bg-gray-50 px-3 py-2 text-sm shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
              >
                <option value="TEKLA">Tekla</option>
                <option value="REVIT">Revit</option>
                <option value="ALLPLAN">Allplan</option>
                <option value="AUTOCAD">AutoCAD</option>
                <option value="IFC_GENERIC">IFC (generic)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {t('elementIdentity.ifc.targetProject')}
              </span>
              <input
                type="text"
                readOnly
                value={`${activeProject.code} — ${activeProject.name ?? ''}`}
                className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700 shadow-neo-in dark:bg-gray-900/80 dark:text-gray-300"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              disabled={!selectedFile}
              onClick={() => selectedFile && parseFile(selectedFile)}
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 disabled:opacity-40 dark:bg-gray-200 dark:text-gray-900"
            >
              {t('elementIdentity.ifc.parse')}
            </button>
          </div>
        </section>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <section className="flex flex-col gap-3 rounded-2xl bg-pf-surface p-4 shadow-neo-out dark:bg-gray-800/90">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Eşlemeyi İncele
            </h3>
            <div className="flex gap-4 text-xs">
              <Stat label={t('elementIdentity.ifc.totalElements')} value={stats.total} />
              <Stat label={t('elementIdentity.ifc.autoMapped')} value={stats.auto} tone="green" />
              <Stat label={t('elementIdentity.ifc.manualNeeded')} value={stats.manual} tone="amber" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Chip
              active={elementTypeFilter === 'all'}
              onClick={() => setElementTypeFilter('all')}
              label="Tümü"
            />
            {ELEMENT_TYPES.map((et) => (
              <Chip
                key={et.id}
                active={elementTypeFilter === et.id}
                onClick={() => setElementTypeFilter(et.id)}
                label={locale === 'en' ? et.nameEn : et.nameTr}
              />
            ))}
            <input
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-auto rounded-lg bg-gray-50 px-3 py-1 text-xs shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
            />
          </div>

          <div className="max-h-[50vh] overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-900/60">
            <table className="w-full table-auto text-xs">
              <thead className="sticky top-0 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-2 text-left">{t('elementIdentity.ifc.includeCol')}</th>
                  <th className="px-2 py-2 text-left">{t('elementIdentity.ifc.sourceName')}</th>
                  <th className="px-2 py-2 text-left">{t('elementIdentity.table.ifcClass')}</th>
                  <th className="px-2 py-2 text-left">{t('elementIdentity.ifc.mappedType')}</th>
                  <th className="px-2 py-2 text-left">{t('elementIdentity.ifc.mappedTypology')}</th>
                  <th className="px-2 py-2 text-left">{t('elementIdentity.ifc.confidence')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => {
                  const idx = rows.indexOf(r)
                  const et = r.overriddenElementTypeId
                  const allowedTypologies = TYPOLOGIES.filter((ty) => ty.elementTypeId === et)
                  return (
                    <tr
                      key={r.record.rawGuid}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={r.included}
                          onChange={(e) => updateRow(idx, { included: e.target.checked })}
                        />
                      </td>
                      <td className="px-2 py-2 font-mono text-[11px] text-gray-900 dark:text-gray-100">
                        {r.record.ifcName}
                      </td>
                      <td className="px-2 py-2">
                        <span className="rounded-md bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-700 dark:bg-gray-700 dark:text-gray-100">
                          {r.record.ifcClass}
                        </span>
                        <span className="ml-1 font-mono text-[10px] text-gray-500">
                          {r.record.ifcPredefinedType}
                          {r.record.ifcObjectType && ` · ${r.record.ifcObjectType}`}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={r.overriddenElementTypeId ?? ''}
                          onChange={(e) => {
                            const next = e.target.value || null
                            updateRow(idx, {
                              overriddenElementTypeId: next,
                              overriddenTypologyId: null,
                            })
                          }}
                          className="rounded-md bg-pf-surface px-2 py-1 text-[11px] shadow-neo-out-sm focus:outline-none dark:bg-gray-800/90 dark:text-gray-100"
                        >
                          <option value="">—</option>
                          {ELEMENT_TYPES.map((et_) => (
                            <option key={et_.id} value={et_.id}>
                              {locale === 'en' ? et_.nameEn : et_.nameTr}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={r.overriddenTypologyId ?? ''}
                          onChange={(e) =>
                            updateRow(idx, { overriddenTypologyId: e.target.value || null })
                          }
                          className="rounded-md bg-pf-surface px-2 py-1 text-[11px] shadow-neo-out-sm focus:outline-none dark:bg-gray-800/90 dark:text-gray-100"
                        >
                          <option value="">—</option>
                          {allowedTypologies.map((ty) => (
                            <option key={ty.id} value={ty.id}>
                              {locale === 'en' ? ty.nameEn : ty.nameTr}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <ConfidenceBadge level={r.confidence} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl bg-gray-200 px-4 py-2 text-xs font-medium text-gray-700 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
            >
              {t('elementIdentity.ifc.back')}
            </button>
            <button
              disabled={stats.included === 0}
              onClick={doImport}
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 disabled:opacity-40 dark:bg-gray-200 dark:text-gray-900"
            >
              {t('elementIdentity.ifc.doImport')} ({stats.included})
            </button>
          </div>
        </section>
      )}

      {/* Step 3 */}
      {step === 3 && importResult && (
        <section className="flex flex-col gap-4 rounded-2xl bg-pf-surface p-4 shadow-neo-out dark:bg-gray-800/90">
          <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 shadow-neo-in dark:bg-emerald-900/30 dark:text-emerald-200">
            ✓{' '}
            {t('elementIdentity.ifc.success').replace('{{count}}', String(importResult.count))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="Import edildi" value={importResult.count} tone="emerald" />
            <SummaryCard label="Skip edildi" value={stats.total - importResult.count} tone="amber" />
            <SummaryCard label="Hedef proje" value={activeProject.code} />
          </div>
          <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-900/60">
            <h4 className="mb-2 text-xs font-semibold text-gray-900 dark:text-gray-50">
              Eleman tipi dağılımı
            </h4>
            <ul className="flex flex-wrap gap-2 text-xs">
              {[...stats.byType.entries()].map(([etId, count]) => {
                const et = ELEMENT_TYPES.find((e) => e.id === etId)
                return (
                  <li
                    key={etId}
                    className="rounded-full bg-gray-200 px-3 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {locale === 'en' ? et?.nameEn : et?.nameTr}: {count}
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => {
                setStep(1)
                setRows([])
                setSelectedFile(null)
                setImportResult(null)
              }}
              className="rounded-xl bg-gray-200 px-4 py-2 text-xs font-medium text-gray-700 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
            >
              Yeni Import
            </button>
            <button
              onClick={onNavigateToList}
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
            >
              Proje eleman listesine git →
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'green' | 'amber' }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
      <span
        className={[
          'font-mono text-sm font-semibold',
          tone === 'green'
            ? 'text-emerald-600 dark:text-emerald-400'
            : tone === 'amber'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-900 dark:text-gray-50',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-[11px] font-medium transition',
        active
          ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
          : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function ConfidenceBadge({ level }: { level: MappedIfcResult['confidence'] }) {
  const cfg = {
    high: { label: 'Yüksek', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
    medium: { label: 'Orta', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
    low: { label: 'Düşük', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    unmapped: {
      label: 'Eşleşmedi',
      cls: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100',
    },
  }[level]
  return <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone?: 'emerald' | 'amber'
}) {
  return (
    <div
      className={[
        'rounded-2xl p-4 shadow-neo-out-sm',
        tone === 'emerald'
          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
          : tone === 'amber'
            ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200'
            : 'bg-gray-50 text-gray-900 dark:bg-gray-900/60 dark:text-gray-100',
      ].join(' ')}
    >
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold">{value}</div>
    </div>
  )
}
