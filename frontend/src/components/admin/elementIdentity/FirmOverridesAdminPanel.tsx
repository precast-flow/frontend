import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type {
  FirmCodeOverride,
  FirmCodeOverrideScope,
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

const SCOPES: FirmCodeOverrideScope[] = ['element_type', 'typology', 'size_format', 'separator']

type Draft = {
  id: string
  firmId: string
  scope: FirmCodeOverrideScope
  refId: string
  customCode: string
  customSizeFormatId: string
  active: boolean
  notes: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  firmId: '',
  scope: 'element_type',
  refId: '',
  customCode: '',
  customSizeFormatId: '',
  active: true,
  notes: '',
}

export function FirmOverridesAdminPanel() {
  const {
    overrides,
    firms,
    upsertOverride,
    removeOverride,
  } = useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [filterFirm, setFilterFirm] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filtered = filterFirm === 'all' ? overrides : overrides.filter((o) => o.firmId === filterFirm)

  const firmOptions = firms.map((f) => ({ value: f.id, label: f.name }))
  const paginated = usePaginatedRows(filtered, 20)

  const handleAdd = () => {
    if (!draft.firmId || !draft.refId.trim()) return
    const now = new Date().toISOString()
    const id = draft.id.trim() || `ov-${draft.firmId}-${draft.scope}-${draft.refId}-${Date.now().toString(36)}`
    if (overrides.some((r) => r.id === id)) return
    const row: FirmCodeOverride = {
      id,
      firmId: draft.firmId,
      scope: draft.scope,
      refId: draft.refId.trim(),
      customCode: draft.customCode.trim() || undefined,
      customSizeFormatId: draft.customSizeFormatId.trim() || undefined,
      active: draft.active,
      createdAt: now,
      updatedAt: now,
      notes: draft.notes.trim() || undefined,
    }
    upsertOverride(row)
    setDraft({ ...EMPTY_DRAFT, firmId: draft.firmId, scope: draft.scope })
    setIsAddModalOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="Firma Kod Override"
        count={overrides.length}
        description="firma seviyesinde kod / format değiştirici kayıtlar"
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
        title="Yeni Override"
        subtitle="Firma seviyesinde kod/format override kaydı ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.firmId || !draft.refId.trim()}
      >
      <AddFieldset legend="Yeni Override">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <Field label="ID (boş bırakılabilir)" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} />
          <Select
            label="Firma"
            value={draft.firmId}
            onChange={(v) => setDraft({ ...draft, firmId: v })}
            options={[{ value: '', label: '— seçiniz —' }, ...firmOptions]}
          />
          <Select
            label="Kapsam"
            value={draft.scope}
            onChange={(v) => setDraft({ ...draft, scope: v as FirmCodeOverrideScope })}
            options={SCOPES.map((s) => ({ value: s, label: s }))}
          />
          <Field
            label="Ref ID"
            value={draft.refId}
            onChange={(v) => setDraft({ ...draft, refId: v })}
            placeholder="örn: col, beam-rect, …"
          />
          <Field
            label="Özel Kod"
            value={draft.customCode}
            onChange={(v) => setDraft({ ...draft, customCode: v })}
          />
          <Field
            label="Özel Format ID"
            value={draft.customSizeFormatId}
            onChange={(v) => setDraft({ ...draft, customSizeFormatId: v })}
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
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Firma filtresi:</span>
        <button
          type="button"
          onClick={() => setFilterFirm('all')}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition',
            filterFirm === 'all'
              ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
              : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
          ].join(' ')}
        >
          Tümü
        </button>
        {firms.map((f) => (
          <button
            type="button"
            key={f.id}
            onClick={() => setFilterFirm(f.id)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition',
              filterFirm === f.id
                ? 'bg-gray-800 text-white shadow-neo-out dark:bg-gray-200 dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 shadow-neo-in dark:bg-gray-900/70 dark:text-gray-200',
            ].join(' ')}
          >
            {f.name}
          </button>
        ))}
      </div>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Firma</th>
            <th className="px-3 py-2 text-left">Kapsam</th>
            <th className="px-3 py-2 text-left">Ref</th>
            <th className="px-3 py-2 text-left">Özel Kod</th>
            <th className="px-3 py-2 text-left">Özel Format</th>
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
              <td className="px-3 py-1.5 font-mono text-[11px] text-gray-700 dark:text-gray-200">{row.id}</td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.firmId}
                  onChange={(v) =>
                    upsertOverride({ ...row, firmId: v, updatedAt: new Date().toISOString() })
                  }
                  options={firmOptions}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineSelect
                  value={row.scope}
                  onChange={(v) =>
                    upsertOverride({
                      ...row,
                      scope: v as FirmCodeOverrideScope,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  options={SCOPES.map((s) => ({ value: s, label: s }))}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.refId}
                  onCommit={(v) =>
                    upsertOverride({ ...row, refId: v, updatedAt: new Date().toISOString() })
                  }
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.customCode ?? ''}
                  onCommit={(v) =>
                    upsertOverride({
                      ...row,
                      customCode: v.trim() || undefined,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-24 font-mono"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.customSizeFormatId ?? ''}
                  onCommit={(v) =>
                    upsertOverride({
                      ...row,
                      customSizeFormatId: v.trim() || undefined,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                />
              </td>
              <td className="px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(e) =>
                    upsertOverride({
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
                    if (confirm(`Override "${row.id}" silinsin mi?`)) removeOverride(row.id)
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
