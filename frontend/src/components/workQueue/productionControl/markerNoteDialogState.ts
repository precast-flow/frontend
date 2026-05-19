import type {
  ControlPhase,
  NonconformanceRecord,
  PendingMarkerPlacement,
  QualityMarker,
  ResponsibleUnit,
} from '../../../data/productionQualityControl'
import type { WorkQueueItem } from '../../../data/workQueueMock'

export type MarkerNoteDialogState =
  | { mode: 'existing'; marker: QualityMarker }
  | { mode: 'new'; placement: PendingMarkerPlacement }

export type MarkerNoteSaveInput = {
  description: string
  responsibleUnit: ResponsibleUnit
  photos: { objectUrl: string; fileName: string }[]
}

export function openNewMarkerNote(
  kind: 'warning' | 'error',
  phase: ControlPhase,
  xPct: number,
  yPct: number,
): MarkerNoteDialogState {
  return { mode: 'new', placement: { kind, phase, xPct, yPct } }
}

export function commitMarkerNoteSave(
  item: WorkQueueItem,
  state: MarkerNoteDialogState,
  input: MarkerNoteSaveInput,
  deps: {
    addMarker: (
      productionWorkQueueId: string,
      phase: ControlPhase,
      kind: 'warning' | 'error',
      xPct: number,
      yPct: number,
    ) => QualityMarker
    saveWarningMarkerNote: (
      productionWorkQueueId: string,
      markerId: string,
      input: Pick<MarkerNoteSaveInput, 'description' | 'photos'>,
    ) => void
    saveNonconformanceFromMarker: (
      item: WorkQueueItem,
      marker: QualityMarker,
      input: MarkerNoteSaveInput,
    ) => NonconformanceRecord | null
  },
): string | null {
  if (state.mode === 'new') {
    const { placement } = state
    const marker = deps.addMarker(
      item.id,
      placement.phase,
      placement.kind,
      placement.xPct,
      placement.yPct,
    )
    if (placement.kind === 'warning') {
      deps.saveWarningMarkerNote(item.id, marker.id, input)
    } else {
      const record = deps.saveNonconformanceFromMarker(item, marker, input)
      return record?.id ?? null
    }
    return null
  }
  const { marker } = state
  if (marker.kind === 'warning') {
    deps.saveWarningMarkerNote(item.id, marker.id, input)
    return null
  }
  if (marker.kind === 'error') {
    const record = deps.saveNonconformanceFromMarker(item, marker, input)
    return record?.id ?? null
  }
  return null
}
