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

/** Tek örnek — çoklu kart ızgarası yok. */
const PREVIEW_SAMPLE: PreviewElement = {
  labelTr: 'Dikdörtgen Kolon',
  labelEn: 'Rectangular Column',
  elementTypeId: 'col',
  typologyId: 'col-rect',
  dimensions: { height: 5000, sectionWidth: 400, sectionDepth: 400 },
  sequence: 1,
  revision: 0,
}

export function LivePreview({
  template,
  firm,
  project,
  overrides,
  showTrace = false,
}: {
  template: FirmNamingTemplate
  firm: FirmProfile
  project: ProjectLike
  overrides: FirmCodeOverride[]
  showTrace?: boolean
}) {
  const { t, locale } = useI18n()
  const s = PREVIEW_SAMPLE
  const result = useMemo(
    () =>
      resolveInstanceMark({
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
    [template, firm, project, overrides],
  )

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t('elementIdentity.livePreview.title')}
      </p>
      <p className="text-[11px] text-slate-600 dark:text-slate-300">
        {locale === 'en' ? s.labelEn : s.labelTr}
      </p>
      <p className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
        {result.instanceMark || '—'}
      </p>
      {showTrace && (
        <details className="text-xs text-slate-600 dark:text-slate-300">
          <summary className="cursor-pointer select-none">{t('elementIdentity.livePreview.tokenTrace')}</summary>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre font-mono text-[10px] leading-tight text-slate-700 dark:text-slate-200">
            {result.trace
              .filter((t_) => !t_.skipped || t_.rawValue != null)
              .map(
                (t_) =>
                  `${t_.token.padEnd(13)} = ${t_.formatted == null ? '—' : `"${t_.formatted}"`}  [${t_.source}]`,
              )
              .join('\n')}
          </pre>
        </details>
      )}
      {result.warnings.length > 0 && (
        <ul className="list-disc pl-4 text-[11px] text-amber-700 dark:text-amber-400">
          {result.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
