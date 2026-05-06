import { useState } from 'react'
import { useElementIdentity } from '../../elementIdentity/elementIdentityContextValue'
import type { FirmNamingTemplate, NamingTokenConfig } from '../../../elementIdentity/types'
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

const DEFAULT_TOKENS: NamingTokenConfig[] = [
  { token: 'FIRM_CODE', enabled: true, order: 1 },
  { token: 'FAMILY_CODE', enabled: true, order: 2 },
  { token: 'SIZE', enabled: true, order: 3 },
  { token: 'SEQUENCE', enabled: true, order: 4, padding: 3 },
]

type Draft = {
  id: string
  firmId: string
  name: string
  separator: string
  sequencePadding: string
  revisionPrefix: string
}

const EMPTY_DRAFT: Draft = {
  id: '',
  firmId: '',
  name: '',
  separator: '-',
  sequencePadding: '3',
  revisionPrefix: 'R',
}

export function NamingTemplatesAdminPanel() {
  const { templates, firms, addTemplate, updateTemplate, removeTemplate } = useElementIdentity()
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const paginated = usePaginatedRows(templates, 20)

  const firmOptions = firms.map((f) => ({ value: f.id, label: f.name }))

  const handleAdd = () => {
    if (!draft.id.trim() || !draft.firmId || !draft.name.trim()) return
    if (templates.some((r) => r.id === draft.id.trim())) return
    const now = new Date().toISOString()
    const row: FirmNamingTemplate = {
      id: draft.id.trim(),
      firmId: draft.firmId,
      name: draft.name.trim(),
      tokens: DEFAULT_TOKENS,
      separator: draft.separator || '-',
      sizeConcat: false,
      sequencePadding: Number(draft.sequencePadding) || 3,
      revisionPrefix: draft.revisionPrefix || 'R',
      revisionZeroSuffix: false,
      uppercaseEnforce: true,
      createdAt: now,
      updatedAt: now,
    }
    addTemplate(row)
    setDraft({ ...EMPTY_DRAFT, firmId: draft.firmId })
    setIsAddModalOpen(false)
  }

  const summarizeTokens = (tokens: NamingTokenConfig[]) =>
    tokens
      .filter((t) => t.enabled)
      .sort((a, b) => a.order - b.order)
      .map((t) => t.token)
      .join(' · ')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PanelHeader
        title="İsimlendirme Şablonları"
        count={templates.length}
        description="firma → şablon"
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
        title="Yeni Şablon"
        subtitle="Firma isimlendirme şablonu ekle"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
        submitDisabled={!draft.id.trim() || !draft.firmId || !draft.name.trim()}
      >
      <AddFieldset legend="Yeni Şablon">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <Field label="ID" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })} placeholder="örn: tmpl-yeni" />
          <Select
            label="Firma"
            value={draft.firmId}
            onChange={(v) => setDraft({ ...draft, firmId: v })}
            options={[{ value: '', label: '— seçiniz —' }, ...firmOptions]}
          />
          <Field label="Ad" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field
            label="Ayraç"
            value={draft.separator}
            onChange={(v) => setDraft({ ...draft, separator: v })}
          />
          <Field
            label="Sıra Doldurma"
            value={draft.sequencePadding}
            onChange={(v) => setDraft({ ...draft, sequencePadding: v })}
          />
          <Field
            label="Revizyon Önek"
            value={draft.revisionPrefix}
            onChange={(v) => setDraft({ ...draft, revisionPrefix: v })}
          />
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Token sırası varsayılan olarak <span className="font-mono">FIRM_CODE · FAMILY_CODE · SIZE · SEQUENCE</span>{' '}
          eklenir. Detaylı token düzeni için "Eleman Kimlik" sayfasındaki Şablon Tasarımcısı'nı kullanın.
        </p>
      </AddFieldset>
      </AdminFormModal>

      <TableShell>
        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Firma</th>
            <th className="px-3 py-2 text-left">Ad</th>
            <th className="px-3 py-2 text-left">Token sırası</th>
            <th className="px-3 py-2 text-left">Ayraç</th>
            <th className="px-3 py-2 text-left">Doldurma</th>
            <th className="px-3 py-2 text-left">Rev. Önek</th>
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
                  value={row.firmId}
                  onChange={(v) =>
                    updateTemplate({ ...row, firmId: v, updatedAt: new Date().toISOString() })
                  }
                  options={firmOptions}
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.name}
                  onCommit={(v) =>
                    updateTemplate({ ...row, name: v, updatedAt: new Date().toISOString() })
                  }
                />
              </td>
              <td className="px-3 py-1.5 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                {summarizeTokens(row.tokens)}
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.separator}
                  onCommit={(v) =>
                    updateTemplate({ ...row, separator: v, updatedAt: new Date().toISOString() })
                  }
                  className="w-12"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={String(row.sequencePadding)}
                  onCommit={(v) =>
                    updateTemplate({
                      ...row,
                      sequencePadding: Number(v) || 3,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-14"
                />
              </td>
              <td className="px-3 py-1.5">
                <InlineInput
                  value={row.revisionPrefix}
                  onCommit={(v) =>
                    updateTemplate({
                      ...row,
                      revisionPrefix: v,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="w-12"
                />
              </td>
              <td className="px-3 py-1.5 text-right">
                <DeleteButton
                  onClick={() => {
                    if (confirm(`"${row.name}" şablonu silinsin mi?`)) removeTemplate(row.id)
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
