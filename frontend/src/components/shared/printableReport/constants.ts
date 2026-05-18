/** Yazdır/PDF çıktısında marka; tarayıcı üst bilgisinde localhost yerine bu görünür */
export const PRINT_REPORT_BRAND = 'PRECAST FLOW'

/** Yazdırma sırasında `document.title` — tarayıcı header’ında URL yerine marka */
export function printDocumentTitle(): string {
  return PRINT_REPORT_BRAND
}
