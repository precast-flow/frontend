import { useCallback, useMemo, useState } from 'react'
import { mapIfcBatch } from '../../elementIdentity/ifc/ifcMapper'
import { MOCK_IFC_FILES, type MockIfcFile } from '../../elementIdentity/ifc/mockIfcData'
import type { ProjectProduct } from '../../elementIdentity/types'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { useElementIdentity } from './elementIdentityContextValue'

type Step = 0 | 1 | 2

type Row = {
  id: string
  name: string
  code: string
  elementTypeId: string
  typologyId: string
  included: boolean
  duplicate: boolean
  conflictAction: 'replace' | 'skip' | 'revision'
}

type Props = {
  open: boolean
  projectId: string
  onClose: () => void
}

export function BulkProductImportDialog({ open, projectId, onClose }: Props) {
  const { t, locale } = useI18n()
  const { projectProducts, replaceProjectProducts } = useElementIdentity()
  const [step, setStep] = useState<Step>(0)
  const [file, setFile] = useState<MockIfcFile | null>(null)
  const [rows, setRows] = useState<Row[]>([])

  const existingCodes = useMemo(() => {
    const s = new Set<string>()
    for (const p of projectProducts) {
      if (p.projectId === projectId) s.add(p.code.toUpperCase())
    }
    return s
  }, [projectProducts, projectId])

  const parse = useCallback(() => {
    if (!file) return
    const mapped = mapIfcBatch(file.records)
    const next: Row[] = mapped.map((m, i) => {
      const code = (m.record.rawGuid.slice(0, 10) + i.toString()).toUpperCase()
      const dup =
        existingCodes.has(code) ||
        projectProducts.some((p) => p.projectId === projectId && p.code.toUpperCase() === code.toUpperCase())
      return {
        id: `cand-${i}`,
        name: m.record.ifcName,
        code,
        elementTypeId: m.elementTypeId ?? 'col',
        typologyId: m.typologyId ?? 'col-rect',
        included: m.matched,
        duplicate: dup,
        conflictAction: 'revision' as const,
      }
    })
    setRows(next)
    setStep(1)
  }, [file, existingCodes, projectProducts, projectId])

  const confirm = useCallback(() => {
    let forProject = projectProducts.filter((p) => p.projectId === projectId)
    for (const r of rows) {
      if (!r.included) continue
      const activeSame = forProject.filter(
        (p) => p.code.toUpperCase() === r.code.toUpperCase() && p.status === 'active',
      )
      if (activeSame.length > 0) {
        if (r.conflictAction === 'skip') continue
        if (r.conflictAction === 'replace') {
          const drop = new Set(activeSame.map((p) => p.id))
          forProject = forProject.filter((p) => !drop.has(p.id))
        } else if (r.conflictAction === 'revision') {
          const drop = new Set(activeSame.map((p) => p.id))
          forProject = forProject.map((p) => (drop.has(p.id) ? { ...p, status: 'superseded' as const } : p))
        }
      }
      const revs = forProject.filter((p) => p.code.toUpperCase() === r.code.toUpperCase()).map((p) => p.revision)
      const maxRev = revs.length > 0 ? Math.max(...revs) : 0
      const prod: ProjectProduct = {
        id: `prd-${crypto.randomUUID().slice(0, 8)}`,
        projectId,
        name: r.name,
        code: r.code,
        elementTypeId: r.elementTypeId,
        typologyId: r.typologyId,
        source: 'IFC',
        revision: activeSame.length > 0 && r.conflictAction === 'revision' ? maxRev + 1 : 1,
        status: 'active',
        note: file?.fileName,
        createdAt: new Date().toISOString(),
      }
      forProject = [...forProject, prod]
    }
    replaceProjectProducts(projectId, forProject)
    onClose()
    setStep(0)
    setRows([])
    setFile(null)
  }, [rows, projectId, projectProducts, file, replaceProjectProducts, onClose])

  const resetAndClose = useCallback(() => {
    onClose()
    setStep(0)
    setRows([])
    setFile(null)
  }, [onClose])

  if (!open) return null

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={resetAndClose}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
      >
        {t('elementIdentity.cancel')}
      </button>
      {step === 0 ? (
        <button
          type="button"
          disabled={!file}
          onClick={parse}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {t('elementIdentity.ifc.parse')}
        </button>
      ) : null}
      {step === 1 ? (
        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {t('elementIdentity.ifc.next')}
        </button>
      ) : null}
      {step === 2 ? (
        <button
          type="button"
          onClick={confirm}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {t('elementIdentity.dialog.confirm')}
        </button>
      ) : null}
    </div>
  )

  return (
    <PmStyleDialog
      title={t('elementIdentity.dialog.bulkTitle')}
      subtitle={`${t('elementIdentity.dialog.bulkStepSource')} → ${t('elementIdentity.dialog.bulkStepReview')} → ${t('elementIdentity.dialog.bulkStepConfirm')}`}
      closeLabel={t('elementIdentity.cancel')}
      onClose={resetAndClose}
      footer={footer}
      maxWidthClass="max-w-3xl"
      ariaLabel={t('elementIdentity.dialog.bulkTitle')}
    >
      <div className="min-h-0 text-sm">
        {step === 0 ? (
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t('elementIdentity.ifc.mockFileLabel')}
            </span>
            <select
              value={file?.fileName ?? ''}
              onChange={(e) => setFile(MOCK_IFC_FILES.find((f) => f.fileName === e.target.value) ?? null)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">—</option>
              {MOCK_IFC_FILES.map((f) => (
                <option key={f.fileName} value={f.fileName}>
                  {f.fileName}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {step === 1 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10">
                  <th className="py-2 pr-2">{t('elementIdentity.ifc.includeCol')}</th>
                  <th className="py-2 pr-2">{t('elementIdentity.detail.code')}</th>
                  <th className="py-2 pr-2">{t('elementIdentity.ifc.sourceName')}</th>
                  <th className="py-2">{t('elementIdentity.dialog.bulkConflict')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id} className="border-b border-slate-100/80 dark:border-white/5">
                    <td className="py-1.5 pr-2">
                      <input
                        type="checkbox"
                        checked={r.included}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, included: e.target.checked } : x)),
                          )
                        }
                      />
                    </td>
                    <td className="py-1.5 pr-2 font-mono">{r.code}</td>
                    <td className="py-1.5 pr-2">{r.name}</td>
                    <td className="py-1.5">
                      {r.duplicate ? (
                        <div className="flex flex-col gap-1">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`d-${r.id}`}
                              checked={r.conflictAction === 'revision'}
                              onChange={() =>
                                setRows((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, conflictAction: 'revision' } : x)),
                                )
                              }
                            />
                            <span>{t('elementIdentity.dialog.bulkDupRevision')}</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`d-${r.id}`}
                              checked={r.conflictAction === 'replace'}
                              onChange={() =>
                                setRows((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, conflictAction: 'replace' } : x)),
                                )
                              }
                            />
                            <span>{t('elementIdentity.dialog.bulkReplace')}</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`d-${r.id}`}
                              checked={r.conflictAction === 'skip'}
                              onChange={() =>
                                setRows((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, conflictAction: 'skip' } : x)),
                                )
                              }
                            />
                            <span>{t('elementIdentity.dialog.bulkSkip')}</span>
                          </label>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {step === 2 ? (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {locale === 'en'
              ? `${rows.filter((r) => r.included).length} product(s) will be loaded (mock).`
              : `${rows.filter((r) => r.included).length} ürün yüklenecek (mock).`}
          </p>
        ) : null}
      </div>
    </PmStyleDialog>
  )
}
