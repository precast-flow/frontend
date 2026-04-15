import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { projectManagementActivitiesMock, projectManagementCardsMock } from '../../data/projectManagementCardsMock'
import '../muhendislikOkan/engineeringOkanLiquid.css'

type ProjectDetailTabId =
  | 'bilgi'
  | 'ozet'
  | 'kisiler'
  | 'aktiviteler'
  | 'fazlar'
  | 'mobilizasyonlar'
  | 'dokumanlar'
  | 'notlar'
  | 'ekler'
  | 'iscilik'
  | 'parca-kodlari'
  | 'kaliplar'
  | 'kalite-kontrol'
  | 'yuklemeler'
  | 'montaj-sirasi'
  | 'nakliye-fiyatlari'
  | 'sozlesme'

const PROJECT_DETAIL_TABS: { id: ProjectDetailTabId; label: string }[] = [
  { id: 'bilgi', label: 'Bilgi' },
  { id: 'ozet', label: 'Ozet' },
  { id: 'kisiler', label: 'Kisiler' },
  { id: 'aktiviteler', label: 'Aktiviteler' },
  { id: 'fazlar', label: 'Fazlar' },
  { id: 'mobilizasyonlar', label: 'Mobilizasyonlar' },
  { id: 'dokumanlar', label: 'Dokumanlar' },
  { id: 'notlar', label: 'Notlar' },
  { id: 'ekler', label: 'Ekler' },
  { id: 'iscilik', label: 'Iscilik' },
  { id: 'parca-kodlari', label: 'Parca Kodlari' },
  { id: 'kaliplar', label: 'Kaliplar' },
  { id: 'kalite-kontrol', label: 'Kalite Kontrol' },
  { id: 'yuklemeler', label: 'Yuklemeler' },
  { id: 'montaj-sirasi', label: 'Montaj Sirasi' },
  { id: 'nakliye-fiyatlari', label: 'Nakliye Fiyatlari' },
  { id: 'sozlesme', label: 'Sozlesme' },
]

export function ProjectManagementDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams()
  const [activeTab, setActiveTab] = useState<ProjectDetailTabId>('bilgi')

  const cameFromList = Boolean((location.state as { fromProjectList?: boolean } | null)?.fromProjectList)
  if (!cameFromList) return <Navigate to="/proje" replace />

  const project = projectManagementCardsMock.find((x) => x.id === projectId)
  if (!project) return <Navigate to="/proje" replace />

  const activities = projectManagementActivitiesMock.filter((a) => a.projectId === project.id)
  const panelClass = 'okan-liquid-panel'
  const nestedPanelClass = 'okan-liquid-panel-nested'
  const phaseRows = useMemo(
    () => [
      { id: 'f1', name: 'Proje Baslatma', status: 'Tamamlandi', progress: 100, due: '03.04.2026' },
      { id: 'f2', name: 'Tasarim ve Koordinasyon', status: 'Devam', progress: 78, due: '17.04.2026' },
      { id: 'f3', name: 'Uretim Hazirlik', status: 'Devam', progress: 56, due: '28.04.2026' },
      { id: 'f4', name: 'Sevkiyat ve Montaj', status: 'Planlandi', progress: 12, due: '12.05.2026' },
    ],
    [],
  )

  const mobilizationRows = useMemo(
    () => [
      { id: 'm1', title: 'Santiye ofis kurulumu', team: 'Saha', at: '15.04.2026', state: 'Planli' },
      { id: 'm2', title: 'Kule vinc kurulumu', team: 'Mekanik', at: '18.04.2026', state: 'Onay bekliyor' },
      { id: 'm3', title: 'Elektrik gecici hat', team: 'Elektrik', at: '16.04.2026', state: 'Tamamlandi' },
    ],
    [],
  )

  const docsRows = useMemo(
    () => [
      { id: 'd1', file: 'Sozlesme_RevA.pdf', category: 'Sozlesme', rev: 'A', date: '10.04.2026' },
      { id: 'd2', file: 'Vaziyet_Plani.ifc', category: 'Model', rev: 'C', date: '14.04.2026' },
      { id: 'd3', file: 'Kalite_Plani.xlsx', category: 'Kalite', rev: 'B', date: '12.04.2026' },
    ],
    [],
  )

  const notesRows = useMemo(
    () => [
      'Musteri toplantisi sonrasi montaj onceligi aks 3-4 icin degisti.',
      'Sevkiyat kapasite limitine gore haftalik parti 4 TIR ile sinirli.',
      'Kalite kontrol checklistinde ankraj adimi zorunluya alindi.',
    ],
    [],
  )

  const laborRows = useMemo(
    () => [
      { id: 'i1', scope: 'Kaba montaj', unit: 'adam/saat', qty: 240, unitPrice: 18 },
      { id: 'i2', scope: 'Demir baglama', unit: 'adam/saat', qty: 160, unitPrice: 21 },
      { id: 'i3', scope: 'Yuzey duzeltme', unit: 'adam/saat', qty: 96, unitPrice: 16 },
    ],
    [],
  )

  const partCodeRows = useMemo(
    () => [
      { id: 'p1', code: 'KL-401', family: 'Kolon', rev: 'R2', qty: 42 },
      { id: 'p2', code: 'KR-208', family: 'Kiris', rev: 'R1', qty: 68 },
      { id: 'p3', code: 'PN-090', family: 'Panel', rev: 'R3', qty: 113 },
    ],
    [],
  )

  const moldRows = useMemo(
    () => [
      { id: 'k1', mold: 'K-01', status: 'Dolu', currentPart: 'PN-090', shift: 'Sabah' },
      { id: 'k2', mold: 'K-07', status: 'Bos', currentPart: '-', shift: 'Aksam' },
      { id: 'k3', mold: 'K-11', status: 'Bakim', currentPart: '-', shift: 'Gece' },
    ],
    [],
  )

  const qcRows = useMemo(
    () => [
      { id: 'q1', check: 'Boyut toleransi', result: 'Uygun', owner: 'QC-01', at: '14.04.2026 09:10' },
      { id: 'q2', check: 'Yuzey kalite', result: 'Uyarili', owner: 'QC-03', at: '14.04.2026 11:05' },
      { id: 'q3', check: 'Ankraj kontrolu', result: 'Uygun', owner: 'QC-02', at: '13.04.2026 17:20' },
    ],
    [],
  )

  const loadingRows = useMemo(
    () => [
      { id: 'y1', loadNo: 'YUK-3201', truck: '34 ABC 901', status: 'Hazir', eta: '16.04.2026 08:30' },
      { id: 'y2', loadNo: 'YUK-3202', truck: '06 FDE 224', status: 'Planli', eta: '16.04.2026 13:10' },
      { id: 'y3', loadNo: 'YUK-3203', truck: '35 KLM 510', status: 'Yukleniyor', eta: '15.04.2026 17:20' },
    ],
    [],
  )

  const assemblyRows = useMemo(
    () => [
      { id: 's1', seq: 1, item: 'Aks A kolonlar', date: '17.04.2026' },
      { id: 's2', seq: 2, item: 'Aks A-B kirisler', date: '18.04.2026' },
      { id: 's3', seq: 3, item: 'Dis cephe panelleri', date: '20.04.2026' },
    ],
    [],
  )

  const freightRows = useMemo(
    () => [
      { id: 'n1', route: 'Fabrika -> Santiye 1', type: 'Lowbed', amount: 1450, curr: 'EUR' },
      { id: 'n2', route: 'Fabrika -> Santiye 2', type: 'Tenteli', amount: 980, curr: 'EUR' },
      { id: 'n3', route: 'Fabrika -> Santiye 3', type: 'Acik kasa', amount: 860, curr: 'EUR' },
    ],
    [],
  )

  const peopleRows = useMemo(
    () => [
      { id: 'u1', role: 'Proje Muduru', name: 'Selin Guler', contact: 'selin.g@mock.com' },
      { id: 'u2', role: 'Saha Sefi', name: 'Murat Kaya', contact: 'murat.k@mock.com' },
      { id: 'u3', role: 'Kalite Sorumlusu', name: 'Ayse Yildiz', contact: 'ayse.y@mock.com' },
    ],
    [],
  )

  const summaryRows = useMemo(
    () => [
      { label: 'Genel ilerleme', value: '%71' },
      { label: 'Acik risk', value: '3' },
      { label: 'Acik aksiyon', value: '8' },
      { label: 'Son revizyon', value: 'R3' },
    ],
    [],
  )

  return (
    <div className="okan-liquid-root flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--c" />
      </div>
      <div className="okan-liquid-content flex min-h-0 flex-1 flex-col gap-4 p-1">
        <div className="mt-2 px-2 sm:mt-3 sm:px-3">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex w-fit max-w-full items-center gap-1 text-sm text-slate-700 dark:text-slate-200"
          >
            <button
              type="button"
              onClick={() => navigate('/proje')}
              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
            >
              Proje Yonetimi
            </button>
            <ChevronRight className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
            <span className="max-w-[34ch] truncate rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 dark:text-slate-50">
              {project.name}
            </span>
          </nav>
        </div>

        <section className={`${panelClass} p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{project.code}</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{project.name}</h1>
            </div>
            <button
              type="button"
              onClick={() => navigate('/proje')}
              className="okan-liquid-btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Listeye don
            </button>
          </div>
        </section>

        <div
          className="okan-liquid-pill-track flex gap-1 overflow-x-auto rounded-full p-1"
          role="tablist"
          aria-label="Proje detay sekmeleri"
        >
          {PROJECT_DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                activeTab === tab.id
                  ? 'okan-liquid-pill-active text-slate-900 dark:text-slate-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className={`${panelClass} min-h-0 flex-1 p-4`}>
          {activeTab === 'bilgi' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Musteri</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{project.customer}</p>
              </div>
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Sorumlu</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{project.owner}</p>
              </div>
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Baslangic</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{project.startDate}</p>
              </div>
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Termin</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{project.dueDate}</p>
              </div>
            </div>
          ) : null}

          {activeTab === 'ozet' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summaryRows.map((r) => (
                <div key={r.label} className={`${nestedPanelClass} p-3`}>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{r.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{r.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'kisiler' ? (
            <div className="space-y-2">
              {peopleRows.map((p) => (
                <div key={p.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{p.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{p.role}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{p.contact}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'aktiviteler' ? (
            <div className="space-y-2">
              {activities.length ? (
                activities.map((a) => (
                  <div key={a.id} className={`${nestedPanelClass} p-3 text-sm text-slate-700 dark:text-slate-200`}>
                    <span className="mr-2 text-xs text-slate-500 dark:text-slate-400">{a.at}</span>
                    {a.text}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">Aktivite yok.</p>
              )}
            </div>
          ) : null}

          {activeTab === 'fazlar' ? (
            <div className="space-y-2">
              {phaseRows.map((f) => (
                <div key={f.id} className={`${nestedPanelClass} p-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{f.name}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{f.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Termin: {f.due}</p>
                  <div className="mt-2 h-2 rounded-full bg-white/20">
                    <div className="h-2 rounded-full bg-indigo-500/70" style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'mobilizasyonlar' ? (
            <div className="space-y-2">
              {mobilizationRows.map((m) => (
                <div key={m.id} className={`${nestedPanelClass} p-3`}>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{m.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {m.team} · {m.at} · {m.state}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'dokumanlar' ? (
            <div className="space-y-2">
              {docsRows.map((d) => (
                <div key={d.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{d.file}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {d.category} · Rev {d.rev} · {d.date}
                    </p>
                  </div>
                  <button type="button" className="okan-liquid-btn-secondary px-3 py-1.5 text-xs font-semibold">
                    Goruntule
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'notlar' ? (
            <div className="space-y-2">
              {notesRows.map((n) => (
                <div key={n} className={`${nestedPanelClass} p-3 text-sm text-slate-700 dark:text-slate-200`}>
                  {n}
                </div>
              ))}
              <textarea
                rows={3}
                placeholder="Yeni not ekle... (mock)"
                className="okan-liquid-input w-full resize-none border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none"
              />
            </div>
          ) : null}

          {activeTab === 'ekler' ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {['Saha_fotograf_01.jpg', 'Haftalik_rapor.pdf', 'Kontrol_listesi.xlsx'].map((e) => (
                <div key={e} className={`${nestedPanelClass} p-3`}>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{e}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Ek dosya (mock)</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'iscilik' ? (
            <div className="space-y-2">
              {laborRows.map((i) => (
                <div key={i.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{i.scope}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {i.qty} {i.unit} · Birim: {i.unitPrice} EUR
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{i.qty * i.unitPrice} EUR</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'parca-kodlari' ? (
            <div className="space-y-2">
              {partCodeRows.map((p) => (
                <div key={p.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">{p.code}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{p.family} · Rev {p.rev}</p>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">Adet: {p.qty}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'kaliplar' ? (
            <div className="space-y-2">
              {moldRows.map((k) => (
                <div key={k.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{k.mold}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Durum: {k.status} · Vardiya: {k.shift}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{k.currentPart}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'kalite-kontrol' ? (
            <div className="space-y-2">
              {qcRows.map((q) => (
                <div key={q.id} className={`${nestedPanelClass} p-3`}>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{q.check}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Sonuc: {q.result} · {q.owner} · {q.at}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'yuklemeler' ? (
            <div className="space-y-2">
              {loadingRows.map((y) => (
                <div key={y.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{y.loadNo}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {y.truck} · ETA {y.eta}
                    </p>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{y.status}</span>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'montaj-sirasi' ? (
            <div className="space-y-2">
              {assemblyRows.map((s) => (
                <div key={s.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <p className="text-sm text-slate-800 dark:text-slate-100">
                    <span className="mr-2 font-semibold">#{s.seq}</span>
                    {s.item}
                  </p>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{s.date}</span>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'nakliye-fiyatlari' ? (
            <div className="space-y-2">
              {freightRows.map((n) => (
                <div key={n.id} className={`${nestedPanelClass} flex items-center justify-between gap-3 p-3`}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{n.route}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{n.type}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {n.amount} {n.curr}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'sozlesme' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Sozlesme No</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">SZL-2026-104</p>
              </div>
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Tip</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Birim Fiyat + Eskalasyon</p>
              </div>
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Bedel</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">1.240.000 EUR</p>
              </div>
              <div className={`${nestedPanelClass} p-3`}>
                <p className="text-xs text-slate-600 dark:text-slate-300">Durum</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Yururlukte</p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
