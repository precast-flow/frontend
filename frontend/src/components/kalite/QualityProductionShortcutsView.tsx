import { useId, useState } from 'react'
import { Bell, Cpu, Factory, FlaskConical, X } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'

const btnPrimary =
  'rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

type Props = {
  onNavigate: (moduleId: string) => void
}

export function QualityProductionShortcutsView({ onNavigate }: Props) {
  const { t } = useI18n()
  const baseId = useId()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mockBatchId] = useState('BP-2025-0320-01')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }

  const confirmSampleFromPour = () => {
    setDrawerOpen(false)
    showToast(t('qualityShortcuts.toastSampleCreated', { batch: mockBatchId }))
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-10:</strong> {t('qualityShortcuts.intro')}
      </p>

      {/* Kısayol diyagramı (metin) */}
      <pre className="overflow-x-auto rounded-2xl bg-gray-100 p-4 font-mono text-[11px] leading-relaxed text-gray-800 shadow-neo-in dark:bg-gray-950/80 dark:text-gray-200">
        {t('qualityShortcuts.diagram')}
      </pre>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* P0 — santral perspektifi */}
        <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85">
          <div className="flex items-center gap-2">
            <Factory className="size-5 text-gray-600 dark:text-gray-300" strokeWidth={1.75} aria-hidden />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityShortcuts.operatorTitle')}</h3>
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{t('qualityShortcuts.operatorHint')}</p>
          <p className="mt-2 font-mono text-xs text-gray-700 dark:text-gray-200">
            {t('qualityShortcuts.mockBatch', { id: mockBatchId })}
          </p>
          <button type="button" className={`${btnPrimary} mt-4 w-full sm:w-auto`} onClick={() => setDrawerOpen(true)}>
            {t('qualityShortcuts.openDrawer')}
          </button>
        </section>

        {/* Hızlı geçişler */}
        <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityShortcuts.quickNav')}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
              onClick={() => onNavigate('batch-plant')}
            >
              {t('qualityShortcuts.goBatch')}
            </button>
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
              onClick={() => onNavigate('mes')}
            >
              {t('qualityShortcuts.goMes')}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityShortcuts.quickNavHint')}</p>
        </section>

        {/* P1 — push mock */}
        <section className="rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/80 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <Bell className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" strokeWidth={1.5} aria-hidden />
            <div>
              <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">{t('qualityShortcuts.pushTitle')}</h3>
              <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-amber-950 shadow-neo-in dark:bg-gray-950/60 dark:text-amber-50">
                {t('qualityShortcuts.pushBody')}
              </p>
              <p className="mt-2 text-[11px] text-amber-900/80 dark:text-amber-200/90">{t('qualityShortcuts.pushHint')}</p>
            </div>
          </div>
        </section>

        {/* P2 — IoT placeholder */}
        <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/70">
          <div className="flex items-start gap-2">
            <Cpu className="mt-0.5 size-5 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.5} aria-hidden />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityShortcuts.iotTitle')}</h3>
              <p className="mt-2 font-mono text-[11px] text-gray-600 dark:text-gray-300">{t('qualityShortcuts.iotBody')}</p>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityShortcuts.iotHint')}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Drawer — bu döküme numune */}
      {drawerOpen ? (
        <div
          className="gm-glass-modal-shell fixed inset-0 z-[85] flex items-end justify-center bg-gray-900/40 backdrop-blur-[1px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${baseId}-dr-title`}
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-pf-surface p-5 shadow-neo-out sm:rounded-3xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-6 text-gray-600 dark:text-gray-300" strokeWidth={1.5} aria-hidden />
                <h3 id={`${baseId}-dr-title`} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {t('qualityShortcuts.drawerTitle')}
                </h3>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('qualityShortcuts.close')}
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('qualityShortcuts.drawerBody')}</p>
            <dl className="mt-4 space-y-2 rounded-xl bg-gray-50 px-3 py-3 text-sm shadow-neo-in dark:bg-gray-950/60">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">{t('qualityShortcuts.drawerBatch')}</dt>
                <dd className="font-mono font-semibold text-gray-900 dark:text-gray-50">{mockBatchId}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">{t('qualityShortcuts.drawerFactory')}</dt>
                <dd className="font-mono text-xs">{t('qualityShortcuts.drawerFactoryValue')}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
                onClick={() => setDrawerOpen(false)}
              >
                {t('qualityShortcuts.cancel')}
              </button>
              <button type="button" className={btnPrimary} onClick={confirmSampleFromPour}>
                {t('qualityShortcuts.confirmSample')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200/90 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900 shadow-neo-out dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
