import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type { IfcClassName, IfcMappingRule } from '../../../elementIdentity/types'
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

type Draft = {
  id: string
  ifcClass: IfcClassName
  ifcPredefinedType: string
  ifcObjectType: string
  heuristic: string
  systemElementTypeId: string
  systemTypologyId: string
  priority: string
  notes: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  ifcClass: 'IfcColumn',
  ifcPredefinedType: '',
  ifcObjectType: '',
  heuristic: '',
  systemElementTypeId: '',
  systemTypologyId: '',
  priority: '10',
  notes: '',
}

export function IfcMappingAdminPanel() {
  const {
    ifcMappingRulesData,
    elementTypesData,
    typologiesData,
    addIfcMappingRule,
    updateIfcMappingRule,
    removeIfcMappingRule,
  } = useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const paginated = usePaginatedRows(ifcMappingRulesData, 20)

  const elementTypeOptions = elementTypesData.map((e) => ({ value: e.id, label: e.id }))
  const typologyOptions = [
    { value: '', label: '— yok —' },
    ...typologiesData.map((t) => ({ value: t.id, label: t.id })),
  ]

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.systemElementTypeId) return
    if (ifcMappingRulesData.some((r) => r.id === draft.id.trim())) return
    const row: IfcMappingRule = {
      id: draft.id.trim(),
      ifcClass: draft.ifcClass,
      ifcPredefinedType: (draft.ifcPredefinedType.trim() || undefined) as IfcMappingRule['ifcPredefinedType'],
      ifcObjectType: draft.ifcObjectType.trim() || undefined,
      heuristic: draft.heuristic.trim() || undefined,
      systemElementTypeId: draft.systemElementTypeId,
      systemTypologyId: draft.systemTypologyId.trim() || undefined,
      priority: Number(draft.priority) || 10,
      notes: draft.notes.trim() || undefined,
    }
    addIfcMappingRule(row)
    setDraft(EMPTY_DRAFT)
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="IFC Eşleme Kuralları"
        count={ifcMappingRulesData.length}
        description="ifc → sistem eleman tipi/tipoloji"
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
        title="Yeni IFC Kuralı"
        subtitle="IFC → sistem eşleme kuralı ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.systemElementTypeId}
      >
      <AddFieldset legend="Yeni Kural">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-5">
          <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: r48" />
          <Select
            label="IFC Sınıfı"
            value={draft.ifcClass}
            onChange={(v) => setDraft({ ...draft, ifcClass: v as IfcClassName })}
            options={IFC_CLASSES.map((c) => ({ value: c, label: c }))}
          />
          <Field
            label="Predef Tip"
            value={draft.ifcPredefinedType}
            onChange={(v) => setDraft({ ...draft, ifcPredefinedType: v })}
          />
          <Field
            label="Object Type"
            value={draft.ifcObjectType}
            onChange={(v) => setDraft({ ...draft, ifcObjectType: v })}
          />
          <Field
            label="Heuristic"
            value={draft.heuristic}
            onChange={(v) => setDraft({ ...draft, heuristic: v })}
          />
          <Select
            label="Sistem Eleman Tipi"
            value={draft.systemElementTypeId}
            onChange={(v) => setDraft({ ...draft, systemElementTypeId: v })}
            options={[{ value: '', label: '— seçiniz —' }, ...elementTypeOptions]}
          />
          <Select
            label="Sistem Tipolojisi"
            value={draft.systemTypologyId}
            onChange={(v) => setDraft({ ...draft, systemTypologyId: v })}
            options={typologyOptions}
          />
          <Field
            label="Öncelik"
            value={draft.priority}
            onChange={(v) => setDraft({ ...draft, priority: v })}
          />
          <Field
            label="Notlar"
            value={draft.notes}
            onChange={(v) => setDraft({ ...draft, notes: v })}
            className="md:col-span-3 lg:col-span-2"
          />
        </div>
      </AddFieldset>
      </AdminFormModal>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">IFC Sınıfı</th>
            <th className="px-3 py-2 text-left">Predef</th>
            <th className="px-3 py-2 text-left">Object Type</th>
            <th className="px-3 py-2 text-left">Eleman Tipi</th>
            <th className="px-3 py-2 text-left">Tipoloji</th>
            <th className="px-3 py-2 text-left">Öncelik</th>
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
                  value={row.ifcClass}
                  onChange={(v) => updateIfcMappingRule({ ...row, ifcClass: v as IfcClassName })}
                  options={IFC_CLASSES.map((c) => ({ value: c, label: c }))}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.ifcPredefinedType ?? ''}
                  onCommit={(v) =>
                    updateIfcMappingRule({
                      ...row,
                      ifcPredefinedType: (v.trim() || undefined) as IfcMappingRule['ifcPredefinedType'],
                    })
                  }
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.ifcObjectType ?? ''}
                  onCommit={(v) => updateIfcMappingRule({ ...row, ifcObjectType: v.trim() || undefined })}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.systemElementTypeId}
                  onChange={(v) => updateIfcMappingRule({ ...row, systemElementTypeId: v })}
                  options={elementTypeOptions}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.systemTypologyId ?? ''}
                  onChange={(v) =>
                    updateIfcMappingRule({ ...row, systemTypologyId: v || undefined })
                  }
                  options={typologyOptions}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={String(row.priority)}
                  onCommit={(v) => updateIfcMappingRule({ ...row, priority: Number(v) || 0 })}
                  className="w-14"
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.id}" silinsin mi?`)) removeIfcMappingRule(row.id)
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
