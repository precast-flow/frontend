import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

const steps = ['Genel bilgi', 'Fatura & adres', 'Özet'] as const

export function CrmNewCustomerModal({ open, onClose }: Props) {
  const titleId = useId()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!open) setStep(0)
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
    <div
      className="gm-glass-modal-shell fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="gm-glass-drawer-backdrop absolute inset-0 bg-gray-900/25 backdrop-blur-[2px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="gm-glass-modal-shell relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col rounded-3xl border border-gray-200/90 bg-gray-100 p-5 shadow-neo-out dark:border-gray-700 dark:bg-gray-900 md:max-w-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Yeni müşteri
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Adım {step + 1} / {steps.length} — {steps[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-neo-out-sm transition hover:text-gray-900 dark:text-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
            aria-label="Pencereyi kapat"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-gray-100 dark:bg-gray-900 p-1 shadow-neo-in">
          {steps.map((label, i) => (
            <div
              key={label}
              className={`flex-1 rounded-full px-2 py-1.5 text-center text-xs font-semibold ${
                i === step
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-neo-out-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-gray-50 dark:bg-gray-950/90/80 p-4 shadow-neo-in">
          {step === 0 ? (
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Ticari unvan</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  placeholder="Örn. Örnek Yapı A.Ş."
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Müşteri kodu</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  placeholder="Otomatik veya elle"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Sektör</span>
                <select className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
                  <option>Konut</option>
                  <option>Altyapı</option>
                  <option>Endüstriyel</option>
                </select>
              </label>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="flex flex-col gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Vergi numarası</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Şehir</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Fatura adresi</span>
                <textarea
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border-0 bg-gray-100 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 shadow-neo-in placeholder:text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  placeholder="Mahalle, cadde, No…"
                />
              </label>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <p className="font-medium text-gray-900 dark:text-gray-50">Kayıt özeti (yer tutucu)</p>
              <p className="text-gray-600 dark:text-gray-300">
                Bilgiler kaydedilmeden önce son kontrol. Gerçek uygulamada API’ye POST.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-200/90 dark:border-gray-700/90 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 shadow-neo-out-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
          >
            Vazgeç
          </button>
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
            >
              Geri
            </button>
          ) : null}
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-neo-out-sm transition active:shadow-neo-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
            >
              İleri
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:ring-offset-gray-900"
            >
              Kaydet (demo)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
