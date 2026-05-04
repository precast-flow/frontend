import { useMemo, useState } from 'react'
import { ALL_ELEMENT_TYPES } from '../../elementIdentity/catalog/allElementTypes'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { useElementIdentity } from './elementIdentityContextValue'

type Props = {
  open: boolean
  projectId: string
  onClose: () => void
}

export function AddFromStandardCatalogDialog({ open, projectId, onClose }: Props) {
  const { t, locale } = useI18n()
  const { activeFirm, standardSeriesTemplates, instantiateStandardTemplateToProject } = useElementIdentity()
  const [query, setQuery] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const firmTemplates = useMemo(
    () => standardSeriesTemplates.filter((x) => x.firmId === activeFirm.id && x.active),
    [standardSeriesTemplates, activeFirm.id],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    if (!q) return firmTemplates
    return firmTemplates.filter((tpl) => {
      const hay = `${tpl.code} ${tpl.name}`.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
      return hay.includes(q)
    })
  }, [firmTemplates, query, locale])

  const selected = useMemo(
    () => firmTemplates.find((x) => x.id === selectedTemplateId) ?? null,
    [firmTemplates, selectedTemplateId],
  )

  if (!open) return null

  const canSave = Boolean(selected && code.trim() && name.trim())

  return (
    <PmStyleDialog
      title={t('standardSeries.addFromCatalogTitle')}
      subtitle={t('standardSeries.addFromCatalogSubtitle')}
      closeLabel={t('elementIdentity.cancel')}
      onClose={onClose}
      maxWidthClass="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-600"
          >
            {t('elementIdentity.cancel')}
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              if (!selected) return
              instantiateStandardTemplateToProject(projectId, selected.id, {
                code: code.trim().toUpperCase(),
                name: name.trim(),
              })
              setQuery('')
              setSelectedTemplateId(null)
              setCode('')
              setName('')
              onClose()
            }}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
          >
            {t('standardSeries.addConfirm')}
          </button>
        </div>
      }
    >
      <div className="grid gap-3 text-sm">
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {t('standardSeries.search')}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <div>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {t('standardSeries.pickTemplate')}
          </span>
          <ul className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200/80 dark:border-slate-600/60">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-slate-500">{t('standardSeries.empty')}</li>
            ) : (
              filtered.map((tpl) => {
                const et = tpl.elementTypeId
                  ? ALL_ELEMENT_TYPES.find((e) => e.id === tpl.elementTypeId)
                  : undefined
                return (
                  <li key={tpl.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id)
                        setCode(tpl.code)
                        setName(tpl.name)
                      }}
                      className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs ${
                        selectedTemplateId === tpl.id
                          ? 'bg-sky-500/15 font-semibold dark:bg-sky-400/15'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="font-mono text-sm">{tpl.code}</span>
                      <span className="text-slate-600 dark:text-slate-300">{tpl.name}</span>
                      {et ? (
                        <span className="text-[10px] text-slate-500">
                          {locale === 'en' ? et.nameEn : et.nameTr}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {t('elementIdentity.detail.code')}
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {t('elementIdentity.products.nameField')}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      </div>
    </PmStyleDialog>
  )
}
