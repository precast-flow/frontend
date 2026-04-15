import { GitMerge, Globe, Mail, MapPin, Phone, StickyNote, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { crmCustomers, statusLabel, type CrmCustomer } from '../../data/crmCustomers'
import { useI18n } from '../../i18n/I18nProvider'
import '../muhendislikOkan/engineeringOkanLiquid.css'

const detailTabs = [
  { id: 'genel', label: 'Genel' },
  { id: 'iletisim', label: 'İletişim' },
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

export function CrmCustomerDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { customerId } = useParams<{ customerId: string }>()
  const [detailTab, setDetailTab] = useState<DetailTabId>('genel')

  const customer = useMemo(() => crmCustomers.find((c) => c.id === customerId) ?? null, [customerId])

  if (!customer) {
    return <Navigate to="/crm" replace />
  }

  const panelClass = 'okan-liquid-panel'
  const nestedPanelClass = 'okan-liquid-panel-nested'
  const crmTitle = t('nav.crm')

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
      </div>

      <div className="okan-liquid-content relative z-[1] flex min-h-0 flex-1 flex-col gap-4">
        <nav
          className="rounded-2xl border border-white/25 bg-white/25 px-4 py-2 text-xs text-slate-700 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-slate-200"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50"
              >
                Ana Sayfa
              </button>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <button
                type="button"
                onClick={() => navigate('/crm')}
                className="font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-50"
              >
                {crmTitle}
              </button>
            </li>
            <li className="text-slate-400">/</li>
            <li className="max-w-[min(100%,28rem)] truncate font-semibold text-slate-900 dark:text-slate-50" title={customer.name}>
              Müşteri detayı · {customer.name}
            </li>
          </ol>
        </nav>

        <section className={`${panelClass} flex min-h-0 flex-1 flex-col p-4`} aria-label="Müşteri detayı">
          <div className="mb-3 border-b border-white/20 pb-3 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{customer.name}</h1>
              <span className={statusPill(customer.status)}>{statusLabel(customer.status)}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
              {customer.code} · {customer.city} · Satış: {customer.owner}
            </p>
            {customer.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
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
            {detailTabs.map((tab) => {
              const on = detailTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setDetailTab(tab.id)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                    on
                      ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                >
                  {tab.label}
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
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.taxId}</dd>
                  </div>
                  <div className={`${nestedPanelClass} p-3`}>
                    <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kayit tarihi</dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.createdAt}</dd>
                  </div>
                  <div className={`${nestedPanelClass} p-3`}>
                    <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sektor</dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.sector}</dd>
                  </div>
                  <div className={`${nestedPanelClass} p-3`}>
                    <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Ilgili kisi</dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.contactPerson}</dd>
                  </div>
                </dl>
                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Son aktivite
                  </h2>
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
                        <p className="text-xs text-slate-600 dark:text-slate-300">15 Mar · {customer.owner}</p>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : null}

            {detailTab === 'iletisim' ? (
              <div className="space-y-4">
                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Şirket iletişimi
                  </h2>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div className={`${nestedPanelClass} flex gap-3 p-3`}>
                      <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                      <div className="min-w-0">
                        <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Şehir</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.city}</dd>
                        {customer.iletisim.adresNotu ? (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{customer.iletisim.adresNotu}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className={`${nestedPanelClass} flex gap-3 p-3`}>
                      <Phone className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                      <div>
                        <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sabit hat</dt>
                        <dd className="mt-1">
                          <a
                            href={`tel:${customer.iletisim.sabitHat.replace(/\s/g, '')}`}
                            className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                          >
                            {customer.iletisim.sabitHat}
                          </a>
                        </dd>
                      </div>
                    </div>
                    {customer.iletisim.faks ? (
                      <div className={`${nestedPanelClass} flex gap-3 p-3`}>
                        <Phone className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                        <div>
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Faks</dt>
                          <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.iletisim.faks}</dd>
                        </div>
                      </div>
                    ) : null}
                    <div className={`${nestedPanelClass} flex gap-3 p-3`}>
                      <Mail className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                      <div className="min-w-0">
                        <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Genel e-posta</dt>
                        <dd className="mt-1">
                          <a
                            href={`mailto:${customer.iletisim.infoEmail}`}
                            className="break-all font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                          >
                            {customer.iletisim.infoEmail}
                          </a>
                        </dd>
                      </div>
                    </div>
                    {customer.iletisim.web ? (
                      <div className={`${nestedPanelClass} flex gap-3 p-3 sm:col-span-2`}>
                        <Globe className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                        <div className="min-w-0">
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Web</dt>
                          <dd className="mt-1">
                            <a
                              href={`https://${customer.iletisim.web.replace(/^https?:\/\//, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-50"
                            >
                              {customer.iletisim.web}
                            </a>
                          </dd>
                        </div>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    İlgili kişiler
                  </h2>
                  <div className={`${nestedPanelClass} overflow-x-auto`}>
                    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="okan-liquid-table-thead text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                          <th className="px-3 py-2.5">Ad soyad</th>
                          <th className="px-3 py-2.5">Görev</th>
                          <th className="px-3 py-2.5">Cep</th>
                          <th className="px-3 py-2.5">E-posta</th>
                          <th className="whitespace-nowrap px-3 py-2.5 text-center">Not</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.iletisim.kisiler.map((k, idx) => (
                          <tr
                            key={k.id}
                            className={`okan-liquid-table-row border-b ${
                              idx % 2 === 1 ? 'bg-white/10 dark:bg-white/5' : ''
                            }`}
                          >
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-2 font-medium text-slate-900 dark:text-slate-50">
                                <User className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                                {k.adSoyad}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{k.gorev}</td>
                            <td className="whitespace-nowrap px-3 py-2.5">
                              <a
                                href={`tel:${k.cep.replace(/\s/g, '')}`}
                                className="text-slate-800 underline-offset-2 hover:underline dark:text-slate-100"
                              >
                                {k.cep}
                              </a>
                            </td>
                            <td className="max-w-[14rem] px-3 py-2.5">
                              <a
                                href={`mailto:${k.email}`}
                                className="break-all text-slate-800 underline-offset-2 hover:underline dark:text-slate-100"
                              >
                                {k.email}
                              </a>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {k.birincil ? (
                                <span className="inline-flex rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-900 dark:bg-sky-400/15 dark:text-sky-100">
                                  Birincil
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Liste CRM mock verisidir; ERP senkronu yoktur.
                  </p>
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
                    {customer.projeler.map((p) => (
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
                      {customer.teklifler.map((t) => (
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
                  onClick={() => navigate('/teklif')}
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
                  <p className="text-slate-700 dark:text-slate-200">{customer.notes || 'Not yok.'}</p>
                </div>
              </div>
            ) : null}

            {detailTab === 'dokumanlar' ? (
              <div className={`${nestedPanelClass}`}>
                {customer.dokumanlar.length === 0 ? (
                  <p className="p-4 text-slate-600 dark:text-slate-300">Henuz dokuman yok (mock).</p>
                ) : (
                  <ul className="divide-y divide-white/20 dark:divide-white/10">
                    {customer.dokumanlar.map((d) => (
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
              Tehlikeli akış; kaynak kayıtlar seçilir, hedef müşteri ve çakışan vergi no uyarısı, çift kayıtlar arşivlenir.
              Üretimde ayrı onay ve denetim izi gerekir — burada yalnızca not.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
