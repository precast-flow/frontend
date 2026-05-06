import { useCallback, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { resolveInstanceMark } from '../../elementIdentity/firm/nameResolver'
import type {
  FirmNamingTemplate,
  NamingToken,
  NamingTokenConfig,
} from '../../elementIdentity/types'
import { useElementIdentity } from './elementIdentityContextValue'
import { LivePreview } from './LivePreview'

export type TemplateBuilderPanelProps = {
  /** `embedded`: Tanımlar detay etiket sekmesi — sol palet + genel seçenekler, ortada önizleme ve sıra */
  layout?: 'full' | 'embedded'
}

const ALL_TOKENS: NamingToken[] = [
  'FIRM_CODE',
  'PROJECT_CODE',
  'TYPOLOGY_CODE',
  'FAMILY_CODE',
  'VARIANT_CODE',
  'SIZE',
  'SEQUENCE',
  'REVISION',
]

type Preset = {
  id: string
  labelKey: string
  tokens: NamingToken[]
  sizeConcat: boolean
  sequencePadding: number
  separator: string
}

const PRESETS: Preset[] = [
  {
    id: 'small',
    labelKey: 'elementIdentity.template.presetSmall',
    tokens: ['FIRM_CODE', 'FAMILY_CODE', 'SIZE', 'SEQUENCE'],
    sizeConcat: false,
    sequencePadding: 3,
    separator: '-',
  },
  {
    id: 'big',
    labelKey: 'elementIdentity.template.presetBig',
    tokens: [
      'PROJECT_CODE',
      'FAMILY_CODE',
      'TYPOLOGY_CODE',
      'SIZE',
      'SEQUENCE',
      'REVISION',
    ],
    sizeConcat: false,
    sequencePadding: 4,
    separator: '-',
  },
  {
    id: 'compact',
    labelKey: 'elementIdentity.template.presetCompact',
    tokens: ['FAMILY_CODE', 'SIZE', 'SEQUENCE'],
    sizeConcat: true,
    sequencePadding: 3,
    separator: '-',
  },
]

const PREVIEW_ELEMENT = {
  elementTypeId: 'col',
  typologyId: 'col-rect',
  dimensions: { height: 5000, sectionWidth: 400, sectionDepth: 400 },
  sequence: 1,
  revision: 0,
} as const

export function TemplateBuilderPanel({ layout = 'full' }: TemplateBuilderPanelProps) {
  const { t } = useI18n()
  const {
    activeTemplate,
    updateTemplate,
    activeFirm,
    activeProject,
    overrides,
    templates,
    setActiveTemplateId,
    addTemplate,
    sizeFormatsData,
  } = useElementIdentity()

  const [draft, setDraft] = useState<FirmNamingTemplate>(activeTemplate)
  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(activeTemplate),
    [draft, activeTemplate],
  )

  // If firm / active template changes from outside, reset draft.
  const [lastSyncedId, setLastSyncedId] = useState<string>(activeTemplate.id)
  if (lastSyncedId !== activeTemplate.id) {
    setDraft(activeTemplate)
    setLastSyncedId(activeTemplate.id)
  }

  const firmTemplates = templates.filter((tpl) => tpl.firmId === activeFirm.id)

  const activeTokens = draft.tokens
    .filter((tk) => tk.enabled)
    .sort((a, b) => a.order - b.order)
  const paletteTokens = ALL_TOKENS.filter((tk) => !draft.tokens.some((d) => d.token === tk && d.enabled))

  const addTokenToTemplate = useCallback((tk: NamingToken) => {
    setDraft((d) => {
      const exists = d.tokens.find((x) => x.token === tk)
      const nextOrder =
        d.tokens.filter((x) => x.enabled).reduce((m, x) => Math.max(m, x.order), 0) + 10
      if (exists) {
        return {
          ...d,
          tokens: d.tokens.map((x) =>
            x.token === tk ? { ...x, enabled: true, order: nextOrder } : x,
          ),
        }
      }
      return {
        ...d,
        tokens: [...d.tokens, { token: tk, enabled: true, order: nextOrder }],
      }
    })
  }, [])

  const removeTokenFromTemplate = useCallback((tk: NamingToken) => {
    setDraft((d) => ({
      ...d,
      tokens: d.tokens.map((x) => (x.token === tk ? { ...x, enabled: false } : x)),
    }))
  }, [])

  const moveToken = useCallback((tk: NamingToken, dir: -1 | 1) => {
    setDraft((d) => {
      const enabled = d.tokens.filter((x) => x.enabled).sort((a, b) => a.order - b.order)
      const idx = enabled.findIndex((x) => x.token === tk)
      if (idx < 0) return d
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= enabled.length) return d
      const a = enabled[idx]
      const b = enabled[swapIdx]
      return {
        ...d,
        tokens: d.tokens.map((x) => {
          if (x.token === a.token) return { ...x, order: b.order }
          if (x.token === b.token) return { ...x, order: a.order }
          return x
        }),
      }
    })
  }, [])

  const reorderActiveTokens = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setDraft((d) => {
      const enabled = [...d.tokens].filter((x) => x.enabled).sort((a, b) => a.order - b.order)
      if (fromIndex < 0 || fromIndex >= enabled.length || toIndex < 0 || toIndex > enabled.length) return d
      const item = enabled[fromIndex]
      const rest = enabled.filter((_, i) => i !== fromIndex)
      const clampedTo = Math.min(toIndex, rest.length)
      rest.splice(clampedTo, 0, item)
      const orderMap = new Map(rest.map((x, i) => [x.token, (i + 1) * 10]))
      return {
        ...d,
        tokens: d.tokens.map((x) => {
          if (!x.enabled) return x
          const o = orderMap.get(x.token)
          return o != null ? { ...x, order: o } : x
        }),
      }
    })
  }, [])

  const updateTokenConfig = useCallback((tk: NamingToken, patch: Partial<NamingTokenConfig>) => {
    setDraft((d) => ({
      ...d,
      tokens: d.tokens.map((x) => (x.token === tk ? { ...x, ...patch } : x)),
    }))
  }, [])

  const applyPreset = useCallback((preset: Preset) => {
    setDraft((d) => {
      const tokens: NamingTokenConfig[] = ALL_TOKENS.map((tk) => {
        const order = preset.tokens.indexOf(tk)
        return {
          token: tk,
          enabled: order >= 0,
          order: order >= 0 ? (order + 1) * 10 : 999,
        }
      })
      return {
        ...d,
        tokens,
        sizeConcat: preset.sizeConcat,
        sequencePadding: preset.sequencePadding,
        separator: preset.separator,
      }
    })
  }, [])

  const save = useCallback(() => {
    updateTemplate({ ...draft, updatedAt: new Date().toISOString() })
  }, [draft, updateTemplate])

  const cancel = useCallback(() => {
    setDraft(activeTemplate)
  }, [activeTemplate])

  const createNewTemplate = useCallback(() => {
    const newId = `tpl-${activeFirm.id}-${Date.now().toString(36)}`
    const empty: FirmNamingTemplate = {
      id: newId,
      firmId: activeFirm.id,
      name: `Template ${firmTemplates.length + 1}`,
      tokens: ALL_TOKENS.map((tk, i) => ({
        token: tk,
        enabled: ['FAMILY_CODE', 'SIZE', 'SEQUENCE'].includes(tk),
        order: (i + 1) * 10,
      })),
      separator: '-',
      sizeConcat: false,
      sequencePadding: 3,
      revisionPrefix: 'R',
      revisionZeroSuffix: false,
      uppercaseEnforce: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addTemplate(empty)
    setActiveTemplateId(newId)
  }, [activeFirm.id, firmTemplates.length, addTemplate, setActiveTemplateId])

  // DnD handlers ----------------------------------------------------------
  const [dragOver, setDragOver] = useState(false)

  const onPaletteDragStart = (e: React.DragEvent, tk: NamingToken) => {
    e.dataTransfer.setData('text/eidentity-token', tk)
    e.dataTransfer.effectAllowed = 'copy'
  }
  const onDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOver(true)
  }
  const onDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const tk = e.dataTransfer.getData('text/eidentity-token') as NamingToken
    if (tk) addTokenToTemplate(tk)
  }

  const isEmbedded = layout === 'embedded'

  const draftPreviewMark = useMemo(
    () =>
      resolveInstanceMark({
        element: PREVIEW_ELEMENT,
        template: draft,
        firm: activeFirm,
        project: activeProject,
        overrides,
      }).instanceMark,
    [draft, activeFirm, activeProject, overrides],
  )

  const renderGlobalOptions = () => (
    <section
      className={
        isEmbedded
          ? 'space-y-2'
          : 'rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/40'
      }
    >
      <h3 className={`text-xs font-semibold text-gray-700 dark:text-gray-300 ${isEmbedded ? '' : 'mb-2'}`}>
        {t('elementIdentity.template.globalOptions')}
      </h3>
      <div
        className={
          isEmbedded
            ? 'grid gap-3 text-xs sm:grid-cols-1'
            : 'grid gap-3 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
        }
      >
        <label className="flex flex-col gap-1">
          <span className="text-gray-600 dark:text-gray-300">
            {t('elementIdentity.template.separator')}
          </span>
          <input
            type="text"
            maxLength={3}
            value={draft.separator}
            onChange={(e) => setDraft((d) => ({ ...d, separator: e.target.value }))}
            className="rounded-lg bg-pf-surface px-2 py-1 font-mono text-sm shadow-neo-out-sm focus:outline-none dark:bg-gray-800/90 dark:text-gray-100"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.sizeConcat}
            onChange={(e) => setDraft((d) => ({ ...d, sizeConcat: e.target.checked }))}
          />
          <span className="text-gray-700 dark:text-gray-200">
            {t('elementIdentity.template.sizeConcat')}
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-600 dark:text-gray-300">
            {t('elementIdentity.template.sequencePadding')}
          </span>
          <input
            type="number"
            min={1}
            max={6}
            value={draft.sequencePadding}
            onChange={(e) => setDraft((d) => ({ ...d, sequencePadding: Number(e.target.value) }))}
            className="rounded-lg bg-pf-surface px-2 py-1 text-sm shadow-neo-out-sm focus:outline-none dark:bg-gray-800/90 dark:text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-600 dark:text-gray-300">
            {t('elementIdentity.template.revisionPrefix')}
          </span>
          <input
            type="text"
            maxLength={4}
            value={draft.revisionPrefix}
            onChange={(e) => setDraft((d) => ({ ...d, revisionPrefix: e.target.value }))}
            className="rounded-lg bg-pf-surface px-2 py-1 font-mono text-sm shadow-neo-out-sm focus:outline-none dark:bg-gray-800/90 dark:text-gray-100"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.revisionZeroSuffix}
            onChange={(e) => setDraft((d) => ({ ...d, revisionZeroSuffix: e.target.checked }))}
          />
          <span className="text-gray-700 dark:text-gray-200">
            {t('elementIdentity.template.revisionZero')}
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.uppercaseEnforce}
            onChange={(e) => setDraft((d) => ({ ...d, uppercaseEnforce: e.target.checked }))}
          />
          <span className="text-gray-700 dark:text-gray-200">
            {t('elementIdentity.template.uppercase')}
          </span>
        </label>
      </div>
    </section>
  )

  const renderPalette = () => (
    <aside
      className={
        isEmbedded
          ? 'flex flex-col gap-2'
          : 'flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/40'
      }
    >
      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {t('elementIdentity.template.palette')}
      </h3>
      {paletteTokens.length === 0 && <p className="text-[11px] text-gray-500">Tümü aktif.</p>}
      {paletteTokens.map((tk) => (
        <div
          key={tk}
          draggable
          onDragStart={(e) => onPaletteDragStart(e, tk)}
          onDoubleClick={() => addTokenToTemplate(tk)}
          title="Sürükle veya çift tıkla"
          className="flex cursor-grab items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-xs font-medium active:cursor-grabbing dark:border-slate-700/70 dark:bg-slate-900"
        >
          <span className="select-none text-gray-500">⋮⋮</span>
          <span className="flex-1 truncate text-gray-900 dark:text-gray-50">
            {t(`elementIdentity.token.${tk}`)}
          </span>
          <span className="rounded-md bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-200">
            {tk}
          </span>
        </div>
      ))}
      {ALL_TOKENS.filter((tk) => draft.tokens.some((d) => d.token === tk && d.enabled)).map((tk) => (
        <div
          key={`active-${tk}`}
          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/60 bg-slate-100/70 px-3 py-1.5 text-[11px] text-gray-500 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-gray-400"
        >
          <span>✓ {t(`elementIdentity.token.${tk}`)}</span>
        </div>
      ))}
    </aside>
  )

  const renderActiveRow = (tkCfg: NamingTokenConfig, idx: number) => {
    const canFormat = tkCfg.token === 'SIZE' || tkCfg.token === 'SEQUENCE'
    return (
      <div
        key={tkCfg.token}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/eidentity-reorder', String(idx))
          e.dataTransfer.effectAllowed = 'move'
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          const raw = e.dataTransfer.getData('text/eidentity-reorder')
          if (raw === '') return
          const from = Number(raw)
          if (Number.isNaN(from)) return
          reorderActiveTokens(from, idx)
        }}
        className="flex flex-col gap-2 rounded-lg border border-slate-200/70 bg-white p-3 dark:border-slate-700/70 dark:bg-slate-900 md:flex-row md:items-center"
      >
        <div className="flex cursor-grab items-center gap-2 active:cursor-grabbing">
          <span className="select-none text-gray-400">⋮⋮</span>
          <span className="w-8 font-mono text-xs text-gray-400">#{idx + 1}</span>
          <span className="rounded-md bg-gray-800 px-2 py-1 font-mono text-[10px] text-white dark:bg-gray-200 dark:text-gray-900">
            {tkCfg.token}
          </span>
          <span className="text-xs text-gray-700 dark:text-gray-200">
            {t(`elementIdentity.token.${tkCfg.token}`)}
          </span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {tkCfg.token === 'SIZE' && (
            <select
              value={tkCfg.formatId ?? ''}
              onChange={(e) => updateTokenConfig(tkCfg.token, { formatId: e.target.value || undefined })}
              className="rounded-lg bg-gray-50 px-2 py-1 text-[11px] shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
            >
              <option value="">Auto (typology)</option>
              {sizeFormatsData.map((sf) => (
                <option key={sf.id} value={sf.id}>
                  {sf.id}
                </option>
              ))}
            </select>
          )}
          {tkCfg.token === 'SEQUENCE' && (
            <input
              type="number"
              min={1}
              max={6}
              value={tkCfg.padding ?? draft.sequencePadding}
              onChange={(e) => updateTokenConfig(tkCfg.token, { padding: Number(e.target.value) })}
              className="w-14 rounded-lg bg-gray-50 px-2 py-1 text-[11px] shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
              title="Padding"
            />
          )}
          {!canFormat && <span className="text-[10px] text-gray-400">—</span>}
          <input
            type="text"
            value={tkCfg.prefix ?? ''}
            onChange={(e) => updateTokenConfig(tkCfg.token, { prefix: e.target.value })}
            placeholder="prefix"
            className="w-16 rounded-lg bg-gray-50 px-2 py-1 text-[11px] shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
          />
          <input
            type="text"
            value={tkCfg.suffix ?? ''}
            onChange={(e) => updateTokenConfig(tkCfg.token, { suffix: e.target.value })}
            placeholder="suffix"
            className="w-16 rounded-lg bg-gray-50 px-2 py-1 text-[11px] shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveToken(tkCfg.token, -1)}
              disabled={idx === 0}
              className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-900/70"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveToken(tkCfg.token, 1)}
              disabled={idx === activeTokens.length - 1}
              className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-900/70"
            >
              ↓
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeTokenFromTemplate(tkCfg.token)}
            className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            title="Kaldır"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (isEmbedded) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2 dark:border-slate-700/60">
          <span className="min-w-0 truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{draft.name}</span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={!dirty}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100"
            >
              {t('elementIdentity.cancel')}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
            >
              {t('elementIdentity.save')}
            </button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)_minmax(11rem,17rem)]">
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-0.5">
            {renderPalette()}
          </div>
          <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
            <section
              onDragOver={onDropZoneDragOver}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDropZoneDrop}
              className={[
                'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl border p-3 transition',
                dragOver
                  ? 'border-slate-500 bg-slate-100 dark:border-slate-400 dark:bg-slate-900/70'
                  : 'border-dashed border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-900/40',
              ].join(' ')}
            >
              <div className="shrink-0 border-b border-slate-200/70 pb-3 dark:border-slate-600/60">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t('elementIdentity.template.preview')}
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {draftPreviewMark || '—'}
                </p>
              </div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t('elementIdentity.template.active')}
              </h3>
              {activeTokens.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                  {t('elementIdentity.template.empty')}
                </div>
              )}
              {activeTokens.map((tkCfg, idx) => renderActiveRow(tkCfg, idx))}
            </section>
          </div>
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pl-0.5">{renderGlobalOptions()}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/70 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[12rem] flex-col gap-1 text-xs">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Template</span>
            <select
              value={draft.id}
              onChange={(e) => setActiveTemplateId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {firmTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[14rem] flex-col gap-1 text-xs">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Template adı</span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <button
            onClick={createNewTemplate}
            className="self-end rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-slate-800"
          >
            + {t('elementIdentity.template.newTemplate')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cancel}
            disabled={!dirty}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100"
          >
            {t('elementIdentity.cancel')}
          </button>
          <button
            onClick={save}
            disabled={!dirty}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
          >
            {t('elementIdentity.save')}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="grid gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="flex flex-col items-start gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 text-left transition hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
          >
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-50">
              {t(preset.labelKey)}
            </span>
            <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
              [{preset.tokens.join('] [')}]
            </span>
            <span className="text-[10px] text-gray-400">
              sep='{preset.separator}' · pad={preset.sequencePadding}
              {preset.sizeConcat ? ' · concat' : ''}
            </span>
          </button>
        ))}
      </div>

      {/* 3-column layout */}
      <div className="grid gap-3 xl:grid-cols-[220px_1fr_360px]">
        {renderPalette()}
        <section
          onDragOver={onDropZoneDragOver}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDropZoneDrop}
          className={[
            'flex flex-col gap-2 rounded-xl border p-3 transition',
            dragOver
              ? 'border-slate-500 bg-slate-100 dark:border-slate-400 dark:bg-slate-900/70'
              : 'border-dashed border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-900/40',
          ].join(' ')}
        >
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {t('elementIdentity.template.active')}
          </h3>
          {activeTokens.length === 0 && (
            <div className="rounded-xl bg-gray-100 p-6 text-center text-xs text-gray-500 dark:bg-gray-900/80 dark:text-gray-400">
              {t('elementIdentity.template.empty')}
            </div>
          )}
          {activeTokens.map((tkCfg, idx) => renderActiveRow(tkCfg, idx))}
        </section>
        <aside className="xl:sticky xl:top-2 xl:self-start">
          <LivePreview
            template={draft}
            firm={activeFirm}
            project={activeProject}
            overrides={overrides}
          />
        </aside>
      </div>

      {renderGlobalOptions()}
    </div>
  )
}
