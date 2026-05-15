import type { ReactNode } from 'react'
import { EI_SPLIT_LIST_PAGE_SIZE } from './useElementIdentitySplitListPagination'

type ElementIdentitySplitListPaginationFooterProps = {
  gl: boolean
  locale: string
  pageStart: number
  pageEnd: number
  totalCount: number
  safePage: number
  pageCount: number
  onPrev: () => void
  onNext: () => void
  trailing?: ReactNode
}

export function ElementIdentitySplitListPaginationFooter({
  gl,
  locale,
  pageStart,
  pageEnd,
  totalCount,
  safePage,
  pageCount,
  onPrev,
  onNext,
  trailing,
}: ElementIdentitySplitListPaginationFooterProps) {
  const en = locale === 'en'
  const resultLabel = en ? 'results' : 'sonuç'
  const noResults = en ? 'No results' : 'Sonuç yok'
  const perPage = en ? `${EI_SPLIT_LIST_PAGE_SIZE} per page` : `Sayfa başına ${EI_SPLIT_LIST_PAGE_SIZE}`

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${gl ? 'text-black/75 dark:text-white/80' : 'text-[11px] text-slate-600 dark:text-slate-300'}`}
    >
      <p>
        {totalCount > 0 ? (
          <>
            <span className={`tabular-nums font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {pageStart}
            </span>
            -
            <span className={`tabular-nums font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {pageEnd}
            </span>{' '}
            /{' '}
            <span className={`tabular-nums font-semibold ${gl ? 'text-black dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
              {totalCount}
            </span>{' '}
            {resultLabel}
          </>
        ) : (
          noResults
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {totalCount > 0 && pageCount > 1 ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={onPrev}
              className={
                gl
                  ? ['glass-btn', 'secondary', 'small', 'disabled:pointer-events-none', 'disabled:opacity-35'].join(' ')
                  : 'rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }
              aria-label={en ? 'Previous page' : 'Önceki sayfa'}
            >
              {en ? 'Prev' : 'Önceki'}
            </button>
            <span className={`tabular-nums ${gl ? 'text-black/80 dark:text-white/75' : 'text-slate-600 dark:text-slate-300'}`}>
              {en ? 'Page' : 'Sayfa'} {safePage}/{pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={onNext}
              className={
                gl
                  ? ['glass-btn', 'secondary', 'small', 'disabled:pointer-events-none', 'disabled:opacity-35'].join(' ')
                  : 'rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              }
              aria-label={en ? 'Next page' : 'Sonraki sayfa'}
            >
              {en ? 'Next' : 'Sonraki'}
            </button>
          </div>
        ) : null}
        <span className={`tabular-nums ${gl ? 'text-black/65 dark:text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
          {perPage}
        </span>
        {trailing}
      </div>
    </div>
  )
}
