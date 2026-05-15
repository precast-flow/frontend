import { StickyNote } from 'lucide-react'
import type { CrmCustomer } from '../../data/crmCustomers'

type Props = {
  customer: CrmCustomer
  gl: boolean
}

export function CustomerNotesGlassPanel({ customer, gl }: Props) {
  const hasNote = Boolean(customer.notes?.trim())

  return (
    <div
      className="project-mgmt-glass-light flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl"
      data-neutral-shell="true"
    >
      <div
        className={[
          'flex min-h-0 flex-1 flex-col overflow-hidden',
          gl
            ? 'glass-card glass-card--static project-mgmt-split-panel'
            : 'rounded-xl border border-black/15 bg-white/70 p-4 dark:border-white/12 dark:bg-black/45',
        ].join(' ')}
      >
        <header className="shrink-0 border-b border-black/12 pb-3 dark:border-white/10">
          <p
            className={
              gl
                ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
            }
          >
            Müşteri notları
          </p>
          <h2
            className={
              gl
                ? 'mt-1 text-base font-semibold text-black dark:text-white'
                : 'mt-1 text-base font-semibold text-slate-900 dark:text-slate-50'
            }
          >
            {customer.name}
          </h2>
          <p
            className={
              gl
                ? 'mt-0.5 text-xs text-black/65 dark:text-white/70'
                : 'mt-0.5 text-xs text-slate-600 dark:text-slate-300'
            }
          >
            Sorumlu: {customer.owner} · Son aktivite: {customer.lastActivity}
          </p>
        </header>

        <div className="okan-project-tab-panel min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div
            className={
              gl
                ? 'flex flex-col divide-y divide-black/12 dark:divide-white/10'
                : 'flex flex-col divide-y divide-slate-200/25 dark:divide-white/10'
            }
          >
            <section className="pb-4">
              <p
                className={
                  gl
                    ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                }
              >
                Kayıtlı not
              </p>
              <div
                className={[
                  'mt-3 flex items-start gap-3',
                  gl
                    ? 'glass-card glass-card--static rounded-2xl p-4'
                    : 'rounded-xl border border-black/14 bg-white/50 p-4 dark:border-white/12 dark:bg-black/40',
                ].join(' ')}
              >
                <StickyNote
                  className={
                    gl
                      ? 'mt-0.5 size-5 shrink-0 text-black/55 dark:text-white/60'
                      : 'mt-0.5 size-5 shrink-0 text-slate-500 dark:text-slate-400'
                  }
                  aria-hidden
                />
                <p
                  className={
                    gl
                      ? 'text-base leading-relaxed text-black/90 dark:text-white/90'
                      : 'text-base leading-relaxed text-slate-700 dark:text-slate-200'
                  }
                >
                  {hasNote ? customer.notes : 'Henüz kayıtlı not yok.'}
                </p>
              </div>
            </section>

            <section className="py-4">
              <label
                htmlFor={`crm-customer-notes-draft-${customer.id}`}
                className={
                  gl
                    ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                }
              >
                Yeni not
              </label>
              <textarea
                id={`crm-customer-notes-draft-${customer.id}`}
                rows={4}
                placeholder="Görüşme özeti, takip maddesi veya iç not... (mock)"
                className={
                  gl
                    ? 'glass-input mt-2 w-full min-h-[6rem] resize-y'
                    : 'okan-liquid-input mt-2 w-full min-h-[6rem] resize-y border-0 px-3 py-2.5 text-sm shadow-none focus:outline-none'
                }
              />
              <p
                className={
                  gl
                    ? 'mt-2 text-[11px] text-black/60 dark:text-white/65'
                    : 'mt-2 text-[11px] text-slate-500 dark:text-slate-400'
                }
              >
                Mock arayüz; kayıt sunucuya gönderilmez.
              </p>
            </section>

            <section className="pt-4">
              <p
                className={
                  gl
                    ? 'text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/65'
                    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                }
              >
                Son not hareketleri
              </p>
              <ol
                className={
                  gl
                    ? 'mt-3 space-y-3 border-l-2 border-black/15 pl-4 dark:border-white/15'
                    : 'mt-3 space-y-3 border-l-2 border-slate-200/60 pl-4 dark:border-slate-600/60'
                }
              >
                <li className="relative">
                  <span
                    className={
                      gl
                        ? 'absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-black ring-4 ring-black/10 dark:bg-white dark:ring-white/15'
                        : 'absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/20 dark:ring-sky-400/20'
                    }
                  />
                  <p
                    className={
                      gl ? 'font-medium text-black dark:text-white' : 'font-medium text-slate-900 dark:text-slate-50'
                    }
                  >
                    Toplantı notu eklendi
                  </p>
                  <p
                    className={
                      gl ? 'text-xs text-black/65 dark:text-white/70' : 'text-xs text-slate-600 dark:text-slate-300'
                    }
                  >
                    15 Mar · {customer.owner}
                  </p>
                </li>
                {hasNote ? (
                  <li className="relative">
                    <span
                      className={
                        gl
                          ? 'absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-black/35 ring-4 ring-black/8 dark:bg-white/40 dark:ring-white/10'
                          : 'absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-slate-400 ring-4 ring-slate-400/15 dark:bg-slate-500'
                      }
                    />
                    <p
                      className={
                        gl ? 'font-medium text-black dark:text-white' : 'font-medium text-slate-900 dark:text-slate-50'
                      }
                    >
                      Müşteri kartı güncellendi
                    </p>
                    <p
                      className={
                        gl ? 'text-xs text-black/65 dark:text-white/70' : 'text-xs text-slate-600 dark:text-slate-300'
                      }
                    >
                      Kayıt tarihi: {customer.createdAt}
                    </p>
                  </li>
                ) : null}
              </ol>
            </section>
          </div>
        </div>

        <footer
          className={[
            'mt-auto shrink-0 border-t pt-3',
            gl
              ? 'glass-card glass-card--static project-mgmt-footer-panel border-black/12 dark:border-white/10'
              : 'border-black/15 dark:border-white/12',
          ].join(' ')}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={gl ? 'text-xs text-black/70 dark:text-white/75' : 'text-xs text-slate-600 dark:text-slate-300'}>
              Notlar yalnızca bu müşteri kartına bağlıdır (mock).
            </p>
            <button
              type="button"
              className={
                gl
                  ? ['glass-btn', 'primary', 'small'].join(' ')
                  : 'rounded-lg border border-black/22 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-black/5 dark:border-white/15 dark:bg-black/80 dark:text-white dark:hover:bg-white/10'
              }
            >
              Kaydet
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
