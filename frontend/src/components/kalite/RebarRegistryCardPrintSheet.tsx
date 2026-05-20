import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useI18n } from '../../i18n/I18nProvider'
import { buildInputMaterialQrPayload } from '../../data/quality/qualityQrPayload'
import type { QualityInputMaterial } from '../../data/quality/qualityManagementTypes'
import '../shared/printableReport/printableReport.css'

type Props = {
  material: QualityInputMaterial
  supplierName: string
  reportId: string
  copies: number
}

export function RebarRegistryCardPrintSheet({ material, supplierName, reportId, copies }: Props) {
  const { t } = useI18n()
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    QRCode.toDataURL(buildInputMaterialQrPayload(material.id), { width: 100, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [material.id])

  const typeLabel = t(`qualityInput.type.${material.materialType}`)

  return (
    <div data-print-report-id={reportId} className="sr-only" aria-hidden>
      {Array.from({ length: copies }, (_, i) => (
        <div
          key={i}
          className="printable-report-sheet printable-report-sheet--label"
          style={i > 0 ? { pageBreakBefore: 'always' } : undefined}
        >
          <div className="printable-label">
            <p className="printable-label__brand">{t('qualityRegistryCard.title')}</p>
            <p className="printable-label__code">{material.systemMaterialCode}</p>
            <p className="printable-label__name">{material.name}</p>
            <dl className="printable-label__meta">
              <div>
                <dt>{t('qualityRegistryCard.supplier')}</dt>
                <dd>{supplierName}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.supplierCode')}</dt>
                <dd>{material.supplierMaterialCode}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.type')}</dt>
                <dd>{typeLabel}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.diameter')}</dt>
                <dd>{material.diameterOrSize}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.qualityClass')}</dt>
                <dd>{material.qualityClass}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.lot')}</dt>
                <dd>{material.lotNo}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.certificate')}</dt>
                <dd>{material.certificateNo}</dd>
              </div>
              <div>
                <dt>{t('qualityRegistryCard.entryDate')}</dt>
                <dd>{material.entryDate}</dd>
              </div>
              {material.description ? (
                <div>
                  <dt>{t('qualityInput.field.description')}</dt>
                  <dd>{material.description}</dd>
                </div>
              ) : null}
            </dl>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="" className="printable-label__qr" width={88} height={88} />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
