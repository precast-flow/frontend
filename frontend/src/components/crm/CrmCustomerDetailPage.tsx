import { ChevronRight, Globe, Mail, MapPin, Phone, StickyNote, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { crmCustomers } from '../../data/crmCustomers'
import { useI18n } from '../../i18n/I18nProvider'
import { CustomerProjectsCommercialPanel } from './CustomerProjectsCommercialPanel'
import { DocumentExplorerSplit } from '../shared/DocumentExplorerSplit'
import type { ExplorerDocument } from '../shared/documentExplorerTypes'
import { QuoteModuleView } from '../teklif/QuoteModuleView'
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

export function CrmCustomerDetailPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId } = useParams<{ customerId: string }>()
  const [detailTab, setDetailTab] = useState<DetailTabId>('genel')

  const cameFromList = Boolean((location.state as { fromCrmList?: boolean } | null)?.fromCrmList)

  const customer = useMemo(() => crmCustomers.find((c) => c.id === customerId) ?? null, [customerId])

  const explorerDocs: ExplorerDocument[] = useMemo(
    () =>
      (customer?.dokumanlar ?? []).map((d) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        size: d.size,
        ext: d.ext,
        uploadedAt: d.uploadedAt,
        uploadedBy: d.uploadedBy,
        revision: d.revision,
        note: d.note,
        previewUrl: d.previewUrl,
      })),
    [customer?.dokumanlar],
  )

  const docPersistKey = `crm:detail:${customerId ?? 'unknown'}:docs`

  if (!customer) {
    return <Navigate to="/crm" replace />
  }

  if (!cameFromList) {
    return <Navigate to="/crm" replace />
  }

  const tabScrollClass =
    detailTab === 'dokumanlar' || detailTab === 'teklifler' || detailTab === 'projeler'
      ? 'min-h-0 flex-1 flex flex-col overflow-hidden'
      : 'min-h-0 flex-1 overflow-y-auto text-sm text-slate-700 dark:text-slate-200'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.25rem]">
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="px-[0.6875rem] py-1">
          <div className="mb-2 pb-2">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-2xl">
              {customer.name} Müşteri Detayı
            </h1>
          </div>
          <nav aria-label={t('project.breadcrumbAria')} className="mb-0">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link
                  to="/planlama"
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
                >
                  {t('nav.sidebar.section.planning')}
                </Link>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/crm')}
                  className="font-medium text-slate-600 underline-offset-2 transition hover:text-sky-600 hover:underline dark:text-slate-300 dark:hover:text-sky-400"
                >
                  {t('nav.crm')}
                </button>
              </li>
              <li className="flex items-center gap-1" aria-hidden>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </li>
              <li className="max-w-[40ch] truncate font-semibold text-slate-800 dark:text-slate-100" aria-current="page">
                {customer.name} Müşteri Detayı
              </li>
            </ol>
          </nav>
        </div>

        <div className="min-h-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex h-full min-h-0 flex-col gap-3 px-1 sm:px-2">
            <div className="flex shrink-0 gap-1 overflow-x-auto" role="tablist" aria-label="Müşteri detay sekmeleri">
              {detailTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={detailTab === tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                    detailTab === tab.id
                      ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                      : 'border-slate-200/70 bg-white/55 text-slate-600 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={tabScrollClass}>
              {detailTab === 'genel' ? (
                <div className="space-y-4">
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {[
                      ['Vergi no', customer.taxId],
                      ['Kayıt tarihi', customer.createdAt],
                      ['Sektör', customer.sector],
                      ['İlgili kişi', customer.contactPerson],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                        <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <section className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Son aktivite</p>
                    <ol className="mt-4 space-y-3 border-l-2 border-slate-200/60 pl-4 dark:border-slate-600/60">
                      <li className="relative">
                        <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/20 dark:ring-sky-400/20" />
                        <p className="font-medium text-slate-900 dark:text-slate-50">Teklif taslağı güncellendi</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Bugün 09:14 · Teklif #T-441</p>
                      </li>
                      <li className="relative">
                        <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-400 ring-4 ring-slate-400/15 dark:bg-slate-500" />
                        <p className="font-medium text-slate-900 dark:text-slate-50">Arama kaydı</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Dün · 12 dk</p>
                      </li>
                      <li className="relative">
                        <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-400 ring-4 ring-slate-400/15 dark:bg-slate-500" />
                        <p className="font-medium text-slate-900 dark:text-slate-50">Toplantı notu eklendi</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">15 Mar · {customer.owner}</p>
                      </li>
                    </ol>
                  </section>
                </div>
              ) : null}

              {detailTab === 'iletisim' ? (
                <div className="space-y-4">
                  <section>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Şirket iletişimi</h2>
                    <dl className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 flex gap-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                        <div className="min-w-0">
                          <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Şehir</dt>
                          <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.city}</dd>
                          {customer.iletisim.adresNotu ? (
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{customer.iletisim.adresNotu}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 flex gap-3">
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
                        <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 flex gap-3">
                          <Phone className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                          <div>
                            <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">Faks</dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{customer.iletisim.faks}</dd>
                          </div>
                        </div>
                      ) : null}
                      <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 flex gap-3">
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
                        <div className="rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5 flex gap-3 sm:col-span-2">
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
                  </section>

                  <section>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">İlgili kişiler</h2>
                    <div className="overflow-x-auto rounded-xl border border-slate-200/40 bg-white/40 dark:border-white/10 dark:bg-white/5">
                      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200/50 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700/50 dark:text-slate-300">
                            <th className="px-3 py-2.5">Ad soyad</th>
                            <th className="px-3 py-2.5">Görev</th>
                            <th className="px-3 py-2.5">Cep</th>
                            <th className="px-3 py-2.5">E-posta</th>
                            <th className="whitespace-nowrap px-3 py-2.5 text-center">Not</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customer.iletisim.kisiler.map((k, idx) => (
                            <tr key={k.id} className={`border-b border-slate-200/40 dark:border-slate-700/40 ${idx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-900/25' : ''}`}>
                              <td className="px-3 py-2.5">
                                <span className="inline-flex items-center gap-2 font-medium text-slate-900 dark:text-slate-50">
                                  <User className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                                  {k.adSoyad}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{k.gorev}</td>
                              <td className="whitespace-nowrap px-3 py-2.5">
                                <a href={`tel:${k.cep.replace(/\s/g, '')}`} className="text-slate-800 underline-offset-2 hover:underline dark:text-slate-100">
                                  {k.cep}
                                </a>
                              </td>
                              <td className="max-w-[14rem] px-3 py-2.5">
                                <a href={`mailto:${k.email}`} className="break-all text-slate-800 underline-offset-2 hover:underline dark:text-slate-100">
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
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Liste CRM mock verisidir; ERP senkronu yoktur.</p>
                  </section>
                </div>
              ) : null}

              {detailTab === 'projeler' ? <CustomerProjectsCommercialPanel customerId={customer.id} /> : null}

              {detailTab === 'teklifler' ? (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <QuoteModuleView
                    embedded
                    customerName={customer.name}
                    storageKeyPrefix={`crm:detail:${customer.id}:quotes`}
                  />
                </div>
              ) : null}

              {detailTab === 'notlar' ? (
                <div className="space-y-4">
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Notlar</p>
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-slate-200/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
                      <StickyNote className="size-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                      <p className="text-slate-700 dark:text-slate-200">{customer.notes || 'Not yok.'}</p>
                    </div>
                  </section>
                  <textarea
                    rows={3}
                    placeholder="Yeni not ekle... (mock)"
                    className="okan-liquid-input w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
                  />
                </div>
              ) : null}

              {detailTab === 'dokumanlar' ? (
                <DocumentExplorerSplit documents={explorerDocs} persistKey={docPersistKey} listAriaLabel="Müşteri döküman listesi" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
