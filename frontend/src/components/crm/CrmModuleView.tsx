import { useEffect, useMemo, useState } from 'react'
import { Columns2, FileText, GitMerge, Link2, Plus, StickyNote, UserPlus } from 'lucide-react'
import { crmCustomers, statusLabel, type CrmCustomer } from '../../data/crmCustomers'
import { useFactoryContext } from '../../context/FactoryContext'
import { CrmExtraDrawer } from './CrmExtraDrawer'
import { CrmNewCustomerModal } from './CrmNewCustomerModal'
import { NeoSwitch } from '../NeoSwitch'

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

  return (
    <div className="gm-glass-arch-list flex min-h-0 flex-1 flex-col gap-4">
      <CrmNewCustomerModal open={newOpen} onClose={() => setNewOpen(false)} />
      <CrmExtraDrawer open={drawerOpen} customer={selected} onClose={() => setDrawerOpen(false)} />

      {/* Aksiyon şeridi */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900 dark:hover:text-gray-50"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="size-4" strokeWidth={2} aria-hidden />
            Yeni müşteri
          </span>
        </button>
        <button
          type="button"
          className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900 dark:hover:text-gray-50"
        >
          <span className="inline-flex items-center gap-2">
            <UserPlus className="size-4" strokeWidth={2} aria-hidden />
            Yeni kontak
          </span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('quote')}
          className="rounded-full bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
        >
          <span className="inline-flex items-center gap-2">
            <FileText className="size-4" strokeWidth={2} aria-hidden />
            Teklif oluştur
          </span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('project')}
          className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 active:shadow-neo-press dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900 dark:hover:text-gray-50"
        >
          <span className="inline-flex items-center gap-2">
            <Link2 className="size-4" strokeWidth={2} aria-hidden />
            Proje bağla
          </span>
        </button>
        <button
          type="button"
          onClick={() => setEmptyDemo((e) => !e)}
          className="ml-auto rounded-full border border-gray-300/80 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-600/80 dark:bg-gray-950/90 dark:text-gray-300 dark:hover:bg-gray-900/90"
        >
          {emptyDemo ? 'Örnek listeyi göster' : 'Boş durum demosu'}
        </button>
      </div>

      {/* Filtre — inset well */}
      <div className="gm-glass-filter-strip rounded-2xl bg-gray-100 p-3 shadow-neo-in md:p-4 dark:bg-gray-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Ara</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ünvan, kod, vergi no, şehir, ilgili kişi…"
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 shadow-neo-in placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
          </label>
          <label className="min-w-[140px]">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Durum</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Tümü</option>
              <option value="aktif">Aktif</option>
              <option value="beklemede">Beklemede</option>
              <option value="pasif">Pasif</option>
              <option value="potansiyel">Potansiyel</option>
            </select>
          </label>
          <label className="min-w-[140px]">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Sektör (P1)</span>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-800 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="all">Tümü</option>
              <option value="Konut">Konut</option>
              <option value="Altyapı">Altyapı</option>
              <option value="Endüstriyel">Endüstriyel</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-offset-gray-900"
            onClick={() => {
              setSearch('')
              setFilterStatus('all')
              setFilterSector('all')
            }}
          >
            Sıfırla
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-gray-50 px-3 py-2.5 shadow-neo-in dark:bg-gray-950/60 sm:flex-row sm:items-center sm:justify-between">
          <NeoSwitch
            id={filterId}
            label={`Fabrika bağlamına göre daralt (${selectedCodes.join(', ')})`}
            checked={filterByFactoryContext}
            onChange={setFilterByFactoryContext}
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            P1 — Üst çubuktaki fabrika ile müşteri fabrika listesinin kesişimi (mock).
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl bg-gray-100 p-8 shadow-neo-in dark:bg-gray-900">
          <div
            className="flex h-36 w-full max-w-sm items-center justify-center rounded-2xl bg-gray-50 text-sm font-medium text-gray-600 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300"
            aria-hidden
          >
            Henüz müşteri yok — yer tutucu alan
          </div>
          <p className="max-w-md text-center text-sm text-gray-600 dark:text-gray-300">
            İlk müşterinizi ekleyerek CRM akışını başlatın. Liste ve detay paneli burada görünecek.
          </p>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="rounded-xl bg-gray-800 px-5 py-3 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white dark:ring-offset-gray-900"
          >
            Yeni müşteri
          </button>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <section
            className="gm-glass-list-panel flex min-h-[320px] flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm lg:col-span-5 xl:col-span-5 dark:bg-gray-900"
            aria-labelledby="crm-list-heading"
          >
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2 id="crm-list-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Müşteriler
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-neo-out-sm hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-gray-50"
              >
                <Columns2 className="size-3.5" aria-hidden />
                Ek alanlar
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200/60 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-950/40">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200/90 bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-700/90 dark:bg-gray-900/90 dark:text-gray-300">
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
                        className={`cursor-pointer border-b border-gray-200/70 transition dark:border-gray-700/70 ${
                          i % 2 === 1 ? 'bg-gray-50/80 dark:bg-gray-950/50' : ''
                        } ${active ? 'bg-gray-100 ring-1 ring-inset ring-gray-300/80 dark:bg-gray-900 dark:ring-gray-600/80' : 'hover:bg-gray-100 hover:shadow-sm dark:hover:bg-gray-900/80'}`}
                        onClick={() => {
                          setSelectedId(row.id)
                          setDetailTab('genel')
                        }}
                      >
                        <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-50">{row.name}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-300">{row.taxId}</td>
                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{row.city}</td>
                        <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{row.contactPerson}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">
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
            className="gm-glass-detail-panel flex min-h-[320px] flex-col rounded-2xl bg-gray-100 p-4 shadow-neo-out lg:col-span-7 xl:col-span-7 dark:bg-gray-900"
            aria-label="Müşteri detayı"
          >
            {selected ? (
              <>
                <div className="mb-3 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{selected.name}</h2>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                    {selected.code} · {selected.city} · Satış: {selected.owner}
                  </p>
                  {selected.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-200/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">· P1 etiket (mock)</span>
                    </div>
                  ) : null}
                </div>

                <div
                  className="mb-4 flex flex-wrap gap-1 rounded-full bg-gray-100 p-1 shadow-neo-in dark:bg-gray-900"
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
                            ? 'bg-gray-100 text-gray-900 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-50'
                            : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">
                  {detailTab === 'genel' ? (
                    <div className="space-y-4">
                      <dl className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/90">
                          <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Vergi no</dt>
                          <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.taxId}</dd>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/90">
                          <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Kayıt tarihi</dt>
                          <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.createdAt}</dd>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/90">
                          <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sektör</dt>
                          <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.sector}</dd>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 shadow-neo-in dark:bg-gray-950/90">
                          <dt className="text-xs font-semibold text-gray-600 dark:text-gray-300">İlgili kişi</dt>
                          <dd className="mt-1 font-medium text-gray-900 dark:text-gray-50">{selected.contactPerson}</dd>
                        </div>
                      </dl>
                      <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                          Son aktivite
                        </h3>
                        <div className="rounded-xl bg-gray-100 p-3 shadow-neo-in dark:bg-gray-900">
                          <ol className="space-y-3 border-l-2 border-gray-300/90 pl-4 dark:border-gray-600/90">
                            <li className="relative">
                              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-gray-50 ring-4 ring-gray-100 dark:bg-gray-950 dark:ring-gray-900" />
                              <p className="font-medium text-gray-900 dark:text-gray-50">Teklif taslağı güncellendi</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Bugün 09:14 · Teklif #T-441</p>
                            </li>
                            <li className="relative">
                              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-gray-400 ring-4 ring-gray-100 dark:ring-gray-800" />
                              <p className="font-medium text-gray-900 dark:text-gray-50">Arama kaydı</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Dün · 12 dk</p>
                            </li>
                            <li className="relative">
                              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-gray-400 ring-4 ring-gray-100 dark:ring-gray-800" />
                              <p className="font-medium text-gray-900 dark:text-gray-50">Toplantı notu eklendi</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">15 Mar · {selected.owner}</p>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {detailTab === 'projeler' ? (
                    <div className="overflow-x-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/90">
                      <table className="w-full min-w-[400px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200/90 text-xs uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            <th className="px-3 py-2 font-semibold">Proje</th>
                            <th className="px-3 py-2 font-semibold">Aşama</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.projeler.map((p) => (
                            <tr key={p.id} className="border-b border-gray-200/80 dark:border-gray-700/80">
                              <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-50">{p.name}</td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{p.phase}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="border-t border-gray-200/90 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        Mock: 2 satır (mvp-05).
                      </p>
                    </div>
                  ) : null}

                  {detailTab === 'teklifler' ? (
                    <div className="space-y-2">
                      <div className="overflow-x-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/90">
                        <table className="w-full min-w-[520px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200/90 text-xs uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
                              <th className="px-3 py-2 font-semibold">Teklif no</th>
                              <th className="px-3 py-2 font-semibold">Tarih</th>
                              <th className="px-3 py-2 font-semibold">Tutar</th>
                              <th className="px-3 py-2 font-semibold">Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.teklifler.map((t) => (
                              <tr key={t.id} className="border-b border-gray-200/80 dark:border-gray-700/80">
                                <td className="px-3 py-2.5 font-mono text-xs text-gray-800 dark:text-gray-100">{t.no}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-gray-600 dark:text-gray-300">{t.date}</td>
                                <td className="px-3 py-2.5 tabular-nums text-gray-800 dark:text-gray-100">{t.amount}</td>
                                <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{t.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Mock: 3 satır · Teklif modülü: </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('quote')}
                        className="text-sm font-semibold text-gray-900 underline-offset-2 hover:underline dark:text-gray-50"
                      >
                        Teklif oluştur (kısayol)
                      </button>
                    </div>
                  ) : null}

                  {detailTab === 'notlar' ? (
                    <div className="rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/90">
                      <div className="flex items-start gap-2">
                        <StickyNote className="size-5 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden />
                        <p className="text-gray-700 dark:text-gray-200">{selected.notes || 'Not yok.'}</p>
                      </div>
                    </div>
                  ) : null}

                  {detailTab === 'dokumanlar' ? (
                    <div className="rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-950/90">
                      {selected.dokumanlar.length === 0 ? (
                        <p className="p-4 text-gray-600 dark:text-gray-300">Henüz doküman yok (mock).</p>
                      ) : (
                        <ul className="divide-y divide-gray-200/90 dark:divide-gray-700/90">
                          {selected.dokumanlar.map((d) => (
                            <li
                              key={d.id}
                              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                            >
                              <span className="font-medium text-gray-900 dark:text-gray-50">{d.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {d.size} · {d.date}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="border-t border-gray-200/90 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        P1 — Dosya satırları (indirme yok, prototip).
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-gray-300/90 bg-gray-100/80 p-3 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-400">
                  <GitMerge className="size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
                  <p>
                    <strong className="text-gray-800 dark:text-gray-200">P2 — Müşteri birleştirme (wireframe):</strong>{' '}
                    Tehlikeli akış; kaynak kayıtlar seçilir, hedef müşteri ve çakışan vergi no uyarısı, çift kayıtlar
                    arşivlenir. Üretimde ayrı onay ve denetim izi gerekir — burada yalnızca not.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">Listeden bir müşteri seçin.</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
