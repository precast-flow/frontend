import type { ReactNode } from 'react'
import { SplitListPaginationNav } from '../shared/SplitListPaginationNav'
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
        {totalCount > 0 ? (
          <SplitListPaginationNav
            safePage={safePage}
            pageCount={pageCount}
            onPrev={onPrev}
            onNext={onNext}
            gl={gl}
            locale={locale}
            pageIndicatorClassName={
              gl ? 'tabular-nums text-black/80 dark:text-white/75' : 'tabular-nums text-slate-600 dark:text-slate-300'
            }
          />
        ) : null}
        {trailing}
      </div>
    </div>
  )
}
