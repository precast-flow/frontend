import { resolveProductionDrawingUrl } from '../data/productionDrawingMock'
import type { QualityMarker } from '../data/productionQualityControl'
import type { WorkQueueItem } from '../data/workQueueMock'
import { captureMarkerSpotSnapshot } from './drawingMarkerSnapshot'

export async function enrichMarkersWithSpotSnapshots(
  parent: WorkQueueItem,
  markers: QualityMarker[],
  onlyIds?: Set<string>,
): Promise<QualityMarker[]> {
  const drawingUrl = resolveProductionDrawingUrl(parent)
  return Promise.all(
    markers.map(async (marker) => {
      if (onlyIds && !onlyIds.has(marker.id)) return marker
      if (marker.spotSnapshotUrl) return marker
      try {
        const spotSnapshotUrl = await captureMarkerSpotSnapshot(
          drawingUrl,
          marker.xPct,
          marker.yPct,
          marker.kind,
        )
        return { ...marker, spotSnapshotUrl }
      } catch {
        return marker
      }
    }),
  )
}
