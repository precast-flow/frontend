import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type { FirmProfile, UnitSystem } from '../../../elementIdentity/types'
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
  name: string
  slug: string
  firmCodePrefix: string
  unitSystem: UnitSystem
  defaultTemplateId: string
  active: boolean
}

const EMPTY_DRAFT: Draft = {
  id: '',
  name: '',
  slug: '',
  firmCodePrefix: '',
  unitSystem: 'metric',
  defaultTemplateId: '',
  active: true,
}

export function FirmsAdminPanel() {
  const { firms, templates, addFirm, updateFirm, removeFirm } = useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const paginated = usePaginatedRows(firms, 20)

  const templateOptions = [
    { value: '', label: '— şablon yok —' },
    ...templates.map((t) => ({ value: t.id, label: `${t.name} (${t.firmId})` })),
  ]

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.name.trim()) return
    if (firms.some((r) => r.id === draft.id.trim())) return
    const now = new Date().toISOString()
    const row: FirmProfile = {
      id: draft.id.trim(),
      name: draft.name.trim(),
      slug: draft.slug.trim() || draft.id.trim(),
      firmCodePrefix: draft.firmCodePrefix.trim().toUpperCase(),
      unitSystem: draft.unitSystem,
      defaultTemplateId: draft.defaultTemplateId,
      active: draft.active,
      createdAt: now,
      updatedAt: now,
    }
    addFirm(row)
    setDraft(EMPTY_DRAFT)
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="Firmalar"
        count={firms.length}
        description="firma katmanı (mock + localStorage)"
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
        title="Yeni Firma"
        subtitle="Firma katmanına kayıt ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.name.trim()}
      >
      <AddFieldset legend="Yeni Firma">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: firm-yeni" />
          <Field label="Ad" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v })} />
          <Field
            label="Firma Kodu"
            value={draft.firmCodePrefix}
            onChange={(v) => setDraft({ ...draft, firmCodePrefix: v })}
          />
          <Select
            label="Birim Sistemi"
            value={draft.unitSystem}
            onChange={(v) => setDraft({ ...draft, unitSystem: v as UnitSystem })}
            options={UNIT_SYSTEMS.map((u) => ({ value: u, label: u }))}
          />
          <Select
            label="Varsayılan Şablon"
            value={draft.defaultTemplateId}
            onChange={(v) => setDraft({ ...draft, defaultTemplateId: v })}
            options={templateOptions}
          />
          <label className="flex flex-col gap-1 text-[11px]">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Aktif</span>
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="h-4 w-4 self-start"
            />
          </label>
        </div>
      </AddFieldset>
      </AdminFormModal>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Ad</th>
            <th className="px-3 py-2 text-left">Slug</th>
            <th className="px-3 py-2 text-left">Kod</th>
            <th className="px-3 py-2 text-left">Birim</th>
            <th className="px-3 py-2 text-left">Varsayılan Şablon</th>
            <th className="px-3 py-2 text-left">Aktif</th>
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
                  value={row.name}
                  onCommit={(v) =>
                    updateFirm({ ...row, name: v, updatedAt: new Date().toISOString() })
                  }
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.slug}
                  onCommit={(v) =>
                    updateFirm({ ...row, slug: v, updatedAt: new Date().toISOString() })
                  }
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.firmCodePrefix}
                  onCommit={(v) =>
                    updateFirm({
                      ...row,
                      firmCodePrefix: v.toUpperCase(),
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-20 font-mono"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.unitSystem}
                  onChange={(v) =>
                    updateFirm({
                      ...row,
                      unitSystem: v as UnitSystem,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  options={UNIT_SYSTEMS.map((u) => ({ value: u, label: u }))}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.defaultTemplateId}
                  onChange={(v) =>
                    updateFirm({
                      ...row,
                      defaultTemplateId: v,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  options={templateOptions}
                />
              </td>
              <td className="px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(e) =>
                    updateFirm({
                      ...row,
                      active: e.target.checked,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="h-4 w-4"
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.name}" silinsin mi? Bu işlem firmayı listeden kaldırır.`))
                      removeFirm(row.id)
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
