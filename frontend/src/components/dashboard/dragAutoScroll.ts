const EDGE_PX = 72
const MAX_STEP = 18

/** Pano kaydırma alanı — grid üstündeki boşlukta sürüklerken otomatik scroll */
export function findDashboardScrollPane(from: HTMLElement | null): HTMLElement | null {
  let node = from?.parentElement ?? null
  while (node) {
    if (node.classList.contains('dashboard-scroll-pane')) return node
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

export function autoScrollForPointer(
  clientY: number,
  scrollEl: HTMLElement | null | undefined,
): void {
  if (!scrollEl) return
  const rect = scrollEl.getBoundingClientRect()
  if (clientY < rect.top + EDGE_PX) {
    const dist = rect.top + EDGE_PX - clientY
    scrollEl.scrollTop -= Math.min(MAX_STEP, Math.max(4, dist * 0.35))
  } else if (clientY > rect.bottom - EDGE_PX) {
    const dist = clientY - (rect.bottom - EDGE_PX)
    scrollEl.scrollTop += Math.min(MAX_STEP, Math.max(4, dist * 0.35))
  }
}
