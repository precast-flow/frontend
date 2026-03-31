import { useCallback, useId, useMemo, useState } from 'react'
import { AlertTriangle, GripVertical, MoveRight, Wrench } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  MOLD_BOARD_DAY_SLOTS,
  MOLD_BOARD_SLOT_LOAD,
  MOLD_IDS,
  createInitialMoldBoard,
} from '../../data/moldBoardMock'
import { useI18n } from '../../i18n/I18nProvider'

const btnNeo =
  'rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white dark:ring-offset-gray-900'

export function MoldBoardView() {
  const { t } = useI18n()
  const { contextDetail, selectedFactory, selectedCodes } = useFactoryContext()
  const baseId = useId()
  const [cells, setCells] = useState(createInitialMoldBoard)
  const [dragMoldId, setDragMoldId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [faultOpen, setFaultOpen] = useState(false)
  const [faultMoldId, setFaultMoldId] = useState<string | null>(null)
  const [faultNote, setFaultNote] = useState('')
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveFrom, setMoveFrom] = useState<string | null>(null)
  const [moveTarget, setMoveTarget] = useState<string>(MOLD_IDS[0]!)

  const factoryHint = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const moveJob = useCallback(
    (fromMold: string, toMold: string) => {
      if (fromMold === toMold) return
      setCells((prev) => {
        const job = prev[fromMold]
        if (!job) return prev
        if (prev[toMold]) {
          window.setTimeout(() => showToast(t('moldBoard.cellOccupied')), 0)
          return prev
        }
        return { ...prev, [fromMold]: null, [toMold]: job }
      })
    },
    [showToast, t],
  )

  const onDropOn = useCallback(
    (targetMold: string) => {
      if (!dragMoldId) return
      moveJob(dragMoldId, targetMold)
      setDragMoldId(null)
    },
    [dragMoldId, moveJob],
  )

  const openMove = (moldId: string) => {
    setMoveFrom(moldId)
    const firstEmpty = MOLD_IDS.find((m) => m !== moldId && !cells[m])
    setMoveTarget(firstEmpty ?? MOLD_IDS[0]!)
    setMoveOpen(true)
  }

  const confirmMove = () => {
    if (moveFrom && moveTarget) moveJob(moveFrom, moveTarget)
    setMoveOpen(false)
    setMoveFrom(null)
  }

  const emptyTargets = useMemo(() => MOLD_IDS.filter((id) => !cells[id]), [cells])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-100">prod-03:</strong> Kalıp tahtası — hücre başına en fazla
        bir aktif iş; sürükle-bırak veya <strong>Taşı</strong> (mock). {contextDetail} ·{' '}
        <span className="font-medium text-gray-700 dark:text-gray-200">{factoryHint}</span>
      </p>

      <div className="rounded-xl border border-gray-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
        {t('moldBoard.dndHint')}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {MOLD_IDS.map((moldId) => {
          const job = cells[moldId]
          return (
            <div
              key={moldId}
              className={[
                'flex min-h-[9.5rem] flex-col rounded-2xl bg-gray-100 p-2 shadow-neo-in dark:bg-gray-950/80',
                dragMoldId === moldId ? 'ring-2 ring-gray-500' : '',
              ].join(' ')}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = job ? 'none' : 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                onDropOn(moldId)
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-200">{moldId}</span>
                <button
                  type="button"
                  title={t('moldBoard.faultTitle')}
                  onClick={() => {
                    setFaultMoldId(moldId)
                    setFaultNote('')
                    setFaultOpen(true)
                  }}
                  className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-200/80 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                >
                  <Wrench className="size-4" strokeWidth={1.75} aria-hidden />
                </button>
              </div>

              {job ? (
                <div
                  draggable
                  onDragStart={(e) => {
                    setDragMoldId(moldId)
                    e.dataTransfer.setData('text/plain', moldId)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => setDragMoldId(null)}
                  className={[
                    'flex min-h-0 flex-1 flex-col rounded-xl bg-gray-50 p-2 shadow-neo-out-sm dark:bg-gray-900/90',
                    job.suggested
                      ? 'ring-2 ring-gray-400 ring-offset-2 ring-offset-gray-100 dark:ring-gray-500 dark:ring-offset-gray-900'
                      : '',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-1">
                    <GripVertical className="size-4 shrink-0 text-gray-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-bold text-gray-900 dark:text-gray-50">{job.orderNo}</p>
                      <p className="truncate text-[11px] font-medium text-gray-700 dark:text-gray-200">
                        {job.partCode}
                      </p>
                    </div>
                  </div>
                  <span className="mt-1.5 inline-block w-fit rounded-full bg-gray-200/90 px-2 py-0.5 text-[10px] font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                    {job.statusLabel}
                  </span>
                  <p className="mt-1 text-[10px] text-gray-600 dark:text-gray-400">{job.foremanName}</p>
                  {job.suggested ? (
                    <p className="mt-1 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {t('moldBoard.suggested')}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openMove(moldId)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-gray-100 py-1.5 text-[10px] font-semibold text-gray-700 shadow-neo-in hover:text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <MoveRight className="size-3" aria-hidden />
                    {t('moldBoard.move')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300/90 bg-gray-50/50 px-2 text-center text-[11px] text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                  {t('moldBoard.empty')}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* P2 — yatay zaman ekseni (günlük) */}
      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out-sm dark:bg-gray-900/80">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('moldBoard.timelineTitle')}</h3>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t('moldBoard.timelineHint')}</p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          {MOLD_BOARD_DAY_SLOTS.map((slot, i) => (
            <div key={slot.id} className="flex min-w-[4.5rem] flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[4rem] rounded-t-md bg-gray-500 dark:bg-gray-400"
                style={{ height: `${MOLD_BOARD_SLOT_LOAD[i] ?? 40}%`, minHeight: '24px' }}
                aria-hidden
              />
              <span className="text-center text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                {slot.label}
              </span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400">{slot.hint}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        {t('moldBoard.roleMatrix')}
      </p>

      {faultOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[90] bg-gray-900/30 backdrop-blur-[1px] dark:bg-black/50"
            aria-label="Kapat"
            onClick={() => setFaultOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-[100] w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-100 p-5 shadow-neo-out dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-fault-title`}
          >
            <div className="flex gap-2">
              <AlertTriangle className="size-5 shrink-0 text-gray-600 dark:text-gray-300" aria-hidden />
              <div>
                <h4 id={`${baseId}-fault-title`} className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  {t('moldBoard.faultModalTitle')}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {faultMoldId} — {t('moldBoard.faultModalBody')}
                </p>
              </div>
            </div>
            <label className="mt-4 block text-sm">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t('moldBoard.faultNote')}</span>
              <textarea
                value={faultNote}
                onChange={(e) => setFaultNote(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2 text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-50"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnNeo} onClick={() => setFaultOpen(false)}>
                {t('moldBoard.cancel')}
              </button>
              <button
                type="button"
                className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
                onClick={() => {
                  setFaultOpen(false)
                  showToast(t('moldBoard.faultSent'))
                }}
              >
                {t('moldBoard.send')}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {moveOpen && moveFrom ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[90] bg-gray-900/30 backdrop-blur-[1px] dark:bg-black/50"
            aria-label="Kapat"
            onClick={() => setMoveOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-[100] w-[min(100%,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gray-100 p-5 shadow-neo-out dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
          >
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('moldBoard.moveTitle')}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {moveFrom} → {t('moldBoard.movePick')}
            </p>
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className="mt-3 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-50"
            >
              {emptyTargets.length ? (
                emptyTargets.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))
              ) : (
                <option value="">{t('moldBoard.noEmpty')}</option>
              )}
            </select>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnNeo} onClick={() => setMoveOpen(false)}>
                {t('moldBoard.cancel')}
              </button>
              <button
                type="button"
                disabled={!emptyTargets.length}
                className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm disabled:opacity-40 dark:bg-gray-200 dark:text-gray-900"
                onClick={confirmMove}
              >
                {t('moldBoard.confirmMove')}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[120] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
