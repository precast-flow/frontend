import { useCallback, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Pencil, Plus, Users, X } from 'lucide-react'
import {
  FIRM_FACTORIES_DEFAULT_CODE,
  buildFirmFactoriesSeed,
  type FirmFactoryRow,
} from '../../data/firmFactoriesMock'
import { FACTORY_OPS_SUMMARY, MOLD_ROWS, WORKER_ROWS } from '../../data/productionFactoryOpsMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-neo-out-sm hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100'

const btnDanger =
  'rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 shadow-neo-out-sm hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100'

let newId = 0

export function FirmFactoriesPage() {
  const { t } = useI18n()
  const baseId = useId()
  const [rows, setRows] = useState<FirmFactoryRow[]>(() => buildFirmFactoriesSeed())
  const [defaultCode, setDefaultCode] = useState(FIRM_FACTORIES_DEFAULT_CODE)
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ code: '', name: '', city: '', address: '' })
  const [deactivateTarget, setDeactivateTarget] = useState<FirmFactoryRow | null>(null)
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const activeCount = useMemo(() => rows.filter((r) => r.active).length, [rows])
  const lastFactoryWarn = deactivateTarget ? activeCount === 1 && deactivateTarget.active : false
  const drawerFactory = useMemo(() => rows.find((r) => r.id === drawerId), [rows, drawerId])
  const drawerFactoryOpsId = useMemo(() => {
    if (!drawerFactory) return null
    return FACTORY_OPS_SUMMARY.find((f) => f.code === drawerFactory.code)?.id ?? null
  }, [drawerFactory])
  const drawerMolds = useMemo(
    () => (drawerFactoryOpsId ? MOLD_ROWS.filter((m) => m.factoryId === drawerFactoryOpsId).slice(0, 5) : []),
    [drawerFactoryOpsId],
  )
  const drawerWorkers = useMemo(
    () => (drawerFactoryOpsId ? WORKER_ROWS.filter((w) => w.factoryId === drawerFactoryOpsId).slice(0, 5) : []),
    [drawerFactoryOpsId],
  )

  const openDeactivate = (row: FirmFactoryRow) => {
    if (!row.active) return
    setDeactivateTarget(row)
  }

  const confirmDeactivate = () => {
    if (!deactivateTarget) return
    const nextRows = rows.map((r) => (r.id === deactivateTarget.id ? { ...r, active: false } : r))
    setRows(nextRows)
    if (defaultCode === deactivateTarget.code) {
      const next = nextRows.find((r) => r.active)
      if (next) setDefaultCode(next.code)
    }
    setDeactivateTarget(null)
  }

  const addFactory = () => {
    const code = addForm.code.trim().toUpperCase()
    if (!code || !addForm.name.trim()) return
    if (rows.some((r) => r.code === code)) return
    newId += 1
    setRows((prev) => [
      ...prev,
      {
        id: `new-${newId}`,
        code,
        name: addForm.name.trim(),
        city: addForm.city.trim() || '—',
        address: addForm.address.trim() || '—',
        active: true,
        notes: '',
      },
    ])
    setAddForm({ code: '', name: '', city: '', address: '' })
    setAddOpen(false)
  }

  const updateNotes = (id: string, notes: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)))
  }

  const setDefault = useCallback((code: string) => {
    const row = rows.find((r) => r.code === code && r.active)
    if (row) setDefaultCode(code)
  }, [rows])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('firmFactory.pageTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('firmFactory.pageDesc')}</p>
      </div>

      <div className="rounded-xl border border-gray-200/90 bg-gray-50/90 px-3 py-2 text-xs text-gray-700 shadow-neo-in dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
        {t('firmFactory.topBarNote')}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={`${btnPrimary} inline-flex items-center gap-2`} onClick={() => setAddOpen(true)}>
          <Plus className="size-4" aria-hidden />
          {t('firmFactory.add')}
        </button>
        <Link
          to="/firma-ayarlari/kullanicilar"
          className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-neo-out-sm hover:bg-gray-200/80 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          <Users className="size-4" aria-hidden />
          {t('firmFactory.linkUsers')}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-3 py-3 font-semibold">{t('firmFactory.col.default')}</th>
              <th className="px-3 py-3 font-semibold">{t('firmFactory.col.code')}</th>
              <th className="px-3 py-3 font-semibold">{t('firmFactory.col.name')}</th>
              <th className="px-3 py-3 font-semibold">{t('firmFactory.col.city')}</th>
              <th className="px-3 py-3 font-semibold">{t('firmFactory.col.active')}</th>
              <th className="px-3 py-3 font-semibold">{t('firmFactory.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-t border-gray-200/80 hover:bg-gray-50/80 dark:border-gray-700/80 dark:hover:bg-gray-950/50"
              >
                <td className="px-3 py-3">
                  <input
                    type="radio"
                    name="defaultFactory"
                    className="size-4 accent-gray-900 dark:accent-gray-100"
                    checked={defaultCode === row.code}
                    disabled={!row.active}
                    onChange={() => setDefault(row.code)}
                    aria-label={t('firmFactory.col.default')}
                  />
                </td>
                <td className="px-3 py-3 font-mono font-semibold text-gray-900 dark:text-gray-50">{row.code}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="text-left font-medium text-gray-900 underline decoration-gray-300 decoration-1 underline-offset-2 hover:text-gray-700 dark:text-gray-50 dark:decoration-gray-600 dark:hover:text-gray-200"
                    onClick={() => setDrawerId(row.id)}
                  >
                    {row.name}
                  </button>
                </td>
                <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{row.city}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      row.active
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {row.active ? t('firmFactory.statusActive') : t('firmFactory.statusInactive')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800"
                    onClick={() => setDrawerId(row.id)}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    {t('firmFactory.detail')}
                  </button>
                  {row.active ? (
                    <button
                      type="button"
                      className="ml-2 text-xs font-medium text-red-700 hover:underline dark:text-red-400"
                      onClick={() => openDeactivate(row)}
                    >
                      {t('firmFactory.deactivate')}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ekle — modal */}
      {addOpen ? (
        <div
          className="gm-glass-modal-shell fixed inset-0 z-[80] flex items-end justify-center bg-gray-900/40 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${baseId}-add-title`}
        >
          <div className="w-full max-w-md rounded-3xl bg-pf-surface p-6 shadow-neo-out">
            <h3 id={`${baseId}-add-title`} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {t('firmFactory.addTitle')}
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500">{t('firmFactory.form.code')}</span>
                <input
                  className={`${inset} mt-1 font-mono uppercase`}
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500">{t('firmFactory.form.name')}</span>
                <input
                  className={`${inset} mt-1`}
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500">{t('firmFactory.form.city')}</span>
                <input className={`${inset} mt-1`} value={addForm.city} onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-gray-500">{t('firmFactory.form.address')}</span>
                <textarea
                  className={`${inset} mt-1 min-h-[5rem] resize-y`}
                  value={addForm.address}
                  onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setAddOpen(false)}>
                {t('firmGeneral.cancel')}
              </button>
              <button type="button" className={btnPrimary} onClick={addFactory}>
                {t('firmFactory.addSave')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pasifleştir — onay (birden fazla aktif fabrika varken) */}
      {deactivateTarget && !lastFactoryWarn ? (
        <div
          className="gm-glass-modal-shell fixed inset-0 z-[85] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-md rounded-3xl bg-pf-surface p-6 shadow-neo-out">
            <p className="text-sm text-gray-800 dark:text-gray-100">{t('firmFactory.confirmDeactivate')}</p>
            <p className="mt-2 font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">{deactivateTarget.code}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setDeactivateTarget(null)}>
                {t('firmGeneral.cancel')}
              </button>
              <button type="button" className={btnDanger} onClick={confirmDeactivate}>
                {t('firmFactory.confirmDeactivateOk')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Son aktif fabrika — uyarı */}
      {deactivateTarget && lastFactoryWarn ? (
        <div
          className="gm-glass-modal-shell fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-[2px]"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-neo-out dark:border-amber-800 dark:bg-amber-950/50">
            <p className="text-sm font-medium text-amber-950 dark:text-amber-100">{t('firmFactory.lastFactoryWarn')}</p>
            <p className="mt-2 text-xs text-amber-900/90 dark:text-amber-100/90">{t('firmFactory.lastFactoryHint')}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setDeactivateTarget(null)}>
                {t('firmFactory.lastFactoryCancel')}
              </button>
              <button type="button" className={btnDanger} onClick={confirmDeactivate}>
                {t('firmFactory.lastFactoryForce')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* P1 — drawer */}
      {drawerFactory ? (
        <div className="gm-glass-drawer-root fixed inset-0 z-[75] flex justify-end">
          <button
            type="button"
            className="gm-glass-drawer-backdrop absolute inset-0 cursor-default border-0 p-0"
            aria-label={t('firmFactory.drawerClose')}
            onClick={() => setDrawerId(null)}
          />
          <aside className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden bg-pf-surface shadow-neo-out">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200/90 px-4 py-3 dark:border-gray-700/90">
              <div>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{drawerFactory.code}</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{drawerFactory.name}</h3>
              </div>
              <button
                type="button"
                className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setDrawerId(null)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">{drawerFactory.address}</p>
              <label className="mt-6 block">
                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('firmFactory.drawerNotes')}</span>
                <textarea
                  className={`${inset} mt-2 min-h-[8rem]`}
                  value={drawerFactory.notes}
                  onChange={(e) => updateNotes(drawerFactory.id, e.target.value)}
                />
              </label>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('firmFactory.drawerMap')}</p>
                <div className="mt-2 flex h-40 items-center justify-center rounded-2xl bg-gray-200/80 shadow-neo-in dark:bg-gray-800/80">
                  <MapPin className="size-10 text-gray-500 dark:text-gray-400" strokeWidth={1.25} aria-hidden />
                </div>
                <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">{t('firmFactory.drawerMapHint')}</p>
              </div>

              <div className="mt-6 grid gap-4">
                <section className="rounded-2xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/70">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      {t('firmFactory.drawerMoldsTitle')}
                    </p>
                    <button type="button" className="text-[11px] font-medium text-gray-600 underline dark:text-gray-300">
                      {t('firmFactory.drawerMockAdd')}
                    </button>
                  </div>
                  {drawerMolds.length ? (
                    <table className="w-full text-xs">
                      <thead className="text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="py-1 text-left">{t('firmFactory.drawerMoldCode')}</th>
                          <th className="py-1 text-left">{t('firmFactory.drawerMoldStatus')}</th>
                          <th className="py-1 text-left">{t('firmFactory.drawerMoldActions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawerMolds.map((m) => (
                          <tr key={m.id} className="border-t border-gray-200/80 dark:border-gray-800">
                            <td className="py-1 font-mono">{m.code}</td>
                            <td className="py-1">{m.status}</td>
                            <td className="py-1">{t('firmFactory.drawerMockActionsMold')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('firmFactory.drawerEmptyFactory')}</p>
                  )}
                </section>

                <section className="rounded-2xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/70">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      {t('firmFactory.drawerWorkersTitle')}
                    </p>
                    <button type="button" className="text-[11px] font-medium text-gray-600 underline dark:text-gray-300">
                      {t('firmFactory.drawerMockAdd')}
                    </button>
                  </div>
                  {drawerWorkers.length ? (
                    <table className="w-full text-xs">
                      <thead className="text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="py-1 text-left">{t('firmFactory.drawerWorkerName')}</th>
                          <th className="py-1 text-left">{t('firmFactory.drawerWorkerShift')}</th>
                          <th className="py-1 text-left">{t('firmFactory.drawerMoldActions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawerWorkers.map((w) => (
                          <tr key={w.id} className="border-t border-gray-200/80 dark:border-gray-800">
                            <td className="py-1">{w.name}</td>
                            <td className="py-1 font-mono">{w.shift}</td>
                            <td className="py-1">{t('firmFactory.drawerMockActionsWorker')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('firmFactory.drawerEmptyFactory')}</p>
                  )}
                </section>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
