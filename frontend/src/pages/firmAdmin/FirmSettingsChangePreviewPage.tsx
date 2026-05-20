import { useId, useState } from 'react'
import { BarChart3, Factory, LayoutDashboard } from 'lucide-react'
import {
  MOCK_FACTORY_CHANGES,
  MOCK_PENDING_CHANGES,
  changesIncludeShiftPolicy,
  type ChangeRow,
} from '../../data/firmChangePreviewMock'
import { useI18n } from '../../i18n/I18nProvider'
import { AppDialog, AppDialogButton } from '../../components/shared/AppDialog'

const btnPrimary =
  'rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const MODULE_ICONS = [
  { id: 'prod', Icon: Factory, labelKey: 'firmChange.module.production' },
  { id: 'rep', Icon: BarChart3, labelKey: 'firmChange.module.reporting' },
  { id: 'dash', Icon: LayoutDashboard, labelKey: 'firmChange.module.dashboard' },
] as const

export function FirmSettingsChangePreviewPage() {
  const { t } = useI18n()
  const baseId = useId()
  const [rows] = useState<ChangeRow[]>(() => MOCK_PENDING_CHANGES.map((r) => ({ ...r })))
  const [effectiveFrom, setEffectiveFrom] = useState('2025-04-01T06:00')
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const shiftWarn = changesIncludeShiftPolicy(rows)

  const confirmSave = () => {
    setModalOpen(false)
    setToast(t('firmChange.toastSaved'))
    window.setTimeout(() => setToast(null), 2400)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('firmChange.pageTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('firmChange.pageDesc')}</p>
      </div>

      <section className="rounded-2xl bg-gray-50 p-5 shadow-neo-in dark:bg-gray-950/70">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmChange.pendingTitle')}</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('firmChange.pendingHint')}</p>
        <div className="mt-4 overflow-x-auto rounded-xl bg-gray-100 shadow-neo-in dark:bg-gray-900/60">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-semibold">{t('firmChange.col.field')}</th>
                <th className="px-3 py-2 font-semibold">{t('firmChange.col.before')}</th>
                <th className="px-3 py-2 font-semibold">{t('firmChange.col.after')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">{t(r.fieldKey)}</td>
                  <td className="px-3 py-2 text-gray-600 line-through decoration-gray-400 dark:text-gray-400">{r.before}</td>
                  <td className="px-3 py-2 font-medium text-emerald-800 dark:text-emerald-200">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={() => setModalOpen(true)}>
            {t('firmChange.openPreview')}
          </button>
        </div>
      </section>

      {/* P2 — zamanlanmış geçerlilik (sayfa üstü mock) */}
      <section className="rounded-2xl border border-dashed border-gray-300/90 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-950/50">
        <label className="block max-w-sm">
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            {t('firmChange.effectiveLabel')}
          </span>
          <input
            id={`${baseId}-effective`}
            type="datetime-local"
            className={`${inset} mt-2 font-mono`}
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        </label>
        <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('firmChange.effectiveHint')}</p>
      </section>

      {/* P1 — etkilenen modül ikonları */}
      <section className="rounded-2xl bg-gray-100/80 p-4 shadow-neo-in dark:bg-gray-900/60">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmChange.modulesTitle')}</h3>
        <ul className="mt-3 flex flex-wrap gap-4">
          {MODULE_ICONS.map(({ id, Icon, labelKey }) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 shadow-neo-out-sm dark:bg-gray-950/80"
            >
              <Icon className="size-5 text-gray-600 dark:text-gray-300" strokeWidth={1.75} aria-hidden />
              <span className="text-sm text-gray-800 dark:text-gray-100">{t(labelKey)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-gray-300/90 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-950/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('firmChange.factorySummaryTitle')}</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-800 dark:text-gray-200">
          {MOCK_FACTORY_CHANGES.map((row) => (
            <li key={row.id} className="rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-900/70">
              {t(row.summaryKey)}
            </li>
          ))}
        </ul>
      </section>

      <AppDialog
        open={modalOpen}
        size="sm"
        title={t('firmChange.modalTitle')}
        subtitle={t('firmChange.modalSubtitle')}
        closeLabel={t('firmGeneral.cancel')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <AppDialogButton variant="secondary" onClick={() => setModalOpen(false)}>
              {t('firmGeneral.cancel')}
            </AppDialogButton>
            <AppDialogButton variant="primary" onClick={confirmSave}>
              {t('firmChange.confirmSave')}
            </AppDialogButton>
          </>
        }
      >
        {shiftWarn ? (
          <div
            className="mb-4 rounded-xl border border-amber-300/90 bg-amber-50 px-3 py-3 text-sm text-amber-950"
            role="alert"
          >
            {t('firmChange.shiftBand')}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2 font-semibold">{t('firmChange.col.field')}</th>
                <th className="px-2 py-2 font-semibold">{t('firmChange.col.before')}</th>
                <th className="px-2 py-2 font-semibold">{t('firmChange.col.after')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-200/80">
                  <td className="px-2 py-2 text-slate-800">{t(r.fieldKey)}</td>
                  <td className="px-2 py-2 text-slate-500 line-through">{r.before}</td>
                  <td className="px-2 py-2 font-medium text-slate-900">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {t('firmChange.modalEffective', { at: effectiveFrom.replace('T', ' ') })}
        </p>
      </AppDialog>

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
