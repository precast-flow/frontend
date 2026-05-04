import { useEffect, useMemo, useState } from 'react'
import { ALL_ELEMENT_TYPES } from '../../elementIdentity/catalog/allElementTypes'
import { TYPOLOGIES_BY_ID } from '../../elementIdentity/catalog/typologies'
import { useI18n } from '../../i18n/I18nProvider'
import { PmStyleDialog } from '../shared/PmStyleDialog'
import { useElementIdentity } from './elementIdentityContextValue'

type Props = {
  open: boolean
  projectId: string
  onClose: () => void
}

export function NewProductDialog({ open, projectId, onClose }: Props) {
  const { t, locale } = useI18n()
  const { addProjectProduct } = useElementIdentity()
  const defaultEt = ALL_ELEMENT_TYPES[0]?.id ?? ''
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [elementTypeId, setElementTypeId] = useState(defaultEt)
  const [typologyId, setTypologyId] = useState('')

  const typologyOptions = useMemo(() => {
    const et = ALL_ELEMENT_TYPES.find((e) => e.id === elementTypeId)
    const ids = et?.allowedTypologies ?? []
    return ids.map((id) => TYPOLOGIES_BY_ID[id]).filter((x): x is NonNullable<typeof x> => Boolean(x))
  }, [elementTypeId])

  useEffect(() => {
    if (!open) return
    setName('')
    setCode('')
    setElementTypeId(defaultEt)
  }, [open, defaultEt])

  useEffect(() => {
    if (!open) return
    const first = typologyOptions[0]?.id ?? ''
    setTypologyId((prev) => {
      if (prev && typologyOptions.some((ty) => ty.id === prev)) return prev
      return first
    })
  }, [open, typologyOptions])

  if (!open) return null

  const canSave = Boolean(code.trim() && name.trim() && elementTypeId && typologyId)

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
      >
        {t('elementIdentity.cancel')}
      </button>
      <button
        type="button"
        disabled={!canSave}
        onClick={() => {
          addProjectProduct({
            projectId,
            name: name.trim(),
            code: code.trim().toUpperCase(),
            elementTypeId,
            typologyId,
            source: 'MANUAL',
            revision: 1,
            status: 'active',
          })
          setName('')
          setCode('')
          setElementTypeId(defaultEt)
          setTypologyId('')
          onClose()
        }}
        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        {t('elementIdentity.dialog.manualSave')}
      </button>
    </div>
  )

  return (
    <PmStyleDialog
      title={t('elementIdentity.dialog.manualTitle')}
      subtitle={t('elementIdentity.dialog.manualSubtitle')}
      closeLabel={t('elementIdentity.cancel')}
      onClose={onClose}
      footer={footer}
      ariaLabel={t('elementIdentity.dialog.manualTitle')}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('elementIdentity.table.elementType')}
          </span>
          <select
            value={elementTypeId}
            onChange={(e) => setElementTypeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          >
            {ALL_ELEMENT_TYPES.map((et) => (
              <option key={et.id} value={et.id}>
                {locale === 'en' ? et.nameEn : et.nameTr}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('elementIdentity.table.typology')}
          </span>
          <select
            value={typologyId}
            onChange={(e) => setTypologyId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          >
            {typologyOptions.map((ty) => (
              <option key={ty.id} value={ty.id}>
                {locale === 'en' ? ty.nameEn : ty.nameTr}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('elementIdentity.detail.code')}
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <label>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t('elementIdentity.products.nameField')}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      </div>
    </PmStyleDialog>
  )
}
