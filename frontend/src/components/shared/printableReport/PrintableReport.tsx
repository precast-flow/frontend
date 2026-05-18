import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { PRINT_REPORT_BRAND } from './constants'
import './printableReport.css'

export type PrintableReportField = {
  label: string
  value: string
  fullWidth?: boolean
  mono?: boolean
  warn?: boolean
}

export type PrintableReportSection = {
  title: string
  fields?: PrintableReportField[]
  notes?: string
  /** Uzun metin bölümlerinde sayfa kırılmasına izin ver */
  allowBreak?: boolean
}

export type PrintableReportHeader = {
  brand?: string
  title: string
  subtitle?: string
  meta?: { label: string; value: string }[]
  banner?: { text: string; variant: 'ok' | 'delay' }
}

export type PrintableReportDocumentProps = {
  reportId: string
  header: PrintableReportHeader
  sections: PrintableReportSection[]
  footer?: string
}

function ReportField({ field }: { field: PrintableReportField }) {
  const ddClass = [
    field.mono ? 'is-mono' : '',
    field.warn ? 'is-warn' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={`printable-report-field ${field.fullWidth ? 'printable-report-field--full' : ''}`}
    >
      <dt>{field.label}</dt>
      <dd className={ddClass || undefined}>{field.value}</dd>
    </div>
  )
}

export function PrintableReportDocument({
  reportId,
  header,
  sections,
  footer,
}: PrintableReportDocumentProps) {
  const portal = (
    <div
      className="printable-report-portal"
      data-print-report-id={reportId}
      aria-hidden="true"
    >
      <article className="printable-report-sheet">
        <header className="printable-report-header">
          <p className="printable-report-brand">{header.brand ?? PRINT_REPORT_BRAND}</p>
          <h1 className="printable-report-title">{header.title}</h1>
          {header.subtitle ? (
            <p className="printable-report-subtitle">{header.subtitle}</p>
          ) : null}
          {header.meta && header.meta.length > 0 ? (
            <ul className="printable-report-meta-row">
              {header.meta.map((m) => (
                <li key={`${m.label}-${m.value}`}>
                  <strong>{m.label}:</strong> {m.value}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {header.banner ? (
          <p
            className={`printable-report-banner printable-report-banner--${header.banner.variant}`}
          >
            {header.banner.text}
          </p>
        ) : null}

        {sections.map((section) => (
          <section
            key={section.title}
            className={`printable-report-card ${section.allowBreak ? 'printable-report-card--breakable' : ''}`}
          >
            <h2 className="printable-report-card-title">{section.title}</h2>
            {section.fields && section.fields.length > 0 ? (
              <dl className="printable-report-grid">
                {section.fields.map((field) => (
                  <ReportField key={`${section.title}-${field.label}`} field={field} />
                ))}
              </dl>
            ) : null}
            {section.notes != null ? (
              <p className="printable-report-notes">{section.notes}</p>
            ) : null}
          </section>
        ))}

        {footer ? <footer className="printable-report-footer">{footer}</footer> : null}
      </article>
    </div>
  )

  return createPortal(portal, document.body)
}

type PrintableReportShellProps = {
  reportId: string
  header: PrintableReportHeader
  sections: PrintableReportSection[]
  footer?: string
  toolbar?: ReactNode
  children: ReactNode
  className?: string
}

/** Ekran içeriği + body portalında yazdırma belgesi */
export function PrintableReportShell({
  reportId,
  header,
  sections,
  footer,
  toolbar,
  children,
  className = '',
}: PrintableReportShellProps) {
  return (
    <>
      <PrintableReportDocument
        reportId={reportId}
        header={header}
        sections={sections}
        footer={footer}
      />
      <div className={className}>
        {toolbar}
        {children}
      </div>
    </>
  )
}
