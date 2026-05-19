import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useI18n } from '../../../i18n/I18nProvider'
import { buildProductLabelQrPayload } from '../../../data/productionDrawingMock'
import type { WorkQueueItem } from '../../../data/workQueueMock'
import '../../../components/shared/printableReport/printableReport.css'

type Props = {
  item: WorkQueueItem
  reportId: string
  productionDate: string
}

export function ProductionLabelPrintSheet({ item, reportId, productionDate }: Props) {
  const { t } = useI18n()
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    const payload = buildProductLabelQrPayload(item.id, item.productCode)
    QRCode.toDataURL(payload, { width: 120, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [item.id, item.productCode])

  return (
    <div data-print-report-id={reportId} className="sr-only" aria-hidden>
      <div className="printable-report-sheet printable-report-sheet--label">
        <div className="printable-label">
          <p className="printable-label__brand">{t('unitWorkQueue.labelPrint.brand')}</p>
          <p className="printable-label__code">{item.productCode ?? '—'}</p>
          <p className="printable-label__name">{item.productName ?? item.title}</p>
          <dl className="printable-label__meta">
            <div>
              <dt>{t('unitWorkQueue.labelPrint.project')}</dt>
              <dd>
                {item.projectCode} · {item.projectName}
              </dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.labelPrint.order')}</dt>
              <dd>{item.orderNo}</dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.labelPrint.shift')}</dt>
              <dd>{item.shiftLabel ?? '—'}</dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.labelPrint.date')}</dt>
              <dd>{productionDate}</dd>
            </div>
          </dl>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="" className="printable-label__qr" width={96} height={96} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
