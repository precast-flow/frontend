import { X } from 'lucide-react'
import { useMpts } from '../MptsContext'

export function MptsToast() {
  const { toast, dismissToast } = useMpts()
  if (!toast) return null
  const bg =
    toast.type === 'success'
      ? 'bg-emerald-700'
      : toast.type === 'error'
        ? 'bg-red-700'
        : 'bg-slate-700'
  return (
    <div
      className={`fixed right-4 top-20 z-[80] flex max-w-md items-start gap-2 rounded-md px-4 py-2 text-sm text-white shadow-lg ${bg}`}
      role="status"
    >
      <span className="flex-1">{toast.text}</span>
      <button
        type="button"
        className="rounded p-0.5 hover:bg-white/10"
        onClick={dismissToast}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
