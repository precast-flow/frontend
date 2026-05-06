import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PmStyleDialog } from '../../shared/PmStyleDialog'

export function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  type?: 'text' | 'number'
}) {
  return (
    <label className={`flex flex-col gap-1 text-[11px] ${className ?? ''}`}>
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-gray-50 px-2 py-1 text-sm shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
      />
    </label>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1 text-[11px] ${className ?? ''}`}>
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-gray-50 px-2 py-1 text-sm shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function InlineInput({
  value,
  onCommit,
  className,
  placeholder,
}: {
  value: string
  onCommit: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onCommit(draft)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') setDraft(value)
      }}
      className={`w-full min-w-[6rem] rounded-lg bg-gray-50 px-2 py-1 text-xs shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100 ${className ?? ''}`}
    />
  )
}

export function InlineSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg bg-gray-50 px-2 py-1 text-xs shadow-neo-in focus:outline-none dark:bg-gray-900/80 dark:text-gray-100 ${className ?? ''}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function PanelHeader({
  title,
  count,
  description,
}: {
  title: string
  count: number
  description?: string
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Toplam {count} kayıt{description ? ` — ${description}` : ''}.
        </p>
      </div>
    </header>
  )
}

export function AddButton({
  onClick,
  disabled,
  label = 'Yeni ekle',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-neo-out transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
      >
        {label}
      </button>
    </div>
  )
}

export function DeleteButton({
  onClick,
  title = 'Sil',
}: {
  onClick: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
      title={title}
    >
      ✕
    </button>
  )
}

export function AddFieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-slate-700/70 dark:bg-slate-900/40">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {legend}
      </legend>
      {children}
    </fieldset>
  )
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[22rem] flex-1 overflow-auto rounded-xl bg-gray-50 shadow-neo-in dark:bg-gray-900/60">
      <table className="w-full table-auto text-sm">{children}</table>
    </div>
  )
}

export function EmptyRow({ colSpan, label = 'Kayıt yok.' }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-6 text-center text-xs text-gray-500">
        {label}
      </td>
    </tr>
  )
}

export function usePaginatedRows<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  return { page, setPage, totalPages, pageRows, totalCount: rows.length, pageSize }
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (next: number) => void
}) {
  if (totalCount <= pageSize) return null
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
      <span>
        Toplam {totalCount} kayıt · Sayfa {page}/{totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border border-slate-300/70 px-2 py-1 disabled:opacity-50 dark:border-slate-600/70"
        >
          Önceki
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-300/70 px-2 py-1 disabled:opacity-50 dark:border-slate-600/70"
        >
          Sonraki
        </button>
      </div>
    </div>
  )
}

export function AdminFormModal({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitDisabled,
  children,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  onSubmit: () => void
  submitDisabled?: boolean
  children: ReactNode
}) {
  if (!open) return null

  return (
    <PmStyleDialog
      title={title}
      subtitle={subtitle}
      closeLabel="Pencereyi kapat"
      onClose={onClose}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600/70 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-neo-out transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
          >
            Kaydet
          </button>
        </div>
      }
    >
      {children}
    </PmStyleDialog>
  )
}
