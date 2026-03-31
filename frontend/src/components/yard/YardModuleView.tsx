import { useEffect, useMemo, useState } from 'react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  countInCell,
  yardGridCells,
  yardInventory as initialInventory,
  type YardCellCode,
} from '../../data/yardMock'
import { YardLocationAssignModal } from './YardLocationAssignModal'
import { YardTransferModal } from './YardTransferModal'

type ScopeFilter = 'this' | 'all'

type Props = {
  onNavigate: (moduleId: string) => void
}

export function YardModuleView({ onNavigate }: Props) {
  const { selectedFactory, isFactoryInScope } = useFactoryContext()
  const [inventory, setInventory] = useState(() => initialInventory.map((r) => ({ ...r })))
  const [selectedCell, setSelectedCell] = useState<YardCellCode | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(initialInventory[0]?.id ?? null)
  const [toast, setToast] = useState<string | null>(null)
  const [locationOpen, setLocationOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  /** P1 — sadece seçili fabrika(lar) / tüm yetkili fabrikalar */
  const [scope, setScope] = useState<ScopeFilter>('this')

  const byFactory = useMemo(() => {
    return inventory.filter((i) => (scope === 'this' ? isFactoryInScope(i.factoryCode) : true))
  }, [inventory, scope, isFactoryInScope])

  const filtered = useMemo(() => {
    if (!selectedCell) return byFactory
    return byFactory.filter((i) => i.location === selectedCell)
  }, [byFactory, selectedCell])

  useEffect(() => {
    if (selectedRowId && !filtered.some((r) => r.id === selectedRowId)) {
      setSelectedRowId(filtered[0]?.id ?? null)
    }
  }, [filtered, selectedRowId])

  const selectedRow = inventory.find((r) => r.id === selectedRowId) ?? null

  const handleAssignLocation = (toCell: string) => {
    if (!selectedRow) return
    setInventory((prev) =>
      prev.map((r) => (r.id === selectedRow.id ? { ...r, location: toCell } : r)),
    )
    setToast(`Lokasyon güncellendi → ${toCell} (mock).`)
  }

  const toggleReady = (rowId: string, checked: boolean) => {
    setInventory((prev) => prev.map((r) => (r.id === rowId ? { ...r, readyForShipment: checked } : r)))
  }

  const handleInterFactoryTransfer = (payload: { targetFactoryCode: string; targetCell: string }) => {
    if (!selectedRow) return
    setInventory((prev) =>
      prev.map((r) =>
        r.id === selectedRow.id ? { ...r, factoryCode: payload.targetFactoryCode, location: payload.targetCell } : r,
      ),
    )
    setToast(
      `Transfer talebi oluşturuldu: ${payload.targetFactoryCode} · ${payload.targetCell} (mock kuyruk).`,
    )
  }

  const secondaryBtn =
    'rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900 dark:text-gray-100 dark:hover:text-gray-50'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <YardLocationAssignModal
        open={locationOpen}
        elementLabel={selectedRow ? `${selectedRow.elementId} · ${selectedRow.type}` : ''}
        currentLocation={selectedRow?.location ?? '—'}
        onClose={() => setLocationOpen(false)}
        onConfirm={handleAssignLocation}
      />
      <YardTransferModal
        open={transferOpen}
        elementLabel={selectedRow ? `${selectedRow.elementId} · ${selectedRow.type}` : ''}
        sourceFactoryCode={selectedRow?.factoryCode ?? selectedFactory.code}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleInterFactoryTransfer}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl text-xs text-gray-600 dark:text-gray-300">
          <strong className="text-gray-800 dark:text-gray-100">mvp-10:</strong> Fabrika bağlamı zorunlu; harita{' '}
          <strong>A1–D4</strong> yer tutucu, seçili hücre <strong>inset</strong> vurgulu. Tabloda{' '}
          <strong>fabrika kodu</strong> ve sevkiyat hazır kutusu.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Görünüm:</span>
          <div className="flex rounded-full bg-gray-100 p-0.5 shadow-neo-in dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setScope('this')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                scope === 'this'
                  ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-50'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Bu fabrika
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                scope === 'all'
                  ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-50'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Tüm yetkili fabrikalar
            </button>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        P1 filtre notu: çok fabrikalı rollerde liste birleşir; tek fabrikada yalnızca yerel stok (mock).
      </p>

      {toast ? (
        <div
          className="flex items-start justify-between gap-3 rounded-xl bg-gray-100 px-4 py-3 shadow-neo-out-sm dark:bg-gray-900"
          role="status"
        >
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
          >
            Kapat
          </button>
        </div>
      ) : null}

      <section
        className="rounded-3xl bg-gray-100 p-4 shadow-neo-out md:p-5 dark:bg-gray-900"
        aria-label="Yard haritası (A1–D4)"
      >
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">Saha ızgarası (A1–D4)</h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {yardGridCells.map((cell) => {
            const n = countInCell(cell, byFactory)
            const sel = selectedCell === cell
            return (
              <button
                key={cell}
                type="button"
                onClick={() => setSelectedCell((c) => (c === cell ? null : cell))}
                className={`flex min-h-[4.25rem] flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                  sel
                    ? 'bg-gray-50 shadow-neo-in ring-1 ring-gray-400/70 dark:bg-gray-950/80 dark:ring-gray-500/50'
                    : 'bg-gray-100 shadow-neo-in dark:bg-gray-900/90'
                }`}
              >
                <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-50">{cell}</span>
                <span className="mt-1 text-[10px] font-medium text-gray-600 dark:text-gray-300">{n} eleman</span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
          Aynı hücreye tekrar tıklayınca lokasyon filtresi kalkar.
        </p>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm dark:bg-gray-900">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Envanter</h2>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {selectedCell ? (
              <>
                Lokasyon: <span className="font-mono text-gray-900 dark:text-gray-50">{selectedCell}</span>
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Tüm lokasyonlar</span>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200/60 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-950/40">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-300">
                <th className="px-3 py-2.5">Eleman ID</th>
                <th className="px-3 py-2.5">Tip</th>
                <th className="px-3 py-2.5">Proje</th>
                <th className="px-3 py-2.5">Lokasyon</th>
                <th className="px-3 py-2.5">Fabrika</th>
                <th className="px-3 py-2.5">Sevkiyata hazır</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRowId(row.id)}
                  className={`cursor-pointer border-b border-gray-200/70 dark:border-gray-700/70 ${
                    i % 2 === 1 ? 'bg-gray-50/80 dark:bg-gray-950/50' : ''
                  } ${row.id === selectedRowId ? 'bg-gray-100 ring-1 ring-inset ring-gray-400 dark:bg-gray-900' : 'hover:bg-gray-100/80 dark:hover:bg-gray-900/70'}`}
                >
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-gray-900 dark:text-gray-50">
                    {row.elementId}
                  </td>
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{row.type}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-200">{row.project}</td>
                  <td className="px-3 py-2 font-mono text-xs font-medium text-gray-900 dark:text-gray-50">{row.location}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-200">{row.factoryCode}</td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={row.readyForShipment}
                      onChange={(e) => toggleReady(row.id, e.target.checked)}
                      className="size-4 rounded border-gray-400 text-gray-800 focus:ring-gray-400"
                      aria-label={`Sevkiyata hazır ${row.elementId}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200/90 pt-3 dark:border-gray-700/90">
          <button
            type="button"
            disabled={!selectedRow}
            onClick={() => setLocationOpen(true)}
            className={secondaryBtn}
          >
            Lokasyon ata
          </button>
          <button
            type="button"
            disabled={!selectedRow}
            onClick={() => selectedRow && toggleReady(selectedRow.id, !selectedRow.readyForShipment)}
            className={secondaryBtn}
          >
            Sevkiyata hazır işaretle
          </button>
          <button
            type="button"
            disabled={!selectedRow}
            onClick={() => setTransferOpen(true)}
            className={secondaryBtn}
          >
            Transfer talebi
          </button>
          <button
            type="button"
            disabled={!selectedRow}
            onClick={() => {
              setToast('QR etiket yazdırma kuyruğuna eklendi (mock).')
            }}
            className={secondaryBtn}
          >
            QR etiket yazdır
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dispatch')}
            className="ml-auto text-xs font-semibold text-gray-700 underline-offset-2 hover:underline dark:text-gray-200"
          >
            Sevkiyat modülü
          </button>
        </div>
      </section>
    </div>
  )
}
