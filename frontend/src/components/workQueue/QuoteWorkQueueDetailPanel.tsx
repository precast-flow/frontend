import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuoteById, patchQuoteById } from '../../data/quoteExtraStore'
import {
  QUOTE_REJECTION_REASONS,
  formatQuoteDateTr,
  quoteTrackingOutcomeLabel,
  workQueueStatusForOutcome,
  type QuoteTrackingOutcome,
} from '../../data/quoteTracking'
import type { Quote } from '../../data/quotesMock'
import type { WorkQueueItem } from '../../data/workQueueMock'
import { useWorkQueue } from '../../context/WorkQueueContext'
import { QuoteReviseDialog } from '../teklif/QuoteReviseDialog'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'

type Props = {
  item: WorkQueueItem
  gl: boolean
}

export function QuoteWorkQueueDetailPanel({ item, gl }: Props) {
  const { patchWorkQueueItem } = useWorkQueue()
  const [quoteVersion, setQuoteVersion] = useState(0)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reviseOpen, setReviseOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const quote = useMemo(() => {
    void quoteVersion
    return item.quoteId ? getQuoteById(item.quoteId) : undefined
  }, [item.quoteId, quoteVersion])

  const applyOutcome = (
    outcome: QuoteTrackingOutcome,
    extra?: Partial<Quote> & { rejectionReasonId?: string; rejectionReasonLabel?: string },
  ) => {
    if (!item.quoteId || !quote) return
    const statusMap: Record<QuoteTrackingOutcome, Quote['status']> = {
      beklemede: 'taslak',
      red: 'red',
      donus_yapmiyor: 'taslak',
      kabul: 'onayli',
      revize: 'taslak',
    }
    patchQuoteById(item.quoteId, {
      trackingOutcome: outcome,
      status: statusMap[outcome],
      ...extra,
    })
    patchWorkQueueItem(item.id, {
      status: workQueueStatusForOutcome(outcome),
      summary: `${quote.customer} · ${quoteTrackingOutcomeLabel(outcome)}`,
      lastUpdatedLabel: 'Az önce',
    })
    setQuoteVersion((v) => v + 1)
    setRejectOpen(false)
  }

  if (!quote) {
    return (
      <p className="text-sm text-black/75 dark:text-white/80">
        Teklif kaydı bulunamadı (mock). quoteId: {item.quoteId ?? '—'}
      </p>
    )
  }

  const outcome = quote.trackingOutcome ?? 'beklemede'

  return (
    <div className="flex w-full flex-col gap-4 text-left">
      <section className="rounded-xl border border-slate-200/60 bg-white/40 p-4 dark:border-slate-700/60 dark:bg-slate-900/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
          Teklif özeti
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <QuoteDl label="Teklif no" value={quote.number} mono />
          <QuoteDl label="Müşteri" value={quote.customer} />
          <QuoteDl
            label="Teklif tarihi"
            value={quote.quoteDateIso ? formatQuoteDateTr(quote.quoteDateIso) : '—'}
          />
          <QuoteDl label="Teklifi veren" value={quote.issuedByName ?? '—'} />
          <QuoteDl label="Firma yetkilisi" value={quote.customerContactName ?? '—'} />
          <QuoteDl label="Sonuç" value={quoteTrackingOutcomeLabel(outcome)} />
        </dl>
        {quote.customerId ? (
          <Link
            to={`/musteri-detay/${quote.customerId}`}
            state={{ fromCrmList: true }}
            className="mt-3 inline-block text-sm font-semibold text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
          >
            Müşteri detayına git
          </Link>
        ) : null}
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/60">
          Teklif sonucu
        </p>
        <div className="flex flex-wrap gap-2">
          <OutcomeButton
            gl={gl}
            label="Red"
            active={outcome === 'red'}
            onClick={() => setRejectOpen(true)}
          />
          <OutcomeButton
            gl={gl}
            label="Dönüş yapmıyor"
            active={outcome === 'donus_yapmiyor'}
            onClick={() => applyOutcome('donus_yapmiyor')}
          />
          <OutcomeButton
            gl={gl}
            label="Teklif kabul edildi"
            active={outcome === 'kabul'}
            onClick={() => applyOutcome('kabul')}
          />
          <OutcomeButton
            gl={gl}
            label="Teklif revize"
            active={outcome === 'revize'}
            onClick={() => setReviseOpen(true)}
          />
        </div>
      </section>

      {rejectOpen ? (
        <section className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Red sebepleri</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUOTE_REJECTION_REASONS.map((reason) => (
              <button
                key={reason.id}
                type="button"
                onClick={() =>
                  applyOutcome('red', {
                    rejectionReasonId: reason.id,
                    rejectionReasonLabel: reason.label,
                    rejectionNote: rejectNote.trim() || undefined,
                  })
                }
                className={`${eiSplitHeaderButtonPassive} px-3 py-1.5 text-xs`}
              >
                {reason.label}
              </button>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="text-xs text-rose-800/80 dark:text-rose-200/80">Ek not (opsiyonel)</span>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rose-200/80 bg-white px-3 py-2 text-sm dark:border-rose-800 dark:bg-slate-950"
            />
          </label>
          <button
            type="button"
            onClick={() => setRejectOpen(false)}
            className="mt-2 text-xs text-rose-700 underline dark:text-rose-300"
          >
            İptal
          </button>
        </section>
      ) : null}

      {quote.rejectionReasonLabel ? (
        <p className="text-xs text-black/65 dark:text-white/70">
          Red sebebi: <strong>{quote.rejectionReasonLabel}</strong>
          {quote.rejectionNote ? ` — ${quote.rejectionNote}` : null}
        </p>
      ) : null}

      <QuoteReviseDialog
        open={reviseOpen}
        quote={quote}
        onClose={() => setReviseOpen(false)}
        onSave={(revised) => {
          patchQuoteById(revised.id, revised)
          patchWorkQueueItem(item.id, {
            status: workQueueStatusForOutcome('revize'),
            summary: `${revised.customer} · Revize (${revised.version})`,
          })
          setQuoteVersion((v) => v + 1)
          setReviseOpen(false)
        }}
      />
    </div>
  )
}

function QuoteDl({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-black/55 dark:text-white/60">{label}</dt>
      <dd className={`mt-0.5 font-medium text-black dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

function OutcomeButton({
  label,
  active,
  onClick,
  gl,
}: {
  label: string
  active: boolean
  onClick: () => void
  gl: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        gl ? eiSplitHeaderButtonPassive : 'rounded-lg border px-3 py-2 text-sm font-semibold',
        active ? 'ring-2 ring-sky-400/50' : '',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
