import { useI18n } from '../../i18n/I18nProvider'
import type { WorkQueueItem } from '../../data/workQueueMock'
import '../shared/printableReport/printableReport.css'

type Props = {
  item: WorkQueueItem
  sampleCode: string
  reportId: string
  pourDate: string
}

export function SampleLabelPrintSheet({ item, sampleCode, reportId, pourDate }: Props) {
  const { t } = useI18n()

  return (
    <div data-print-report-id={reportId} className="sr-only" aria-hidden>
      <div className="printable-report-sheet printable-report-sheet--label">
        <div className="printable-label">
          <p className="printable-label__brand">{t('unitWorkQueue.sample.labelTitle')}</p>
          <p className="printable-label__code">{sampleCode}</p>
          <p className="printable-label__name">{item.productName ?? item.title}</p>
          <dl className="printable-label__meta">
            <div>
              <dt>{t('unitWorkQueue.sample.labelProject')}</dt>
              <dd>
                {item.projectCode} · {item.projectName}
              </dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.sample.labelOrder')}</dt>
              <dd>{item.sourceProductionOrderNo ?? item.orderNo}</dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.sample.labelPourDate')}</dt>
              <dd>{pourDate}</dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.pour.mold')}</dt>
              <dd>{item.moldName ?? '—'}</dd>
            </div>
            <div>
              <dt>{t('unitWorkQueue.pour.recipe')}</dt>
              <dd>{item.recipeId ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
