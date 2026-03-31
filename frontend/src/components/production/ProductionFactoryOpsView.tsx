import { useMemo, useState } from 'react'
import { Building2, HardHat, Hammer, Users } from 'lucide-react'
import {
  FACTORY_OPS_SUMMARY,
  MOLD_PLAN_ROWS,
  MOLD_ROWS,
  WORKER_ROWS,
  type FactoryShiftModel,
} from '../../data/productionFactoryOpsMock'

type OpsTab = 'shift' | 'mold' | 'crew'

const tabClass = (on: boolean) =>
  [
    'rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-600 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white',
  ].join(' ')

const statusPill = (status: 'active' | 'maintenance' | 'passive') => {
  if (status === 'active') return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100'
  if (status === 'maintenance') return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100'
  return 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

const shiftLabel = (model: FactoryShiftModel) => (model === '3x8' ? '3 vardiya x 8 saat' : '2 vardiya x 12 saat')

export function ProductionFactoryOpsView() {
  const [factoryId, setFactoryId] = useState(FACTORY_OPS_SUMMARY[0].id)
  const [tab, setTab] = useState<OpsTab>('shift')
  const [workerIds, setWorkerIds] = useState<string[]>([])
  const [bulkShift, setBulkShift] = useState<'A' | 'B' | 'C'>('B')
  const [toast, setToast] = useState<string | null>(null)

  const selectedFactory = FACTORY_OPS_SUMMARY.find((f) => f.id === factoryId) ?? FACTORY_OPS_SUMMARY[0]
  const molds = useMemo(() => MOLD_ROWS.filter((m) => m.factoryId === selectedFactory.id), [selectedFactory.id])
  const workers = useMemo(() => WORKER_ROWS.filter((w) => w.factoryId === selectedFactory.id), [selectedFactory.id])

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  const toggleWorker = (id: string) => {
    setWorkerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const applyBulkAssign = () => {
    if (workerIds.length === 0) {
      showToast('Toplu atama icin en az bir calisan secin.')
      return
    }
    showToast(`${workerIds.length} calisan vardiya ${bulkShift} olarak isaretlendi (mock).`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">prod-08:</strong> Fabrika bazli vardiya, kalip ve ekip
        komutu (mock).
      </p>

      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
        <pre className="overflow-x-auto rounded-xl bg-gray-100 p-3 text-[11px] leading-relaxed text-gray-700 dark:bg-gray-900/80 dark:text-gray-200">
{`┌ Fabrika secici: [ IST-HAD | KOC-01 ] ─ bekleyen is ozeti
├ Sekmeler: [ Vardiya ] [ Kalip ] [ Ekip ]
├ Vardiya: model override + firma default + rol yetkileri
├ Kalip: kod, durum, son bakim, aktif/pasif + bakim plani
└ Ekip: ad, rol, vardiya, aktif/pasif + toplu vardiya atama`}
        </pre>
      </section>

      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/80">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Fabrika</span>
            <select
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in dark:bg-gray-950 dark:text-gray-100"
              value={factoryId}
              onChange={(e) => {
                setFactoryId(e.target.value)
                setWorkerIds([])
              }}
            >
              {FACTORY_OPS_SUMMARY.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} · {f.name}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-950/70">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Aktif kalip</p>
            <p className="text-lg font-semibold">{selectedFactory.activeMolds}</p>
          </div>
          <div className="rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-950/70">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Aktif calisan</p>
            <p className="text-lg font-semibold">{selectedFactory.activeWorkers}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          P1 bekleyen is ozeti: <strong>{selectedFactory.pendingJobs}</strong> emir bekliyor.
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-1.5 shadow-neo-in dark:bg-gray-950/70">
        <button type="button" className={tabClass(tab === 'shift')} onClick={() => setTab('shift')}>
          Vardiya
        </button>
        <button type="button" className={tabClass(tab === 'mold')} onClick={() => setTab('mold')}>
          Kalip
        </button>
        <button type="button" className={tabClass(tab === 'crew')} onClick={() => setTab('crew')}>
          Ekip
        </button>
      </div>

      {tab === 'shift' ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="size-4" aria-hidden />
              P0 — Vardiya modeli override
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                Firma default: <strong>{shiftLabel(selectedFactory.defaultCompanyModel)}</strong>
              </p>
              <p>
                Fabrika override: <strong>{shiftLabel(selectedFactory.shiftModel)}</strong>
              </p>
              <p className="text-xs text-gray-500">Tailwind: rounded-2xl bg-gray-50 p-4 shadow-neo-out</p>
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <HardHat className="size-4" aria-hidden />
              Rol bazli degisim yetkisi
            </h3>
            <ul className="mt-3 space-y-1 text-sm">
              <li>Sef: vardiya modeli ve ekip atama degistirir.</li>
              <li>Vardiya amiri: ekip vardiya atamasi yapar, modeli gorebilir.</li>
              <li>Fabrika admin: kalip ve calisan aktivasyonunu yonetir.</li>
            </ul>
          </div>
        </section>
      ) : null}

      {tab === 'mold' ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-auto rounded-2xl bg-gray-50 shadow-neo-in dark:bg-gray-900/80">
            <h3 className="sticky top-0 border-b border-gray-200/80 bg-gray-50 px-4 py-3 text-sm font-semibold dark:border-gray-700 dark:bg-gray-900">
              P0 — Kalip listesi
            </h3>
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Kod</th>
                  <th className="px-4 py-2 text-left">Durum</th>
                  <th className="px-4 py-2 text-left">Son bakim</th>
                  <th className="px-4 py-2 text-left">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {molds.map((m) => (
                  <tr key={m.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                    <td className="px-4 py-2 font-mono">{m.code}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusPill(m.status)}`}>{m.status}</span>
                    </td>
                    <td className="px-4 py-2">{m.lastMaintenance}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">Aktif / Pasif (mock)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Hammer className="size-4" aria-hidden />
              P1 — Kalip bakim plani
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {MOLD_PLAN_ROWS.map((row) => (
                <li key={`${row.moldCode}-${row.planDate}`} className="rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-950/70">
                  <span className="font-mono">{row.moldCode}</span> · {row.planDate} · {row.note}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {tab === 'crew' ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="overflow-auto rounded-2xl bg-gray-50 shadow-neo-in dark:bg-gray-900/80 lg:col-span-2">
            <h3 className="sticky top-0 border-b border-gray-200/80 bg-gray-50 px-4 py-3 text-sm font-semibold dark:border-gray-700 dark:bg-gray-900">
              P0/P1 — Ekip listesi ve toplu vardiya atama
            </h3>
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Sec</th>
                  <th className="px-4 py-2 text-left">Ad</th>
                  <th className="px-4 py-2 text-left">Rol</th>
                  <th className="px-4 py-2 text-left">Vardiya</th>
                  <th className="px-4 py-2 text-left">Durum</th>
                  <th className="px-4 py-2 text-left">Fabrikadan cikar</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={workerIds.includes(w.id)} onChange={() => toggleWorker(w.id)} />
                    </td>
                    <td className="px-4 py-2">{w.name}</td>
                    <td className="px-4 py-2">{w.role}</td>
                    <td className="px-4 py-2 font-mono">{w.shift}</td>
                    <td className="px-4 py-2">{w.active ? 'Aktif' : 'Pasif'}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">Cikar (mock)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4" aria-hidden />
              Toplu atama
            </h3>
            <label className="mt-3 block">
              <span className="text-xs text-gray-500">Hedef vardiya</span>
              <select
                className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-neo-in dark:bg-gray-950"
                value={bulkShift}
                onChange={(e) => setBulkShift(e.target.value as 'A' | 'B' | 'C')}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </label>
            <button
              type="button"
              className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-100 dark:text-gray-900"
              onClick={applyBulkAssign}
            >
              Secili calisanlari ata
            </button>
            <p className="mt-2 text-[11px] text-gray-500">Tailwind: rounded-xl bg-gray-100 shadow-neo-in</p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
          <h3 className="text-sm font-semibold">P2 — Fabrikalar arasi transfer</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Calisan transferi ve kalip transferi akislari placeholder olarak tutuldu.
          </p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
          <h3 className="text-sm font-semibold">Acilacak UX sorulari</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
            <li>Vardiya modeli degisince mevcut ekip atamalari otomatik guncellensin mi?</li>
            <li>Pasif kaliplar raporlarda tamamen gizlensin mi, yoksa ayri satir mi olsun?</li>
            <li>Fabrikadan cikarilan calisan gecmis raporlarda anonimlestirilmeli mi?</li>
            <li>Toplu atamada yetki siniri vardiya amiri icin ekip listesiyle mi kisitlansin?</li>
          </ol>
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-medium shadow-neo-out dark:bg-gray-900">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
