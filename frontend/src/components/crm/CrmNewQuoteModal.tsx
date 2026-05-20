import { useEffect, useId, useMemo, useState } from 'react'
import type { CrmIletisimKisi } from '../../data/crmCustomers'
import { collectAllQuoteNumbers, generateUniqueQuoteNumber } from '../../data/quoteNumber'
import { loadAllQuotes, saveExtraQuote } from '../../data/quoteExtraStore'
import {
  buildEmptyQuoteLines,
  buildWorkQueueItemForQuote,
  formatQuoteDateTr,
  getSessionQuoteIssuer,
  todayIsoDate,
} from '../../data/quoteTracking'
import type { WorkQueueItem } from '../../data/workQueueMock'
import type { Quote } from '../../data/quotesMock'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950'

export type CrmNewQuotePayload = {
  quote: Quote
  workQueueItem: WorkQueueItem
}

type Props = {
  open: boolean
  customerId: string
  customerName: string
  contacts: CrmIletisimKisi[]
  onSave: (payload: CrmNewQuotePayload) => void
  onClose: () => void
}

export function CrmNewQuoteModal({
  open,
  customerId,
  customerName,
  contacts,
  onSave,
  onClose,
}: Props) {
  const contactSelectId = useId()
  const issuer = useMemo(() => getSessionQuoteIssuer(), [])
  const quoteNumber = useMemo(
    () => generateUniqueQuoteNumber(collectAllQuoteNumbers(loadAllQuotes())),
    [open],
  )
  const quoteDateIso = todayIsoDate()
  const [contactId, setContactId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const contactOptions = contacts.length
    ? contacts
    : [{ id: 'none', adSoyad: 'Tanımlı yetkili yok', gorev: '—', cep: '—', email: '—' }]

  useEffect(() => {
    if (!open) {
      setContactId('')
      setError(null)
      return
    }
    const primary = contacts.find((c) => c.birincil) ?? contacts[0]
    setContactId(primary?.id ?? '')
  }, [open, contacts])

  if (!open) return null

  const selectedContact = contactOptions.find((c) => c.id === contactId)

  const handleSave = () => {
    if (!contactId || contactId === 'none') {
      setError('Firma yetkilisi seçilmelidir.')
      return
    }
    const lines = buildEmptyQuoteLines()
    const snap = { total: 0, lines, versionNote: 'İlk teklif taslağı — kalemler sonra girilecek.' }
    const workQueueId = `wq-quote-${Date.now()}`
    const quote: Quote = {
      id: `q-${Date.now()}`,
      number: quoteNumber,
      customer: customerName,
      customerId,
      projectId: 'p-new',
      project: 'Yeni teklif',
      version: 'v1',
      versionNote: snap.versionNote,
      total: 0,
      currency: '₺',
      status: 'taslak',
      lines,
      validityDate: '—',
      activeStepLabel: '—',
      approvalTemplateName: 'Teklif — standart hiyerarşi',
      approvalHistory: [
        {
          id: `h-${Date.now()}`,
          actor: issuer.name,
          role: 'Satış',
          when: `${formatQuoteDateTr(quoteDateIso)} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
          action: 'Teklif oluşturuldu',
        },
      ],
      versionSnapshots: { v1: snap, v2: snap },
      quoteDateIso,
      issuedByUserId: issuer.userId,
      issuedByName: issuer.name,
      customerContactId: contactId,
      customerContactName: selectedContact?.adSoyad,
      workQueueId,
      trackingOutcome: 'beklemede',
    }
    saveExtraQuote(quote)
    setError(null)
    onSave({ quote, workQueueItem: buildWorkQueueItemForQuote(quote, workQueueId) })
  }

  return (
    <PmStyleDialog
      variant="glass"
      title="Yeni teklif oluştur"
      subtitle={`${customerName} · iş kuyruğuna takip kaydı açılır`}
      closeLabel="Kapat"
      onClose={onClose}
      maxWidthClass="max-w-lg"
      footer={
        <QuoteDialogFooter onClose={onClose} onSave={handleSave} />
      }
    >
      <div className="space-y-3 px-1 pb-1">
        <label>
          <span className="text-xs font-medium text-black/70 dark:text-white/75">Teklif no</span>
          <input type="text" readOnly value={quoteNumber} className={`${inputClass} font-mono uppercase`} />
        </label>
        <label>
          <span className="text-xs font-medium text-black/70 dark:text-white/75">Teklif tarihi</span>
          <input type="text" readOnly value={formatQuoteDateTr(quoteDateIso)} className={inputClass} />
        </label>
        <label>
          <span className="text-xs font-medium text-black/70 dark:text-white/75">Teklifi veren</span>
          <input type="text" readOnly value={issuer.name} className={inputClass} />
        </label>
        <label htmlFor={contactSelectId}>
          <span className="text-xs font-medium text-black/70 dark:text-white/75">
            Teklif verilen firma yetkilisi <span className="text-rose-500">*</span>
          </span>
          <select
            id={contactSelectId}
            value={contactId}
            onChange={(e) => {
              setContactId(e.target.value)
              setError(null)
            }}
            className={inputClass}
          >
            <option value="">Seçiniz</option>
            {contactOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.adSoyad} · {c.gorev}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</p> : null}
        <p className="text-[11px] text-black/55 dark:text-white/60">
          Kayıt sonrası birim iş kuyruğunda teklif sonucu (red, kabul, revize vb.) işlenebilir.
        </p>
      </div>
    </PmStyleDialog>
  )
}

function QuoteDialogFooter({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div className="flex w-full justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
      >
        Vazgeç
      </button>
      <button type="button" onClick={onSave} className={`${eiSplitHeaderButtonPassive} px-3 py-2 text-sm`}>
        Teklifi oluştur
      </button>
    </div>
  )
}
