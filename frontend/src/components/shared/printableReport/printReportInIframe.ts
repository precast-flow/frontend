import { printDocumentTitle } from './constants'
import standaloneCss from './printableReportStandalone.css?inline'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Raporu ana uygulama URL’si olmadan izole iframe’de yazdırır.
 * Böylece tarayıcı alt bilgisinde localhost görünmez (çoğu tarayıcıda boş veya about:blank).
 */
export function printReportInIframe(reportId: string): boolean {
  const portal = document.querySelector<HTMLElement>(
    `[data-print-report-id="${reportId}"]`,
  )
  const sheet = portal?.querySelector<HTMLElement>('.printable-report-sheet')
  if (!sheet) return false

  const title = printDocumentTitle()
  const bodyHtml = sheet.outerHTML

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', title)
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;width:0;height:0;border:0;clip:rect(0,0,0,0);overflow:hidden'

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${standaloneCss}</style>
</head>
<body>${bodyHtml}</body>
</html>`

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    return false
  }

  let cleaned = false
  const cleanup = () => {
    if (cleaned) return
    cleaned = true
    iframe.remove()
  }

  win.addEventListener('afterprint', cleanup, { once: true })
  window.setTimeout(cleanup, 120_000)

  doc.open()
  doc.write(html)
  doc.close()

  const triggerPrint = () => {
    try {
      win.focus()
      win.print()
    } catch {
      cleanup()
    }
  }

  if (doc.readyState === 'complete') {
    requestAnimationFrame(() => requestAnimationFrame(triggerPrint))
  } else {
    iframe.addEventListener('load', () => {
      requestAnimationFrame(() => requestAnimationFrame(triggerPrint))
    }, { once: true })
  }

  return true
}
