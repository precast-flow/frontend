import { useCallback, useId } from 'react'
import { printReportInIframe } from './printReportInIframe'

/** Tarayıcı yazdırma diyaloğunu açar; rapor izole iframe üzerinden basılır (localhost footer yok). */
export function usePrintReport(explicitId?: string) {
  const autoId = useId().replace(/:/g, '')
  const reportId = explicitId ?? `print-report-${autoId}`

  const print = useCallback(() => {
    printReportInIframe(reportId)
  }, [reportId])

  return { reportId, print }
}
