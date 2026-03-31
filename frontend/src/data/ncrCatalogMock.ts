/** mvp-09 P2 — Nonkonformite kodu kataloğu (mock yönetim tablosu) */
export type NcrCatalogRow = {
  id: string
  code: string
  label: string
  severity: 'dusuk' | 'orta' | 'yuksek'
  active: boolean
}

export const initialNcrCatalog: NcrCatalogRow[] = [
  { id: 'n1', code: 'NCR-01', label: 'Ölçü tolerans dışı', severity: 'orta', active: true },
  { id: 'n2', code: 'NCR-02', label: 'Yüzey / çatlak', severity: 'yuksek', active: true },
  { id: 'n3', code: 'NCR-03', label: 'Donatı eksik / hatalı', severity: 'yuksek', active: true },
  { id: 'n4', code: 'NCR-04', label: 'Beton dayanım şüphesi', severity: 'yuksek', active: true },
  { id: 'n5', code: 'NCR-05', label: 'Kalıp hizası', severity: 'orta', active: true },
  { id: 'n6', code: 'NCR-06', label: 'Haşere / vibrasyon izi', severity: 'dusuk', active: true },
  { id: 'n7', code: 'NCR-07', label: 'Etiket / izlenebilirlik', severity: 'orta', active: true },
  { id: 'n8', code: 'NCR-08', label: 'Döküm hatası', severity: 'yuksek', active: true },
  { id: 'n9', code: 'NCR-09', label: 'Kür süreci sapması', severity: 'orta', active: false },
  { id: 'n10', code: 'NCR-10', label: 'Diğer (serbest metin)', severity: 'dusuk', active: true },
]
