import { useMemo, useState } from 'react'
import { AlertTriangle, Beaker, ChevronDown, ChevronUp, Info, Search, ShieldCheck } from 'lucide-react'
import { useFactoryContext } from '../../context/FactoryContext'
import {
  CONCRETE_RECIPE_SEED,
  MOCK_ORDER_CONTEXT,
  MOCK_RECIPE_CHANGE_LOG,
  type ConcreteRecipe,
} from '../../data/concreteRecipeMock'
import { useI18n } from '../../i18n/I18nProvider'

const inset =
  'rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-100'

export function ConcreteRecipeSelectionView() {
  const { t } = useI18n()
  const { contextDetail, selectedFactory, selectedCodes } = useFactoryContext()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>(CONCRETE_RECIPE_SEED[0]!.id)
  const [additivesOpen, setAdditivesOpen] = useState(true)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CONCRETE_RECIPE_SEED
    return CONCRETE_RECIPE_SEED.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.strengthClass.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    )
  }, [query])

  const selected: ConcreteRecipe | undefined = useMemo(
    () => CONCRETE_RECIPE_SEED.find((r) => r.id === selectedId),
    [selectedId],
  )

  const factoryHint = selectedCodes.length > 1 ? selectedCodes.join(', ') : selectedFactory.code

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <strong className="text-gray-800 dark:text-gray-100">prod-05:</strong> {t('concreteRecipe.intro')}{' '}
        <span className="text-gray-500">{contextDetail}</span> · <strong>{factoryHint}</strong>
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* P0 — arama + havuz listesi */}
        <section className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/70">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('concreteRecipe.poolTitle')}</h2>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              className={`${inset} w-full pl-10`}
              placeholder={t('concreteRecipe.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{t('concreteRecipe.poolHint')}</p>
          <ul className="max-h-[min(22rem,50vh)] space-y-2 overflow-auto pr-1">
            {filtered.map((r) => {
              const active = r.id === selectedId
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? 'bg-gray-800 text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900'
                        : 'bg-gray-100 text-gray-800 shadow-neo-in hover:bg-gray-200/80 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold">{r.code}</span>
                      <span className={`text-xs ${active ? 'text-white/90 dark:text-gray-800/90' : 'text-gray-600 dark:text-gray-300'}`}>
                        {r.strengthClass}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          active
                            ? 'bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900'
                            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100'
                        }`}
                      >
                        <ShieldCheck className="size-3" aria-hidden />
                        {t('concreteRecipe.approvedBadge')}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">{t('concreteRecipe.emptyPool')}</p>
          ) : null}
        </section>

        <div className="flex flex-col gap-4">
          {/* P0 — seçim özeti */}
          <section className="rounded-2xl border border-gray-200/90 bg-gray-100/80 p-4 shadow-neo-out-sm dark:border-gray-700 dark:bg-gray-900/80">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
              <Beaker className="size-4 text-gray-600 dark:text-gray-300" aria-hidden />
              {t('concreteRecipe.summaryTitle')}
            </h2>
            {selected ? (
              <>
                <p className="mt-2 font-mono text-lg font-semibold text-gray-900 dark:text-gray-50">{selected.code}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {selected.strengthClass} · {t('concreteRecipe.approvedBadge')}
                </p>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  {selected.criticalNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-500">{t('concreteRecipe.noSelection')}</p>
            )}
          </section>

          {/* P0 — santral paketi önizleme */}
          <section
            className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/80"
            aria-label={t('concreteRecipe.batchPreviewTitle')}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('concreteRecipe.batchPreviewTitle')}
            </h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                <dt className="text-gray-500 dark:text-gray-400">{t('concreteRecipe.batchOrder')}</dt>
                <dd className="font-mono font-medium text-gray-900 dark:text-gray-50">{MOCK_ORDER_CONTEXT.orderNo}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                <dt className="text-gray-500 dark:text-gray-400">{t('concreteRecipe.batchLine')}</dt>
                <dd className="text-gray-800 dark:text-gray-100">{MOCK_ORDER_CONTEXT.lineRef}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                <dt className="text-gray-500 dark:text-gray-400">{t('concreteRecipe.batchM3')}</dt>
                <dd className="tabular-nums font-medium text-gray-900 dark:text-gray-50">{MOCK_ORDER_CONTEXT.m3Target} m³</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-200/80 pb-2 dark:border-gray-700/80">
                <dt className="text-gray-500 dark:text-gray-400">{t('concreteRecipe.batchPart')}</dt>
                <dd className="font-mono text-gray-800 dark:text-gray-100">{MOCK_ORDER_CONTEXT.partRef}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-1">
                <dt className="text-gray-500 dark:text-gray-400">{t('concreteRecipe.batchConcreteId')}</dt>
                <dd className="font-mono font-semibold text-gray-900 dark:text-gray-50">
                  {selected ? selected.code : '—'}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* P1 — uyumsuzluk */}
      {selected?.mismatchWarning ? (
        <div
          className="flex gap-3 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
          <div>
            <p className="font-semibold">{t('concreteRecipe.mismatchTitle')}</p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">{selected.mismatchWarning}</p>
          </div>
        </div>
      ) : null}

      {/* P1 — değişim geçmişi */}
      <section className="rounded-2xl bg-gray-100 shadow-neo-in dark:bg-gray-900/80">
        <h2 className="border-b border-gray-200/90 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-50 dark:border-gray-700/90">
          {t('concreteRecipe.historyTitle')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2 font-semibold">{t('concreteRecipe.colWhen')}</th>
                <th className="px-4 py-2 font-semibold">{t('concreteRecipe.colWho')}</th>
                <th className="px-4 py-2 font-semibold">{t('concreteRecipe.colFrom')}</th>
                <th className="px-4 py-2 font-semibold">{t('concreteRecipe.colTo')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECIPE_CHANGE_LOG.map((row) => (
                <tr key={row.id} className="border-t border-gray-200/80 dark:border-gray-700/80">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-gray-700 dark:text-gray-200">
                    {row.atDisplay}
                  </td>
                  <td className="px-4 py-2.5 text-gray-800 dark:text-gray-100">{row.actor}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-300">{row.fromCode}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium text-gray-900 dark:text-gray-50">{row.toCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* P2 — katkı maddeleri */}
      {selected ? (
        <section className="rounded-2xl border border-gray-200/90 bg-gray-50 dark:border-gray-700 dark:bg-gray-950/60">
          <button
            type="button"
            onClick={() => setAdditivesOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50"
            aria-expanded={additivesOpen}
          >
            <span className="flex items-center gap-2">
              <Info className="size-4 text-gray-500" aria-hidden />
              {t('concreteRecipe.additivesTitle')}
            </span>
            {additivesOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
          </button>
          {additivesOpen ? (
            <div className="border-t border-gray-200/90 px-4 pb-4 pt-2 dark:border-gray-700/90">
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t('concreteRecipe.additivesHint')}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                    <th className="pb-2 font-semibold">{t('concreteRecipe.additiveName')}</th>
                    <th className="pb-2 font-semibold">{t('concreteRecipe.additiveDose')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.additives.map((a, i) => (
                    <tr key={i} className="border-t border-gray-200/70 dark:border-gray-700/70">
                      <td className="py-2 text-gray-800 dark:text-gray-100">{a.name}</td>
                      <td className="py-2 font-mono tabular-nums text-gray-700 dark:text-gray-200">{a.dosageLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
