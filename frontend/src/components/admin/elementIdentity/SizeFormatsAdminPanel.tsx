import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type { SizeFormat, UnitSystem } from '../../../elementIdentity/types'
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

const UNIT_SYSTEMS: UnitSystem[] = ['metric', 'imperial', 'mixed']

type Draft = {
  id: string
  nameTr: string
  nameEn: string
  inputs: string
  outputTemplate: string
  unitSystem: UnitSystem
  separator: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  nameTr: '',
  nameEn: '',
  inputs: '',
  outputTemplate: '',
  unitSystem: 'metric',
  separator: '',
}

export function SizeFormatsAdminPanel() {
  const { sizeFormatsData, addSizeFormat, updateSizeFormat, removeSizeFormat } =
    useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const paginated = usePaginatedRows(sizeFormatsData, 20)

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.nameTr.trim() || !draft.outputTemplate.trim()) return
    if (sizeFormatsData.some((r) => r.id === draft.id.trim())) return
    const row: SizeFormat = {
      id: draft.id.trim(),
      nameTr: draft.nameTr.trim(),
      nameEn: draft.nameEn.trim() || draft.nameTr.trim(),
      inputs: draft.inputs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      outputTemplate: draft.outputTemplate.trim(),
      unitSystem: draft.unitSystem,
      separator: draft.separator.trim() || undefined,
    }
    addSizeFormat(row)
    setDraft(EMPTY_DRAFT)
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="Boyut Formatları"
        count={sizeFormatsData.length}
        description="SIZE token üretim şablonları"
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
        title="Yeni Boyut Formatı"
        subtitle="SIZE token şablonu ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.nameTr.trim() || !draft.outputTemplate.trim()}
      >
        <AddFieldset legend="Yeni Format">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: length_cm" />
            <Field label="İsim (TR)" value={draft.nameTr} onChange={(v) => setDraft({ ...draft, nameTr: v })} />
            <Field label="İsim (EN)" value={draft.nameEn} onChange={(v) => setDraft({ ...draft, nameEn: v })} />
            <Select
              label="Birim Sistemi"
              value={draft.unitSystem}
              onChange={(v) => setDraft({ ...draft, unitSystem: v as UnitSystem })}
              options={UNIT_SYSTEMS.map((u) => ({ value: u, label: u }))}
            />
            <Field
              label="Inputs (virgüllü)"
              value={draft.inputs}
              onChange={(v) => setDraft({ ...draft, inputs: v })}
              placeholder="height,sectionWidth"
              className="md:col-span-3 lg:col-span-2"
            />
            <Field
              label="Output Template"
              value={draft.outputTemplate}
              onChange={(v) => setDraft({ ...draft, outputTemplate: v })}
              placeholder="örn: {height/10|round:0}"
              className="md:col-span-3 lg:col-span-2"
            />
            <Field
              label="Ayraç (opsiyonel)"
              value={draft.separator}
              onChange={(v) => setDraft({ ...draft, separator: v })}
            />
          </div>
        </AddFieldset>
      </AdminFormModal>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">İsim (TR)</th>
            <th className="px-3 py-2 text-left">Inputs</th>
            <th className="px-3 py-2 text-left">Template</th>
            <th className="px-3 py-2 text-left">Birim</th>
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
                  onCommit={(v) => updateSizeFormat({ ...row, nameTr: v })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.inputs.join(', ')}
                  onCommit={(v) =>
                    updateSizeFormat({
                      ...row,
                      inputs: v
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.outputTemplate}
                  onCommit={(v) => updateSizeFormat({ ...row, outputTemplate: v })}
                  className="font-mono"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.unitSystem}
                  onChange={(v) => updateSizeFormat({ ...row, unitSystem: v as UnitSystem })}
                  options={UNIT_SYSTEMS.map((u) => ({ value: u, label: u }))}
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.nameTr}" silinsin mi?`)) removeSizeFormat(row.id)
                  }}
                />
              </td>
            </tr>
          ))}
          {paginated.totalCount === 0 && <EmptyRow colSpan={6} />}
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
