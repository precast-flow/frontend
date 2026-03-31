import { useMemo, useState } from 'react'
import { Building2, Factory, FileText, Layers, Link2, Package, Truck } from 'lucide-react'
import { QUALITY_LINK_PACKAGES, recipeMismatch } from '../../data/qualityLinkPanelMock'
import { useI18n } from '../../i18n/I18nProvider'

const card =
  'rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/85'
const label = 'text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'
const value = 'mt-1 text-sm font-medium text-gray-900 dark:text-gray-50'

const chip =
  'inline-flex rounded-full bg-gray-200/90 px-2.5 py-0.5 text-xs font-mono font-semibold text-gray-800 shadow-neo-in dark:bg-gray-800 dark:text-gray-100'

export function QualityLinkPanelView() {
  const { t } = useI18n()
  const [pkgId, setPkgId] = useState(QUALITY_LINK_PACKAGES[0]?.id ?? '')

  const pkg = useMemo(
    () => QUALITY_LINK_PACKAGES.find((p) => p.id === pkgId) ?? QUALITY_LINK_PACKAGES[0] ?? null,
    [pkgId],
  )

  if (!pkg) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">{t('qualityLink.empty')}</p>
    )
  }

  const mismatch = recipeMismatch(pkg)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <strong className="text-gray-800 dark:text-gray-100">qual-06:</strong> {t('qualityLink.intro')}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-[min(100%,280px)] flex-1">
          <span className={label}>{t('qualityLink.selectPackage')}</span>
          <select
            className="mt-1.5 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 shadow-neo-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-950 dark:text-gray-50"
            value={pkgId}
            onChange={(e) => setPkgId(e.target.value)}
          >
            {QUALITY_LINK_PACKAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sampleCode} · {p.orderNo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mismatch ? (
        <div
          className="rounded-2xl border border-amber-400/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-neo-in dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p className="font-semibold">{t('qualityLink.warnTitle')}</p>
          <p className="mt-1 text-xs leading-relaxed">
            {t('qualityLink.warnBody', {
              sample: pkg.sampleRecipeCode,
              order: pkg.orderRecipeCode,
            })}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <section className={card}>
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.company')}</p>
              <p className={`${value} font-semibold`}>{pkg.companyName}</p>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityLink.companyHint')}</p>
            </div>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-start gap-2">
            <Factory className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.factory')}</p>
              <p className={value}>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{pkg.factoryCode}</span>
                <br />
                {pkg.factoryName}
              </p>
            </div>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-start gap-2">
            <Layers className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.project')}</p>
              <p className={value}>{pkg.project}</p>
              <p className={`${label} mt-3`}>{t('qualityLink.card.customer')}</p>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-100">{pkg.customerName}</p>
            </div>
          </div>
        </section>

        <section className={`${card} sm:col-span-2 xl:col-span-2`}>
          <div className="flex items-start gap-2">
            <Package className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.parts')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pkg.partCodes.map((code) => (
                  <span key={code} className={chip}>
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={card}>
          <p className={label}>{t('qualityLink.card.recipes')}</p>
          <div className="mt-2 space-y-2 text-sm">
            <div className="rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-950/80">
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityLink.recipeSample')}
              </p>
              <p className="mt-0.5 font-mono font-semibold text-gray-900 dark:text-gray-50">{pkg.sampleRecipeCode}</p>
            </div>
            <div className="rounded-xl bg-gray-100 px-3 py-2 shadow-neo-in dark:bg-gray-950/80">
              <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                {t('qualityLink.recipeOrder')}
              </p>
              <p className="mt-0.5 font-mono font-semibold text-gray-900 dark:text-gray-50">{pkg.orderRecipeCode}</p>
            </div>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-start gap-2">
            <Truck className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.order')}</p>
              <p className={`${value} font-mono`}>{pkg.orderNo}</p>
            </div>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-start gap-2">
            <Link2 className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.pour')}</p>
              <p className={`${value} font-mono`}>{pkg.pourBatchId}</p>
            </div>
          </div>
        </section>

        <section className={`${card} sm:col-span-2 xl:col-span-3`}>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 size-4 shrink-0 text-gray-500 dark:text-gray-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={label}>{t('qualityLink.card.external')}</p>
              <a
                href={pkg.externalDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex break-all text-sm font-medium text-gray-900 underline decoration-gray-400 underline-offset-2 hover:text-gray-700 dark:text-gray-50 dark:hover:text-white"
              >
                {pkg.externalDocLabel}
              </a>
              <p className="mt-1 font-mono text-[10px] text-gray-500 dark:text-gray-400">{pkg.externalDocUrl}</p>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{t('qualityLink.externalHint')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
