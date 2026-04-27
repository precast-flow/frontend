import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { resolveInstanceMark } from '../../elementIdentity/firm/nameResolver'
import type {
  FirmCodeOverride,
  FirmNamingTemplate,
  FirmProfile,
  ProjectElement,
  ProjectLike,
} from '../../elementIdentity/types'

type PreviewElement = Pick<
  ProjectElement,
  'elementTypeId' | 'typologyId' | 'variantCode' | 'dimensions' | 'sequence' | 'revision'
> & { labelTr: string; labelEn: string }

const PREVIEW_SAMPLES: PreviewElement[] = [
  {
    labelTr: 'Dikdörtgen Kolon',
    labelEn: 'Rectangular Column',
    elementTypeId: 'col',
    typologyId: 'col-rect',
    dimensions: { height: 5000, sectionWidth: 400, sectionDepth: 400 },
    sequence: 1,
    revision: 0,
  },
  {
    labelTr: 'T Kiriş',
    labelEn: 'T Beam',
    elementTypeId: 'beam',
    typologyId: 'beam-t',
    dimensions: { span: 12000, sectionWidth: 600, totalDepth: 1200 },
    sequence: 42,
    revision: 0,
  },
  {
    labelTr: 'Hollow Core Döşeme',
    labelEn: 'Hollow Core Slab',
    elementTypeId: 'slab',
    typologyId: 'slab-hc',
    dimensions: { length: 8000, width: 1200, thickness: 200, topping: 50 },
    sequence: 15,
    revision: 0,
  },
]

export function LivePreview({
  template,
  firm,
  project,
  overrides,
  showTrace = true,
}: {
  template: FirmNamingTemplate
  firm: FirmProfile
  project: ProjectLike
  overrides: FirmCodeOverride[]
  showTrace?: boolean
}) {
  const { t, locale } = useI18n()
  const resolved = useMemo(
    () =>
      PREVIEW_SAMPLES.map((s) => ({
        sample: s,
        result: resolveInstanceMark({
          element: {
            elementTypeId: s.elementTypeId,
            typologyId: s.typologyId,
            variantCode: s.variantCode,
            dimensions: s.dimensions,
            sequence: s.sequence,
            revision: s.revision,
          },
          template,
          firm,
          project,
          overrides,
        }),
      })),
    [template, firm, project, overrides],
  )

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-900/60">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        {t('elementIdentity.livePreview.title')}
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        {resolved.map(({ sample, result }, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-xl bg-pf-surface p-3 shadow-neo-out-sm dark:bg-gray-800/90"
          >
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {locale === 'en' ? sample.labelEn : sample.labelTr}
            </div>
            <div className="break-all rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-gray-900 shadow-neo-in dark:bg-gray-900/80 dark:text-gray-50">
              {result.instanceMark || '—'}
            </div>
            {showTrace && (
              <details className="text-xs text-gray-600 dark:text-gray-300">
                <summary className="cursor-pointer select-none">
                  {t('elementIdentity.livePreview.tokenTrace')}
                </summary>
                <pre className="mt-1 overflow-x-auto whitespace-pre rounded-md bg-gray-50 p-2 font-mono text-[10px] leading-tight shadow-neo-in dark:bg-gray-900/80 dark:text-gray-100">
                  {result.trace
                    .filter((t_) => !t_.skipped || t_.rawValue != null)
                    .map(
                      (t_) =>
                        `${t_.token.padEnd(13)} = ${
                          t_.formatted == null ? '—' : `"${t_.formatted}"`
                        }  [${t_.source}]`,
                    )
                    .join('\n')}
                </pre>
              </details>
            )}
            {result.warnings.length > 0 && (
              <ul className="list-disc pl-4 text-[11px] text-amber-600 dark:text-amber-400">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
