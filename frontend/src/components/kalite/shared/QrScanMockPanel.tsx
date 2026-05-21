import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, ScanLine } from 'lucide-react'
import { useI18n } from '../../../i18n/I18nProvider'
import { buildInputMaterialQrPayload } from '../../../data/quality/qualityQrPayload'

type Props = {
  onScan: (raw: string) => void
  errorMessage?: string | null
  compact?: boolean
}

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>
}

function getBarcodeDetector(): BarcodeDetectorLike | null {
  const w = window as Window & { BarcodeDetector?: new (opts?: { formats: string[] }) => BarcodeDetectorLike }
  if (!w.BarcodeDetector) return null
  try {
    return new w.BarcodeDetector({ formats: ['qr_code'] })
  } catch {
    return null
  }
}

export function QrScanMockPanel({ onScan, errorMessage, compact = false }: Props) {
  const { t } = useI18n()
  const [manual, setManual] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  useEffect(() => {
    if (!cameraOn) return
    const detector = getBarcodeDetector()
    if (!detector) {
      setCameraError(t('qualityQrScan.cameraUnsupported'))
      stopCamera()
      return
    }

    let cancelled = false
    setCameraError(null)

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()

        const tick = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
            rafRef.current = requestAnimationFrame(tick)
            return
          }
          try {
            const codes = await detector.detect(videoRef.current)
            const raw = codes[0]?.rawValue?.trim()
            if (raw) {
              onScan(raw)
              stopCamera()
              return
            }
          } catch {
            /* frame skip */
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch {
        setCameraError(t('qualityQrScan.cameraDenied'))
        stopCamera()
      }
    }

    void start()
    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }
  }, [cameraOn, onScan, stopCamera, t])

  const submit = () => {
    const v = manual.trim()
    if (!v) return
    onScan(v)
    setManual('')
  }

  const simulate = () => {
    onScan(buildInputMaterialQrPayload('im-001'))
  }

  const shellCls = compact
    ? 'space-y-2 rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-600/60 dark:bg-slate-900/40'
    : 'space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-600/60 dark:bg-slate-900/50'

  return (
    <div className={shellCls}>
      <p className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <ScanLine className="size-4 shrink-0 text-sky-600" aria-hidden />
        {t('qualityQrScan.title')}
      </p>

      {cameraOn ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-300/90 bg-black dark:border-slate-600">
          <video ref={videoRef} className="aspect-[4/3] w-full object-cover" playsInline muted />
          <button
            type="button"
            onClick={stopCamera}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-semibold text-white"
          >
            <CameraOff className="size-3.5" aria-hidden />
            {t('qualityQrScan.cameraStop')}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCameraOn(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/70 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100 dark:border-sky-600/50 dark:bg-sky-950/40 dark:text-sky-100"
          >
            <Camera className="size-3.5 shrink-0" aria-hidden />
            {t('qualityQrScan.cameraStart')}
          </button>
          <span className="self-center text-[11px] text-slate-500 dark:text-slate-400">
            {t('qualityQrScan.cameraHint')}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t('qualityQrScan.placeholder')}
          className="min-w-0 flex-1 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
        >
          {t('qualityQrScan.submit')}
        </button>
        <button
          type="button"
          onClick={simulate}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          {t('qualityQrScan.simulate')}
        </button>
      </div>

      {cameraError ? (
        <p className="text-xs font-medium text-amber-700 dark:text-amber-300" role="status">
          {cameraError}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
