import { useEffect, useId, useState } from 'react'
import { MapPin, Trash2, X } from 'lucide-react'
import type { CrmCustomer, CrmLocationRow } from '../../data/crmCustomers'

type Props = {
  open: boolean
  mode?: 'create' | 'edit'
  initialCustomer?: CrmCustomer | null
  existingCodes: string[]
  onSave: (payload: CustomerDraft) => void
  onClose: () => void
}

type CustomerDraft = {
  name: string
  code: string
  sector: string
  taxId: string
  city: string
  billingAddress: string
  locations: CrmLocationRow[]
}

const EMPTY_DRAFT: CustomerDraft = {
  name: '',
  code: '',
  sector: 'Konut',
  taxId: '',
  city: '',
  billingAddress: '',
  locations: [],
}

export function CrmNewCustomerModal({
  open,
  mode = 'create',
  initialCustomer = null,
  existingCodes,
  onSave,
  onClose,
}: Props) {
  const titleId = useId()
  const [draft, setDraft] = useState<CustomerDraft>(EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [newLocationName, setNewLocationName] = useState('')
  const [newLocationInfo, setNewLocationInfo] = useState('')

  useEffect(() => {
    if (!open) {
      setDraft(EMPTY_DRAFT)
      setError(null)
      setNewLocationName('')
      setNewLocationInfo('')
      return
    }
    if (mode === 'edit' && initialCustomer) {
      setDraft({
        name: initialCustomer.name,
        code: initialCustomer.code,
        sector: initialCustomer.sector,
        taxId: initialCustomer.taxId,
        city: initialCustomer.city,
        billingAddress: initialCustomer.iletisim.adresNotu ?? '',
        locations: initialCustomer.locations ?? [],
      })
    } else {
      setDraft(EMPTY_DRAFT)
    }
  }, [open, mode, initialCustomer])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const addLocation = () => {
    const name = newLocationName.trim()
    const info = newLocationInfo.trim()
    if (!name || !info) return
    setDraft((prev) => ({
      ...prev,
      locations: [...prev.locations, { id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, locationInfo: info }],
    }))
    setNewLocationName('')
    setNewLocationInfo('')
  }

  const removeLocation = (locationId: string) => {
    setDraft((prev) => ({ ...prev, locations: prev.locations.filter((loc) => loc.id !== locationId) }))
  }

  const updateLocation = (locationId: string, patch: Partial<CrmLocationRow>) => {
    setDraft((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) => (loc.id === locationId ? { ...loc, ...patch } : loc)),
    }))
  }

  const save = () => {
    const code = draft.code.trim().toUpperCase()
    if (code.length < 2 || code.length > 4) {
      setError('Müşteri kodu 2-4 karakter olmalı.')
      return
    }
    if (!draft.name.trim()) {
      setError('Ticari unvan zorunludur.')
      return
    }
    const duplicate = existingCodes
      .filter((item) => (mode === 'edit' && initialCustomer ? item !== initialCustomer.code : true))
      .some((item) => item.toUpperCase() === code)
    if (duplicate) {
      setError('Bu müşteri kodu zaten kullanılıyor.')
      return
    }
    if (!draft.locations.length) {
      setError('En az bir lokasyon eklemelisiniz.')
      return
    }
    setError(null)
    onSave({ ...draft, code })
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
        aria-label="Müşteri dialog kapat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xl dark:border-slate-700/70 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {mode === 'edit' ? 'Müşteri düzenle' : 'Yeni müşteri'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Genel bilgileri tek formda doldurun.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Pencereyi kapat"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Ticari unvan</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Örn. Örnek Yapı A.Ş."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Müşteri kodu</span>
            <input
              type="text"
              value={draft.code}
              onChange={(event) => setDraft((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              maxLength={4}
              placeholder="2-4 karakter"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Sektör</span>
            <select
              value={draft.sector}
              onChange={(event) => setDraft((prev) => ({ ...prev, sector: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            >
              <option>Konut</option>
              <option>Altyapı</option>
              <option>Endüstriyel</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Vergi numarası</span>
            <input
              type="text"
              value={draft.taxId}
              onChange={(event) => setDraft((prev) => ({ ...prev, taxId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Şehir</span>
            <input
              type="text"
              value={draft.city}
              onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Fatura adresi</span>
            <textarea
              rows={3}
              value={draft.billingAddress}
              onChange={(event) => setDraft((prev) => ({ ...prev, billingAddress: event.target.value }))}
              className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
              placeholder="Mahalle, cadde, No…"
            />
          </label>

          <div className="sm:col-span-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Lokasyonlar</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  En az bir lokasyon tanımlayın. Projelerde lokasyon seçimi bu listeden yapılır.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Lokasyon adı</span>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(event) => setNewLocationName(event.target.value)}
                  placeholder="Örn. Merkez ofis"
                  className="mt-1 w-full rounded-lg border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 dark:border-slate-600/70 dark:bg-slate-800/35 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500/50 dark:focus-visible:ring-sky-400/15"
                />
              </label>
              <label className="min-w-0 flex-[1.35]">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Adres / konum</span>
                <input
                  type="text"
                  value={newLocationInfo}
                  onChange={(event) => setNewLocationInfo(event.target.value)}
                  placeholder="İl, ilçe, açık adres…"
                  className="mt-1 w-full rounded-lg border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 dark:border-slate-600/70 dark:bg-slate-800/35 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500/50 dark:focus-visible:ring-sky-400/15"
                />
              </label>
              <button
                type="button"
                onClick={addLocation}
                className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:mb-px"
              >
                Ekle
              </button>
            </div>
            {draft.locations.length > 0 ? (
              <ul
                className="mt-3 divide-y divide-slate-200/30 dark:divide-white/10"
                role="list"
              >
                {draft.locations.map((location) => (
                  <li
                    key={location.id}
                    className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-end sm:gap-3"
                  >
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={location.name}
                        onChange={(event) => updateLocation(location.id, { name: event.target.value })}
                        aria-label="Lokasyon adı"
                        className="w-full rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 dark:border-slate-600/60 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500/50 dark:focus-visible:ring-sky-400/15"
                      />
                      <input
                        type="text"
                        value={location.locationInfo}
                        onChange={(event) => updateLocation(location.id, { locationInfo: event.target.value })}
                        aria-label="Adres"
                        className="w-full rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/25 dark:border-slate-600/60 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-sky-500/50 dark:focus-visible:ring-sky-400/15"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocation(location.id)}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                      aria-label="Lokasyonu kaldır"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Henüz lokasyon eklenmedi.</p>
            )}
          </div>
        </div>

        {error ? <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-300">{error}</p> : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {mode === 'edit' ? 'Değişiklikleri kaydet' : 'Müşteriyi oluştur'}
          </button>
        </div>
      </div>
    </div>
  )
}
