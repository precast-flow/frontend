import { useEffect, useMemo, useState } from 'react'
import { fieldProjects, fieldTasks, blokajSebepOptions } from '../../data/fieldMock'
import { NeoSwitch } from '../NeoSwitch'

type Props = {
  onNavigate: (moduleId: string) => void
}

const cardProtrude =
  'rounded-2xl bg-gray-100 px-4 py-5 shadow-[3px_3px_8px_rgb(163_163_163/0.22),-2px_-2px_8px_rgb(255_255_255/0.98)] ring-1 ring-gray-300/70 dark:bg-gray-900 dark:ring-gray-600/70'
const btnTouch =
  'min-h-14 w-full rounded-2xl px-4 text-base font-bold shadow-[3px_3px_8px_rgb(163_163_163/0.25),-2px_-2px_8px_rgb(255_255_255/0.98)] ring-1 ring-gray-300/80 transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900'
const btnPrimary = `${btnTouch} bg-gray-800 text-white ring-gray-700 hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:ring-gray-300 dark:hover:bg-white`

export function FieldModuleView({ onNavigate }: Props) {
  const [projectId, setProjectId] = useState<string>(fieldProjects[0]!.id)
  const [simple, setSimple] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)
  const [blokajSebep, setBlokajSebep] = useState<string>('vinc')

  const todayTasks = useMemo(() => fieldTasks.filter((t) => t.projectId === projectId), [projectId])

  const selected = todayTasks.find((t) => t.id === selectedTaskId) ?? null

  useEffect(() => {
    const first = todayTasks[0]
    setSelectedTaskId(first?.id ?? null)
    if (first?.kind === 'teslim_bekliyor' && first.deliveries?.[0]) {
      setSelectedDeliveryId(first.deliveries[0].id)
    } else {
      setSelectedDeliveryId(null)
    }
  }, [todayTasks])

  const selectedDelivery = selected?.deliveries?.find((d) => d.id === selectedDeliveryId) ?? selected?.deliveries?.[0] ?? null

  const kindLabel = (kind: (typeof fieldTasks)[number]['kind']) => {
    switch (kind) {
      case 'teslim_bekliyor':
        return 'Teslim bekliyor'
      case 'montaj':
        return 'Montaj'
      case 'uyari':
        return 'Uyarı'
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 text-gray-900 md:max-w-2xl dark:text-gray-50">
      {/* P1 — çevrimdışı bilgi bandı */}
      <div
        className="rounded-xl border border-sky-200/90 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 shadow-neo-in dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-100"
        role="status"
      >
        <strong className="font-semibold">Çevrimiçi (mock).</strong> Şu an bağlantı simüle; çevrimdışı kuyruk ve
        senkron sonraki faz — sahada tam kullanım için ayrı tasarlanır.
      </div>

      <p className="text-xs leading-snug text-gray-700 dark:text-gray-200">
        <strong className="text-gray-900 dark:text-gray-50">mvp-12:</strong> Yalnızca responsive web — büyük dokunma
        hedefleri; mobil native yok.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-800 shadow-neo-in dark:bg-gray-900 dark:text-gray-100"
          title="Mock senkron"
        >
          Online mock · senkron OK
        </span>
        <NeoSwitch id="field-simple" label="Sade mod" checked={simple} onChange={setSimple} />
      </div>

      {/* P2 — harita pin placeholder */}
      <div
        className="rounded-2xl border border-dashed border-gray-400/80 bg-gray-200/60 p-4 shadow-neo-in dark:border-gray-600/80 dark:bg-gray-800/50"
        aria-hidden
      >
        <p className="text-center text-xs font-semibold text-gray-600 dark:text-gray-300">Harita — istasyon yok (P2)</p>
        <div className="mx-auto mt-3 flex h-24 max-w-[200px] items-center justify-center rounded-xl bg-gray-300/90 text-[10px] font-bold text-gray-600 shadow-neo-in dark:bg-gray-700/90 dark:text-gray-300">
          PIN
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-200">Proje</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full min-h-[48px] rounded-2xl border-0 bg-gray-100 py-3.5 pl-4 pr-10 text-base font-semibold text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:bg-gray-900 dark:text-gray-50"
          >
            {fieldProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <div className={`flex shrink-0 flex-col justify-center rounded-2xl px-4 py-3 ${cardProtrude} sm:w-36`}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">Bugün</p>
          <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-gray-50">{todayTasks.length}</p>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">görev</p>
        </div>
      </div>

      {!simple ? (
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100">Bugünün görevleri</h2>
      ) : null}

      <ul className="flex flex-col gap-3">
        {todayTasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedTaskId(task.id)
                if (task.kind === 'teslim_bekliyor' && task.deliveries?.[0]) {
                  setSelectedDeliveryId(task.deliveries[0].id)
                } else {
                  setSelectedDeliveryId(null)
                }
              }}
              className={`w-full text-left ${cardProtrude} ${
                task.id === selectedTaskId ? 'ring-2 ring-gray-800 dark:ring-gray-300' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  {kindLabel(task.kind)}
                </span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{task.time}</span>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-50">{task.cardTitle}</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{task.subtitle}</p>
              {task.kind === 'teslim_bekliyor' && task.deliveries && !simple ? (
                <ul className="mt-3 space-y-1.5 rounded-xl bg-gray-50 p-2 text-left text-xs shadow-neo-in dark:bg-gray-950/80">
                  {task.deliveries.map((d) => (
                    <li key={d.id} className="font-mono font-semibold text-gray-900 dark:text-gray-50">
                      {d.sevkNo} — {d.summary}
                    </li>
                  ))}
                </ul>
              ) : null}
              {task.kind === 'uyari' && !simple ? (
                <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">Blokaj / uyarı takibi aşağıda.</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900" aria-label="Görev detayı">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">
            {simple ? selected.cardTitle : `Detay — ${selected.cardTitle}`}
          </h3>

          {selected.kind === 'teslim_bekliyor' && selected.deliveries?.length ? (
            <div className="mt-3 space-y-3">
              {selected.deliveries.length > 1 ? (
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                  Sevkiyat satırı
                  <select
                    value={selectedDeliveryId ?? ''}
                    onChange={(e) => setSelectedDeliveryId(e.target.value)}
                    className="mt-1 w-full min-h-[48px] rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-base font-semibold text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                  >
                    {selected.deliveries.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sevkNo} — {d.summary}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {selectedDelivery ? (
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300">
                  Sevk no: <strong className="text-gray-900 dark:text-gray-50">{selectedDelivery.sevkNo}</strong>
                </p>
              ) : null}
              <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/80">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">Not</p>
                <textarea
                  rows={simple ? 2 : 3}
                  placeholder="Teslim notu (inset)…"
                  className="mt-2 w-full resize-none rounded-lg border-0 bg-gray-100 px-3 py-2.5 text-base font-medium text-gray-900 shadow-neo-in placeholder:text-gray-500 dark:bg-gray-900 dark:text-gray-50 dark:placeholder:text-gray-400"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Fotoğraf</span>
                <div className="mt-1 flex min-h-[88px] items-center justify-center rounded-xl border border-dashed border-gray-500/70 bg-gray-50 text-sm font-semibold text-gray-700 shadow-neo-in dark:bg-gray-950/90 dark:text-gray-200">
                  Yer tutucu — kamera / galeri
                </div>
              </div>
              <button type="button" className={btnPrimary}>
                Teslim alındı
              </button>
            </div>
          ) : null}

          {selected.kind === 'montaj' ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-gray-800 dark:text-gray-100">
                Eleman: <span className="font-mono font-semibold">{selected.montajElement ?? '—'}</span>
              </p>
              <div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Opsiyonel fotoğraf</span>
                <div className="mt-1 flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-gray-400/80 bg-gray-50 text-xs font-semibold text-gray-600 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300">
                  Montaj kanıtı (mock)
                </div>
              </div>
              <button type="button" className={`${btnTouch} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50`}>
                Montaj tamamlandı
              </button>
            </div>
          ) : null}

          {selected.kind === 'uyari' ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Blokaj bildirimi (P1)</p>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                Sebep
                <select
                  value={blokajSebep}
                  onChange={(e) => setBlokajSebep(e.target.value)}
                  className="mt-1 w-full min-h-[48px] rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                >
                  {blokajSebepOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                Açıklama
                <textarea
                  defaultValue={selected.blockReason}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                />
              </label>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                Sorumlu
                <input
                  type="text"
                  defaultValue={selected.blockOwner}
                  className="mt-1 w-full min-h-[44px] rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                />
              </label>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200">
                Çözüm
                <textarea
                  defaultValue={selected.blockSolution}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-50"
                />
              </label>
              <button type="button" className={`${btnTouch} bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50`}>
                Bildirimi gönder (mock)
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
        <strong className="text-gray-900 dark:text-gray-50">Breakpoint:</strong> varsayılan dar sütun{' '}
        <span className="font-mono">max-w-lg</span>; <span className="font-mono">md:</span> ve üzeri{' '}
        <span className="font-mono">max-w-2xl</span> — masaüstünde daha geniş kart.
      </p>

      <button
        type="button"
        onClick={() => onNavigate('dispatch')}
        className="text-center text-xs font-bold text-gray-800 underline-offset-2 hover:underline dark:text-gray-100"
      >
        Sevkiyat kayıtları (sevk no eşlemesi)
      </button>
      <button
        type="button"
        onClick={() => onNavigate('mobile')}
        className="text-center text-xs font-bold text-gray-800 underline-offset-2 hover:underline dark:text-gray-100"
      >
        Mobil web önizleme modülü
      </button>
    </div>
  )
}
