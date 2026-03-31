import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useFactoryContext } from '../../context/FactoryContext'
import { useProductionQuality } from '../../context/ProductionQualityContext'
import { findFactoryByCode } from '../../data/mockFactories'
import {
  formatPlannedDate,
  mesLines,
  mesSlots,
  statusLabelProd02,
  statusRowClass,
  type WorkOrder,
} from '../../data/mesMock'
import { QualityInspectionPanel } from '../kalite/QualityInspectionPanel'
import { QualityRejectModal } from '../kalite/QualityRejectModal'
import { QualityRecordDrawer } from './QualityRecordDrawer'
import { SlotConflictModal } from './SlotConflictModal'
import { MesBie07AssignmentsPanel } from './MesBie07AssignmentsPanel'

type ViewMode = 'list' | 'board'
type DetailTab = 'genel' | 'parcalar' | 'beton' | 'zaman' | 'notlar' | 'kalite' | 'birim'

type Props = {
  onNavigate: (moduleId: string) => void
}

export function MesModuleView({ onNavigate }: Props) {
  const { t } = useI18n()
  const { orders, patchOrder, setOrderStatus, sendToQuality, completeQuality, rejectQuality, updateSlot } =
    useProductionQuality()
  const { factories, isFactoryInScope } = useFactoryContext()

  const [view, setView] = useState<ViewMode>('list')
  const [shift, setShift] = useState<'gunduz' | 'gece'>('gunduz')
  const [lineFilter, setLineFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('genel')
  const [conflictOpen, setConflictOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null)

  const selected = orders.find((o) => o.id === selectedId) ?? null
  const drawerOrder = drawerOrderId ? orders.find((o) => o.id === drawerOrderId) ?? null : null

  const openReject = () => {
    setRejectTargetId(drawerOrder?.id ?? selected?.id ?? null)
    setRejectOpen(true)
  }

  const filteredOrders = useMemo(() => {
    let list = orders.filter((o) => isFactoryInScope(o.factoryCode))
    if (lineFilter !== 'all') list = list.filter((o) => o.lineId === lineFilter)
    return list
  }, [orders, lineFilter, isFactoryInScope])

  const kpis = useMemo(() => {
    const inScope = orders.filter((o) => isFactoryInScope(o.factoryCode))
    return {
      plan: inScope.filter((o) => o.status === 'planlandi').length,
      run: inScope.filter((o) => o.status === 'uretimde').length,
      waiting: inScope.filter((o) => o.status === 'kalite_bekliyor' || o.status === 'beklemede').length,
      done: inScope.filter((o) => o.status === 'tamamlandi').length,
      blocked: inScope.filter((o) => o.status === 'bloke').length,
    }
  }, [orders, isFactoryInScope])

  const conflictAlts = useMemo(() => {
    const occupied = new Set(orders.map((o) => `${o.lineId}-${o.slotIndex}`))
    const alts: { lineLabel: string; slotLabel: string; key: string }[] = []
    for (const line of mesLines) {
      mesSlots.forEach((label, idx) => {
        const k = `${line.id}-${idx}`
        if (!occupied.has(k)) alts.push({ key: k, lineLabel: line.label, slotLabel: label })
      })
    }
    return alts.slice(0, 4)
  }, [orders])

  const applySlotMove = (key: string) => {
    if (!selected) return
    const [lineId, idxStr] = key.split('-')
    const slotIndex = Number(idxStr)
    if (!lineId || Number.isNaN(slotIndex)) return
    updateSlot(selected.id, lineId, slotIndex)
  }

  const factoryName = (code: string) => findFactoryByCode(code, factories)?.name ?? code

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <SlotConflictModal
        open={conflictOpen}
        onClose={() => setConflictOpen(false)}
        onPick={applySlotMove}
        alternatives={conflictAlts}
      />
      <QualityRejectModal
        open={rejectOpen}
        inspectionCode={orders.find((o) => o.id === rejectTargetId)?.code ?? ''}
        onClose={() => {
          setRejectOpen(false)
          setRejectTargetId(null)
        }}
        onConfirm={() => {
          if (rejectTargetId) rejectQuality(rejectTargetId)
          setRejectOpen(false)
          setRejectTargetId(null)
          setDrawerOrderId(null)
        }}
      />
      <QualityRecordDrawer
        open={drawerOrderId !== null}
        workOrder={drawerOrder}
        onClose={() => setDrawerOrderId(null)}
        onApprove={() => {
          if (drawerOrder && drawerOrder.status === 'kalite_bekliyor') completeQuality(drawerOrder.id)
        }}
        onRejectClick={openReject}
      />

      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">prod-02:</strong> Liste kolonları + detay sekmeleri
        (Genel · Parçalar · Beton/Reçete · Zaman · Notlar · Kalite); durumlar gri tonları.{' '}
        <strong className="text-gray-800 dark:text-gray-100">mvp-09:</strong> Üretim emri listesi ve detayda{' '}
        <strong>Kalite</strong> sekmesi aynı bağlamda;{' '}
        <button
          type="button"
          onClick={() => onNavigate('quality')}
          className="font-semibold text-gray-800 underline decoration-gray-400 underline-offset-2 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
        >
          Kalite modülü
        </button>{' '}
        ile çapraz bağlantı.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {[
          { k: 'Planlı', v: kpis.plan },
          { k: 'Üretimde', v: kpis.run },
          { k: 'Beklemede', v: kpis.waiting },
          { k: 'Tamamlanan', v: kpis.done },
          { k: 'Bloke', v: kpis.blocked },
        ].map((x) => (
          <div
            key={x.k}
            className="rounded-xl bg-gray-100 px-3 py-2 text-center shadow-neo-out-sm dark:bg-gray-900"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">{x.k}</p>
            <p className="text-lg font-bold tabular-nums text-gray-900 dark:text-gray-50">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-gray-100 p-3 shadow-neo-in dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Tarih
            <input
              type="date"
              defaultValue="2026-03-20"
              className="mt-1 block rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
          <div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Vardiya</span>
            <div className="mt-1 flex gap-1 rounded-full bg-gray-100 p-0.5 shadow-neo-in dark:bg-gray-900/80">
              {(
                [
                  { id: 'gunduz' as const, label: 'Gündüz' },
                  { id: 'gece' as const, label: 'Gece' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShift(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                    shift === s.id
                      ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Hat
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="mt-1 block rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Tüm hatlar</option>
              {mesLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-1 rounded-full bg-gray-100 p-1 shadow-neo-out-sm dark:bg-gray-900">
          {(
            [
              { id: 'list' as const, label: 'Liste' },
              { id: 'board' as const, label: 'Pano' },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                view === v.id
                  ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
        <div className="flex min-h-0 flex-col gap-3 lg:col-span-5">
          {view === 'list' ? (
            <MesOrderListTable
              orders={filteredOrders}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setDetailTab('genel')
              }}
              factoryName={factoryName}
              onOpenQualityDrawer={(id) => setDrawerOrderId(id)}
            />
          ) : (
            <MesBoard
              orders={filteredOrders}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setDetailTab('genel')
              }}
            />
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Emir oluştur
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => setConflictOpen(true)}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm disabled:opacity-40 dark:bg-gray-900 dark:text-gray-100"
            >
              Slot taşı
            </button>
            <button
              type="button"
              disabled={!selected || selected.status !== 'planlandi'}
              onClick={() => selected && setOrderStatus(selected.id, 'uretimde')}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm disabled:opacity-40 dark:bg-gray-900 dark:text-gray-100"
            >
              Başlat
            </button>
            <button
              type="button"
              disabled={!selected || selected.status !== 'uretimde'}
              onClick={() => selected && sendToQuality(selected.id)}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm disabled:opacity-40 dark:bg-gray-900 dark:text-gray-100"
            >
              QC’ye gönder
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && setDrawerOrderId(selected.id)}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm disabled:opacity-40 dark:bg-gray-900 dark:text-gray-100"
            >
              Kalite kaydı aç
            </button>
            <button
              type="button"
              onClick={() => onNavigate('engineering')}
              className="ml-auto text-xs font-semibold text-gray-700 underline-offset-2 hover:underline dark:text-gray-200"
            >
              Mühendislik paketi
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:col-span-7">
          {selected ? (
            <>
              <div className="rounded-2xl bg-gray-100 p-4 shadow-neo-out dark:bg-gray-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-bold text-gray-900 dark:text-gray-50">{selected.code}</p>
                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">{selected.element}</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{selected.project}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-gray-300/80 ${statusRowClass(selected.status)}`}
                    >
                      {statusLabelProd02(selected.status)}
                    </span>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{factoryName(selected.factoryCode)}</p>
                  </div>
                </div>
                {selected.transitionNote ? (
                  <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
                    {selected.transitionNote}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1 shadow-neo-out-sm dark:bg-gray-900">
                {(
                  [
                    { id: 'genel' as const, label: 'Genel' },
                    { id: 'parcalar' as const, label: 'Parçalar' },
                    { id: 'beton' as const, label: 'Beton/Reçete' },
                    { id: 'zaman' as const, label: 'Zaman çizelgesi' },
                    { id: 'notlar' as const, label: 'Notlar' },
                    { id: 'kalite' as const, label: 'Kalite' },
                    { id: 'birim' as const, label: t('mes.bie07.tab') },
                  ] as const
                ).map((tabItem) => (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() => setDetailTab(tabItem.id)}
                    className={`rounded-full px-2.5 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 sm:px-3 sm:text-xs ${
                      detailTab === tabItem.id
                        ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {tabItem.label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900">
                {detailTab === 'genel' ? (
                  <dl className="space-y-3 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Durum</dt>
                        <dd className="font-medium text-gray-900 dark:text-gray-50">{statusLabelProd02(selected.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Plan tarihi</dt>
                        <dd className="font-medium text-gray-900 dark:text-gray-50">
                          {formatPlannedDate(selected.plannedDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Hat / slot</dt>
                        <dd className="font-medium text-gray-900 dark:text-gray-50">
                          {mesLines.find((l) => l.id === selected.lineId)?.label} · {mesSlots[selected.slotIndex] ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sorumlu vardiya</dt>
                        <dd className="font-medium text-gray-900 dark:text-gray-50">{selected.shiftOwner}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Fabrika</dt>
                        <dd className="font-medium text-gray-900 dark:text-gray-50">{factoryName(selected.factoryCode)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Plan süre</dt>
                        <dd className="font-medium text-gray-900 dark:text-gray-50">{selected.durationMin} dk</dd>
                      </div>
                    </div>
                  </dl>
                ) : null}

                {detailTab === 'parcalar' ? (
                  <div className="overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/60">
                    <table className="w-full min-w-[280px] text-sm">
                      <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Parça</th>
                          <th className="px-3 py-2 text-right font-semibold">Adet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.parts.map((p) => (
                          <tr key={p.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                            <td className="px-3 py-2 text-gray-900 dark:text-gray-50">{p.name}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-gray-800 dark:text-gray-100">{p.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {detailTab === 'beton' ? (
                  <div className="space-y-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Beton sınıfı</dt>
                        <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.concreteClass}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Kalıp</dt>
                        <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.mold}</dd>
                      </div>
                    </div>
                    <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300">
                      Reçete referansı: <strong className="text-gray-800 dark:text-gray-100">MOCK-ONAYLI</strong> — kalite
                      laboratuvarı ekranı yok (Adım 13 ortak blok).
                    </p>
                    {selected.attachments?.length ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">P2 — Ekler (thumb)</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selected.attachments.map((f) => (
                            <div
                              key={f.id}
                              className="flex h-16 w-20 flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-gray-50 text-[10px] text-gray-600 shadow-neo-out-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            >
                              <span className="font-mono font-semibold uppercase text-gray-500">{f.type}</span>
                              <span className="mt-1 line-clamp-2 px-1 text-center">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ek yok (mock).</p>
                    )}
                  </div>
                ) : null}

                {detailTab === 'zaman' ? (
                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-3 py-8 text-center text-xs text-gray-500 shadow-neo-in dark:border-gray-600 dark:bg-gray-950/50 dark:text-gray-400">
                      Zaman çizelgesi (Gantt) — <strong className="text-gray-700 dark:text-gray-200">placeholder</strong>
                      <br />
                      Üretimde gerçek slot ve MES olaylarından beslenir.
                    </div>
                    {selected.revisions.length ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">P1 — Revizyon geçmişi</p>
                        <ul className="mt-2 space-y-2">
                          {selected.revisions.map((r) => (
                            <li
                              key={r.id}
                              className="rounded-xl bg-gray-50 px-3 py-2 shadow-neo-in dark:bg-gray-950/70"
                            >
                              <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{r.at}</span>
                              <p className="mt-1 text-gray-800 dark:text-gray-100">{r.message}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Hat olayları</p>
                      <ul className="mt-2 space-y-2">
                        {selected.lineEvents.length ? (
                          selected.lineEvents.map((ev) => (
                            <li
                              key={ev.id}
                              className="flex gap-3 rounded-xl border border-gray-200/80 bg-gray-50 px-3 py-2 dark:border-gray-700/80 dark:bg-gray-950/50"
                            >
                              <span className="shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400">{ev.at}</span>
                              <span className="text-gray-800 dark:text-gray-100">{ev.message}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-600 dark:text-gray-300">Henüz hat olayı yok (mock).</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'notlar' ? (
                  <div className="space-y-3 text-sm">
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Serbest notlar</span>
                      <textarea
                        rows={4}
                        value={selected.notes}
                        onChange={(e) => patchOrder(selected.id, { notes: e.target.value })}
                        className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-50 px-3 py-2 text-gray-800 shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
                      />
                    </label>
                    {selected.status === 'bloke' ? (
                      <div className="space-y-2 rounded-xl bg-gray-700/10 p-3 dark:bg-gray-800/40">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">P1 — Bloke</p>
                        <label className="block text-xs">
                          <span className="text-gray-600 dark:text-gray-300">Neden</span>
                          <textarea
                            rows={2}
                            value={selected.blockReason ?? ''}
                            onChange={(e) => patchOrder(selected.id, { blockReason: e.target.value })}
                            className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2 text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-50"
                          />
                        </label>
                        <label className="block text-xs">
                          <span className="text-gray-600 dark:text-gray-300">Çözüm notu</span>
                          <textarea
                            rows={2}
                            value={selected.blockResolution ?? ''}
                            onChange={(e) => patchOrder(selected.id, { blockResolution: e.target.value })}
                            className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2 text-gray-900 shadow-neo-in dark:bg-gray-900 dark:text-gray-50"
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {detailTab === 'birim' && selected ? (
                  <MesBie07AssignmentsPanel workOrder={selected} factoryName={factoryName} onNavigate={onNavigate} />
                ) : null}

                {detailTab === 'kalite' ? (
                  <div className="space-y-4">
                    {selected.status === 'bloke' || selected.status === 'beklemede' ? (
                      <p className="rounded-xl bg-gray-200/80 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800/80 dark:text-gray-100">
                        Bu durumda kalite akışı kapalı (mock). Önce bloke çözümü / malzeme bekleme giderilir.
                      </p>
                    ) : null}
                    {selected.status === 'planlandi' ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Emir henüz başlamadı. Önce <strong>Başlat</strong>, ardından üretim sonunda{' '}
                        <strong>QC’ye gönder</strong>.
                      </p>
                    ) : null}
                    {selected.status === 'uretimde' ? (
                      <div className="rounded-xl bg-amber-50/80 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                        Üretim devam ediyor. Hat işi bitince <strong>QC’ye gönder</strong> ile durum{' '}
                        <strong>Kalite bekliyor</strong> olur (otomatik kuyruk notu).
                        <button
                          type="button"
                          onClick={() => sendToQuality(selected.id)}
                          className="ml-2 font-semibold underline decoration-amber-600/60 underline-offset-2"
                        >
                          Şimdi gönder (mock)
                        </button>
                      </div>
                    ) : null}
                    {selected.status === 'kalite_bekliyor' || selected.status === 'tamamlandi' ? (
                      <QualityInspectionPanel
                        workOrder={selected}
                        readOnly={selected.status === 'tamamlandi'}
                        showActions={selected.status === 'kalite_bekliyor'}
                        onApprove={() => completeQuality(selected.id)}
                        onRejectClick={openReject}
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onNavigate('quality')}
                      className="text-xs font-semibold text-gray-700 underline-offset-2 hover:underline dark:text-gray-200"
                    >
                      Fabrika kalite kuyruğunu aç →
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <p className="rounded-2xl bg-gray-100 p-6 text-sm text-gray-600 shadow-neo-in dark:bg-gray-900 dark:text-gray-300">
              Listeden veya panodan bir üretim emri seçin.
            </p>
          )}

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            prod-02 rol matrisi (mock): Üretim şefi / vardiya amiri — durum, notlar, bloke alanları; usta — liste salt +
            not okuma; santral operatörü — beton/reçete görüntü; planlama — plan tarihi önerisi (üretim onayı). İzin:{' '}
            <span className="font-mono">uretim.durum</span>, <span className="font-mono">kalite.kayit</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

function MesOrderListTable({
  orders,
  selectedId,
  onSelect,
  factoryName,
  onOpenQualityDrawer,
}: {
  orders: WorkOrder[]
  selectedId: string | null
  onSelect: (id: string) => void
  factoryName: (code: string) => string
  onOpenQualityDrawer: (id: string) => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-gray-100 p-2 shadow-neo-out-sm dark:bg-gray-900">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200/90 text-xs font-semibold text-gray-600 dark:border-gray-700/90 dark:text-gray-300">
            <th className="px-2 py-2 text-left">Emir no</th>
            <th className="px-2 py-2 text-left">Proje</th>
            <th className="px-2 py-2 text-left">Parça özeti</th>
            <th className="px-2 py-2 text-left">Durum</th>
            <th className="px-2 py-2 text-left">Plan tarihi</th>
            <th className="px-2 py-2 text-left">Hat</th>
            <th className="px-2 py-2 text-left">Vardiya</th>
            <th className="px-2 py-2 text-left">Fabrika</th>
            <th className="px-2 py-2 text-right"> </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr
              key={o.id}
              className={`cursor-pointer border-b border-gray-200/70 ${statusRowClass(o.status)} ${
                o.id === selectedId ? 'ring-1 ring-inset ring-gray-400' : ''
              } ${i % 2 === 1 ? 'opacity-95' : ''}`}
              onClick={() => onSelect(o.id)}
            >
              <td className="whitespace-nowrap px-2 py-2 font-mono text-xs font-semibold">{o.code}</td>
              <td className="max-w-[8rem] truncate px-2 py-2 text-gray-800 dark:text-gray-100">{o.project}</td>
              <td className="max-w-[10rem] truncate px-2 py-2 text-gray-800 dark:text-gray-100">{o.element}</td>
              <td className="whitespace-nowrap px-2 py-2 text-xs font-semibold">{statusLabelProd02(o.status)}</td>
              <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-gray-700 dark:text-gray-200">
                {formatPlannedDate(o.plannedDate)}
              </td>
              <td className="max-w-[7rem] truncate px-2 py-2 text-xs text-gray-700 dark:text-gray-200">
                {mesLines.find((l) => l.id === o.lineId)?.label ?? o.lineId}
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-700 dark:text-gray-200">{o.shiftOwner}</td>
              <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-700 dark:text-gray-200">
                {factoryName(o.factoryCode)}
              </td>
              <td className="px-2 py-2 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenQualityDrawer(o.id)
                  }}
                  className="text-[11px] font-semibold text-gray-700 underline-offset-2 hover:underline dark:text-gray-200"
                >
                  QC
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MesBoard({
  orders,
  selectedId,
  onSelect,
}: {
  orders: WorkOrder[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-x-auto rounded-2xl bg-gray-100 p-2 shadow-neo-out-sm dark:bg-gray-900">
      <div className="inline-block min-w-full">
        <table className="w-full border-separate border-spacing-2 text-left text-xs">
          <thead>
            <tr>
              <th className="w-28 p-1 text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Hat / slot</th>
              {mesSlots.map((s) => (
                <th key={s} className="p-1 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mesLines.map((line) => (
              <tr key={line.id}>
                <td className="align-top p-1 font-semibold text-gray-800 dark:text-gray-100">{line.label}</td>
                {mesSlots.map((label, idx) => {
                  const inCell = orders.filter((o) => o.lineId === line.id && o.slotIndex === idx)
                  return (
                    <td key={label} className="align-top p-1">
                      <div className="flex min-h-[5.5rem] flex-col gap-1 rounded-xl border border-gray-200/70 bg-gray-100 px-1.5 py-1.5 shadow-[inset_2px_2px_6px_rgb(163_163_163/0.12)] dark:border-gray-700/70 dark:bg-gray-900/80">
                        {inCell.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => onSelect(o.id)}
                            className={`w-full rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold leading-tight transition ${
                              o.id === selectedId
                                ? 'border-gray-500 bg-gray-200/90 text-gray-900 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-50'
                                : 'border-gray-300/80 bg-gray-100 text-gray-800 shadow-sm dark:border-gray-600/80 dark:bg-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {o.code}
                            <span className="mt-0.5 block font-normal text-[10px] text-gray-600 dark:text-gray-300">
                              {o.element}
                            </span>
                          </button>
                        ))}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
