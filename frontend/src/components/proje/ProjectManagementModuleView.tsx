import { useMemo, useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  projectManagementActivitiesMock,
  projectManagementCardsMock,
  type ProjectCardItem,
  type ProjectPriority,
  type ProjectStatus,
} from '../../data/projectManagementCardsMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'

function statusLabel(status: ProjectStatus) {
  if (status === 'planlama') return 'Planlama'
  if (status === 'devam') return 'Devam ediyor'
  if (status === 'riskli') return 'Riskli'
  if (status === 'beklemede') return 'Beklemede'
  return 'Tamamlandi'
}

function priorityLabel(priority: ProjectPriority) {
  if (priority === 'dusuk') return 'Dusuk'
  if (priority === 'normal') return 'Normal'
  if (priority === 'yuksek') return 'Yuksek'
  return 'Kritik'
}

type Props = {
  onNavigate: (moduleId: string) => void
}

type DetailTabId = 'ozet' | 'dosyalar' | 'aktivite' | 'hizli-islemler' | 'hizli-ayarlar' | 'notlar'

export function ProjectManagementModuleView({ onNavigate }: Props) {
  const navigate = useNavigate()
  const [rows, setRows] = useState<ProjectCardItem[]>(projectManagementCardsMock)
  const [selectedId, setSelectedId] = useState(projectManagementCardsMock[0]!.id)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([])
  const [ownerFilter, setOwnerFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'all' | '7' | '30'>('all')
  const [detailTab, setDetailTab] = useState<DetailTabId>('ozet')

  const owners = useMemo(() => [...new Set(rows.map((r) => r.owner))], [rows])

  const filtered = useMemo(() => {
    const now = new Date('2026-04-14')
    return rows.filter((r) => {
      if (statusFilter.length && !statusFilter.includes(r.status)) return false
      if (ownerFilter.length && !ownerFilter.includes(r.owner)) return false
      if (dateRange === 'all') return true
      const due = new Date(r.dueDate.split('.').reverse().join('-'))
      const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff <= Number(dateRange)
    })
  }, [rows, statusFilter, ownerFilter, dateRange])

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null
  const selectedActivities = projectManagementActivitiesMock.filter((a) => a.projectId === selected?.id).slice(0, 3)

  const toggleStatus = (status: ProjectStatus) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const toggleOwner = (owner: string) => {
    setOwnerFilter((prev) => (prev.includes(owner) ? prev.filter((s) => s !== owner) : [...prev, owner]))
  }

  const applyMockStatusChange = () => {
    if (!selected) return
    setRows((prev) =>
      prev.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              status: row.status === 'devam' ? 'riskli' : 'devam',
              updatedAt: '14.04.2026 11:45',
            }
          : row,
      ),
    )
  }
  const panelClass = 'okan-liquid-panel'
  const nestedPanelClass = 'okan-liquid-panel-nested'
  const cardClass = 'okan-liquid-list-card'
  const cardSelectedClass = 'okan-liquid-list-card--selected'

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
      </div>
      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col gap-4">
        <div className={`${panelClass} p-3`}>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="okan-liquid-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold sm:text-sm"
          >
            <Filter className="size-4" aria-hidden />
            Filtrele
            <ChevronDown className={`size-4 transition ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden />
          </button>

          {filtersOpen ? (
            <div className="mt-3 grid gap-3 rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-3 backdrop-blur-md md:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-300">Durum</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['planlama', 'devam', 'riskli', 'beklemede', 'tamamlandi'] as ProjectStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStatus(s)}
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        statusFilter.includes(s) ? 'okan-liquid-pill-active text-slate-900' : 'okan-liquid-btn-secondary',
                      ].join(' ')}
                    >
                      {statusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-300">Sorumlu</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {owners.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleOwner(o)}
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        ownerFilter.includes(o) ? 'okan-liquid-pill-active text-slate-900' : 'okan-liquid-btn-secondary',
                      ].join(' ')}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-300">Tarih araligi</p>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as 'all' | '7' | '30')}
                  className="okan-liquid-select mt-2 w-full border-0 px-3 py-2.5 text-sm shadow-none"
                >
                  <option value="all">Tum tarihler</option>
                  <option value="7">7 gun icinde teslim</option>
                  <option value="30">30 gun icinde teslim</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <section className={`${panelClass} flex min-h-0 flex-col p-3`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Projeler</h2>
              <span className="text-xs text-slate-600 dark:text-slate-300">{filtered.length} kart</span>
            </div>
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">Filtreye uygun proje bulunamadi.</p>
            ) : (
              <ul className="grid min-h-0 grid-cols-1 gap-1.5 overflow-y-auto pr-1 md:grid-cols-2">
                {filtered.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={[
                        `${cardClass} w-full p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50`,
                        selected?.id === row.id ? cardSelectedClass : '',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-50">{row.name}</p>
                          <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                            {row.code} · {row.customer}
                          </p>
                        </div>
                        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-100">
                          {priorityLabel(row.priority)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                        <span>{statusLabel(row.status)}</span>
                        <span>{row.updatedAt}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className={`${panelClass} flex min-h-0 flex-col gap-3 p-4`}>
            {selected ? (
              <>
                <div
                  className="okan-liquid-pill-track flex gap-1 overflow-x-auto rounded-full p-1"
                  role="tablist"
                  aria-label="Secili proje panel tablari"
                >
                  {(
                    [
                      ['ozet', 'Ozet'],
                      ['dosyalar', 'Dosyalar'],
                      ['aktivite', 'Aktivite Gecmisi'],
                      ['notlar', 'Notlar'],
                      ['hizli-islemler', 'Hizli Islemler'],
                      ['hizli-ayarlar', 'Hizli Ayarlar'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={detailTab === id}
                      onClick={() => setDetailTab(id)}
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                        detailTab === id
                          ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {detailTab === 'ozet' ? (
                  <>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Secili proje</p>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{selected.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {selected.code} · Sorumlu {selected.owner}
                      </p>
                    </div>

                    <div className={`${nestedPanelClass} p-3`}>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <dt className="text-slate-600 dark:text-slate-300">Durum</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-50">{statusLabel(selected.status)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-600 dark:text-slate-300">Oncelik</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-50">{priorityLabel(selected.priority)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-600 dark:text-slate-300">Baslangic</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-50">{selected.startDate}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-600 dark:text-slate-300">Termin</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-50">{selected.dueDate}</dd>
                        </div>
                      </dl>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-200">{selected.note}</p>

                    <div className={`${nestedPanelClass} p-3`}>
                      <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Son 3 aktivite</p>
                      <ul className="mt-2 space-y-2">
                        {selectedActivities.length ? (
                          selectedActivities.map((a) => (
                            <li key={a.id} className="text-sm text-slate-700 dark:text-slate-200">
                              <span className="mr-2 text-xs text-slate-500 dark:text-slate-400">{a.at}</span>
                              {a.text}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-slate-600 dark:text-slate-300">Aktivite kaydi yok.</li>
                        )}
                      </ul>
                    </div>
                  </>
                ) : null}

                {detailTab === 'dosyalar' ? (
                  <div className={`${nestedPanelClass} space-y-2 p-3`}>
                    <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Proje dosyalari (mock)</p>
                    {['Vaziyet_Plani_RevC.pdf', 'Kalip_Seti_2026-04.ifc', 'Montaj_Notlari_v2.docx'].map((f) => (
                      <div key={f} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm">
                        <span className="truncate text-slate-800 dark:text-slate-100">{f}</span>
                        <button type="button" className="okan-liquid-btn-secondary px-2 py-1 text-xs font-semibold">Ac</button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {detailTab === 'aktivite' ? (
                  <div className={`${nestedPanelClass} p-3`}>
                    <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Aktivite gecmisi</p>
                    <ul className="mt-2 space-y-2">
                      {(projectManagementActivitiesMock.filter((a) => a.projectId === selected.id)).map((a) => (
                        <li key={a.id} className="text-sm text-slate-700 dark:text-slate-200">
                          <span className="mr-2 text-xs text-slate-500 dark:text-slate-400">{a.at}</span>
                          {a.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'hizli-islemler' ? (
                  <div className="space-y-2">
                    <button type="button" onClick={applyMockStatusChange} className="okan-liquid-btn-primary w-full px-4 py-2 text-sm font-semibold">
                      Durum guncelle (mock)
                    </button>
                    <button type="button" onClick={() => onNavigate('dashboard')} className="okan-liquid-btn-secondary w-full px-4 py-2 text-sm font-semibold">
                      Not ekle (mock)
                    </button>
                    <button type="button" onClick={() => onNavigate('engineering')} className="okan-liquid-btn-secondary w-full px-4 py-2 text-sm font-semibold">
                      Sorumlu ata (mock)
                    </button>
                  </div>
                ) : null}

                {detailTab === 'hizli-ayarlar' ? (
                  <div className={`${nestedPanelClass} space-y-2 p-3`}>
                    <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Hizli ayarlar (mock)</p>
                    <label className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
                      <span>Bildirimleri ac</span>
                      <input type="checkbox" defaultChecked className="size-4 accent-indigo-500" />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
                      <span>Gecikme uyarisi</span>
                      <input type="checkbox" defaultChecked className="size-4 accent-indigo-500" />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
                      <span>Haftalik ozet maili</span>
                      <input type="checkbox" className="size-4 accent-indigo-500" />
                    </label>
                  </div>
                ) : null}

                {detailTab === 'notlar' ? (
                  <div className={`${nestedPanelClass} space-y-3 p-3`}>
                    <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">Proje notlari (mock)</p>
                    <ul className="space-y-2">
                      {[
                        'Kalip teslim takvimi saha ekibiyle yeniden dogrulanacak.',
                        'Musteri tarafi revizyon R3 dokumani yarin bekleniyor.',
                        'Lojistik kapasite planina gore sevkiyat penceresi 2 gun kayabilir.',
                      ].map((note, i) => (
                        <li key={note} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                          <span className="mr-2 text-xs text-slate-500 dark:text-slate-400">#{i + 1}</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Yeni not ekle</label>
                      <textarea
                        rows={3}
                        placeholder="Kisa proje notu yazin... (mock)"
                        className="okan-liquid-input w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                      />
                      <button type="button" className="okan-liquid-btn-secondary px-3 py-2 text-xs font-semibold">
                        Notu kaydet (mock)
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/proje-detay/${selected.id}`, {
                      state: {
                        fromProjectList: true,
                        projectName: selected.name,
                      },
                    })
                  }
                  className="okan-liquid-btn-primary mt-auto px-4 py-2.5 text-sm font-semibold"
                >
                  Proje Detayini Gor
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Proje secin.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
