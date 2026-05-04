import { Plus, Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FieldDef, FieldType, MaterialCategory, MaterialDef } from '../../materialCatalog/types'
import { useI18n } from '../../i18n/I18nProvider'
import '../muhendislikOkan/engineeringOkanLiquid.css'
import {
  eiSplitHeaderButtonPassive,
  ElementIdentityFilterSheetHeader,
  ElementIdentityPieceCodesLikeSplit,
} from '../elementIdentity/ElementIdentityPieceCodesLikeSplit'
import { useMaterialCatalog } from './MaterialCatalogContext'
import { FilterToolbarSearch } from '../shared/FilterToolbarSearch'

const CATEGORIES: MaterialCategory[] = [
  'concrete',
  'rebar',
  'prestress',
  'hardware',
  'insulation',
  'sleeve',
  'plate',
  'profile',
  'bolt',
  'custom',
]

function categoryLabelKey(c: MaterialCategory): string {
  return `materialCatalog.category.${c}`
}

type DetailTab = 'general' | 'fields' | 'preview'

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function sortFields(fields: FieldDef[]): FieldDef[] {
  return [...fields].sort((a, b) => a.order - b.order)
}

function parseOptionsText(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function MaterialCatalogModuleView() {
  const { t, locale } = useI18n()
  const { materials, upsertMaterial, removeMaterial } = useMaterialCatalog()
  const [filterOpen, setFilterOpen] = useState(false)
  const [listSearch, setListSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('general')
  const [draft, setDraft] = useState<MaterialDef | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [newDraft, setNewDraft] = useState({ name: '', code: '', category: 'custom' as MaterialCategory })
  const newTriggerRef = useRef<HTMLButtonElement | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const selected = useMemo(() => materials.find((m) => m.id === selectedId) ?? null, [materials, selectedId])

  useEffect(() => {
    if (!selected) {
      setDraft(null)
      return
    }
    setDraft({ ...selected, fields: sortFields(selected.fields) })
  }, [selected])

  useEffect(() => {
    if (materials.length && (!selectedId || !materials.some((m) => m.id === selectedId))) {
      setSelectedId(materials[0]!.id)
    }
  }, [materials, selectedId])

  const filtered = useMemo(() => {
    const byCat = filterCategory === 'all' ? materials : materials.filter((m) => m.category === filterCategory)
    const q = listSearch.trim().toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
    if (!q) return byCat
    return byCat.filter((m) => {
      const hay = `${m.code} ${m.name} ${m.description ?? ''}`.toLocaleLowerCase(locale === 'en' ? 'en-US' : 'tr-TR')
      return hay.includes(q)
    })
  }, [materials, filterCategory, listSearch, locale])

  const measureNewPopover = useCallback(() => {
    const btn = newTriggerRef.current
    if (!btn || !newOpen) return
    const rect = btn.getBoundingClientRect()
    const width = Math.min(360, Math.max(280, window.innerWidth - 16))
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    setPopoverPos({ top: rect.top, left, width })
  }, [newOpen])

  useLayoutEffect(() => {
    if (!newOpen) {
      setPopoverPos(null)
      return
    }
    measureNewPopover()
    const on = () => measureNewPopover()
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
    }
  }, [newOpen, measureNewPopover])

  useEffect(() => {
    if (!newOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNewOpen(false)
    }
    const onDown = (e: MouseEvent) => {
      const node = e.target as Node
      if (newTriggerRef.current?.contains(node)) return
      const panel = document.getElementById('mc-new-material-popover')
      if (panel?.contains(node)) return
      setNewOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [newOpen])

  const persistDraft = useCallback(() => {
    if (!draft) return
    const next: MaterialDef = {
      ...draft,
      fields: sortFields(draft.fields.map((f, i) => ({ ...f, order: i }))),
      updatedAt: new Date().toISOString(),
    }
    upsertMaterial(next)
  }, [draft, upsertMaterial])

  const updateField = useCallback((id: string, patch: Partial<FieldDef>) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      }
    })
  }, [])

  const addField = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return prev
      const order = prev.fields.length
      const f: FieldDef = {
        id: newId('fld'),
        label: locale === 'en' ? 'New field' : 'Yeni alan',
        type: 'text',
        required: false,
        order,
      }
      return { ...prev, fields: [...prev.fields, f] }
    })
  }, [locale])

  const removeField = useCallback((id: string) => {
    setDraft((prev) => {
      if (!prev) return prev
      return { ...prev, fields: prev.fields.filter((f) => f.id !== id) }
    })
  }, [])

  const moveField = useCallback((id: string, dir: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev
      const sorted = sortFields(prev.fields)
      const i = sorted.findIndex((f) => f.id === id)
      if (i < 0) return prev
      const j = i + dir
      if (j < 0 || j >= sorted.length) return prev
      const copy = [...sorted]
      const tmp = copy[i]!.order
      copy[i] = { ...copy[i]!, order: copy[j]!.order }
      copy[j] = { ...copy[j]!, order: tmp }
      return { ...prev, fields: copy }
    })
  }, [])

  const rightRef = useRef<HTMLDivElement | null>(null)
  const scrollTop = () => {
    requestAnimationFrame(() => rightRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
  }

  const createNewMaterial = () => {
    const name = newDraft.name.trim()
    const code = newDraft.code.trim().toUpperCase()
    if (!name || !code) return
    const ts = new Date().toISOString()
    const m: MaterialDef = {
      id: newId('mat-def'),
      name,
      code,
      category: newDraft.category,
      description: '',
      fields: [],
      readonly: false,
      createdAt: ts,
      updatedAt: ts,
    }
    upsertMaterial(m)
    setSelectedId(m.id)
    setDetailTab('general')
    setNewOpen(false)
    setNewDraft({ name: '', code: '', category: 'custom' })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ElementIdentityPieceCodesLikeSplit
        persistKey="material-catalog"
        listTitle={t('materialCatalog.listTitle')}
        defaultSplitRatio={38}
        filterToolbarSearch={
          <FilterToolbarSearch
            id="material-catalog-list-search"
            value={listSearch}
            onValueChange={setListSearch}
            placeholder={locale === 'en' ? 'Code, name…' : 'Kod, ad…'}
            ariaLabel={locale === 'en' ? 'Search materials' : 'Materyal ara'}
          />
        }
        headerActions={
          <div className="relative self-center sm:self-auto">
            <button
              ref={newTriggerRef}
              type="button"
              onClick={() => setNewOpen((o) => !o)}
              className={eiSplitHeaderButtonPassive}
            >
              <Plus className="size-3.5 shrink-0" aria-hidden />
              {t('materialCatalog.new')}
            </button>
            {newOpen && popoverPos
              ? createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[96] bg-slate-950/20 backdrop-blur-[1px] dark:bg-slate-950/35"
                      aria-hidden
                    />
                    <div
                      id="mc-new-material-popover"
                      role="dialog"
                      aria-modal="true"
                      style={{
                        top: popoverPos.top,
                        left: popoverPos.left,
                        width: popoverPos.width,
                      }}
                      className="fixed z-[100] -translate-y-[calc(100%+0.5rem)] rounded-2xl border border-white/20 bg-white/10 p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200/40 pb-2 dark:border-white/10">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {t('materialCatalog.dialog.newTitle')}
                        </p>
                        <button
                          type="button"
                          onClick={() => setNewOpen(false)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-white/40 dark:hover:bg-white/10"
                          aria-label="Kapat"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <label className="block text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.name')}</span>
                          <input
                            value={newDraft.name}
                            onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/90 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900/50"
                          />
                        </label>
                        <label className="block text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.code')}</span>
                          <input
                            value={newDraft.code}
                            onChange={(e) => setNewDraft((d) => ({ ...d, code: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/90 px-2 py-1.5 font-mono text-sm dark:border-slate-600 dark:bg-slate-900/50"
                          />
                        </label>
                        <label className="block text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.category')}</span>
                          <select
                            value={newDraft.category}
                            onChange={(e) =>
                              setNewDraft((d) => ({ ...d, category: e.target.value as MaterialCategory }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/90 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900/50"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {t(categoryLabelKey(c))}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setNewOpen(false)}
                            className="okan-liquid-btn-secondary rounded-full px-3 py-1.5 text-xs font-semibold"
                          >
                            {t('elementIdentity.cancel')}
                          </button>
                          <button
                            type="button"
                            disabled={!newDraft.name.trim() || !newDraft.code.trim()}
                            onClick={createNewMaterial}
                            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
                          >
                            {t('materialCatalog.save')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>,
                  document.body,
                )
              : null}
          </div>
        }
        isFilterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        filterAside={
          <div>
            <ElementIdentityFilterSheetHeader
              title={t('materialCatalog.filterTitle')}
              subtitle={t('materialCatalog.filterCategory')}
              onClose={() => setFilterOpen(false)}
            />
            <label className="mt-2 block">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.search')}</span>
              <input
                type="search"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder={locale === 'en' ? 'Code, name…' : 'Kod, ad…'}
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold ${
                  filterCategory === 'all' ? 'okan-liquid-pill-active' : 'okan-liquid-btn-secondary'
                }`}
              >
                {t('materialCatalog.filterAll')}
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilterCategory(c)}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold ${
                    filterCategory === c ? 'okan-liquid-pill-active' : 'okan-liquid-btn-secondary'
                  }`}
                >
                  {t(categoryLabelKey(c))}
                </button>
              ))}
            </div>
          </div>
        }
        listBody={
          filtered.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300/60 px-3 py-8 text-center text-xs text-slate-500 dark:border-slate-600">
              —
            </li>
          ) : (
            filtered.map((m) => (
              <li key={m.id} className="rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(m.id)
                    setDetailTab('general')
                    scrollTop()
                  }}
                  aria-current={selectedId === m.id ? 'true' : undefined}
                  className={[
                    'flex w-full flex-col gap-1 px-3 py-2 text-left text-sm transition',
                    selectedId === m.id
                      ? 'okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10'
                      : 'hover:bg-white/50 dark:hover:bg-slate-900/35',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t(categoryLabelKey(m.category))}
                    </span>
                    {m.readonly ? (
                      <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300">{t('materialCatalog.readonly')}</span>
                    ) : null}
                  </div>
                  <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-50">{m.code}</p>
                  <p className="truncate text-xs text-slate-600 dark:text-slate-300">{m.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {m.fields.length} {t('materialCatalog.fieldsCount')}
                  </p>
                </button>
              </li>
            ))
          )
        }
        footer={
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-600 dark:text-slate-300">
            <span>
              <span className="tabular-nums font-semibold">{filtered.length}</span> {locale === 'en' ? 'items' : 'kayıt'}
            </span>
            <button
              type="button"
              onClick={() => selected && !selected.readonly && removeMaterial(selected.id)}
              disabled={!selected || Boolean(selected.readonly)}
              className="rounded-md border border-rose-300/70 px-2 py-1 text-[11px] font-semibold text-rose-700 disabled:opacity-40 dark:border-rose-600 dark:text-rose-300"
            >
              {t('materialCatalog.delete')}
            </button>
          </div>
        }
        rightPanelRef={rightRef}
        rightAside={
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {draft ? (
              <div className="flex h-full min-h-0 flex-col">
                <header className="shrink-0 border-b border-slate-200/25 pb-3 text-center dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('materialCatalog.detail.selected')}
                  </p>
                  <h3 className="mt-1.5 font-mono text-lg font-semibold text-slate-900 dark:text-slate-50">{draft.code}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{draft.name}</p>
                </header>
                <div className="sticky top-0 z-10 flex shrink-0 justify-center pt-3">
                  <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist">
                    {(
                      [
                        ['general', 'materialCatalog.tab.general'],
                        ['fields', 'materialCatalog.tab.fields'],
                        ['preview', 'materialCatalog.tab.preview'],
                      ] as const
                    ).map(([id, key]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={detailTab === id}
                        onClick={() => {
                          setDetailTab(id)
                          scrollTop()
                        }}
                        className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold sm:text-sm ${
                          detailTab === id
                            ? 'border-sky-300/70 bg-sky-100/70 text-slate-900 dark:border-sky-500/50 dark:bg-sky-900/35 dark:text-slate-50'
                            : 'border-slate-200/70 bg-white/55 text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/35 dark:text-slate-300'
                        }`}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="okan-project-tab-panel mt-3 min-h-0 flex-1 overflow-y-auto px-0.5 text-left sm:px-1">
                  {detailTab === 'general' ? (
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.name')}</span>
                        <input
                          value={draft.name}
                          disabled={draft.readonly}
                          onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                          className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/90 px-2 py-2 text-sm disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/50"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.code')}</span>
                        <input
                          value={draft.code}
                          disabled={draft.readonly}
                          onChange={(e) => setDraft((d) => (d ? { ...d, code: e.target.value } : d))}
                          className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/90 px-2 py-2 font-mono text-sm disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/50"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.category')}</span>
                        <select
                          value={draft.category}
                          disabled={draft.readonly}
                          onChange={(e) =>
                            setDraft((d) =>
                              d ? { ...d, category: e.target.value as MaterialCategory } : d,
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/90 px-2 py-2 text-sm disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/50"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {t(categoryLabelKey(c))}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{t('materialCatalog.description')}</span>
                        <textarea
                          value={draft.description ?? ''}
                          disabled={draft.readonly}
                          rows={3}
                          onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
                          className="mt-1 w-full resize-y rounded-lg border border-slate-300/80 bg-white/90 px-2 py-2 text-sm disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/50"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={draft.readonly}
                        onClick={persistDraft}
                        className="self-end rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
                      >
                        {t('materialCatalog.save')}
                      </button>
                    </div>
                  ) : null}
                  {detailTab === 'fields' ? (
                    <div className="flex flex-col gap-3">
                      {draft.readonly ? (
                        <p className="text-xs text-slate-500">{t('materialCatalog.readonly')}</p>
                      ) : (
                        <>
                          {sortFields(draft.fields).map((f, idx) => (
                            <div
                              key={f.id}
                              className="rounded-xl border border-slate-200/50 bg-white/40 p-3 dark:border-slate-600/40 dark:bg-slate-900/30"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[10px] font-semibold uppercase text-slate-500">#{idx + 1}</span>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    className="rounded border border-slate-200 px-1.5 text-[10px] dark:border-slate-600"
                                    onClick={() => moveField(f.id, -1)}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded border border-slate-200 px-1.5 text-[10px] dark:border-slate-600"
                                    onClick={() => moveField(f.id, 1)}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded border border-rose-200 p-1 text-rose-600 dark:border-rose-800"
                                    onClick={() => removeField(f.id)}
                                    aria-label="remove"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                <label className="block text-[11px] sm:col-span-2">
                                  <span>{t('materialCatalog.field.label')}</span>
                                  <input
                                    value={f.label}
                                    onChange={(e) => updateField(f.id, { label: e.target.value })}
                                    className="mt-0.5 w-full rounded border border-slate-300/80 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900/50"
                                  />
                                </label>
                                <label className="block text-[11px]">
                                  <span>{t('materialCatalog.field.type')}</span>
                                  <select
                                    value={f.type}
                                    onChange={(e) =>
                                      updateField(f.id, {
                                        type: e.target.value as FieldType,
                                        options: e.target.value === 'select' ? f.options ?? [] : undefined,
                                      })
                                    }
                                    className="mt-0.5 w-full rounded border border-slate-300/80 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900/50"
                                  >
                                    <option value="text">text</option>
                                    <option value="number">number</option>
                                    <option value="select">select</option>
                                    <option value="bool">bool</option>
                                  </select>
                                </label>
                                <label className="block text-[11px]">
                                  <span>{t('materialCatalog.field.unit')}</span>
                                  <input
                                    value={f.unit ?? ''}
                                    onChange={(e) => updateField(f.id, { unit: e.target.value || undefined })}
                                    className="mt-0.5 w-full rounded border border-slate-300/80 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900/50"
                                  />
                                </label>
                                {f.type === 'select' ? (
                                  <label className="block text-[11px] sm:col-span-2">
                                    <span>{t('materialCatalog.field.options')}</span>
                                    <textarea
                                      value={(f.options ?? []).join('\n')}
                                      rows={4}
                                      onChange={(e) =>
                                        updateField(f.id, { options: parseOptionsText(e.target.value) })
                                      }
                                      className="mt-0.5 w-full rounded border border-slate-300/80 bg-white px-2 py-1 font-mono text-[11px] dark:border-slate-600 dark:bg-slate-900/50"
                                    />
                                  </label>
                                ) : null}
                                <label className="flex items-center gap-2 text-[11px] sm:col-span-2">
                                  <input
                                    type="checkbox"
                                    checked={f.required}
                                    onChange={(e) => updateField(f.id, { required: e.target.checked })}
                                  />
                                  {t('materialCatalog.field.required')}
                                </label>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={addField} className={eiSplitHeaderButtonPassive}>
                            {t('materialCatalog.field.add')}
                          </button>
                          <button type="button" onClick={persistDraft} className="self-end rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                            {t('materialCatalog.save')}
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                  {detailTab === 'preview' ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-[11px] text-slate-500">{t('materialCatalog.preview.hint')}</p>
                      <div className="space-y-2 rounded-xl border border-slate-200/50 bg-white/40 p-3 dark:border-slate-600/40 dark:bg-slate-900/30">
                        {sortFields(draft.fields).map((f) => (
                          <label key={f.id} className="block text-[11px]">
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {f.label}
                              {f.required ? ' *' : ''}
                              {f.unit ? ` (${f.unit})` : ''}
                            </span>
                            {f.type === 'text' ? (
                              <input className="mt-0.5 w-full rounded border border-slate-200 bg-white/80 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900/40" readOnly placeholder="…" />
                            ) : null}
                            {f.type === 'number' ? (
                              <input type="number" className="mt-0.5 w-full rounded border border-slate-200 bg-white/80 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900/40" readOnly placeholder="0" />
                            ) : null}
                            {f.type === 'bool' ? (
                              <input type="checkbox" className="mt-1" disabled />
                            ) : null}
                            {f.type === 'select' ? (
                              <select className="mt-0.5 w-full rounded border border-slate-200 bg-white/80 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900/40" disabled>
                                <option>—</option>
                                {(f.options ?? []).map((opt) => {
                                  const [val, lab] = opt.includes(':') ? opt.split(':') : [opt, opt]
                                  return (
                                    <option key={opt} value={val}>
                                      {lab}
                                    </option>
                                  )
                                })}
                              </select>
                            ) : null}
                          </label>
                        ))}
                        {draft.fields.length === 0 ? (
                          <p className="text-xs text-slate-500">{locale === 'en' ? 'No fields yet.' : 'Henüz alan yok.'}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="px-2 text-center text-xs text-slate-500">—</p>
            )}
          </div>
        }
      />
    </div>
  )
}
