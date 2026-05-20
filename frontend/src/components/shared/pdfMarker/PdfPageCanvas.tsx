import { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

/** pdf.js 5 — OpenJPEG / JBIG2 (public/pdfjs-wasm). */
const PDF_WASM_URL = `${import.meta.env.BASE_URL}pdfjs-wasm/`

export type PdfPageLayout = {
  width: number
  height: number
}

type Props = {
  pdfUrl: string
  alt: string
  /** Viewport genişliği (px); 0 ise render beklenir */
  layoutWidth: number
  onLoadError?: (error: unknown) => void
  onPageLayout?: (layout: PdfPageLayout) => void
}

export function PdfPageCanvas({
  pdfUrl,
  alt,
  layoutWidth,
  onLoadError,
  onPageLayout,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onLoadErrorRef = useRef(onLoadError)
  const onPageLayoutRef = useRef(onPageLayout)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    onLoadErrorRef.current = onLoadError
    onPageLayoutRef.current = onPageLayout
  })

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    const width = Math.floor(layoutWidth)
    if (!canvas || width < 8) {
      setStatus('idle')
      return
    }

    setStatus('loading')

    const load = async () => {
      try {
        const cleanUrl = pdfUrl.split('#')[0]?.split('?')[0] ?? pdfUrl
        const doc = await getDocument({
          url: cleanUrl,
          wasmUrl: PDF_WASM_URL,
        }).promise
        const page = await doc.getPage(1)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
        const displayWidth = width
        const displayHeight = (baseViewport.height / baseViewport.width) * displayWidth
        const renderScale = (displayWidth / baseViewport.width) * dpr
        const viewport = page.getViewport({ scale: renderScale })

        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('canvas context')

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`

        const renderTask = page.render({ canvasContext: ctx, viewport, canvas })
        await renderTask.promise
        if (cancelled) return

        setStatus('ready')
        onPageLayoutRef.current?.({ width: displayWidth, height: displayHeight })
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          onLoadErrorRef.current?.(err)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [pdfUrl, layoutWidth])

  if (status === 'error') {
    return null
  }

  return (
    <div className="block w-full min-w-0">
      {status === 'loading' || status === 'idle' ? (
        <div
          className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-white text-xs font-medium text-slate-500 dark:bg-slate-950 dark:text-slate-400"
          aria-busy="true"
        >
          PDF…
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className={`block max-w-full bg-white ${status === 'ready' ? 'h-auto w-full' : 'pointer-events-none absolute h-0 w-full opacity-0'}`}
        aria-label={alt}
      />
    </div>
  )
}
