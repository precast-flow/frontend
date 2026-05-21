import { useMemo } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { useQualityManagement } from '../../../context/QualityManagementContext'
import { useWorkQueue } from '../../../context/WorkQueueContext'
import type { RebarScanTraceRow } from '../../../data/productionWorkOrderFlow'
import type { WorkQueueItem } from '../../../data/workQueueMock'

type Props = {
  gl: boolean
  item?: WorkQueueItem
  productCode?: string
}

export function RebarMaterialTraceSection({ gl, item, productCode }: Props) {
  const { t } = useI18n()
  const { getProductionFlowState, getRebarScansForProductCode } = useWorkQueue()
  const { findInputMaterial, supplierName } = useQualityManagement()

  const scans: RebarScanTraceRow[] = useMemo(() => {
    if (productCode?.trim()) {
      return getRebarScansForProductCode(productCode.trim())
    }
    if (item) {
      return getProductionFlowState(item.id).rebarScans.map((scan) => ({ ...scan }))
    }
    return []
  }, [productCode, item, getRebarScansForProductCode, getProductionFlowState])

  const rows = useMemo(
    () =>
      scans.map((scan) => {
        const mat = findInputMaterial(scan.inputMaterialId)
        return { scan, mat }
      }),
    [scans, findInputMaterial],
  )

  const sectionCls = gl
    ? 'rounded-xl border border-black/12 bg-black/[0.03] p-4 dark:border-white/12 dark:bg-white/[0.04]'
    : 'rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-600/60 dark:bg-slate-900/40'

  const titleKey = productCode?.trim() ? 'qualityQrScan.traceOnPiece' : 'qualityQrScan.traceSectionTitle'

  if (rows.length === 0) {
    return (
      <section className={sectionCls}>
        <h5 className="text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
          {t(titleKey)}
        </h5>
        <p className="mt-2 text-sm text-black/65 dark:text-white/70">{t('qualityQrScan.traceEmpty')}</p>
      </section>
    )
  }

  return (
    <section className={sectionCls}>
      <h5 className="text-xs font-bold uppercase tracking-wide text-black/70 dark:text-white/75">
        {t(titleKey)}
      </h5>
      <p className="mt-1 text-[11px] text-black/55 dark:text-white/60">{t('qualityQrScan.traceSectionHint')}</p>
      <ul className="mt-3 space-y-2">
        {rows.map(({ scan, mat }) => (
          <li
            key={scan.scanId}
            className="rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-sm dark:border-slate-600/60 dark:bg-slate-800/50"
          >
            {mat ? (
              <>
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {supplierName(mat.supplierId)} · {mat.supplierMaterialCode}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {mat.systemMaterialCode} · {t(`qualityInput.type.${mat.materialType}`)} · {mat.diameterOrSize}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {t('qualityQrScan.traceLot')}: {mat.lotNo} · {t('qualityQrScan.traceScannedAt')}:{' '}
                  {new Date(scan.scannedAt).toLocaleString()}
                  {scan.productionOrderNo ? (
                    <>
                      {' '}
                      · {t('qualityQrScan.traceProductionOrder')}: {scan.productionOrderNo}
                    </>
                  ) : null}
                </p>
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-300">{scan.inputMaterialId}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
