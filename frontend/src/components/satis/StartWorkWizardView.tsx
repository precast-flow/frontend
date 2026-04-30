import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, FileSignature, Send, X } from 'lucide-react'
import { quotes } from '../../data/quotesMock'
import {
  DEFAULT_START_WORK,
  PREVIEW_AFTER_SUBMIT,
  type StartWorkPreviewRow,
} from '../../data/startWorkBie04Mock'

const inset =
  'w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'
const btnPrimary =
  'rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-neo-out-sm transition hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white'

type Props = {
  onNavigate: (moduleId: string) => void
}

function formatMoney(n: number, currency: string) {
  return `${currency}${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
}

export function StartWorkWizardView({ onNavigate }: Props) {
  const [searchParams] = useSearchParams()
  const [prereqOk, setPrereqOk] = useState(true)
  const [refNo, setRefNo] = useState(DEFAULT_START_WORK.refQuoteNo)
  const [contractRef, setContractRef] = useState(DEFAULT_START_WORK.contractRef)
  const [closingPrice, setClosingPrice] = useState(String(DEFAULT_START_WORK.closingPrice))
  const [deadline, setDeadline] = useState(DEFAULT_START_WORK.deadline)
  const [specialTerms, setSpecialTerms] = useState(DEFAULT_START_WORK.specialTerms)
  const [riskNote, setRiskNote] = useState(DEFAULT_START_WORK.riskNote)
  const [contractFileName, setContractFileName] = useState<string | null>('sozlesme_PRJ-2026-014_imzali.pdf')
  const [preview, setPreview] = useState<StartWorkPreviewRow | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const qid = searchParams.get('quote')
    if (!qid) return
    const q = quotes.find((x) => x.id === qid)
    if (q) {
      setRefNo(q.number)
      setClosingPrice(String(q.total))
    }
  }, [searchParams])

  const matchedQuote = useMemo(() => quotes.find((q) => q.number === refNo.trim()), [refNo])
  const quoteTotal = matchedQuote?.total ?? DEFAULT_START_WORK.quoteTotal

  const closingNum = Number(String(closingPrice).replace(/\s/g, '').replace(',', '.')) || 0
  const delta = quoteTotal - closingNum

  const handleSubmit = () => {
    if (!prereqOk) return
    setPreview(PREVIEW_AFTER_SUBMIT)
    setSubmitted(true)
  }

  const mockUploadContract = () => {
    setContractFileName(`sozlesme_yukleme_${Date.now()}.pdf`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">bie-04 (mock):</strong> Onaylı teklif / sözleşme özeti,
        kapanış kararları ve mühendislik birimine <strong>üretim öncesi mühendislik</strong> iş emri (Tip B) oluşturma.
      </p>

      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <strong className="font-semibold">Önkoşul:</strong> İş başlatılmadan önce onaylı teklif veya imzalı sözleşme
        referansı doğrulanmalıdır (checkbox — gerçek akışta belge kontrolü).
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Referanslar</h2>
            <label className="mt-3 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Onaylı teklif no
              <input className={`${inset} mt-1`} value={refNo} onChange={(e) => setRefNo(e.target.value)} />
            </label>
            <label className="mt-3 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Sözleşme / ek protokol ref. (mock)
              <input className={`${inset} mt-1`} value={contractRef} onChange={(e) => setContractRef(e.target.value)} />
            </label>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-gray-50 px-3 py-3 shadow-neo-in dark:bg-gray-950/80">
              <input
                type="checkbox"
                checked={prereqOk}
                onChange={(e) => setPrereqOk(e.target.checked)}
                className="mt-0.5 size-4 rounded border-gray-400 accent-gray-800 dark:accent-gray-200"
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">
                Onaylı teklif / sözleşme referansını kontrol ettim; kayıtlarla eşleşiyor (mock).
              </span>
            </label>
          </section>

          <section className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Karşılaştırma (P1)</h2>
            <table className="mt-3 w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                  <td className="py-2 text-gray-600 dark:text-gray-400">Teklif tutarı (referans)</td>
                  <td className="py-2 text-right font-mono font-medium text-gray-900 dark:text-gray-50">
                    {formatMoney(quoteTotal, DEFAULT_START_WORK.currency)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
                  <td className="py-2 text-gray-600 dark:text-gray-400">Kapanış (aşağıdaki alan)</td>
                  <td className="py-2 text-right font-mono font-medium text-gray-900 dark:text-gray-50">
                    {formatMoney(closingNum || DEFAULT_START_WORK.closingPrice, DEFAULT_START_WORK.currency)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600 dark:text-gray-400">Fark (teklif − kapanış)</td>
                  <td
                    className={`py-2 text-right font-mono font-semibold ${
                      delta >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {formatMoney(delta, DEFAULT_START_WORK.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Son karar</h2>
            <label className="mt-3 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Kapanış fiyatı (KDV hariç, mock)
              <input
                className={`${inset} mt-1 font-mono`}
                value={closingPrice}
                onChange={(e) => setClosingPrice(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <label className="mt-3 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Termin / teslimat penceresi
              <input className={`${inset} mt-1`} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </label>
            <label className="mt-3 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Özel maddeler
              <textarea
                className={`${inset} mt-1 min-h-[88px] resize-y`}
                value={specialTerms}
                onChange={(e) => setSpecialTerms(e.target.value)}
              />
            </label>
            <label className="mt-3 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Risk notu
              <textarea
                className={`${inset} mt-1 min-h-[72px] resize-y`}
                value={riskNote}
                onChange={(e) => setRiskNote(e.target.value)}
              />
            </label>
          </section>

          <section className="rounded-2xl border border-dashed border-gray-300/90 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-950/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
              <FileSignature className="size-4" aria-hidden />
              Ek dosya (P2)
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">İmzalı sözleşme PDF — sunucuya gitmez.</p>
            <button
              type="button"
              onClick={mockUploadContract}
              className="mt-3 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
            >
              Sözleşme PDF yükle (mock)
            </button>
            {contractFileName ? (
              <p className="mt-2 font-mono text-xs text-gray-700 dark:text-gray-300">{contractFileName}</p>
            ) : null}
          </section>

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!prereqOk} onClick={handleSubmit} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-45`}>
              <span className="inline-flex items-center gap-2">
                <Send className="size-4" aria-hidden />
                Mühendislik birimine gönder
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('project')}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-neo-out-sm dark:bg-gray-900 dark:text-gray-100"
            >
              Birim iş kuyruğunu aç
            </button>
          </div>

          {submitted ? (
            <div
              className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100"
              role="status"
            >
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Proje durumu (mock): <strong>İş başlatıldı</strong> → <strong>Mühendislikte</strong>
              </p>
              <p className="mt-2 text-xs text-emerald-900/90 dark:text-emerald-200/90">
                UX notu: İş başlat geri alınır mı? — Üretimde yalnızca yetkili rol ve iptal politikası ile; prototipte
                geri alma yok.
              </p>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Özet — oluşacak iş emri (bie-05 uyumlu)
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              Gönder sonrası mühendislik kuyruğuna düşen satır örneği aşağıdaki önizleme ile aynı yapıdadır.
            </p>
            <dl className="mt-4 space-y-2 rounded-xl bg-gray-100 p-3 text-sm dark:bg-gray-900/80">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Tip</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-50">Üretim öncesi mühendislik (Tip B)</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Proje</dt>
                <dd className="text-right font-mono text-xs text-gray-800 dark:text-gray-100">{PREVIEW_AFTER_SUBMIT.projectCode}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Hedef birim</dt>
                <dd>{PREVIEW_AFTER_SUBMIT.assigneeUnitLabel}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {preview ? (
        <div className="gm-glass-modal-shell fixed inset-0 z-50 flex items-center justify-center bg-gray-900/35 p-4 backdrop-blur-[2px]">
          <div
            className="relative w-full max-w-md rounded-2xl bg-pf-surface p-5 shadow-neo-out"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wo-preview-title"
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-xl p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setPreview(null)}
              aria-label="Kapat"
            >
              <X className="size-5" />
            </button>
            <h2 id="wo-preview-title" className="pr-10 text-lg font-semibold text-gray-900 dark:text-gray-50">
              İş emri önizlemesi
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Mühendislik birimine iletildi (mock).</p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80">
              <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">{preview.workOrderNo}</p>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-100">{preview.projectName}</p>
              <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">{preview.projectCode}</p>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">
                Tür: <strong>Üretim öncesi mühendislik</strong>
              </p>
            </div>
            <button type="button" className={`${btnPrimary} mt-5 w-full`} onClick={() => setPreview(null)}>
              Tamam
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
