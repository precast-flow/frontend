import { useEffect, useMemo, useState } from 'react'
import { Columns2, FileText, GitMerge, Link2, Plus, StickyNote, UserPlus } from 'lucide-react'
import { crmCustomers, statusLabel, type CrmCustomer } from '../../data/crmCustomers'
import { useFactoryContext } from '../../context/FactoryContext'
import { CrmExtraDrawer } from './CrmExtraDrawer'
import { CrmNewCustomerModal } from './CrmNewCustomerModal'
import { NeoSwitch } from '../NeoSwitch'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

const detailTabs = [
  { id: 'genel', label: 'Genel' },
  { id: 'projeler', label: 'Projeler' },
  { id: 'teklifler', label: 'Teklifler' },
  { id: 'notlar', label: 'Notlar' },
  { id: 'dokumanlar', label: 'Dokümanlar' },
] as const

type DetailTabId = (typeof detailTabs)[number]['id']

function statusPill(status: CrmCustomer['status']) {
  const base =
    'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-gray-300/90 dark:ring-gray-600/80'
  if (status === 'aktif') return `${base} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100`
  if (status === 'beklemede') return `${base} bg-gray-50 text-gray-700 dark:bg-gray-950/90 dark:text-gray-200`
  if (status === 'potansiyel')
    return `${base} bg-amber-50 text-amber-900 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800/80`
  return `${base} bg-gray-200/80 text-gray-700 dark:bg-gray-700/80 dark:text-gray-200`
}

export function CrmModuleView({ onNavigate }: Props) {
  const { selectedCodes } = useFactoryContext()
  const filterId = 'crm-fabrika-filtre'

  const [newOpen, setNewOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [emptyDemo, setEmptyDemo] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(crmCustomers[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTabId>('genel')

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSector, setFilterSector] = useState<string>('all')
  const [filterByFactoryContext, setFilterByFactoryContext] = useState(true)

  const list = useMemo(() => {
    if (emptyDemo) return []
    let rows = [...crmCustomers]

    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.taxId.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q),
      )
    }
    if (filterStatus !== 'all') {
      rows = rows.filter((c) => c.status === filterStatus)
    }
    if (filterSector !== 'all') {
      rows = rows.filter((c) => c.sector === filterSector)
    }
    if (filterByFactoryContext) {
      rows = rows.filter((c) => selectedCodes.some((code) => c.factories.includes(code)))
    }

    return rows
  }, [
    emptyDemo,
    search,
    filterStatus,
    filterSector,
    filterByFactoryContext,
    selectedCodes,
  ])

  useEffect(() => {
    if (list.length === 0) {
      setSelectedId(null)
      return
    }
    setSelectedId((id) => {
      if (id && list.some((c) => c.id === id)) return id
      return list[0]!.id
    })
  }, [list])

  const selected = list.find((c) => c.id === selectedId) ?? null
  const panelClass = 'okan-liquid-panel'
  const nestedPanelClass = 'okan-liquid-panel-nested'

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <CrmNewCustomerModal open={newOpen} onClose={() => setNewOpen(false)} />
      <CrmExtraDrawer open={drawerOpen} customer={selected} onClose={() => setDrawerOpen(false)} />

      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
      </div>

      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col gap-4">
        <div className={`${panelClass} flex flex-wrap items-center gap-2 p-3`}>
          <button type="button" onClick={() => setNewOpen(true)} className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <Plus className="size-4" strokeWidth={2} aria-hidden />
              Yeni musteri
            </span>
          </button>
          <button type="button" className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <UserPlus className="size-4" strokeWidth={2} aria-hidden />
              Yeni kontak
            </span>
          </button>
          <button type="button" onClick={() => onNavigate('quote')} className="okan-liquid-btn-primary px-4 py-2.5 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <FileText className="size-4" strokeWidth={2} aria-hidden />
              Teklif olustur
            </span>
          </button>
          <button type="button" onClick={() => onNavigate('project')} className="okan-liquid-btn-secondary px-4 py-2.5 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <Link2 className="size-4" strokeWidth={2} aria-hidden />
              Proje bagla
            </span>
          </button>
          <button type="button" onClick={() => setEmptyDemo((e) => !e)} className="ml-auto okan-liquid-btn-secondary px-3 py-2 text-xs font-semibold">
            {emptyDemo ? 'Ornek listeyi goster' : 'Bos durum demosu'}
          </button>
        </div>

        <div className={`${panelClass} p-3 md:p-4`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ara</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Unvan, kod, vergi no, sehir, ilgili kisi..."
                className="okan-liquid-input mt-1 w-full border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
              />
            </label>
            <label className="min-w-[140px]">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Durum</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="okan-liquid-select mt-1 w-full border-0 px-3 py-2.5 text-sm shadow-none"
              >
                <option value="all">Tumu</option>
                <option value="aktif">Aktif</option>
                <option value="beklemede">Beklemede</option>
                <option value="pasif">Pasif</option>
                <option value="potansiyel">Potansiyel</option>
              </select>
            </label>
            <label className="min-w-[140px]">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sektor (P1)</span>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="okan-liquid-select mt-1 w-full border-0 px-3 py-2.5 text-sm shadow-none"
              >
                <option value="all">Tumu</option>
                <option value="Konut">Konut</option>
                <option value="Altyapı">Altyapi</option>
                <option value="Endüstriyel">Endustriyel</option>
              </select>
            </label>
            <button
              type="button"
              className="okan-liquid-btn-secondary px-5 py-2.5 text-sm font-semibold"
              onClick={() => {
                setSearch('')
                setFilterStatus('all')
                setFilterSector('all')
              }}
            >
              Sifirla
            </button>
          </div>
          <div className={`${nestedPanelClass} mt-3 flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between`}>
            <NeoSwitch
              id={filterId}
              label={`Fabrika baglamina gore daralt (${selectedCodes.join(', ')})`}
              checked={filterByFactoryContext}
              onChange={setFilterByFactoryContext}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              P1 — Ust cubuktaki fabrika ile musteri fabrika listesinin kesisimi (mock).
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className={`${panelClass} flex flex-1 flex-col items-center justify-center gap-4 p-8`}>
            <div className={`${nestedPanelClass} flex h-36 w-full max-w-sm items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300`} aria-hidden>
              Henuz musteri yok — yer tutucu alan
            </div>
            <p className="max-w-md text-center text-sm text-slate-600 dark:text-slate-300">
              Ilk musteriyi ekleyerek CRM akisina baslayin. Liste ve detay paneli burada gorunecek.
            </p>
            <button type="button" onClick={() => setNewOpen(true)} className="okan-liquid-btn-primary px-5 py-3 text-sm font-semibold">
              Yeni musteri
            </button>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <section
            className={`${panelClass} flex min-h-[320px] flex-col p-3 lg:col-span-5 xl:col-span-5`}
            aria-labelledby="crm-list-heading"
          >
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2 id="crm-list-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Müşteriler
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="okan-liquid-btn-secondary inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
              >
                <Columns2 className="size-3.5" aria-hidden />
                Ek alanlar
              </button>
            </div>
            <div className={`${nestedPanelClass} min-h-0 flex-1 overflow-auto`}>
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                    <tr className="okan-liquid-table-thead text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    <th className="px-3 py-2.5">Ünvan</th>
                    <th className="px-3 py-2.5">Vergi no</th>
                    <th className="px-3 py-2.5">Şehir</th>
                    <th className="px-3 py-2.5">İlgili kişi</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">Son teklif</th>
                    <th className="px-3 py-2.5">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, i) => {
                    const active = row.id === selectedId
                    return (
                      <tr
                        key={row.id}
                        className={`okan-liquid-table-row cursor-pointer border-b transition ${
                          i % 2 === 1 ? 'bg-white/10 dark:bg-white/5' : ''
                        } ${active ? 'bg-white/30 ring-1 ring-inset ring-sky-300/40 dark:bg-white/10 dark:ring-sky-300/25' : 'hover:bg-white/20 dark:hover:bg-white/10'}`}
                        onClick={() => {
                          setSelectedId(row.id)
                          setDetailTab('genel')
                        }}
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-50">{row.name}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-600 dark:text-slate-300">{row.taxId}</td>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{row.city}</td>
                        <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{row.contactPerson}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                          {row.lastQuoteDate}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section
            className={`${panelClass} flex min-h-[320px] flex-col p-4 lg:col-span-7 xl:col-span-7`}
            aria-label="Müşteri detayı"
          >
            {selected ? (
              <>
                <div className="mb-3 border-b border-white/20 pb-3 dark:border-white/10">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{selected.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                    {selected.code} · {selected.city} · Satış: {selected.owner}
                  </p>
                  {selected.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800 dark:text-slate-100"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">· P1 etiket (mock)</span>
                    </div>
                  ) : null}
                </div>

                <div
                  className="mb-4 okan-liquid-pill-track flex flex-wrap gap-1 rounded-full p-1"
                  role="tablist"
                  aria-label="Detay sekmeleri"
                >
                  {detailTabs.map((t) => {
                    const on = detailTab === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setDetailTab(t.id)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                          on
                            ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                            : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto text-sm text-slate-700 dark:text-slate-200">
                  {detailTab === 'genel' ? (
                    <div className="space-y-4">
                      <dl className="grid gap-2 sm:grid-cols-2">
                        <div className={`${nestedPanelClass} p-3`}>
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Vergi no</dt>
                          <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{selected.taxId}</dd>
                        </div>
                        <div className={`${nestedPanelClass} p-3`}>
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kayit tarihi</dt>
                          <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{selected.createdAt}</dd>
                        </div>
                        <div className={`${nestedPanelClass} p-3`}>
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sektor</dt>
                          <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{selected.sector}</dd>
                        </div>
                        <div className={`${nestedPanelClass} p-3`}>
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Ilgili kisi</dt>
                          <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{selected.contactPerson}</dd>
                        </div>
                      </dl>
                      <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          Son aktivite
                        </h3>
                        <div className={`${nestedPanelClass} p-3`}>
                          <ol className="space-y-3 border-l-2 border-white/30 pl-4 dark:border-white/20">
                            <li className="relative">
                              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-white ring-4 ring-white/40 dark:bg-white/30 dark:ring-white/10" />
                              <p className="font-medium text-slate-900 dark:text-slate-50">Teklif taslagi guncellendi</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">Bugun 09:14 · Teklif #T-441</p>
                            </li>
                            <li className="relative">
                              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-400 ring-4 ring-white/40 dark:ring-white/10" />
                              <p className="font-medium text-slate-900 dark:text-slate-50">Arama kaydi</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">Dun · 12 dk</p>
                            </li>
                            <li className="relative">
                              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-400 ring-4 ring-white/40 dark:ring-white/10" />
                              <p className="font-medium text-slate-900 dark:text-slate-50">Toplanti notu eklendi</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300">15 Mar · {selected.owner}</p>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {detailTab === 'projeler' ? (
                    <div className={`${nestedPanelClass} overflow-x-auto`}>
                      <table className="w-full min-w-[400px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/20 text-xs uppercase text-slate-500 dark:border-white/10 dark:text-slate-400">
                            <th className="px-3 py-2 font-semibold">Proje</th>
                            <th className="px-3 py-2 font-semibold">Aşama</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.projeler.map((p) => (
                            <tr key={p.id} className="border-b border-gray-200/80 dark:border-gray-700/80">
                              <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-50">{p.name}</td>
                              <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{p.phase}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="border-t border-white/20 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                        Mock: 2 satır (mvp-05).
                      </p>
                    </div>
                  ) : null}

                  {detailTab === 'teklifler' ? (
                    <div className="space-y-2">
                      <div className={`${nestedPanelClass} overflow-x-auto`}>
                        <table className="w-full min-w-[520px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/20 text-xs uppercase text-slate-500 dark:border-white/10 dark:text-slate-400">
                              <th className="px-3 py-2 font-semibold">Teklif no</th>
                              <th className="px-3 py-2 font-semibold">Tarih</th>
                              <th className="px-3 py-2 font-semibold">Tutar</th>
                              <th className="px-3 py-2 font-semibold">Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.teklifler.map((t) => (
                              <tr key={t.id} className="border-b border-gray-200/80 dark:border-gray-700/80">
                                <td className="px-3 py-2.5 font-mono text-xs text-slate-800 dark:text-slate-100">{t.no}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-slate-600 dark:text-slate-300">{t.date}</td>
                                <td className="px-3 py-2.5 tabular-nums text-slate-800 dark:text-slate-100">{t.amount}</td>
                                <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{t.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mock: 3 satır · Teklif modülü: </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('quote')}
                        className="text-sm font-semibold text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                      >
                        Teklif oluştur (kısayol)
                      </button>
                    </div>
                  ) : null}

                  {detailTab === 'notlar' ? (
                    <div className={`${nestedPanelClass} p-4`}>
                      <div className="flex items-start gap-2">
                        <StickyNote className="size-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                        <p className="text-slate-700 dark:text-slate-200">{selected.notes || 'Not yok.'}</p>
                      </div>
                    </div>
                  ) : null}

                  {detailTab === 'dokumanlar' ? (
                    <div className={`${nestedPanelClass}`}>
                      {selected.dokumanlar.length === 0 ? (
                        <p className="p-4 text-slate-600 dark:text-slate-300">Henuz dokuman yok (mock).</p>
                      ) : (
                        <ul className="divide-y divide-white/20 dark:divide-white/10">
                          {selected.dokumanlar.map((d) => (
                            <li
                              key={d.id}
                              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                            >
                              <span className="font-medium text-slate-900 dark:text-slate-50">{d.name}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {d.size} · {d.date}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="border-t border-white/20 px-4 py-2 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                        P1 — Dosya satırları (indirme yok, prototip).
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-white/30 bg-white/10 p-3 text-xs text-slate-600 dark:border-white/20 dark:bg-white/5 dark:text-slate-400">
                  <GitMerge className="size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">P2 — Musteri birlestirme (wireframe):</strong>{' '}
                    Tehlikeli akış; kaynak kayıtlar seçilir, hedef müşteri ve çakışan vergi no uyarısı, çift kayıtlar
                    arşivlenir. Üretimde ayrı onay ve denetim izi gerekir — burada yalnızca not.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Listeden bir musteri secin.</p>
            )}
          </section>
          </div>
        )}
      </div>
    </div>
  )
}
