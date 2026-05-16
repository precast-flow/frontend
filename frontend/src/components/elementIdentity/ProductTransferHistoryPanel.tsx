import { useState } from 'react'
import { ChevronDown, ChevronUp, History } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import type { ProductTransferLogEntry } from './productTransferTypes'
import { transferReasonI18nKey } from './productTransferTypes'

type Props = {
  logs: ProductTransferLogEntry[]
  glass?: boolean
}

export function ProductTransferHistoryPanel({ logs, glass = false }: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(true)

  if (logs.length === 0) return null

  const shell = glass
    ? 'rounded-xl border border-black/12 bg-white/35 dark:border-white/12 dark:bg-white/5'
    : 'rounded-xl border border-slate-200/70 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-900/35'

  return (
    <section className={`${shell} px-3 py-2`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">
          <History className="size-3.5 shrink-0 opacity-70" aria-hidden />
          {t('elementIdentity.transfer.historyTitle')}
          <span className="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] tabular-nums dark:bg-slate-700">
            {logs.length}
          </span>
        </span>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>
      {open ? (
        <ul className="mt-2 max-h-36 space-y-2 overflow-y-auto border-t border-slate-200/60 pt-2 text-xs dark:border-slate-700/60">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-lg border border-slate-200/60 bg-white/70 px-2.5 py-2 dark:border-slate-700/50 dark:bg-slate-950/40"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  → {log.toProjectLabel}
                </span>
                <time className="text-[10px] text-slate-500 dark:text-slate-400">{log.at}</time>
              </div>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                {t(transferReasonI18nKey(log.reason))}
                {log.reasonNote ? ` · ${log.reasonNote}` : ''}
              </p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                {log.productSummaries.join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
