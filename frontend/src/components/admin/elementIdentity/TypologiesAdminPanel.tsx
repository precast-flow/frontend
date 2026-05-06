import { useMemo, useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type { Typology } from '../../../elementIdentity/types'
import {
  AdminFormModal,
  AddFieldset,
  DeleteButton,
  EmptyRow,
  Field,
  InlineInput,
  InlineSelect,
  PanelHeader,
  Select,
  TableShell,
  Pagination,
  usePaginatedRows,
} from './_widgets'

type Draft = {
  id: string
  elementTypeId: string
  nameTr: string
  nameEn: string
  defaultCode: string
  ifcPredefinedType: string
  ifcObjectType: string
  identifyingDimensions: string
  defaultSizeFormatId: string
  notes: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  elementTypeId: '',
  nameTr: '',
  nameEn: '',
  defaultCode: '',
  ifcPredefinedType: '',
  ifcObjectType: '',
  identifyingDimensions: '',
  defaultSizeFormatId: '',
  notes: '',
}

export function TypologiesAdminPanel() {
  const {
    typologiesData,
    elementTypesData,
    sizeFormatsData,
    addTypology,
    updateTypology,
    removeTypology,
  } = useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [filter, setFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? typologiesData
        : typologiesData.filter((t) => t.elementTypeId === filter),
    [filter, typologiesData],
  )

  const elementTypeOptions = elementTypesData.map((e) => ({ value: e.id, label: e.nameTr }))
  const paginated = usePaginatedRows(filtered, 20)
  const sizeFormatOptions = sizeFormatsData.map((s) => ({ value: s.id, label: s.id }))

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.nameTr.trim() || !draft.elementTypeId) return
    if (typologiesData.some((r) => r.id === draft.id.trim())) return
    const row: Typology = {
      id: draft.id.trim(),
      elementTypeId: draft.elementTypeId,
      nameTr: draft.nameTr.trim(),
      nameEn: draft.nameEn.trim() || draft.nameTr.trim(),
      defaultCode: draft.defaultCode.trim().toUpperCase(),
      ifcPredefinedType: (draft.ifcPredefinedType.trim() || undefined) as Typology['ifcPredefinedType'],
      ifcObjectType: draft.ifcObjectType.trim() || undefined,
      identifyingDimensions: draft.identifyingDimensions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      defaultSizeFormatId: draft.defaultSizeFormatId || sizeFormatsData[0]?.id || '',
      notes: draft.notes.trim() || undefined,
    }
    addTypology(row)
    setDraft({ ...EMPTY_DRAFT, elementTypeId: draft.elementTypeId })
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="Tipolojiler"
        count={typologiesData.length}
        description="eleman tipi varyantları"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-neo-out transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
        >
          Yeni ekle
        </button>
      </div>

      <AdminFormModal
        open={isAddModalOpen}
        title="Yeni Tipoloji"
        subtitle="Eleman tipi varyantı ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.nameTr.trim() || !draft.elementTypeId}
      >
        <AddFieldset legend="Yeni Tipoloji">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-5">
            <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: col-rect" />
            <Select
              label="Eleman Tipi"
              value={draft.elementTypeId}
              onChange={(v) => setDraft({ ...draft, elementTypeId: v })}
              options={[{ value: '', label: '— seçiniz —' }, ...elementTypeOptions]}
            />
            <Field label="İsim (TR)" value={draft.nameTr} onChange={(v) => setDraft({ ...draft, nameTr: v })} />
            <Field label="İsim (EN)" value={draft.nameEn} onChange={(v) => setDraft({ ...draft, nameEn: v })} />
            <Field
              label="Varsayılan Kod"
              value={draft.defaultCode}
              onChange={(v) => setDraft({ ...draft, defaultCode: v })}
            />
            <Field
              label="IFC Predef Tip"
              value={draft.ifcPredefinedType}
              onChange={(v) => setDraft({ ...draft, ifcPredefinedType: v })}
            />
            <Field
              label="IFC Object Type"
              value={draft.ifcObjectType}
              onChange={(v) => setDraft({ ...draft, ifcObjectType: v })}
            />
            <Select
              label="Varsayılan Format"
              value={draft.defaultSizeFormatId}
              onChange={(v) => setDraft({ ...draft, defaultSizeFormatId: v })}
              options={[{ value: '', label: '— seçiniz —' }, ...sizeFormatOptions]}
            />
            <Field
              label="Tanımlayıcı Boyutlar (virgüllü)"
              value={draft.identifyingDimensions}
              onChange={(v) => setDraft({ ...draft, identifyingDimensions: v })}
              className="md:col-span-3 lg:col-span-2"
            />
            <Field
              label="Notlar"
              value={draft.notes}
              onChange={(v) => setDraft({ ...draft, notes: v })}
              className="md:col-span-3 lg:col-span-3"
            />
          </div>
        </AddFieldset>
      </AdminFormModal>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Filtre:</span>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition',
            filter === 'all'
              ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
              : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
          ].join(' ')}
        >
          Tümü
        </button>
        {elementTypesData.map((et) => (
          <button
            type="button"
            key={et.id}
            onClick={() => setFilter(et.id)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition',
              filter === et.id
                ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
            ].join(' ')}
          >
            {et.nameTr}
          </button>
        ))}
      </div>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Eleman Tipi</th>
            <th className="px-3 py-2 text-left">İsim (TR)</th>
            <th className="px-3 py-2 text-left">Kod</th>
            <th className="px-3 py-2 text-left">IFC Predef</th>
            <th className="px-3 py-2 text-left">Format</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {paginated.pageRows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100/60 dark:hover:bg-gray-900/50"
            >
              <td className="px-3 py-1.5 font-mono text-xs text-gray-700 dark:text-gray-200">{row.id}</td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.elementTypeId}
                  onChange={(v) => updateTypology({ ...row, elementTypeId: v })}
                  options={elementTypeOptions}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.nameTr}
                  onCommit={(v) => updateTypology({ ...row, nameTr: v })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.defaultCode}
                  onCommit={(v) => updateTypology({ ...row, defaultCode: v.toUpperCase() })}
                  className="w-20 font-mono"
                />
              </td>
              <td className="px-3 py-1.5 font-mono text-xs">
                {row.ifcPredefinedType ?? '—'}
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.defaultSizeFormatId}
                  onChange={(v) => updateTypology({ ...row, defaultSizeFormatId: v })}
                  options={sizeFormatOptions}
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.nameTr}" silinsin mi?`)) removeTypology(row.id)
                  }}
                />
              </td>
            </tr>
          ))}
          {paginated.totalCount === 0 && <EmptyRow colSpan={7} />}
        </tbody>
      </TableShell>

      <Pagination
        page={paginated.page}
        totalPages={paginated.totalPages}
        totalCount={paginated.totalCount}
        pageSize={paginated.pageSize}
        onPageChange={paginated.setPage}
      />
    </div>
  )
}
