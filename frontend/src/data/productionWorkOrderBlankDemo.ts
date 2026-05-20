/**
 * Birim iş kuyruğu — sıfırdan doldurulacak test üretim emri.
 * flowById içine EKLENMEZ; döküm öncesi/sonrası, kürleme ve alt emirler kullanıcı adımlarıyla oluşur.
 */
import { S2_KOLON_DRAWING_PDF } from './productionDrawingMock'
import { MOCK_WORK_QUEUE_VIEWER_ID, type WorkQueueItem } from './workQueueMock'

export const BLANK_PRODUCTION_WORK_ORDER_ID = 'wq-blank-sandbox'

export const BLANK_PRODUCTION_WORK_ORDER: WorkQueueItem = {
  id: BLANK_PRODUCTION_WORK_ORDER_ID,
  orderNo: 'IW-2025-TEST-0001',
  title: 'Test üretim emri — boş akış (manuel doldurma)',
  summary:
    'Hiçbir döküm öncesi/sonrası veya kürleme adımı yapılmadı. Kontrolleri, beton döküm onayını ve sonrasını siz tamamlayın.',
  detailBody:
    'Bu kayıt yalnızca demo/test içindir. Proje dökümanı sekmesinde örnek çizim görünür. Döküm öncesi kontrol listesini işaretleyip beton dökümünü onayladığınızda beton döküm, numune ve kürleme alt emirleri oluşur; ardından döküm sonrası ve depo onayı adımlarını sırayla deneyebilirsiniz.',
  kind: 'production',
  status: 'beklemede',
  priority: 'normal',
  targetUnit: 'production',
  fromUnit: 'planning',
  toUnit: 'production',
  assigneeUserId: MOCK_WORK_QUEUE_VIEWER_ID,
  assignerUserId: 'u-emre',
  projectCode: 'PRJ-2026-TEST',
  projectName: 'Manuel test projesi',
  projectRouteId: 'pm-1',
  factoryCode: 'IST-HAD',
  daysOnDesk: 0,
  lastUpdatedLabel: 'Bugün — yeni',
  dueToday: true,
  productCode: 'S2-KOLON',
  productName: 'S2 Kolon',
  moldId: 'MOLD-SBX-01',
  moldName: 'Test kalıbı SBX-01',
  shiftLabel: 'Sabah',
  volumeM3: 9.8,
  steelKg: 620,
  recipeId: 'R-C30-01',
  planDayIso: new Date().toISOString().slice(0, 10),
  fieldNotes: 'Boş akış testi — tüm adımlar sizin tarafınızdan tamamlanacak.',
  drawingPreviewUrl: S2_KOLON_DRAWING_PDF,
}
