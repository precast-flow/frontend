import { useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  resolveCode,
  resolveSizeFormatId,
  hasActiveOverride,
} from '../../elementIdentity/firm/codeResolver'
import type {
  ElementTypeCatalogEntry,
  FirmCodeOverride,
  SizeFormat,
  Typology,
  UnitSystem,
} from '../../elementIdentity/types'
import { useElementIdentity } from './elementIdentityContextValue'
import { LivePreview } from './LivePreview'

type SidebarKey = 'elementTypes' | 'typologies' | 'sizeFormats' | 'firmProfile'

export function FirmSettingsPanel() {
  const { t, locale } = useI18n()
  const {
    activeFirm,
    overrides,
    upsertOverride,
    removeOverride,
    activeTemplate,
    activeProject,
    updateFirm,
    templates,
    elementTypesData,
    typologiesData,
    sizeFormatsData,
  } = useElementIdentity()

  const [key, setKey] = useState<SidebarKey>('elementTypes')
  const [typologyFilter, setTypologyFilter] = useState<string>('all')

  const sidebar: { id: SidebarKey; labelKey: string; icon: string }[] = [
    { id: 'elementTypes', labelKey: 'elementIdentity.firmSettings.sidebar.elementTypes', icon: '📁' },
    { id: 'typologies', labelKey: 'elementIdentity.firmSettings.sidebar.typologies', icon: '🗂️' },
    { id: 'sizeFormats', labelKey: 'elementIdentity.firmSettings.sidebar.sizeFormats', icon: '📐' },
    { id: 'firmProfile', labelKey: 'elementIdentity.firmSettings.sidebar.firmProfile', icon: '🏢' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 xl:grid xl:grid-cols-[220px_1fr_360px]">
      {/* Sidebar */}
      <aside className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/40">
        {sidebar.map((s) => {
          const isActive = key === s.id
          return (
            <button
              key={s.id}
              onClick={() => setKey(s.id)}
              className={[
                'flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
                isActive
                  ? 'bg-slate-100 font-semibold text-gray-900 ring-1 ring-inset ring-slate-300/70 dark:bg-slate-800 dark:text-gray-50 dark:ring-slate-600/70'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
              ].join(' ')}
            >
              <span aria-hidden>{s.icon}</span>
              <span>{t(s.labelKey)}</span>
            </button>
          )
        })}
      </aside>

      {/* Main content */}
      <section className="min-h-0 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/40">
        {key === 'elementTypes' && (
          <ElementTypesTable
            firmId={activeFirm.id}
            overrides={overrides}
            upsertOverride={upsertOverride}
            removeOverride={removeOverride}
            locale={locale}
            t={t}
            elementTypes={elementTypesData}
          />
        )}
        {key === 'typologies' && (
          <TypologiesTable
            firmId={activeFirm.id}
            overrides={overrides}
            upsertOverride={upsertOverride}
            removeOverride={removeOverride}
            filter={typologyFilter}
            setFilter={setTypologyFilter}
            locale={locale}
            t={t}
            elementTypes={elementTypesData}
            typologies={typologiesData}
          />
        )}
        {key === 'sizeFormats' && (
          <SizeFormatsTable
            firmId={activeFirm.id}
            overrides={overrides}
            upsertOverride={upsertOverride}
            removeOverride={removeOverride}
            locale={locale}
            t={t}
            typologies={typologiesData}
            sizeFormats={sizeFormatsData}
          />
        )}
        {key === 'firmProfile' && (
          <FirmProfileForm firm={activeFirm} templates={templates} updateFirm={updateFirm} t={t} />
        )}
      </section>

      {/* Live preview */}
      <aside className="xl:sticky xl:top-2 xl:self-start">
        <LivePreview
          template={activeTemplate}
          firm={activeFirm}
          project={activeProject}
          overrides={overrides}
        />
      </aside>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Element Types table
// ---------------------------------------------------------------------------

function ElementTypesTable({
  firmId,
  overrides,
  upsertOverride,
  removeOverride,
  locale,
  t,
  elementTypes,
}: {
  firmId: string
  overrides: FirmCodeOverride[]
  upsertOverride: (o: FirmCodeOverride) => void
  removeOverride: (id: string) => void
  locale: 'tr' | 'en'
  t: (k: string) => string
  elementTypes: ElementTypeCatalogEntry[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        {t('elementIdentity.firmSettings.sidebar.elementTypes')}
      </h3>
      <div className="overflow-x-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-900/60">
        <table className="w-full table-auto text-sm">
          <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.elementType')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.ifcClass')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.default')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.override')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.preview')}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {elementTypes.map((et) => {
              const effective =
                resolveCode('element_type', et.id, firmId, overrides) ?? et.defaultCode
              const isOv = hasActiveOverride('element_type', et.id, firmId, overrides)
              const ovRec = overrides.find(
                (o) =>
                  o.firmId === firmId &&
                  o.scope === 'element_type' &&
                  o.refId === et.id &&
                  o.active,
              )
              return (
                <tr
                  key={et.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-900/50"
                >
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                    {locale === 'en' ? et.nameEn : et.nameTr}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-gray-200 px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-100">
                      {et.ifcClass}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                    {et.defaultCode}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={ovRec?.customCode ?? ''}
                      placeholder={et.defaultCode}
                      onChange={(e) => {
                        const val = e.target.value.trim().toUpperCase()
                        if (!val) {
                          if (ovRec) removeOverride(ovRec.id)
                          return
                        }
                        const id =
                          ovRec?.id ?? `ov-${firmId}-et-${et.id}-${Date.now().toString(36)}`
                        upsertOverride({
                          id,
                          firmId,
                          scope: 'element_type',
                          refId: et.id,
                          customCode: val,
                          active: true,
                          createdAt: ovRec?.createdAt ?? new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        })
                      }}
                      className="w-24 rounded-lg bg-gray-50 px-2 py-1 font-mono text-xs shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">
                    {effective}-…
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isOv && ovRec && (
                      <button
                        onClick={() => removeOverride(ovRec.id)}
                        className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                        title={t('elementIdentity.reset')}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Typologies table
// ---------------------------------------------------------------------------

function TypologiesTable({
  firmId,
  overrides,
  upsertOverride,
  removeOverride,
  filter,
  setFilter,
  locale,
  t,
  elementTypes,
  typologies,
}: {
  firmId: string
  overrides: FirmCodeOverride[]
  upsertOverride: (o: FirmCodeOverride) => void
  removeOverride: (id: string) => void
  filter: string
  setFilter: (v: string) => void
  locale: 'tr' | 'en'
  t: (k: string) => string
  elementTypes: ElementTypeCatalogEntry[]
  typologies: Typology[]
}) {
  const filtered = useMemo(
    () => (filter === 'all' ? typologies : typologies.filter((ty) => ty.elementTypeId === filter)),
    [filter, typologies],
  )

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        {t('elementIdentity.firmSettings.sidebar.typologies')}
      </h3>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Tümü" />
        {elementTypes.map((et) => (
          <FilterChip
            key={et.id}
            active={filter === et.id}
            onClick={() => setFilter(et.id)}
            label={locale === 'en' ? et.nameEn : et.nameTr}
          />
        ))}
      </div>
      <div className="max-h-[60vh] overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-900/60">
        <table className="w-full table-auto text-sm">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.typology')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.elementType')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.ifcPredef')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.default')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.override')}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((ty) => {
              const et = elementTypes.find((e) => e.id === ty.elementTypeId)!
              const ovRec = overrides.find(
                (o) =>
                  o.firmId === firmId &&
                  o.scope === 'typology' &&
                  o.refId === ty.id &&
                  o.active,
              )
              return (
                <tr
                  key={ty.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-900/50"
                >
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                    {locale === 'en' ? ty.nameEn : ty.nameTr}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className="rounded-md bg-gray-200 px-2 py-0.5 dark:bg-gray-700 dark:text-gray-100">
                      {locale === 'en' ? et.nameEn : et.nameTr}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                    {ty.ifcPredefinedType ?? '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">
                    {ty.defaultCode}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={ovRec?.customCode ?? ''}
                      placeholder={ty.defaultCode}
                      onChange={(e) => {
                        const val = e.target.value.trim().toUpperCase()
                        if (!val) {
                          if (ovRec) removeOverride(ovRec.id)
                          return
                        }
                        const id =
                          ovRec?.id ?? `ov-${firmId}-ty-${ty.id}-${Date.now().toString(36)}`
                        upsertOverride({
                          id,
                          firmId,
                          scope: 'typology',
                          refId: ty.id,
                          customCode: val,
                          active: true,
                          createdAt: ovRec?.createdAt ?? new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        })
                      }}
                      className="w-24 rounded-lg bg-gray-50 px-2 py-1 font-mono text-xs shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {ovRec && (
                      <button
                        onClick={() => removeOverride(ovRec.id)}
                        className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-xs font-medium transition',
        active
          ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
          : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Size formats table
// ---------------------------------------------------------------------------

function SizeFormatsTable({
  firmId,
  overrides,
  upsertOverride,
  removeOverride,
  locale,
  t,
  typologies,
  sizeFormats,
}: {
  firmId: string
  overrides: FirmCodeOverride[]
  upsertOverride: (o: FirmCodeOverride) => void
  removeOverride: (id: string) => void
  locale: 'tr' | 'en'
  t: (k: string) => string
  typologies: Typology[]
  sizeFormats: SizeFormat[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        {t('elementIdentity.firmSettings.sidebar.sizeFormats')}
      </h3>
      <div className="max-h-[60vh] overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-900/60">
        <table className="w-full table-auto text-sm">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.typology')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.default')}</th>
              <th className="px-3 py-2 text-left">{t('elementIdentity.table.format')}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {typologies.map((ty) => {
              const defaultId = ty.defaultSizeFormatId
              const effectiveId = resolveSizeFormatId(ty.id, firmId, overrides) ?? defaultId
              const ovRec = overrides.find(
                (o) =>
                  o.firmId === firmId &&
                  o.scope === 'size_format' &&
                  o.refId === ty.id &&
                  o.active,
              )
              return (
                <tr
                  key={ty.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-900/50"
                >
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                    {locale === 'en' ? ty.nameEn : ty.nameTr}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {defaultId}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={effectiveId}
                      onChange={(e) => {
                        const newId = e.target.value
                        if (newId === defaultId) {
                          if (ovRec) removeOverride(ovRec.id)
                          return
                        }
                        const id =
                          ovRec?.id ?? `ov-${firmId}-sf-${ty.id}-${Date.now().toString(36)}`
                        upsertOverride({
                          id,
                          firmId,
                          scope: 'size_format',
                          refId: ty.id,
                          customSizeFormatId: newId,
                          active: true,
                          createdAt: ovRec?.createdAt ?? new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        })
                      }}
                      className="rounded-lg bg-gray-50 px-2 py-1 text-xs shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
                    >
                      {sizeFormats.map((sf) => (
                        <option key={sf.id} value={sf.id}>
                          {sf.id} — {locale === 'en' ? sf.nameEn : sf.nameTr}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {ovRec && (
                      <button
                        onClick={() => removeOverride(ovRec.id)}
                        className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Firm profile form
// ---------------------------------------------------------------------------

function FirmProfileForm({
  firm,
  templates,
  updateFirm,
  t,
}: {
  firm: import('../../elementIdentity/types').FirmProfile
  templates: import('../../elementIdentity/types').FirmNamingTemplate[]
  updateFirm: (f: import('../../elementIdentity/types').FirmProfile) => void
  t: (k: string) => string
}) {
  const firmTemplates = templates.filter((tpl) => tpl.firmId === firm.id)
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        {t('elementIdentity.firmSettings.sidebar.firmProfile')}
      </h3>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          {t('elementIdentity.firmProfile.firmName')}
        </span>
        <input
          type="text"
          value={firm.name}
          readOnly
          className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700 shadow-neo-in dark:bg-gray-900/80 dark:text-gray-300"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          {t('elementIdentity.firmProfile.firmCode')}
        </span>
        <input
          type="text"
          value={firm.firmCodePrefix}
          onChange={(e) =>
            updateFirm({
              ...firm,
              firmCodePrefix: e.target.value.toUpperCase(),
              updatedAt: new Date().toISOString(),
            })
          }
          className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-mono shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
        />
      </label>
      <fieldset className="flex flex-col gap-2 text-xs">
        <legend className="font-semibold text-gray-600 dark:text-gray-300">
          {t('elementIdentity.firmProfile.unitSystem')}
        </legend>
        <div className="flex gap-3">
          {(['metric', 'imperial', 'mixed'] as UnitSystem[]).map((us) => (
            <label key={us} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="radio"
                name="unitSystem"
                checked={firm.unitSystem === us}
                onChange={() =>
                  updateFirm({
                    ...firm,
                    unitSystem: us,
                    updatedAt: new Date().toISOString(),
                  })
                }
              />
              {us}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-xs">
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          {t('elementIdentity.firmProfile.defaultTemplate')}
        </span>
        <select
          value={firm.defaultTemplateId}
          onChange={(e) =>
            updateFirm({
              ...firm,
              defaultTemplateId: e.target.value,
              updatedAt: new Date().toISOString(),
            })
          }
          className="rounded-xl bg-gray-50 px-3 py-2 text-sm shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
        >
          {firmTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
