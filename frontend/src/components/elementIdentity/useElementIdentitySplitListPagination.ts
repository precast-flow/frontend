import { useEffect, useMemo, useState } from 'react'

export const EI_SPLIT_LIST_PAGE_SIZE = 6

export function useElementIdentitySplitListPagination<T>(items: T[], resetKey: string) {
  const [page, setPage] = useState(1)

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(items.length / EI_SPLIT_LIST_PAGE_SIZE)),
    [items.length],
  )
  const safePage = Math.min(page, pageCount)
  const visible = useMemo(
    () => items.slice((safePage - 1) * EI_SPLIT_LIST_PAGE_SIZE, safePage * EI_SPLIT_LIST_PAGE_SIZE),
    [items, safePage],
  )
  const pageStart = items.length === 0 ? 0 : (safePage - 1) * EI_SPLIT_LIST_PAGE_SIZE + 1
  const pageEnd = Math.min(items.length, safePage * EI_SPLIT_LIST_PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return {
    visible,
    safePage,
    pageCount,
    pageStart,
    pageEnd,
    totalCount: items.length,
    setPage,
  }
}
