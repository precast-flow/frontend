/**
 * Demo ürün görselleri — `src/assets/pending-priority-demo/` altındaki dosyalar (Vite glob).
 * Klasöre yeni dosya eklenince dev sunucusunu yeniden başlatın veya build alın.
 */

const modules = import.meta.glob('../assets/pending-priority-demo/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
}) as Record<string, { default: string }>

/** Alfabetik sıra (dosya adı); sayısal sıra için dosya adlarını 01-, 02- ile başlatın */
export function getPendingPriorityDemoImageUrls(): string[] {
  return Object.keys(modules)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((path) => modules[path]!.default)
}

export function pickDemoImageForRow(imageUrls: string[], rowIndex: number): string | null {
  if (!imageUrls.length) return null
  return imageUrls[rowIndex % imageUrls.length]!
}
