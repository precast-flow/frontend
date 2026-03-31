import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import {
  approvalUiLabel,
  approvalUiPill,
  dispatchFlowSteps,
  dispatchPlans as initialPlans,
  mockDispatchCarriers,
  statusLabel,
  statusPill,
  type DispatchStatus,
} from '../../data/dispatchMock'
import { DispatchCancelModal } from './DispatchCancelModal'

type Props = {
  onNavigate: (moduleId: string) => void
}

/** mock: tamamlama izni (gerçekte RBAC) */
const MOCK_CAN_COMPLETE_EXIT = true

export function DispatchModuleView({ onNavigate }: Props) {
  const [plans, setPlans] = useState(() => initialPlans.map((p) => ({ ...p, loadOrder: [...p.loadOrder] })))
  const [selectedId, setSelectedId] = useState(initialPlans[0]?.id ?? null)
  const [cancelOpen, setCancelOpen] = useState(false)

  const selected = useMemo(() => plans.find((p) => p.id === selectedId) ?? null, [plans, selectedId])

  const todayPlans = useMemo(
    () => plans.filter((p) => p.status !== 'iptal' && p.status !== 'teslim_edildi'),
    [plans],
  )

  useEffect(() => {
    if (selectedId && !todayPlans.some((p) => p.id === selectedId)) {
      setSelectedId(todayPlans[0]?.id ?? null)
    }
  }, [todayPlans, selectedId])

  const setPlanStatus = (id: string, status: DispatchStatus) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  const patchPlan = (id: string, patch: Partial<(typeof plans)[number]>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const fixCapacity = () => {
    if (!selected) return
    patchPlan(selected.id, { capacityExceeded: false, totalWeightT: Math.min(selected.totalWeightT, selected.capacityLimitT - 0.5) })
  }

  const sendToApproval = () => {
    if (!selected) return
    patchPlan(selected.id, {
      status: 'onay_bekliyor',
      approvalUi: 'bekliyor',
      activeApprovalStepLabel:
        'Adım 1/3 · Lojistik onayı kuyruğunda (Şablon: Sevkiyat çıkışı — mvp-02)',
      flowStepIndex: 2,
    })
  }

  const completeExit = () => {
    if (!selected || !MOCK_CAN_COMPLETE_EXIT) return
    patchPlan(selected.id, {
      status: 'teslim_edildi',
      approvalUi: 'onaylandi',
      flowStepIndex: 3,
      activeApprovalStepLabel: 'Çıkış kaydı kapatıldı (mock).',
    })
  }

  const canCompleteExit =
    selected &&
    selected.approvalUi === 'onaylandi' &&
    (selected.status === 'yukleme' || selected.status === 'yolda')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <DispatchCancelModal
        open={cancelOpen}
        planCode={selected?.code ?? ''}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => selected && setPlanStatus(selected.id, 'iptal')}
      />

      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">mvp-11:</strong> Çıkış kaydı ve{' '}
        <button
          type="button"
          onClick={() => onNavigate('approval-flow')}
          className="font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
        >
          onay şablonu
        </button>{' '}
        (Sevkiyat çıkışı — mvp-02) bağlantılı mock.{' '}
        <button
          type="button"
          onClick={() => onNavigate('yard')}
          className="font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
        >
          Yard
        </button>{' '}
        ile eleman eşlemesi.
      </p>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
        <section
          className="flex max-h-[min(42vh,380px)] flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm dark:bg-gray-900 lg:col-span-4 lg:max-h-none"
          aria-labelledby="dispatch-list-h"
        >
          <h2 id="dispatch-list-h" className="mb-2 px-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
            Bugün — plan / çıkış ({todayPlans.length})
          </h2>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {todayPlans.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                    p.id === selectedId
                      ? 'bg-gray-100 shadow-neo-in ring-1 ring-gray-400/70 dark:bg-gray-900'
                      : 'bg-gray-100/70 shadow-neo-out-sm hover:shadow-neo-out dark:bg-gray-900/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-gray-50">{p.code}</span>
                    <span className={statusPill(p.status)}>
                      {p.status === 'teslim_edildi' ? (
                        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                      ) : null}
                      {statusLabel(p.status)}
                    </span>
                    <span className={approvalUiPill(p.approvalUi)}>{approvalUiLabel(p.approvalUi)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">{p.destination}</p>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{p.window}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="flex min-h-0 flex-col gap-3 rounded-2xl bg-gray-100 p-4 shadow-neo-out dark:bg-gray-900 lg:col-span-8"
          aria-label="Sevkiyat detayı"
        >
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
                <div>
                  <p className="font-mono text-lg font-bold text-gray-900 dark:text-gray-50">{selected.code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selected.project}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Fabrika: <span className="font-mono text-gray-700 dark:text-gray-200">{selected.factoryCode}</span>
                  </p>
                </div>
                <span className={statusPill(selected.status)}>
                  {selected.status === 'teslim_edildi' ? (
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  ) : null}
                  {statusLabel(selected.status)}
                </span>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Onay durumu
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={approvalUiPill(selected.approvalUi)}>{approvalUiLabel(selected.approvalUi)}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{selected.activeApprovalStepLabel}</span>
                </div>
              </div>

              {selected.capacityExceeded ? (
                <div className="rounded-xl bg-gray-50 px-3 py-2.5 shadow-neo-in dark:bg-gray-950/80">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
                    Kapasite (P1)
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
                    Toplam ağırlık: <strong>{selected.totalWeightT.toFixed(1)} t</strong> / limit{' '}
                    <strong>{selected.capacityLimitT} t</strong> — aşım.
                  </p>
                  <button
                    type="button"
                    onClick={fixCapacity}
                    className="mt-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
                  >
                    Yükü düzenle (mock)
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 px-3 py-2.5 shadow-neo-in dark:bg-gray-950/80">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Kapasite (P1)
                  </p>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-100">
                    Ağırlık: <strong>{selected.totalWeightT.toFixed(1)} t</strong> / limit{' '}
                    <strong>{selected.capacityLimitT} t</strong> — uygun.
                  </p>
                </div>
              )}

              <div className="grid gap-3 rounded-xl bg-gray-50 p-3 text-sm shadow-neo-in sm:grid-cols-2 dark:bg-gray-950/80">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Araç plaka
                  </h3>
                  <p className="mt-1 font-mono font-semibold text-gray-900 dark:text-gray-50">{selected.plate}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Şoför
                  </h3>
                  <p className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.driverName}</p>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Fabrika çıkış saati
                  </h3>
                  <p className="mt-1 font-mono text-gray-900 dark:text-gray-50">{selected.factoryExitTime}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Nakliyeci (P2)
                </label>
                <select
                  value={selected.carrierId}
                  onChange={(e) => patchPlan(selected.id, { carrierId: e.target.value })}
                  className="mt-1 w-full max-w-md rounded-xl border-0 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-100"
                >
                  {mockDispatchCarriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Yükleme sırası (eleman ID)
                </h3>
                <ol className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
                  {selected.loadOrder.map((id, i) => (
                    <li
                      key={`${selected.id}-${id}-${i}`}
                      className="border-b border-gray-200/70 py-2 font-mono text-sm font-medium text-gray-800 last:border-0 dark:border-gray-700/70 dark:text-gray-100"
                    >
                      {i + 1}. {id}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Akış (P1)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dispatchFlowSteps.map((s, i) => {
                    const done = i < selected.flowStepIndex
                    const active = i === selected.flowStepIndex
                    return (
                      <div
                        key={s.id}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          active
                            ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm ring-1 ring-gray-400/60 dark:bg-gray-900 dark:text-gray-50'
                            : done
                              ? 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/90 dark:text-gray-200'
                              : 'bg-gray-100/60 text-gray-500 ring-1 ring-gray-200/80 dark:bg-gray-900/50 dark:text-gray-400'
                        }`}
                      >
                        {i + 1}. {s.label}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  Planla → Yükle → Onay → Kapat — adım durumu kayıtla eşlenir (mock).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-200/90 pt-3 dark:border-gray-700/90">
                <button
                  type="button"
                  disabled={!selected || selected.status !== 'taslak'}
                  onClick={sendToApproval}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900 dark:text-gray-100"
                >
                  Onaya gönder
                </button>
                <button
                  type="button"
                  disabled={!selected || !MOCK_CAN_COMPLETE_EXIT || !canCompleteExit}
                  title={!MOCK_CAN_COMPLETE_EXIT ? 'sevkiyat.cikis.tamamla izni gerekir (mock)' : undefined}
                  onClick={completeExit}
                  className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Çıkışı tamamla
                </button>
                <p className="w-full text-[11px] text-gray-500 dark:text-gray-400 sm:w-auto">
                  Yetki (mock): çıkış tamamlama <span className="font-mono">sevkiyat.cikis.tamamla</span> — burada{' '}
                  {MOCK_CAN_COMPLETE_EXIT ? 'açık' : 'kapalı'}.
                </p>
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="ml-auto text-sm font-semibold text-red-800 underline-offset-2 hover:underline"
                >
                  İptal / ertele
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">Kayıt seçin.</p>
          )}
        </section>
      </div>
    </div>
  )
}
