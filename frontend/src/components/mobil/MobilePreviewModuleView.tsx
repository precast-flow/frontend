import { useState } from 'react'
import {
  mobileNotifications,
  mobileScanPlaceholder,
  mobileTasks,
} from '../../data/mobilePreviewMock'

type TabId = 'tasks' | 'scan' | 'notifications'

const tabs: { id: TabId; label: string }[] = [
  { id: 'tasks', label: 'Görevler' },
  { id: 'scan', label: 'Tarama' },
  { id: 'notifications', label: 'Bildirimler' },
]

/** Telefon içi — masaüstüne göre daha hafif neumorphic gölge */
const inPhoneOut =
  'shadow-[2px_2px_5px_rgb(163_163_163/0.2),-2px_-2px_5px_rgb(255_255_255/0.95)]'
const inPhoneOutSm =
  'shadow-[1.5px_1.5px_4px_rgb(163_163_163/0.18),-1.5px_-1.5px_4px_rgb(255_255_255/0.92)]'
const inPhoneIn =
  'shadow-[inset_2px_2px_5px_rgb(163_163_163/0.22),inset_-2px_-2px_5px_rgb(255_255_255/0.9)]'

export function MobilePreviewModuleView() {
  const [tab, setTab] = useState<TabId>('tasks')

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-4">
      <p className="max-w-xl text-center text-sm text-gray-600 dark:text-gray-300">
        Web içinde telefon çerçevesi; iç yüzeyde gölgeler bir kademe{' '}
        <strong className="font-medium text-gray-800 dark:text-gray-100">daha hafif</strong> (küçük ölçek).
      </p>

      {/* Dış cihaz: büyük protrude */}
      <div
        className={`w-full max-w-[360px] rounded-[2.5rem] bg-gray-100 dark:bg-gray-900 p-3 shadow-neo-out ring-1 ring-gray-200/90 sm:p-4`}
      >
        {/* Ekran içi */}
        <div className="flex min-h-[540px] flex-col overflow-hidden rounded-[1.85rem] bg-gray-100 dark:bg-gray-900 ring-1 ring-gray-300/60">
          {/* Durum şeridi */}
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <span className="text-[10px] font-semibold tabular-nums text-gray-600 dark:text-gray-300">09:41</span>
            <div className="h-5 w-16 rounded-full bg-gray-200/80 dark:bg-gray-700/80 shadow-neo-in" aria-hidden />
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">LTE</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-1">
            {tab === 'tasks' ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100">
                  Bugünkü görevler
                </h2>
                {mobileTasks.map((task) => (
                  <article
                    key={task.id}
                    className={`rounded-2xl bg-gray-100 dark:bg-gray-900 p-4 ${inPhoneOut} ring-1 ring-gray-200/70 dark:ring-gray-700/70`}
                  >
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">{task.title}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{task.subtitle}</p>
                    <button
                      type="button"
                      className={`mt-4 w-full rounded-xl bg-gray-800 py-3 text-xs font-bold text-white ${inPhoneOutSm} transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900 active:shadow-neo-press`}
                    >
                      {task.cta}
                    </button>
                  </article>
                ))}
              </div>
            ) : null}

            {tab === 'scan' ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100">QR / barkod</h2>
                <div
                  className={`flex aspect-[4/3] flex-col items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-900/90 ${inPhoneIn} ring-1 ring-gray-300/50`}
                >
                  <div className="rounded-lg border-2 border-dashed border-gray-500/60 p-6 shadow-none">
                    <div
                      className="grid size-28 grid-cols-6 grid-rows-6 gap-0.5 opacity-70"
                      aria-hidden
                    >
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-[1px] ${i % 7 === 0 || i % 5 === 2 ? 'bg-gray-800' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 px-4 text-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    {mobileScanPlaceholder.label}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{mobileScanPlaceholder.hint}</p>
                <div
                  className={`rounded-2xl bg-gray-100 dark:bg-gray-900 p-3 ${inPhoneOut} ring-1 ring-gray-200/70 dark:ring-gray-700/70`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Son tarama
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {mobileScanPlaceholder.lastScan}
                  </p>
                </div>
              </div>
            ) : null}

            {tab === 'notifications' ? (
              <div className="flex flex-col gap-2">
                <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100">
                  Bildirimler
                </h2>
                <ul className="flex flex-col gap-2">
                  {mobileNotifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex gap-3 rounded-xl bg-gray-100 dark:bg-gray-900/80 px-3 py-2.5 ${inPhoneIn} ring-1 ring-gray-200/60`}
                    >
                      <div className="relative mt-1.5 shrink-0">
                        <span
                          className={`block size-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-gray-800'}`}
                          aria-hidden
                        />
                        {!n.read ? (
                          <span className="sr-only">Okunmadı</span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{n.title}</p>
                          <time className="shrink-0 text-[10px] text-gray-500 dark:text-gray-400">{n.time}</time>
                        </div>
                        <p className="mt-0.5 text-xs leading-snug text-gray-700 dark:text-gray-200">{n.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Alt: pill sekmeler */}
          <nav
            className={`mt-auto flex justify-center gap-1 px-2 pb-3 pt-2`}
            aria-label="Mobil sekme"
          >
            <div
              className={`flex rounded-full bg-gray-100 dark:bg-gray-900/90 p-1 ${inPhoneIn} ring-1 ring-gray-200/70 dark:ring-gray-700/70`}
            >
              {tabs.map((t) => {
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-3 py-2 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-1 ${
                      active
                        ? `bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 ${inPhoneOutSm} ring-1 ring-gray-200/80`
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
