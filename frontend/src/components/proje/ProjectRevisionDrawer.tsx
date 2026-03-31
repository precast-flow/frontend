import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  projectCode: string
  projectName: string
  onClose: () => void
}

/**
 * P1 — Revizyon talebi (drawer, mock form)
 */
export function ProjectRevisionDrawer({ open, projectCode, projectName, onClose }: Props) {
  const titleId = useId()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [priority, setPriority] = useState<'normal' | 'yuksek'>('normal')

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDetail('')
      setPriority('normal')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="gm-glass-drawer-root fixed inset-0 z-[75] flex justify-end">
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 border-0 p-0"
        aria-label="Kapat"
        onClick={onClose}
      />
      <aside
        className="gm-glass-drawer-panel relative z-10 flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden rounded-l-3xl border-l border-gray-200/90 bg-gray-100 shadow-neo-out dark:border-gray-700 dark:bg-gray-900 md:m-3 md:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-200/90 p-4 dark:border-gray-700/90">
          <h2 id={titleId} className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Revizyon talebi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 shadow-neo-out-sm hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="border-b border-gray-200/90 px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
          {projectCode} · {projectName}
        </p>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Başlık</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Örn. Kolon E-1004 revizyonu"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Açıklama</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={5}
              className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Kapsam, referans çizim, teslim tarihi beklentisi…"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Öncelik</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'normal' | 'yuksek')}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100"
            >
              <option value="normal">Normal</option>
              <option value="yuksek">Yüksek</option>
            </select>
          </label>
        </div>
        <div className="shrink-0 border-t border-gray-200/90 p-4 dark:border-gray-700/90">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-800 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
          >
            Talebi gönder (mock)
          </button>
        </div>
      </aside>
    </div>
  )
}
