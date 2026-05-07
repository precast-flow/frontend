import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type {
  ElementCategory,
  ElementTypeCatalogEntry,
  IfcClassName,
} from '../../../elementIdentity/types'
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

const IFC_CLASSES: IfcClassName[] = [
  'IfcColumn',
  'IfcBeam',
  'IfcSlab',
  'IfcWall',
  'IfcStairFlight',
  'IfcFooting',
  'IfcMember',
  'IfcPlate',
  'IfcCovering',
  'IfcPile',
  'IfcPipeSegment',
  'IfcCableCarrierSegment',
  'IfcBuildingElementProxy',
]

const CATEGORIES: ElementCategory[] = [
  'superstructure',
  'substructure',
  'industrial',
  'architectural',
  'environmental_protection',
  'landscaping',
  'energy_carrier',
  'custom_prefab',
]

type Draft = {
  id: string
  nameTr: string
  nameEn: string
  defaultCode: string
  ifcClass: IfcClassName
  defaultIfcPredefinedType: string
  category: ElementCategory
  order: string
  description: string
  allowedTypologies: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  nameTr: '',
  nameEn: '',
  defaultCode: '',
  ifcClass: 'IfcColumn',
  defaultIfcPredefinedType: '',
  category: 'superstructure',
  order: '100',
  description: '',
  allowedTypologies: '',
}

export function ElementTypesAdminPanel() {
  const { elementTypesData, addElementType, updateElementType, removeElementType } =
    useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const paginated = usePaginatedRows(elementTypesData, 20)

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.nameTr.trim()) return
    if (elementTypesData.some((r) => r.id === draft.id.trim())) return
    const row: ElementTypeCatalogEntry = {
      id: draft.id.trim(),
      nameTr: draft.nameTr.trim(),
      nameEn: draft.nameEn.trim() || draft.nameTr.trim(),
      defaultCode: draft.defaultCode.trim().toUpperCase(),
      ifcClass: draft.ifcClass,
      defaultIfcPredefinedType: (draft.defaultIfcPredefinedType.trim() || undefined) as
        | ElementTypeCatalogEntry['defaultIfcPredefinedType']
        | undefined,
      category: draft.category,
      order: Number(draft.order) || 100,
      description: draft.description.trim() || undefined,
      allowedTypologies: draft.allowedTypologies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    addElementType(row)
    setDraft(EMPTY_DRAFT)
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="Eleman Tipleri"
        count={elementTypesData.length}
        description="sistem kataloğu (mock + localStorage)"
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
        title="Yeni Eleman Tipi"
        subtitle="Sistem katalog kaydı ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.nameTr.trim()}
      >
        <AddFieldset legend="Yeni Eleman Tipi">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: col" />
            <Field label="İsim (TR)" value={draft.nameTr} onChange={(v) => setDraft({ ...draft, nameTr: v })} />
            <Field label="İsim (EN)" value={draft.nameEn} onChange={(v) => setDraft({ ...draft, nameEn: v })} />
            <Field
              label="Varsayılan Kod"
              value={draft.defaultCode}
              onChange={(v) => setDraft({ ...draft, defaultCode: v })}
              placeholder="örn: KL"
            />
            <Select
              label="IFC Sınıfı"
              value={draft.ifcClass}
              onChange={(v) => setDraft({ ...draft, ifcClass: v as IfcClassName })}
              options={IFC_CLASSES.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Kategori"
              value={draft.category}
              onChange={(v) => setDraft({ ...draft, category: v as ElementCategory })}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Field
              label="IFC Predef Tip"
              value={draft.defaultIfcPredefinedType}
              onChange={(v) => setDraft({ ...draft, defaultIfcPredefinedType: v })}
            />
            <Field
              label="Sıra"
              value={draft.order}
              onChange={(v) => setDraft({ ...draft, order: v })}
            />
            <Field
              label="İzinli Tipolojiler (virgüllü)"
              value={draft.allowedTypologies}
              onChange={(v) => setDraft({ ...draft, allowedTypologies: v })}
              className="md:col-span-3"
            />
            <Field
              label="Açıklama"
              value={draft.description}
              onChange={(v) => setDraft({ ...draft, description: v })}
              className="md:col-span-3 lg:col-span-3"
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
            <th className="px-3 py-2 text-left">Kod</th>
            <th className="px-3 py-2 text-left">IFC</th>
            <th className="px-3 py-2 text-left">Kategori</th>
            <th className="px-3 py-2 text-left">Sıra</th>
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
                  onCommit={(v) => updateElementType({ ...row, nameTr: v })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.nameEn}
                  onCommit={(v) => updateElementType({ ...row, nameEn: v })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.defaultCode}
                  onCommit={(v) => updateElementType({ ...row, defaultCode: v.toUpperCase() })}
                  className="w-20 font-mono"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.ifcClass}
                  onChange={(v) => updateElementType({ ...row, ifcClass: v as IfcClassName })}
                  options={IFC_CLASSES.map((c) => ({ value: c, label: c }))}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.category}
                  onChange={(v) => updateElementType({ ...row, category: v as ElementCategory })}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={String(row.order)}
                  onCommit={(v) => updateElementType({ ...row, order: Number(v) || 0 })}
                  className="w-14"
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.nameTr}" silinsin mi?`)) removeElementType(row.id)
                  }}
                />
              </td>
            </tr>
          ))}
          {paginated.totalCount === 0 && <EmptyRow colSpan={8} />}
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
