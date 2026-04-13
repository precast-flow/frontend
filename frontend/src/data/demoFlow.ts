/** Prompt 16 — uçtan uca demo adımları (modül id + sunum metni) */
export type DemoFlowStep = {
  step: number
  moduleId: string
  title: string
  screen: string
  control: string
  surfaceNote: string
  tailwindLine: string
  emptyOrErrorInset?: string
  /** Kalite adımı: prototip kapsamı notu */
  scopeNote?: string
}

export const demoFlowSteps: DemoFlowStep[] = [
  {
    step: 1,
    moduleId: 'crm',
    title: 'CRM — müşteri seç',
    screen: 'CRM / İletişim · liste–detay',
    control: 'Liste satırı veya kart seçimi; sekmeler / drawer',
    surfaceNote: 'Liste satırları protrude veya düz hover; arama/filtre inset well.',
    tailwindLine:
      'Satır: `rounded-xl shadow-neo-out-sm`; filtre kabı: `rounded-2xl shadow-neo-in`.',
    emptyOrErrorInset:
      'Müşteri yoksa: `shadow-neo-in` içinde kısa metin + secondary protrude “Yeni müşteri”.',
  },
  {
    step: 2,
    moduleId: 'quote',
    title: 'Teklif — oluştur → onay',
    screen: 'Teklif & Keşif · kalem tablosu',
    control: 'Versiyon / satır ekleme; onay drawer birincil CTA',
    surfaceNote: 'Ana tablo alanı protrude kart; onay metni inset well içinde.',
    tailwindLine:
      'CTA onay: `bg-gray-800 shadow-neo-out-sm`; özet: `rounded-xl shadow-neo-in text-gray-800`.',
    emptyOrErrorInset: 'Kalem yoksa: inset uyarı şeridi + `text-red-700` başlık.',
  },
  {
    step: 3,
    moduleId: 'project',
    title: 'Proje — panoyu aç',
    screen: 'Proje Yönetimi · sekmeler',
    control: 'Sekme (Özet / Elemanlar / Zaman çizelgesi)',
    surfaceNote: 'Sekme track inset; aktif sekme protrude pill.',
    tailwindLine:
      'Track: `shadow-neo-in rounded-full`; içerik kartları: `shadow-neo-out-sm rounded-2xl`.',
    emptyOrErrorInset: 'Eleman listesi boş: inset boş durum metni.',
  },
  {
    step: 4,
    moduleId: 'engineering',
    title: 'Mühendislik — üretime hazır',
    screen: 'Mühendislik Entegrasyonu · hazırlık / checklist',
    control: 'Hazırlık skoru; akıllı üretim emri modalı (mock)',
    surfaceNote: 'Okan liquid paneller; checklist ve risk özeti.',
    tailwindLine:
      'Modal kabı: `shadow-neo-out rounded-2xl`; form alanları: `shadow-neo-in rounded-xl`.',
    emptyOrErrorInset: 'Kilit çakışması: inset uyarı + kırmızı metin (00b).',
  },
  {
    step: 5,
    moduleId: 'mes',
    title: 'MES — emir oluştur → tamamla',
    screen: 'Üretim (MES) · pano veya tablo',
    control: 'Slot / emir satırı; tamamla veya detay drawer',
    surfaceNote: 'Ana sahne protrude; slot hücreleri inset track hissi.',
    tailwindLine:
      'Hücre seçimi: `ring-2 ring-gray-800`; çakışma modal: `shadow-neo-out-sm`.',
    emptyOrErrorInset: 'Slot boş liste: inset bilgi + `text-gray-700`.',
  },
  {
    step: 6,
    moduleId: 'quality',
    title: 'Kalite — kontrol kuyruğu',
    screen: 'Kalite · kuyruk ve form',
    control: 'Kuyruk satırı seç; onay / ret / tamir (prototip sade)',
    surfaceNote: 'Kuyruk inset liste; form alanları inset; birincil aksiyonlar protrude.',
    tailwindLine:
      'Kuyruk kabı: `shadow-neo-in rounded-2xl`; CTA: `shadow-neo-out-sm bg-gray-800` (onay).',
    emptyOrErrorInset: 'Kuyruk boş: `shadow-neo-in` “Bekleyen kayıt yok”.',
    scopeNote:
      'Tam NCR / CAPA MVP dışı; UI sadeleşir: tek sütun kuyruk, drawer yerine tek ekran formlar.',
  },
  {
    step: 7,
    moduleId: 'yard',
    title: 'Yard — lokasyon',
    screen: 'Yard / Sahası · harita veya grid',
    control: 'Lokasyon seçimi; transfer / hazırlık CTA',
    surfaceNote: 'Harita/karo protrude; seçili hücre inset vurgu.',
    tailwindLine:
      'Karo: `shadow-neo-out-sm`; seçili: `shadow-neo-in ring-1 ring-gray-400`.',
    emptyOrErrorInset: 'Lokasyon veri yok: inset gri kutu + açıklama metni.',
  },
  {
    step: 8,
    moduleId: 'dispatch',
    title: 'Sevkiyat — çıkış',
    screen: 'Sevkiyat · plan ve yükleme',
    control: 'Yükleme adımları; çıkış kaydı birincil',
    surfaceNote: 'Adım kartları protrude; durum özeti inset.',
    tailwindLine:
      'Adım: `rounded-2xl shadow-neo-out-sm`; özet şerit: `shadow-neo-in px-4 py-2`.',
    emptyOrErrorInset: 'Plan boş: inset uyarı; risk `text-red-800`.',
  },
  {
    step: 9,
    moduleId: 'field',
    title: 'Saha — teslim / montaj',
    screen: 'Saha (Şantiye) · görev listesi',
    control: 'Görev kartı seç; “Teslim alındı” / “Montaj tamamlandı”',
    surfaceNote: 'Görev kartları hafif protrude (sahada okunurluk); detay well inset.',
    tailwindLine:
      'Kart: hafif çift gölge + `ring-1 ring-gray-300/70`; CTA: `min-h-14 shadow-neo-out-sm`.',
    emptyOrErrorInset: 'Görev yok: inset mesaj; senkron rozeti yine inset pill.',
  },
  {
    step: 10,
    moduleId: 'dashboard',
    title: 'Dashboard — KPI',
    screen: 'Genel Bakış',
    control: 'KPI protrude kartlara tık; uyarılar inset listeden modüle git',
    surfaceNote: 'KPI: protrude-sm; uyarılar: `shadow-neo-in` kuyruk; mini grafik inset.',
    tailwindLine:
      'KPI: `min-h-[148px] rounded-2xl shadow-neo-out-sm`; uyarılar: `rounded-2xl shadow-neo-in`.',
    emptyOrErrorInset: 'KPI veri yok: her kartta inset alt metin veya tek satır hata.',
  },
]
