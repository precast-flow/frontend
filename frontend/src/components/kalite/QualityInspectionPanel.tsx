import { useEffect, useState } from 'react'
import type { QualityInspectionDraft, WorkOrder } from '../../data/mesMock'
import { useProductionQuality } from '../../context/ProductionQualityContext'

const emptyDraft = (): QualityInspectionDraft => ({
  lengthMm: '',
  widthMm: '',
  visualNote: '',
  slumpCm: '',
  pressureMpa: '',
})

type Props = {
  workOrder: WorkOrder
  readOnly?: boolean
  /** Kalite bekliyor veya üretimde ret sonrası */
  showActions?: boolean
  onApprove?: () => void
  onRejectClick?: () => void
}

export function QualityInspectionPanel({
  workOrder,
  readOnly = false,
  showActions = false,
  onApprove,
  onRejectClick,
}: Props) {
  const { patchOrder } = useProductionQuality()
  const [draft, setDraft] = useState<QualityInspectionDraft>(() =>
    workOrder.qualityInspection ? { ...workOrder.qualityInspection } : emptyDraft(),
  )

  useEffect(() => {
    setDraft(workOrder.qualityInspection ? { ...workOrder.qualityInspection } : emptyDraft())
  }, [workOrder.id])

  const locked = readOnly || workOrder.status === 'tamamlandi'

  const update = (patch: Partial<QualityInspectionDraft>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    patchOrder(workOrder.id, { qualityInspection: next })
  }

  return (
    <div className="space-y-4">
      <fieldset className="space-y-4">
        <legend className="sr-only">Kalite kontrol formu</legend>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Ölçü</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Uzunluk (mm)</span>
              <input
                type="text"
                value={draft.lengthMm}
                disabled={locked}
                onChange={(e) => update({ lengthMm: e.target.value })}
                className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-70"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Genişlik (mm)</span>
              <input
                type="text"
                value={draft.widthMm}
                disabled={locked}
                onChange={(e) => update({ widthMm: e.target.value })}
                className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-70"
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Görsel</h3>
          <textarea
            rows={2}
            value={draft.visualNote}
            disabled={locked}
            onChange={(e) => update({ visualNote: e.target.value })}
            placeholder="Yüzey, donatı, kalıp ayırıcı…"
            className="w-full resize-none rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-70"
          />
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Test</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Slump (cm)</span>
              <input
                type="text"
                value={draft.slumpCm}
                disabled={locked}
                onChange={(e) => update({ slumpCm: e.target.value })}
                className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-70"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Basınç (MPa)</span>
              <input
                type="text"
                value={draft.pressureMpa}
                disabled={locked}
                onChange={(e) => update({ pressureMpa: e.target.value })}
                className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-70"
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Fotoğraf</h3>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-950/80 p-3 shadow-neo-in">
            <div className="grid gap-2 sm:grid-cols-3">
              {['Ön', 'Yan', 'Etiket'].map((lab) => (
                <div
                  key={lab}
                  className="flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-gray-400/80 bg-gray-100/80 text-center text-[10px] font-semibold text-gray-600 dark:bg-gray-900/80 dark:text-gray-300"
                >
                  {lab}
                  <span className="sr-only"> — yer tutucu</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">Inset alan — prototip yükleme yok.</p>
          </div>
        </section>
      </fieldset>

      {showActions && !locked ? (
        <div className="flex flex-wrap gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90">
          <button
            type="button"
            onClick={onApprove}
            className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
          >
            Onayla
          </button>
          <button
            type="button"
            onClick={onRejectClick}
            className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-neo-out-sm ring-1 ring-gray-300/90 transition hover:bg-red-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
          >
            Ret
          </button>
        </div>
      ) : null}
    </div>
  )
}
