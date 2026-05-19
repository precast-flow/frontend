import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  qualityControlReportDetailPath,
  type QualityControlReportDetailLocationState,
} from '../../data/qualityControlReportPaths'

export function useOpenQualityControlReport() {
  const navigate = useNavigate()

  return useCallback(
    (productionWorkQueueId: string, opts?: { returnWorkQueueId?: string }) => {
      const state: QualityControlReportDetailLocationState = {
        fromUnitWorkQueue: true,
        returnWorkQueueId: opts?.returnWorkQueueId ?? productionWorkQueueId,
      }
      navigate(qualityControlReportDetailPath(productionWorkQueueId), { state })
    },
    [navigate],
  )
}
