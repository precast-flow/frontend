import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { MOCK_IFC_FILES } from '../../elementIdentity/ifc/mockIfcData'
import type { SourceSystem } from '../../elementIdentity/types'

const SOURCE_OPTIONS: SourceSystem[] = ['REVIT', 'TEKLA', 'ALLPLAN', 'AUTOCAD', 'IFC_GENERIC', 'MANUAL']

type Props = {
  projectCode: string
  onOpenBulkWizard: () => void
}

/**
 * Eleman ekleme sekmesinde sağ kolonda: IFC demo dosyası + kaynak seçimi (yapılandırma özeti).
 * Tam adım akışı `BulkProductImportDialog` içindedir.
 */
export function ElementIdentityIfcConfigCompact({ projectCode, onOpenBulkWizard }: Props) {
  const { t } = useI18n()
  const [fileName, setFileName] = useState(MOCK_IFC_FILES[0]?.fileName ?? '')
  const [source, setSource] = useState<SourceSystem>('REVIT')

  return (
    <section className="rounded-xl border border-slate-200/60 bg-white/50 p-3 text-left text-xs shadow-sm dark:border-white/10 dark:bg-slate-900/40">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t('elementIdentity.detail.ifcConfigTitle')}
      </h4>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
        {t('elementIdentity.detail.ifcConfigHint')}
      </p>
      <p className="mt-2 rounded-lg border border-slate-200/60 bg-white/70 px-2 py-1.5 font-mono text-[11px] text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
        {t('elementIdentity.ifc.targetProject')}: {projectCode}
      </p>
      <label className="mt-3 block">
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
          {t('elementIdentity.ifc.mockFileLabel')}
        </span>
        <select
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        >
          {MOCK_IFC_FILES.map((f) => (
            <option key={f.fileName} value={f.fileName}>
              {f.fileName}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-2 block">
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
          {t('elementIdentity.ifc.sourceSystem')}
        </span>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as SourceSystem)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        >
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onOpenBulkWizard}
        className="mt-3 w-full rounded-full border border-sky-400/60 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-900 transition hover:bg-sky-500/25 dark:border-sky-500/50 dark:bg-sky-900/40 dark:text-sky-100"
      >
        {t('elementIdentity.detail.openBulkWizard')}
      </button>
    </section>
  )
}
