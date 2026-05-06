import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type { DimensionUnit, IdentifyingDimension } from '../../../elementIdentity/types'
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

const UNITS: DimensionUnit[] = ['mm', 'cm', 'm', 'in', 'ft']

type Draft = {
  id: string
  nameTr: string
  nameEn: string
  unit: DimensionUnit
  required: boolean
  description: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  nameTr: '',
  nameEn: '',
  unit: 'mm',
  required: false,
  description: '',
}

export function DimensionsAdminPanel() {
  const { dimensionsData, addDimension, updateDimension, removeDimension } = useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const paginated = usePaginatedRows(dimensionsData, 20)

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.nameTr.trim()) return
    if (dimensionsData.some((r) => r.id === draft.id.trim())) return
    const row: IdentifyingDimension = {
      id: draft.id.trim(),
      nameTr: draft.nameTr.trim(),
      nameEn: draft.nameEn.trim() || draft.nameTr.trim(),
      unit: draft.unit,
      required: draft.required,
      description: draft.description.trim() || undefined,
    }
    addDimension(row)
    setDraft(EMPTY_DRAFT)
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="Tanımlayıcı Boyutlar"
        count={dimensionsData.length}
        description="boyut katalog"
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
        title="Yeni Boyut"
        subtitle="Tanımlayıcı boyut kaydı ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.nameTr.trim()}
      >
        <AddFieldset legend="Yeni Boyut">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-5">
            <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: height" />
            <Field label="İsim (TR)" value={draft.nameTr} onChange={(v) => setDraft({ ...draft, nameTr: v })} />
            <Field label="İsim (EN)" value={draft.nameEn} onChange={(v) => setDraft({ ...draft, nameEn: v })} />
            <Select
              label="Birim"
              value={draft.unit}
              onChange={(v) => setDraft({ ...draft, unit: v as DimensionUnit })}
              options={UNITS.map((u) => ({ value: u, label: u }))}
            />
            <label className="flex flex-col gap-1 text-[11px]">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Zorunlu</span>
              <input
                type="checkbox"
                checked={draft.required}
                onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
                className="h-4 w-4 self-start"
              />
            </label>
            <Field
              label="Açıklama"
              value={draft.description}
              onChange={(v) => setDraft({ ...draft, description: v })}
              className="md:col-span-3 lg:col-span-5"
            />
          </div>
        </AddFieldset>
      </AdminFormModal>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">İsim (TR)</th>
            <th className="px-3 py-2 text-left">İsim (EN)</th>
            <th className="px-3 py-2 text-left">Birim</th>
            <th className="px-3 py-2 text-left">Zorunlu</th>
            <th className="px-3 py-2 text-left">Açıklama</th>
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
                <InlineInput
                  value={row.nameTr}
                  onCommit={(v) => updateDimension({ ...row, nameTr: v })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.nameEn}
                  onCommit={(v) => updateDimension({ ...row, nameEn: v })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.unit}
                  onChange={(v) => updateDimension({ ...row, unit: v as DimensionUnit })}
                  options={UNITS.map((u) => ({ value: u, label: u }))}
                />
              </td>
              <td className="px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={row.required}
                  onChange={(e) => updateDimension({ ...row, required: e.target.checked })}
                  className="h-4 w-4"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.description ?? ''}
                  onCommit={(v) => updateDimension({ ...row, description: v || undefined })}
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.nameTr}" silinsin mi?`)) removeDimension(row.id)
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
