import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../templates/glassmorphism/GlassCard'
import { GlassForm } from '../templates/glassmorphism/GlassForm'
import { GlassKpiWidget } from '../templates/glassmorphism/GlassKpiWidget'
import { GlassTable } from '../templates/glassmorphism/GlassTable'

const rows = [
  { id: 'WO-1042', product: 'Kiriş 12m', status: 'Üretimde', eta: '26 Mar' },
  { id: 'WO-1043', product: 'Panel A-17', status: 'Plan', eta: '28 Mar' },
  { id: 'WO-1044', product: 'Kolon C-04', status: 'Kalite', eta: '27 Mar' },
]

/**
 * Demo surface for dashboard / table / form glass compositions (prod-06).
 * Open in glass template: `/glass-showcase`
 */
export function GlassShowcasePage() {
  const [note, setNote] = useState('')

  const onDemoSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="gm-glass-scope flex flex-col gap-4 rounded-[1.15rem] md:gap-5">
      <GlassCard>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--glass-accent-primary)]">
              Glass showcase
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--glass-text-primary)]">
              Dashboard · Liste · Form
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--glass-text-muted)]">
              Bu sayfa yalnızca cam katmanlı bileşen örneklerini gösterir. Ana modüllere dönmek için genel bakışa
              gidebilirsiniz.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--glass-border-soft)] bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--glass-text-primary)] transition hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            Genel bakışa dön
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <GlassKpiWidget label="Aktif iş emri" value="38" hint="+4 son 24s" />
          <GlassKpiWidget label="Sevk hazır" value="12" hint="3 bekleyen QC" />
          <GlassKpiWidget label="Kapasite" value="%76" hint="Hat-2 darboğaz" />
          <GlassKpiWidget label="SLA" value="92%" hint="Haftalık ort." />
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--glass-accent-primary)]">
          glass-02 — yardımcı sınıflar
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--glass-text-primary)]">Token + gm-glass-* örnekleri</h2>
        <p className="mt-1 text-sm text-[var(--glass-text-muted)]">
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">.gm-glass-surface-panel</code>,{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">.gm-glass-control</code>,{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">.gm-glass-divider</code>,{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">.gm-glass-solid-row</code> (blur kapalı satır).
        </p>
        <div className="gm-glass-surface-panel mt-4 rounded-2xl p-4">
          <p className="text-sm font-medium text-[var(--glass-text-primary)]">İç yüzey — surface-panel</p>
          <div className="gm-glass-divider" />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              className="gm-glass-control min-w-[12rem] flex-1 text-sm"
              placeholder="gm-glass-control (input)"
              aria-label="Örnek cam input"
            />
            <button type="button" className="gm-glass-control px-4 py-2.5 text-sm font-semibold">
              gm-glass-control (button)
            </button>
          </div>
          <div className="mt-4 flex items-stretch gap-2">
            <span className="flex items-center text-xs text-[var(--glass-text-muted)]">Ayırıcı</span>
            <div className="gm-glass-divider-vertical shrink-0" aria-hidden />
            <div className="gm-glass-solid-row flex flex-1 items-center rounded-xl border px-3 py-2 text-sm text-[var(--glass-text-primary)]">
              Yoğun veri satırı — solid-row
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--glass-accent-primary)]">
          glass-03 — primitive sınıflar
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--glass-text-primary)]">gm-glass-btn-* · gm-glass-card-inset</h2>
        <p className="mt-1 text-sm text-[var(--glass-text-muted)]">
          Modüllerde kademeli geçiş için; ayrıca Dashboard / Teklif gibi ekranlarda mevcut Tailwind + neo kombinasyonları otomatik camlaşır.
        </p>
        <div className="gm-glass-card-inset mt-4 space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="gm-glass-btn-primary">
              Birincil
            </button>
            <button type="button" className="gm-glass-btn-secondary">
              İkincil
            </button>
            <button type="button" className="gm-glass-btn-ghost">
              Ghost
            </button>
            <button type="button" className="gm-glass-btn-danger">
              Tehlike
            </button>
            <button type="button" className="gm-glass-btn-primary" disabled>
              Pasif
            </button>
          </div>
          <div className="gm-glass-divider" />
          <p className="text-xs text-[var(--glass-text-muted)]">
            Sınıf sabitleri: <code className="rounded bg-white/10 px-1">glassPrimitiveClasses</code> içinde{' '}
            <code className="rounded bg-white/10 px-1">glassTokens.ts</code>.
          </p>
        </div>
      </GlassCard>

      <GlassTable title="Liste / tablo örneği">
        <table className="min-w-full border-collapse text-left text-sm text-[var(--glass-text-primary)]">
          <thead className="bg-white/5 text-[var(--glass-text-muted)] dark:bg-black/20">
            <tr>
              <th className="px-4 py-3 font-semibold md:px-5">İş emri</th>
              <th className="px-4 py-3 font-semibold md:px-5">Ürün</th>
              <th className="px-4 py-3 font-semibold md:px-5">Durum</th>
              <th className="px-4 py-3 font-semibold md:px-5">ETA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-[var(--glass-border-muted)] transition hover:bg-white/5 dark:hover:bg-white/5"
              >
                <td className="px-4 py-3 font-medium md:px-5">{r.id}</td>
                <td className="px-4 py-3 md:px-5">{r.product}</td>
                <td className="px-4 py-3 md:px-5">
                  <span className="rounded-full border border-[var(--glass-border-soft)] bg-white/10 px-2.5 py-1 text-xs font-semibold">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--glass-text-muted)] md:px-5">{r.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassTable>

      <GlassForm title="Form örneği" onSubmit={onDemoSubmit}>
        <label className="block text-sm font-medium text-[var(--glass-text-primary)]">
          Proje adı
          <input
            className="mt-1 w-full rounded-xl border border-[var(--glass-border-soft)] bg-white/10 px-3 py-2 text-sm text-[var(--glass-text-primary)] outline-none placeholder:text-[var(--glass-text-muted)] focus-visible:ring-2 focus-visible:ring-sky-300"
            placeholder="Örn. Merkez Ofis"
          />
        </label>
        <label className="block text-sm font-medium text-[var(--glass-text-primary)]">
          Not
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-[var(--glass-border-soft)] bg-white/10 px-3 py-2 text-sm text-[var(--glass-text-primary)] outline-none placeholder:text-[var(--glass-text-muted)] focus-visible:ring-2 focus-visible:ring-sky-300"
            placeholder="Kısa açıklama"
          />
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            className="rounded-xl bg-[var(--glass-accent-primary)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:text-slate-950"
          >
            Kaydet (demo)
          </button>
          <button
            type="button"
            className="rounded-xl border border-[var(--glass-border-soft)] bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--glass-text-primary)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            Vazgeç
          </button>
        </div>
      </GlassForm>
    </div>
  )
}
