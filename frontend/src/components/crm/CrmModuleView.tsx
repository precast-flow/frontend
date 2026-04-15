import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Link2, Plus, UserPlus } from 'lucide-react'
import { crmCustomers, statusLabel, type CrmCustomer } from '../../data/crmCustomers'
import { useFactoryContext } from '../../context/FactoryContext'
import { CrmNewCustomerModal } from './CrmNewCustomerModal'
import { NeoSwitch } from '../NeoSwitch'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type Props = {
  onNavigate: (moduleId: string) => void
}

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
  const navigate = useNavigate()
  const { selectedCodes } = useFactoryContext()
  const filterId = 'crm-fabrika-filtre'

  const [newOpen, setNewOpen] = useState(false)
  const [emptyDemo, setEmptyDemo] = useState(false)

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

  const panelClass = 'okan-liquid-panel'
  const nestedPanelClass = 'okan-liquid-panel-nested'

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <CrmNewCustomerModal open={newOpen} onClose={() => setNewOpen(false)} />

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
              Ilk musteriyi ekleyerek CRM akisina baslayin. Musteri listesi burada gorunecek.
            </p>
            <button type="button" onClick={() => setNewOpen(true)} className="okan-liquid-btn-primary px-5 py-3 text-sm font-semibold">
              Yeni musteri
            </button>
          </div>
        ) : (
          <section className={`${panelClass} flex min-h-0 flex-1 flex-col p-3`} aria-labelledby="crm-list-heading">
            <div className="mb-2 px-1">
              <h2 id="crm-list-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Müşteriler
              </h2>
            </div>
            <div className={`${nestedPanelClass} min-h-0 flex-1 overflow-auto`}>
              <table className="w-full min-w-[1280px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="okan-liquid-table-thead text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:text-xs">
                    <th className="min-w-[9rem] px-2 py-2 sm:px-3 sm:py-2.5">Ünvan</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Kod</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Sektör</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Vergi no</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Şehir</th>
                    <th className="min-w-[6.5rem] px-2 py-2 sm:px-3 sm:py-2.5">İlgili kişi</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Son teklif</th>
                    <th className="min-w-[6.5rem] px-2 py-2 sm:px-3 sm:py-2.5">Son aktivite</th>
                    <th className="whitespace-nowrap px-2 py-2 text-right sm:px-3 sm:py-2.5">Açık teklif</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Durum</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Kayıt</th>
                    <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">Satış</th>
                    <th className="min-w-[7rem] px-2 py-2 sm:px-3 sm:py-2.5">Etiketler</th>
                    <th className="min-w-[6rem] px-2 py-2 sm:px-3 sm:py-2.5">Fabrikalar</th>
                    <th className="sticky right-0 z-[1] whitespace-nowrap bg-white/40 px-2 py-2 text-right backdrop-blur-sm dark:bg-slate-900/50 sm:px-3 sm:py-2.5">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`okan-liquid-table-row border-b transition ${
                        i % 2 === 1 ? 'bg-white/10 dark:bg-white/5' : ''
                      } hover:bg-white/20 dark:hover:bg-white/10`}
                    >
                      <td className="max-w-[14rem] px-2 py-2 font-medium text-slate-900 dark:text-slate-50 sm:px-3 sm:py-2.5">
                        <span className="line-clamp-2 sm:line-clamp-none">{row.name}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.code}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-slate-700 dark:text-slate-200 sm:px-3 sm:py-2.5">
                        {row.sector}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.taxId}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-slate-700 dark:text-slate-200 sm:px-3 sm:py-2.5">
                        {row.city}
                      </td>
                      <td className="px-2 py-2 text-slate-700 dark:text-slate-200 sm:px-3 sm:py-2.5">{row.contactPerson}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-[11px] text-slate-600 dark:text-slate-400 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.lastQuoteDate}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-[11px] text-slate-600 dark:text-slate-400 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.lastActivity}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-slate-700 dark:text-slate-200 sm:px-3 sm:py-2.5">
                        {row.openQuotes}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">
                        <span className={statusPill(row.status)}>{statusLabel(row.status)}</span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-[11px] text-slate-600 dark:text-slate-400 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.createdAt}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-slate-700 dark:text-slate-200 sm:px-3 sm:py-2.5">
                        {row.owner}
                      </td>
                      <td className="max-w-[10rem] px-2 py-2 text-[11px] text-slate-600 dark:text-slate-300 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.tags.length ? row.tags.join(', ') : '—'}
                      </td>
                      <td className="max-w-[9rem] px-2 py-2 text-[11px] text-slate-600 dark:text-slate-300 sm:px-3 sm:py-2.5 sm:text-xs">
                        {row.factories.join(', ')}
                      </td>
                      <td className="sticky right-0 z-[1] whitespace-nowrap bg-white/40 px-2 py-2 text-right backdrop-blur-sm dark:bg-slate-900/50 sm:px-3 sm:py-2.5">
                        <button
                          type="button"
                          className="okan-liquid-btn-secondary px-2.5 py-1.5 text-[11px] font-semibold sm:text-xs"
                          onClick={() => navigate(`/musteri-detay/${row.id}`)}
                        >
                          Müşteri detayını gör
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
