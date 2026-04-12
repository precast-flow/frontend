import type { HTMLAttributes, ReactNode } from 'react'

export function MptsDenseTable({ children }: { children: ReactNode }) {
  return (
    <div className="okan-liquid-table-wrap min-h-0 w-full">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm text-slate-900 dark:text-slate-100">{children}</table>
    </div>
  )
}

export function MptsTh({ children, className = '', sticky }: { children?: ReactNode; className?: string; sticky?: boolean }) {
  return (
    <th
      className={`okan-liquid-table-thead whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-wide ${
        sticky ? 'sticky left-0 z-10 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90' : ''
      } ${className}`}
    >
      {children}
    </th>
  )
}

export function MptsTd({
  children,
  className = '',
  sticky,
  ...rest
}: { children?: ReactNode; className?: string; sticky?: boolean } & HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`okan-liquid-table-row border-b px-2 py-2 text-xs ${sticky ? 'sticky left-0 z-[1] bg-white/85 backdrop-blur-sm dark:bg-slate-900/85' : ''} ${className}`}
      {...rest}
    >
      {children}
    </td>
  )
}
