import '../muhendislikOkan/engineeringOkanLiquid.css'
import { MptsProvider } from './MptsContext'
import { MptsRoutes } from './MptsRoutes'

type Props = {
  onCloseModule: () => void
}

export function ManualPieceTemplateStudioModule({ onCloseModule }: Props) {
  return (
    <div className="okan-liquid-root flex min-h-0 min-h-[28rem] flex-1 flex-col gap-4 overflow-hidden rounded-[1.25rem]">
      <div className="okan-liquid-blobs" aria-hidden>
        <div className="okan-liquid-blob okan-liquid-blob--a" />
        <div className="okan-liquid-blob okan-liquid-blob--b" />
        <div className="okan-liquid-blob okan-liquid-blob--c" />
      </div>
      <div className="okan-liquid-content relative z-[1] flex min-h-0 flex-1 flex-col gap-4">
        <MptsProvider>
          <MptsRoutes onCloseModule={onCloseModule} />
        </MptsProvider>
      </div>
    </div>
  )
}

export { MPTS_BASE_PATH } from './constants'
