import { useId, useState } from 'react'
import { CalendarClock, Plus, Send } from 'lucide-react'
import {
  MOCK_PERIODIC_REPORTS,
  canOpenDeliveryModal,
  type PeriodicReportRow,
  type PeriodicReportStatus,
} from '../../data/qualityPeriodicReportsMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white'

const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 shadow-neo-out-sm hover:bg-gray-200/90 dark:bg-gray-800 dark:text-gray-100'

const statusClass = (s: PeriodicReportStatus) => {
  switch (s) {
    case 'draft':
      return 'bg-gray-200/90 text-gray-800 ring-gray-400/50 dark:bg-gray-800 dark:text-gray-200'
    case 'approved':
      return 'bg-sky-100 text-sky-950 ring-sky-300/70 dark:bg-sky-950/50 dark:text-sky-100'
    case 'pending_delivery':
      return 'bg-amber-100 text-amber-950 ring-amber-300/80 dark:bg-amber-950/40 dark:text-amber-100'
    case 'delivered':
      return 'bg-emerald-100 text-emerald-950 ring-emerald-300/80 dark:bg-emerald-950/40 dark:text-emerald-100'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}

export function QualityPeriodicReportsView() {
  const { t } = useI18n()
  const baseId = useId()
  const [autoCreate, setAutoCreate] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeRow, setActiveRow] = useState<PeriodicReportRow | null>(null)
  const [email, setEmail] = useState('musteri.kalite@example.com')
  const [channel, setChannel] = useState<'email' | 'portal' | 'sftp'>('email')

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }

  const openDelivery = (row: PeriodicReportRow) => {
    setActiveRow(row)
    setModalOpen(true)
  }

  const confirmDelivery = () => {
    setModalOpen(false)
    showToast(t('qualityPeriodic.toastDelivered', { email }))
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-08:</strong> {t('qualityPeriodic.intro')}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={btnPrimary} onClick={() => showToast(t('qualityPeriodic.toastCreate'))}>
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          {t('qualityPeriodic.create')}
        </button>

        {/* P2 — otomatik oluştur */}
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 shadow-neo-in dark:bg-gray-950/70">
          <input
            type="checkbox"
            className="size-4 rounded border-gray-400 text-gray-900 focus:ring-gray-400"
            checked={autoCreate}
            onChange={(e) => setAutoCreate(e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{t('qualityPeriodic.autoCreate')}</span>
        </label>
      </div>

      {/* P1 — zamanlama özeti */}
      <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.5} aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qualityPeriodic.scheduleTitle')}</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{t('qualityPeriodic.scheduleBody')}</p>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityPeriodic.scheduleHint')}</p>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-950/70">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[11px] uppercase text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2 font-semibold">{t('qualityPeriodic.col.name')}</th>
              <th className="px-3 py-2 font-semibold">{t('qualityPeriodic.col.period')}</th>
              <th className="px-3 py-2 font-semibold">{t('qualityPeriodic.col.status')}</th>
              <th className="px-3 py-2 font-semibold">{t('qualityPeriodic.col.due')}</th>
              <th className="px-3 py-2 font-semibold">{t('qualityPeriodic.col.action')}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PERIODIC_REPORTS.map((row) => (
              <tr key={row.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-50">{t(row.nameKey)}</td>
                <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">{t(row.periodKey)}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusClass(row.status)}`}>
                    {t(`qualityPeriodic.status.${row.status}`)}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-200">{row.dueDate}</td>
                <td className="px-3 py-2.5">
                  {canOpenDeliveryModal(row.status) ? (
                    <button type="button" className={btnSecondary} onClick={() => openDelivery(row)}>
                      <Send className="size-3.5" strokeWidth={1.75} aria-hidden />
                      {t('qualityPeriodic.deliver')}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && activeRow ? (
        <div
          className="gm-glass-modal-shell fixed inset-0 z-[80] flex items-end justify-center bg-gray-900/45 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${baseId}-modal-title`}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-3xl bg-pf-surface p-6 shadow-neo-out">
            <h3 id={`${baseId}-modal-title`} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {t('qualityPeriodic.modalTitle')}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t(activeRow.nameKey)} · {t(activeRow.periodKey)}
            </p>

            <label className="mt-4 block" htmlFor={`${baseId}-email`}>
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityPeriodic.field.email')}
              </span>
              <input
                id={`${baseId}-email`}
                type="email"
                className={`${inset} mt-1.5 font-mono`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </label>

            <label className="mt-3 block" htmlFor={`${baseId}-channel`}>
              <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityPeriodic.field.channel')}
              </span>
              <select
                id={`${baseId}-channel`}
                className={`${inset} mt-1.5`}
                value={channel}
                onChange={(e) => setChannel(e.target.value as 'email' | 'portal' | 'sftp')}
              >
                <option value="email">{t('qualityPeriodic.channel.email')}</option>
                <option value="portal">{t('qualityPeriodic.channel.portal')}</option>
                <option value="sftp">{t('qualityPeriodic.channel.sftp')}</option>
              </select>
            </label>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
                onClick={() => setModalOpen(false)}
              >
                {t('qualityPeriodic.cancel')}
              </button>
              <button type="button" className={btnPrimary} onClick={confirmDelivery}>
                {t('qualityPeriodic.confirmDeliver')}
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
