import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'

export type MptsPaginationBarProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Verilirse sol tarafta “sayfa başına satır” seçici gösterilir */
  perPage?: number
  onPerPageChange?: (n: number) => void
  perPageOptions?: number[]
}

export function MptsPaginationBar({
  page,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  perPageOptions = [10, 25, 50, 100],
}: MptsPaginationBarProps) {
  const { t } = useI18n()
  const showRows = perPage !== undefined && typeof onPerPageChange === 'function'

  return (
    <div
      className={`okan-liquid-panel-nested mt-2 flex flex-wrap items-center gap-x-4 gap-y-2.5 px-3 py-2.5 sm:px-4 ${
        showRows ? 'justify-between' : 'justify-end'
      }`}
    >
      {showRows ? (
        <label className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <span className="shrink-0 whitespace-nowrap">{t('mpts.common.rowsPerPage')}</span>
          <select
            className="okan-liquid-select min-w-[4.5rem] px-2.5 py-1.5 text-sm"
            value={perPage}
            onChange={(e) => {
              onPerPageChange!(Number(e.target.value))
            }}
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          disabled={page <= 1}
          className="okan-liquid-btn-secondary inline-flex h-8 min-w-[2.25rem] items-center justify-center px-2 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label={t('mpts.common.prev')}
          title={t('mpts.common.prev')}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
        </button>
        <span className="min-w-[6.5rem] rounded-full bg-slate-100/90 px-3 py-1 text-center text-[11px] font-medium tabular-nums text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
          {t('mpts.common.page')} {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          className="okan-liquid-btn-secondary inline-flex h-8 min-w-[2.25rem] items-center justify-center px-2 py-1.5 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          aria-label={t('mpts.common.next')}
          title={t('mpts.common.next')}
        >
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      </div>
    </div>
  )
}
