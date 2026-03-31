# prod-04 — Bekleyen iş / öncelik raporu (uygulama notları)

Kaynak: `prod-04-bekleyen-is-oncelik-raporu.md` + `design-promts/prompts/00c-DINAMIK-VERI-GORUNUMU-SABLONU.md` (ilk uygulama).

## Wireframe (ASCII)

```
┌ [✓ Üretim şefi]  (vardiya: kısıt notu) ────────────────────────┐
│ Hat [▼]  Proje [▼]  Aciliyet [▼]  [Arama…]   [İkon|Liste|Tablo|Galeri] │
├────────────────────────────────────────────────────────────────┤
│ P2: Otomatik öneri açıklama (kural metni)                      │
├ (Tablo) P1: sütun görünürlüğü — checkbox                       │
├ Gövde: aynı 15 mock satır — seçilen moda göre yerleşim         │
├ Alt (seçim varsa): “N öğe seçildi” + Önceliği yükselt + temizle │
└────────────────────────────────────────────────────────────────┘
```

## 15 mock satır

`app/src/data/pendingPriorityMock.ts` — `PENDING_PRIORITY_SEED` (p1…p15).

## Demo ürün görselleri (ikon / galeri / tablo önizleme)

- Klasör: `app/src/assets/pending-priority-demo/` — PNG/JPG/WebP/AVIF/GIF/SVG; dosya adına göre sıralı; satırlar `pickDemoImageForRow` ile döngüsel eşlenir.
- Kod: `app/src/data/pendingPriorityDemoImages.ts` (`import.meta.glob`).
- Repoya `sample-placeholder.svg` örnek dosyası dahil; yeni görseller için dev sunucusunu yeniden başlatın (Vite glob).

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | **00c dört mod** (ikon / liste / tablo / galeri), aynı mock veri; toolbar’da görünüm seçici; tercih `localStorage` (`precast-pf-pending-priority-view-mode`); filtre + arama; şef sıra yukarı/aşağı (tablo + diğer modlarda); vardiya notu |
| P1 | Gecikme nedeni select; çoklu seçim + alt **seçim şeridi** + önceliği yükselt (+5 skor); tabloda **sütun görünürlüğü** |
| P2 | Bilgi kutusu — termin yakın kural metni (algoritma yok) |

## Kod

| Dosya | Açıklama |
|-------|----------|
| `data/pendingPriorityMock.ts` | 15 satır, termin riski, gecikme seçenekleri |
| `components/production/PendingPriorityReportView.tsx` | UI |
| `data/navigation.ts` | `pending-priority` → `/oncelik-raporu` |

## UX soruları

1. Öncelik sırası fabrika bazında mı global mi kilitlenmeli?
2. Vardiya amiri “öneri”yi reddedince sıra otomatik mi düşer?
3. Gecikme nedeni zorunlu mu olmalı (yüksek riskte)?
4. Toplu yükseltme audit log’a yazılmalı mı?
