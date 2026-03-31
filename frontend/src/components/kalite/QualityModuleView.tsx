import { useMemo, useState } from 'react'
import { useFactoryContext } from '../../context/FactoryContext'
import { useProductionQuality } from '../../context/ProductionQualityContext'
import { findFactoryByCode } from '../../data/mockFactories'
import { statusLabel, statusRowClass, type WorkOrder } from '../../data/mesMock'
import { useI18n } from '../../i18n/I18nProvider'
import { QualityDashboardSection } from './QualityDashboardSection'
import { QualityInspectionPanel } from './QualityInspectionPanel'
import { QualityRejectModal } from './QualityRejectModal'
import { QualitySamplesListView } from './QualitySamplesListView'
import { QualitySlumpQuickView } from './QualitySlumpQuickView'
import { QualityCompressiveStrengthView } from './QualityCompressiveStrengthView'
import { QualityTestResultFormView } from './QualityTestResultFormView'
import { QualityLinkPanelView } from './QualityLinkPanelView'
import { QualityReportBuilderView } from './QualityReportBuilderView'
import { QualityPeriodicReportsView } from './QualityPeriodicReportsView'
import { QualityReportArchiveView } from './QualityReportArchiveView'
import { QualityProductionShortcutsView } from './QualityProductionShortcutsView'

type QualityMainTab =
  | 'samples'
  | 'slump'
  | 'compressive'
  | 'testForm'
  | 'links'
  | 'report'
  | 'periodic'
  | 'archive'
  | 'shortcuts'
  | 'overview'

const tabClass = (on: boolean) =>
  [
    'rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
    on
      ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
      : 'bg-gray-100 text-gray-600 shadow-neo-in hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white',
  ].join(' ')

type Lane = 'bekleyen' | 'devam' | 'tamamlandi'

const laneMeta: { lane: Lane; title: string; subtitle: string }[] = [
  { lane: 'bekleyen', title: 'Bekleyen', subtitle: 'Kalite bekliyor' },
  { lane: 'devam', title: 'İncelemede', subtitle: 'Aktif (mock)' },
  { lane: 'tamamlandi', title: 'Tamamlandı', subtitle: 'Son kayıtlar' },
]

type Props = {
  onNavigate: (moduleId: string) => void
}

export function QualityModuleView({ onNavigate }: Props) {
  const { t } = useI18n()
  const { orders, completeQuality, rejectQuality } = useProductionQuality()
  const { factories, isFactoryInScope } = useFactoryContext()

  const [mainTab, setMainTab] = useState<QualityMainTab>('samples')

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const first = orders.find(
      (o) =>
        o.status === 'kalite_bekliyor' && isFactoryInScope(o.factoryCode),
    )
    return first?.id ?? null
  })
  const [rejectOpen, setRejectOpen] = useState(false)

  const bekleyenOrders = useMemo(
    () =>
      orders.filter((o) => o.status === 'kalite_bekliyor' && isFactoryInScope(o.factoryCode)),
    [orders, isFactoryInScope],
  )

  const tamamOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'tamamlandi' && isFactoryInScope(o.factoryCode))
        .slice(0, 4),
    [orders, isFactoryInScope],
  )

  const selected = orders.find((o) => o.id === selectedId) ?? null

  const selectedLane: Lane | null = useMemo(() => {
    if (!selected) return null
    if (selected.status === 'kalite_bekliyor') return 'bekleyen'
    if (selected.status === 'tamamlandi') return 'tamamlandi'
    return null
  }, [selected])

  const formLocked = selected?.status === 'tamamlandi'

  const handleApprove = () => {
    if (!selected || selected.status !== 'kalite_bekliyor') return
    completeQuality(selected.id)
  }

  const handleRejectConfirm = () => {
    if (!selected) return
    rejectQuality(selected.id)
    setRejectOpen(false)
  }

  const laneLists: Record<Lane, WorkOrder[]> = {
    bekleyen: bekleyenOrders,
    devam: [],
    tamamlandi: tamamOrders,
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <QualityRejectModal
        open={rejectOpen}
        inspectionCode={selected?.code ?? ''}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleRejectConfirm}
      />

      <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-1.5 shadow-neo-in dark:bg-gray-950/70">
        <button type="button" className={tabClass(mainTab === 'samples')} onClick={() => setMainTab('samples')}>
          {t('qualityModule.tab.samples')}
        </button>
        <button type="button" className={tabClass(mainTab === 'slump')} onClick={() => setMainTab('slump')}>
          {t('qualityModule.tab.slump')}
        </button>
        <button type="button" className={tabClass(mainTab === 'compressive')} onClick={() => setMainTab('compressive')}>
          {t('qualityModule.tab.compressive')}
        </button>
        <button type="button" className={tabClass(mainTab === 'testForm')} onClick={() => setMainTab('testForm')}>
          {t('qualityModule.tab.testForm')}
        </button>
        <button type="button" className={tabClass(mainTab === 'links')} onClick={() => setMainTab('links')}>
          {t('qualityModule.tab.links')}
        </button>
        <button type="button" className={tabClass(mainTab === 'report')} onClick={() => setMainTab('report')}>
          {t('qualityModule.tab.report')}
        </button>
        <button type="button" className={tabClass(mainTab === 'periodic')} onClick={() => setMainTab('periodic')}>
          {t('qualityModule.tab.periodic')}
        </button>
        <button type="button" className={tabClass(mainTab === 'archive')} onClick={() => setMainTab('archive')}>
          {t('qualityModule.tab.archive')}
        </button>
        <button type="button" className={tabClass(mainTab === 'shortcuts')} onClick={() => setMainTab('shortcuts')}>
          {t('qualityModule.tab.shortcuts')}
        </button>
        <button type="button" className={tabClass(mainTab === 'overview')} onClick={() => setMainTab('overview')}>
          {t('qualityModule.tab.overview')}
        </button>
      </div>

      {mainTab === 'samples' ? (
        <QualitySamplesListView onNavigate={onNavigate} />
      ) : mainTab === 'slump' ? (
        <QualitySlumpQuickView />
      ) : mainTab === 'compressive' ? (
        <QualityCompressiveStrengthView />
      ) : mainTab === 'testForm' ? (
        <QualityTestResultFormView />
      ) : mainTab === 'links' ? (
        <QualityLinkPanelView />
      ) : mainTab === 'report' ? (
        <QualityReportBuilderView />
      ) : mainTab === 'periodic' ? (
        <QualityPeriodicReportsView />
      ) : mainTab === 'archive' ? (
        <QualityReportArchiveView />
      ) : mainTab === 'shortcuts' ? (
        <QualityProductionShortcutsView onNavigate={onNavigate} />
      ) : (
        <>
      <QualityDashboardSection />

      <div className="border-t border-gray-200/90 pt-2 dark:border-gray-700/90">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityQueue.sectionTitle')}</h2>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityQueue.sectionHint')}</p>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">mvp-09:</strong> Aynı fabrika bağlamındaki{' '}
        <strong>kalite bekleyen</strong> emirler;{' '}
        <button
          type="button"
          onClick={() => onNavigate('mes')}
          className="font-semibold text-gray-800 underline decoration-gray-400 underline-offset-2 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
        >
          Üretim (MES)
        </button>{' '}
        emir detayı ile senkron (mock durum).
      </p>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:col-span-5">
          {laneMeta.map(({ lane, title, subtitle }) => (
            <section
              key={lane}
              className="flex max-h-[min(40vh,320px)] flex-col rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm dark:bg-gray-900 md:max-h-[min(52vh,480px)] lg:max-h-none"
              aria-labelledby={`lane-${lane}`}
            >
              <div className="mb-2 px-1">
                <h2 id={`lane-${lane}`} className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {title}
                </h2>
                <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{subtitle}</p>
              </div>
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {lane === 'devam' ? (
                  <li className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-300">
                    Paralel inceleme yok — tüm bekleyenler solda listelenir (P1 kuyruk).
                  </li>
                ) : null}
                {laneLists[lane].map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                        item.id === selectedId
                          ? 'bg-gray-100 shadow-neo-in ring-1 ring-gray-400/70 dark:bg-gray-900'
                          : 'bg-gray-100/70 shadow-neo-out-sm hover:shadow-neo-out dark:bg-gray-900/70'
                      }`}
                    >
                      <p className="font-mono text-xs font-bold text-gray-900 dark:text-gray-50">{item.code}</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-800 dark:text-gray-100">{item.element}</p>
                      <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                        {item.project} · {findFactoryByCode(item.factoryCode, factories)?.name ?? item.factoryCode}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-gray-300/80 ${statusRowClass(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:col-span-7">
          <div className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-900">
            {selected && (selectedLane === 'bekleyen' || selectedLane === 'tamamlandi') ? (
              <>
                <div className="mb-4 border-b border-gray-200/90 pb-3 dark:border-gray-700/90">
                  <p className="font-mono text-sm font-bold text-gray-900 dark:text-gray-50">{selected.code}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {selected.element} · {selected.project}
                  </p>
                  {selected.transitionNote ? (
                    <p className="mt-2 rounded-lg bg-gray-50 px-2 py-1.5 text-xs text-gray-600 dark:bg-gray-950/80 dark:text-gray-300">
                      {selected.transitionNote}
                    </p>
                  ) : null}
                </div>

                <QualityInspectionPanel
                  workOrder={selected}
                  readOnly={formLocked}
                  showActions={!formLocked && selected.status === 'kalite_bekliyor'}
                  onApprove={handleApprove}
                  onRejectClick={() => setRejectOpen(true)}
                />

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200/90 pt-4 dark:border-gray-700/90">
                  <button
                    type="button"
                    onClick={() => onNavigate('mes')}
                    className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
                  >
                    MES emir detayına git
                  </button>
                </div>

                {formLocked ? (
                  <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-300">
                    Tamamlanan kayıtta yalnızca görüntüleme (salt okunur).
                  </p>
                ) : null}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
                Soldan bir emir seçin veya MES’te <strong>Kalite bekliyor</strong> durumuna geçirin.
              </p>
            )}
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            İzin (mock): <span className="font-mono">kalite.kayit</span> — kontrol ve onay / ret;{' '}
            <span className="font-mono">uretim.durum</span> — emir durumu MES ile birlikte düşünülür.
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
