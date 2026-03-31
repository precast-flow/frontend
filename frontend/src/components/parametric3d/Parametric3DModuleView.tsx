import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { useI18n } from '../../i18n/I18nProvider'
import { buildMeshFromPayload, disposeGroup } from '../../parametric3d/buildMesh'
import {
  defaultPayload,
  loadSavedDesigns,
  saveDesigns,
  type ElementFamily,
  type ParametricPayload,
  type SavedDesign,
} from '../../parametric3d/types'
import { validatePayload } from '../../parametric3d/validate'
import { ParametricViewer } from './ParametricViewer'

const FAMILIES: ElementFamily[] = ['COLUMN', 'BEAM', 'CULVERT', 'PANEL', 'PROFILE_WALL']

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <input
        type="number"
        min={0}
        step={1}
        value={Number.isFinite(value) ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-900 shadow-inner outline-none ring-gray-300 focus-visible:ring-2 disabled:opacity-50 dark:bg-gray-900 dark:text-gray-100"
      />
    </label>
  )
}

export function Parametric3DModuleView() {
  const { t } = useI18n()
  const [family, setFamily] = useState<ElementFamily>('COLUMN')
  const [payload, setPayload] = useState<ParametricPayload>(() => defaultPayload('COLUMN'))
  const [saved, setSaved] = useState<SavedDesign[]>(() => loadSavedDesigns())
  const [nameDraft, setNameDraft] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const deferredPayload = useDeferredValue(payload)
  const validation = useMemo(() => validatePayload(deferredPayload), [deferredPayload])

  const setParams = useCallback((patch: Record<string, unknown>) => {
    setPayload((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, ...patch } as ParametricPayload['parameters'],
    }))
  }, [])

  const switchFamily = (f: ElementFamily) => {
    setFamily(f)
    setPayload(defaultPayload(f))
    setErrorMsg(null)
  }

  const handleSave = () => {
    const v = validatePayload(payload)
    if (!v.ok) {
      setErrorMsg(v.message)
      return
    }
    const title = nameDraft.trim() || `${payload.elementFamily} · ${payload.variantCode}`
    const entry: SavedDesign = {
      id: crypto.randomUUID(),
      name: title,
      payload: structuredClone(payload),
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...saved]
    setSaved(next)
    saveDesigns(next)
    setNameDraft('')
    setErrorMsg(null)
  }

  const loadDesign = (s: SavedDesign) => {
    setPayload(s.payload)
    setFamily(s.payload.elementFamily)
  }

  const removeDesign = (id: string) => {
    const next = saved.filter((x) => x.id !== id)
    setSaved(next)
    saveDesigns(next)
  }

  const exportGlb = async () => {
    const v = validatePayload(payload)
    if (!v.ok) {
      setErrorMsg(v.message)
      return
    }
    const group = buildMeshFromPayload(payload)
    const exporter = new GLTFExporter()
    exporter.parse(
      group,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: 'model/gltf-binary' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `${payload.variantCode.replace(/[^a-z0-9-_]/gi, '_')}.glb`
          a.click()
          URL.revokeObjectURL(a.href)
        }
        disposeGroup(group)
      },
      (err) => console.error(err),
      { binary: true },
    )
  }

  const p = payload.parameters as Record<string, unknown>
  const showViewer = validation.ok

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,400px)_1fr]">
        <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/60">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('parametric3d.family')}
            </label>
            <select
              value={family}
              onChange={(e) => switchFamily(e.target.value as ElementFamily)}
              className="mt-1 w-full rounded-xl border-0 bg-gray-100 px-3 py-2.5 text-sm shadow-inner dark:bg-gray-900 dark:text-gray-100"
            >
              {FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {t(`parametric3d.family.${f}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('parametric3d.variantCode')}
              </span>
              <input
                value={payload.variantCode}
                onChange={(e) => setPayload((prev) => ({ ...prev, variantCode: e.target.value }))}
                className="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-inner dark:bg-gray-900 dark:text-gray-100"
              />
            </label>

            {family === 'COLUMN' ? (
              <>
                <Field label={t('parametric3d.field.sectionWidth')} value={p.sectionWidth as number} onChange={(v) => setParams({ sectionWidth: v })} />
                <Field label={t('parametric3d.field.sectionDepth')} value={p.sectionDepth as number} onChange={(v) => setParams({ sectionDepth: v })} />
                <Field label={t('parametric3d.field.height')} value={p.height as number} onChange={(v) => setParams({ height: v })} />
              </>
            ) : null}

            {family === 'BEAM' ? (
              <>
                <Field label={t('parametric3d.field.span')} value={p.span as number} onChange={(v) => setParams({ span: v })} />
                <Field label={t('parametric3d.field.width')} value={p.width as number} onChange={(v) => setParams({ width: v })} />
                <Field label={t('parametric3d.field.beamHeight')} value={p.height as number} onChange={(v) => setParams({ height: v })} />
              </>
            ) : null}

            {family === 'CULVERT' ? (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('parametric3d.culvert.outer')}</p>
                <Field label={t('parametric3d.field.outerLength')} value={p.outerLength as number} onChange={(v) => setParams({ outerLength: v })} />
                <Field label={t('parametric3d.field.outerWidth')} value={p.outerWidth as number} onChange={(v) => setParams({ outerWidth: v })} />
                <Field label={t('parametric3d.field.outerHeight')} value={p.outerHeight as number} onChange={(v) => setParams({ outerHeight: v })} />
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('parametric3d.culvert.inner')}</p>
                <Field label={t('parametric3d.field.innerLength')} value={p.innerLength as number} onChange={(v) => setParams({ innerLength: v })} />
                <Field label={t('parametric3d.field.innerWidth')} value={p.innerWidth as number} onChange={(v) => setParams({ innerWidth: v })} />
                <Field label={t('parametric3d.field.innerHeight')} value={p.innerHeight as number} onChange={(v) => setParams({ innerHeight: v })} />
              </>
            ) : null}

            {family === 'PANEL' ? (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('parametric3d.panelKind')}</span>
                  <select
                    value={payload.panelKind ?? 'WALL'}
                    onChange={(e) =>
                      setPayload((prev) => ({
                        ...prev,
                        panelKind: e.target.value as 'WALL' | 'SLAB',
                      }))
                    }
                    className="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-inner dark:bg-gray-900"
                  >
                    <option value="WALL">{t('parametric3d.panelKind.wall')}</option>
                    <option value="SLAB">{t('parametric3d.panelKind.slab')}</option>
                  </select>
                </label>
                <Field label={t('parametric3d.field.length')} value={p.length as number} onChange={(v) => setParams({ length: v })} />
                <Field label={t('parametric3d.field.panelHeight')} value={p.height as number} onChange={(v) => setParams({ height: v })} />
                <Field label={t('parametric3d.field.thickness')} value={p.thickness as number} onChange={(v) => setParams({ thickness: v })} />
              </>
            ) : null}

            {family === 'PROFILE_WALL' ? (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('parametric3d.profileType')}</span>
                  <select
                    value={(p.profileType as string) ?? 'L'}
                    onChange={(e) => setParams({ profileType: e.target.value })}
                    className="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-inner dark:bg-gray-900"
                  >
                    <option value="L">L</option>
                    <option value="U">U</option>
                  </select>
                </label>
                <Field label={t('parametric3d.field.legA')} value={p.legLengthA as number} onChange={(v) => setParams({ legLengthA: v })} />
                <Field label={t('parametric3d.field.legB')} value={p.legLengthB as number} onChange={(v) => setParams({ legLengthB: v })} />
                {(p.profileType as string) === 'U' ? (
                  <Field
                    label={t('parametric3d.field.legC')}
                    value={(p.legLengthC as number) ?? p.legLengthB}
                    onChange={(v) => setParams({ legLengthC: v })}
                  />
                ) : null}
                <Field label={t('parametric3d.field.wallThickness')} value={p.wallThickness as number} onChange={(v) => setParams({ wallThickness: v })} />
                <Field
                  label={t('parametric3d.field.extrusionHeight')}
                  value={p.extrusionHeight as number}
                  onChange={(v) => setParams({ extrusionHeight: v })}
                />
              </>
            ) : null}
          </div>

          <div className="border-t border-gray-200/80 pt-3 dark:border-gray-700/80">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('parametric3d.saveAs')}</span>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={t('parametric3d.saveAsPlaceholder')}
                className="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm shadow-inner dark:bg-gray-900"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-neo-out-sm dark:bg-gray-200 dark:text-gray-900"
              >
                {t('parametric3d.save')}
              </button>
              <button
                type="button"
                onClick={exportGlb}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-neo-out-sm dark:bg-gray-800 dark:text-gray-100"
              >
                {t('parametric3d.exportGlb')}
              </button>
            </div>
            {errorMsg ? (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                {errorMsg}
              </p>
            ) : null}
            {!validation.ok ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{validation.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t('parametric3d.unit')}: mm · schema {payload.schemaVersion}
              </p>
            )}
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col gap-3">
          <div className="min-h-[360px] flex-1">
            {showViewer ? <ParametricViewer payload={deferredPayload} /> : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-100/50 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900/40">
                {validation.ok === false ? validation.message : t('parametric3d.loading')}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 shadow-neo-in dark:bg-gray-950/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('parametric3d.savedTitle')}</h3>
            <ul className="mt-2 max-h-48 space-y-2 overflow-auto text-sm">
              {saved.length === 0 ? (
                <li className="text-gray-500 dark:text-gray-400">{t('parametric3d.savedEmpty')}</li>
              ) : (
                saved.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-900/80"
                  >
                    <button
                      type="button"
                      onClick={() => loadDesign(s)}
                      className="min-w-0 flex-1 truncate text-left font-medium text-gray-800 hover:underline dark:text-gray-100"
                    >
                      {s.name}
                    </button>
                    <span className="shrink-0 text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => removeDesign(s.id)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      {t('parametric3d.remove')}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
