import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { FileText, Plus, Target, Trash2, Upload } from 'lucide-react'
import type { CrmCustomer, CrmIletisimKisi } from '../../data/crmCustomers'
import {
  CRM_CUSTOMER_POTENTIAL_OPTIONS,
  CRM_MEETING_METHOD_OPTIONS,
  CRM_TARGET_AUDIENCES,
  type CrmCustomerPotential,
} from '../../data/crmFormOptions'
import { getDistrictsForProvince, getProvinceNames } from '../../data/turkeyProvinces'
import { eiSplitHeaderButtonPassive } from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { AppDialog, AppDialogButton } from '../shared/AppDialog'

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950'
const labelClass = 'text-xs font-medium text-slate-600 dark:text-slate-300'
const sectionTitleClass = 'text-sm font-semibold text-slate-900 dark:text-slate-50'

export type CrmContactPersonDraft = {
  id: string
  adSoyad: string
  unvan: string
  telefon: string
  email: string
  notlar: string
}

export type CrmPendingDocDraft = {
  id: string
  name: string
  size: string
}

export type CustomerDraft = {
  name: string
  province: string
  district: string
  openAddress: string
  stampImageUrl: string | null
  customerPotential: CrmCustomerPotential | ''
  taxId: string
  contactPersons: CrmContactPersonDraft[]
  targetAudienceIds: string[]
  pendingDocs: CrmPendingDocDraft[]
  meetingMethod: string
  meetingNotes: string
  reminderEnabled: boolean
  reminderNote: string
  reminderDate: string
}

type Props = {
  open: boolean
  mode?: 'create' | 'edit'
  initialCustomer?: CrmCustomer | null
  onSave: (payload: CustomerDraft) => void
  onClose: () => void
}

const EMPTY_CONTACT = (): CrmContactPersonDraft => ({
  id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  adSoyad: '',
  unvan: '',
  telefon: '',
  email: '',
  notlar: '',
})

const EMPTY_DRAFT: CustomerDraft = {
  name: '',
  province: '',
  district: '',
  openAddress: '',
  stampImageUrl: null,
  customerPotential: '',
  taxId: '',
  contactPersons: [EMPTY_CONTACT()],
  targetAudienceIds: [],
  pendingDocs: [],
  meetingMethod: '',
  meetingNotes: '',
  reminderEnabled: false,
  reminderNote: '',
  reminderDate: '',
}

function mapContactFromCustomer(k: CrmIletisimKisi): CrmContactPersonDraft {
  return {
    id: k.id,
    adSoyad: k.adSoyad,
    unvan: k.gorev,
    telefon: k.cep,
    email: k.email,
    notlar: k.notlar ?? '',
  }
}

function customerToDraft(customer: CrmCustomer): CustomerDraft {
  return {
    name: customer.name,
    province: customer.province ?? customer.city ?? '',
    district: customer.district ?? '',
    openAddress: customer.openAddress ?? customer.iletisim.adresNotu ?? '',
    stampImageUrl: customer.stampImageUrl ?? null,
    customerPotential: customer.customerPotential ?? '',
    taxId: customer.taxId,
    contactPersons: customer.iletisim.kisiler.length
      ? customer.iletisim.kisiler.map(mapContactFromCustomer)
      : [EMPTY_CONTACT()],
    targetAudienceIds: customer.targetAudienceIds ?? [],
    pendingDocs: [],
    meetingMethod: customer.meetingMethod ?? '',
    meetingNotes: customer.meetingNotes ?? customer.notes ?? '',
    reminderEnabled: customer.reminder?.enabled ?? false,
    reminderNote: customer.reminder?.note ?? '',
    reminderDate: customer.reminder?.date ?? '',
  }
}

function isValidTaxId(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}

function SectionHeader({
  title,
  hint,
  icon,
  action,
}: {
  title: string
  hint?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {icon}
        <div>
          <p className={sectionTitleClass}>{title}</p>
          {hint ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        </div>
      </div>
      {action}
    </div>
  )
}


export function CrmNewCustomerModal({
  open,
  mode = 'create',
  initialCustomer = null,
  onSave,
  onClose,
}: Props) {
  const stampFileRef = useRef<HTMLInputElement>(null)
  const docFileRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<CustomerDraft>(EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)

  const provinceNames = useMemo(() => getProvinceNames(), [])
  const districtOptions = useMemo(
    () => (draft.province ? getDistrictsForProvince(draft.province) : []),
    [draft.province],
  )

  useEffect(() => {
    if (!open) {
      setDraft(EMPTY_DRAFT)
      setError(null)
      return
    }
    if (mode === 'edit' && initialCustomer) {
      setDraft(customerToDraft(initialCustomer))
    } else {
      setDraft(EMPTY_DRAFT)
    }
  }, [open, mode, initialCustomer])

  const toggleTargetAudience = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      targetAudienceIds: prev.targetAudienceIds.includes(id)
        ? prev.targetAudienceIds.filter((x) => x !== id)
        : [...prev.targetAudienceIds, id],
    }))
  }

  const updateContact = (id: string, patch: Partial<CrmContactPersonDraft>) => {
    setDraft((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }

  const addContact = () => {
    setDraft((prev) => ({ ...prev, contactPersons: [...prev.contactPersons, EMPTY_CONTACT()] }))
  }

  const removeContact = (id: string) => {
    setDraft((prev) => {
      const next = prev.contactPersons.filter((p) => p.id !== id)
      return { ...prev, contactPersons: next.length ? next : [EMPTY_CONTACT()] }
    })
  }

  const onStampFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) {
      setDraft((prev) => ({ ...prev, stampImageUrl: null }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : null
      setDraft((prev) => ({ ...prev, stampImageUrl: url }))
    }
    reader.readAsDataURL(file)
  }

  const onDocFiles = (files: FileList | null) => {
    if (!files?.length) return
    const added: CrmPendingDocDraft[] = Array.from(files).map((f) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size > 1_048_576 ? `${(f.size / 1_048_576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
    }))
    setDraft((prev) => ({ ...prev, pendingDocs: [...prev.pendingDocs, ...added] }))
  }

  const removeDoc = (id: string) => {
    setDraft((prev) => ({ ...prev, pendingDocs: prev.pendingDocs.filter((d) => d.id !== id) }))
  }

  const save = () => {
    if (!draft.name.trim()) {
      setError('Firma ünvanı zorunludur.')
      return
    }
    if (!draft.province) {
      setError('İl seçimi zorunludur.')
      return
    }
    if (!draft.district) {
      setError('İlçe seçimi zorunludur.')
      return
    }
    if (!draft.openAddress.trim()) {
      setError('Açık adres zorunludur.')
      return
    }
    if (!draft.taxId.trim()) {
      setError('VKN veya TCKN zorunludur.')
      return
    }
    if (!isValidTaxId(draft.taxId)) {
      setError('VKN 10 veya TCKN 11 haneli olmalıdır.')
      return
    }
    if (!draft.customerPotential) {
      setError('Müşteri olma potansiyeli seçilmelidir.')
      return
    }
    const hasValidContact = draft.contactPersons.some(
      (p) => p.adSoyad.trim() && p.unvan.trim() && p.telefon.trim() && p.email.trim(),
    )
    if (!hasValidContact) {
      setError('En az bir ilgili kişi için ad soyad, ünvan, telefon ve e-posta girilmelidir.')
      return
    }
    if (!draft.targetAudienceIds.length) {
      setError('En az bir hedef kitle seçilmelidir.')
      return
    }
    if (!draft.meetingMethod) {
      setError('Görüşme şekli (tanışma kanalı) seçilmelidir.')
      return
    }
    if (!draft.meetingNotes.trim()) {
      setError('Görüşme notu zorunludur.')
      return
    }
    if (draft.reminderEnabled) {
      if (!draft.reminderDate) {
        setError('Hatırlatma tarihi girilmelidir.')
        return
      }
      if (!draft.reminderNote.trim()) {
        setError('Hatırlatma notu girilmelidir.')
        return
      }
    }
    setError(null)
    onSave(draft)
  }

  return (
    <AppDialog
      open={open}
      size="lg"
      title={mode === 'edit' ? 'Aday müşteri düzenle' : 'Aday müşteri oluştur'}
      subtitle="Potansiyel müşteri kaydı; zorunlu alanlar * ile işaretlidir."
      closeLabel="Pencereyi kapat"
      onClose={onClose}
      footer={
        <>
          <AppDialogButton variant="secondary" onClick={onClose}>
            Vazgeç
          </AppDialogButton>
          <AppDialogButton variant="primary" onClick={save}>
            {mode === 'edit' ? 'Değişiklikleri kaydet' : 'Aday müşteriyi kaydet'}
          </AppDialogButton>
        </>
      }
    >
      <div className="space-y-4">
          <section className="space-y-3">
            <h3 className={sectionTitleClass}>Firma bilgileri</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelClass}>
                  Firma ünvanı <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Örn. Örnek Yapı A.Ş."
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>
                  İl <span className="text-rose-500">*</span>
                </span>
                <select
                  value={draft.province}
                  onChange={(e) => {
                    const province = e.target.value
                    setDraft((p) => ({
                      ...p,
                      province,
                      district: '',
                    }))
                  }}
                  className={inputClass}
                >
                  <option value="">Seçiniz</option>
                  {provinceNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>
                  İlçe <span className="text-rose-500">*</span>
                </span>
                <select
                  value={draft.district}
                  disabled={!draft.province}
                  onChange={(e) => setDraft((p) => ({ ...p, district: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Seçiniz</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>
                  Açık adres <span className="text-rose-500">*</span>
                </span>
                <textarea
                  rows={2}
                  value={draft.openAddress}
                  onChange={(e) => setDraft((p) => ({ ...p, openAddress: e.target.value }))}
                  placeholder="Mahalle, cadde, kapı no…"
                  className={`${inputClass} resize-none`}
                />
              </label>
              <StampUploadBlock
                stampFileRef={stampFileRef}
                stampImageUrl={draft.stampImageUrl}
                onPick={() => stampFileRef.current?.click()}
                onFile={onStampFile}
                onClear={() => setDraft((p) => ({ ...p, stampImageUrl: null }))}
              />
              <label>
                <span className={labelClass}>
                  VKN veya TCKN <span className="text-rose-500">*</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draft.taxId}
                  onChange={(e) => setDraft((p) => ({ ...p, taxId: e.target.value }))}
                  placeholder="10 veya 11 hane"
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>
                  Müşteri olma potansiyeli <span className="text-rose-500">*</span>
                </span>
                <select
                  value={draft.customerPotential}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, customerPotential: e.target.value as CrmCustomerPotential | '' }))
                  }
                  className={inputClass}
                >
                  <option value="">Seçiniz</option>
                  {CRM_CUSTOMER_POTENTIAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <SectionHeader
              title="İlgili kişiler"
              hint="Ad soyad, ünvan, telefon ve e-posta zorunlu; notlar opsiyonel."
              action={
                <button type="button" onClick={addContact} className={`${eiSplitHeaderButtonPassive} px-2 py-1 text-xs`}>
                  <Plus className="mr-1 inline size-3.5" aria-hidden />
                  Kişi ekle
                </button>
              }
            />
            <ul className="space-y-3">
              {draft.contactPersons.map((person, index) => (
                <li
                  key={person.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
                >
                  <ContactPersonFields
                    person={person}
                    index={index}
                    canRemove={draft.contactPersons.length > 1}
                    onUpdate={(patch) => updateContact(person.id, patch)}
                    onRemove={() => removeContact(person.id)}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <SectionHeader
              icon={<Target className="size-4 text-sky-600 dark:text-sky-400" aria-hidden />}
              title="Hedef kitle"
              hint="Önceden tanımlı listelerden seçim yapın."
            />
            <div className="grid gap-2 sm:grid-cols-2">
              {CRM_TARGET_AUDIENCES.map((ta) => {
                const selected = draft.targetAudienceIds.includes(ta.id)
                return (
                  <button
                    key={ta.id}
                    type="button"
                    onClick={() => toggleTargetAudience(ta.id)}
                    className={[
                      'rounded-xl border px-3 py-2.5 text-left text-sm transition',
                      selected
                        ? 'border-sky-500/60 bg-sky-50/80 ring-1 ring-sky-400/30 dark:bg-sky-950/40'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                    ].join(' ')}
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-50">{ta.label}</span>
                    {ta.description ? (
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{ta.description}</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <SectionHeader
              icon={<FileText className="size-4 text-slate-500" aria-hidden />}
              title="Dökümanlar"
              hint="Sözleşme, çizim veya diğer dosyalar (opsiyonel)."
            />
            <input
              ref={docFileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                onDocFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => docFileRef.current?.click()}
              className={`${eiSplitHeaderButtonPassive} inline-flex items-center gap-2 px-3 py-2 text-sm`}
            >
              <Upload className="size-4" aria-hidden />
              Dosya yükle
            </button>
            {draft.pendingDocs.length > 0 ? (
              <ul className="divide-y divide-slate-200/60 rounded-lg border border-slate-200/80 dark:divide-slate-700 dark:border-slate-700">
                {draft.pendingDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="truncate text-slate-800 dark:text-slate-100">{doc.name}</span>
                    <span className="shrink-0 text-xs text-slate-500">{doc.size}</span>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="shrink-0 text-slate-400 hover:text-rose-600"
                      aria-label="Dosyayı kaldır"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className={sectionTitleClass}>Görüşme</h3>
            <label>
              <span className={labelClass}>
                Biz nereden tanıştık? <span className="text-rose-500">*</span>
              </span>
              <select
                value={draft.meetingMethod}
                onChange={(e) => setDraft((p) => ({ ...p, meetingMethod: e.target.value }))}
                className={inputClass}
              >
                <option value="">Seçiniz</option>
                {CRM_MEETING_METHOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={labelClass}>
                Görüşme notu <span className="text-rose-500">*</span>
              </span>
              <textarea
                rows={3}
                value={draft.meetingNotes}
                onChange={(e) => setDraft((p) => ({ ...p, meetingNotes: e.target.value }))}
                placeholder="İlk görüşme özeti, ihtiyaçlar, sonraki adımlar…"
                className={`${inputClass} resize-none`}
              />
            </label>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className={sectionTitleClass}>Hatırlatma</h3>
            <fieldset className="flex flex-wrap gap-4">
              <legend className="sr-only">Hatırlatma yapılacak mı</legend>
              {(['hayir', 'evet'] as const).map((value) => (
                <label
                  key={value}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="radio"
                    name="crm-reminder"
                    checked={value === 'evet' ? draft.reminderEnabled : !draft.reminderEnabled}
                    onChange={() =>
                      setDraft((p) => ({
                        ...p,
                        reminderEnabled: value === 'evet',
                        reminderNote: value === 'evet' ? p.reminderNote : '',
                        reminderDate: value === 'evet' ? p.reminderDate : '',
                      }))
                    }
                    className="size-4 accent-sky-600"
                  />
                  {value === 'evet' ? 'Evet' : 'Hayır'}
                </label>
              ))}
            </fieldset>
            {draft.reminderEnabled ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelClass}>
                    Hatırlatma notu <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="text"
                    value={draft.reminderNote}
                    onChange={(e) => setDraft((p) => ({ ...p, reminderNote: e.target.value }))}
                    placeholder="Örn. Tekrar ara, teklif gönder"
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className={labelClass}>
                    Hatırlatma tarihi <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={draft.reminderDate}
                    onChange={(e) => setDraft((p) => ({ ...p, reminderDate: e.target.value }))}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evet seçildiğinde belirlenen tarihte bildirim merkezine otomatik hatırlatma düşer.
              </p>
            )}
          </section>

      </div>
      {error ? (
        <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>
      ) : null}
    </AppDialog>
  )
}

function StampUploadBlock({
  stampFileRef,
  stampImageUrl,
  onPick,
  onFile,
  onClear,
}: {
  stampFileRef: React.RefObject<HTMLInputElement | null>
  stampImageUrl: string | null
  onPick: () => void
  onFile: (file: File | undefined) => void
  onClear: () => void
}) {
  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>Kaşe resmi (opsiyonel)</span>
      <input
        ref={stampFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onPick} className={`${eiSplitHeaderButtonPassive} px-3 py-2 text-sm`}>
          <Upload className="mr-1.5 inline size-4" aria-hidden />
          Görsel seç
        </button>
        {stampImageUrl ? (
          <>
            <img src={stampImageUrl} alt="Kaşe önizleme" className="h-14 w-auto rounded border border-slate-200 object-contain dark:border-slate-600" />
            <button type="button" onClick={onClear} className="text-xs text-slate-500 underline hover:text-rose-600">
              Kaldır
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

function ContactPersonFields({
  person,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: {
  person: CrmContactPersonDraft
  index: number
  canRemove: boolean
  onUpdate: (patch: Partial<CrmContactPersonDraft>) => void
  onRemove: () => void
}) {
  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kişi {index + 1}</span>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-600"
            aria-label="Kişiyi kaldır"
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Ad soyad *</span>
          <input
            type="text"
            value={person.adSoyad}
            onChange={(e) => onUpdate({ adSoyad: e.target.value })}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Ünvan *</span>
          <input
            type="text"
            value={person.unvan}
            onChange={(e) => onUpdate({ unvan: e.target.value })}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Telefon *</span>
          <input
            type="tel"
            value={person.telefon}
            onChange={(e) => onUpdate({ telefon: e.target.value })}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>E-posta *</span>
          <input
            type="email"
            value={person.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Notlar</span>
          <input
            type="text"
            value={person.notlar}
            onChange={(e) => onUpdate({ notlar: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
    </>
  )
}
