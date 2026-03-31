# firm-04 — Vardiya ve takvim (uygulama notları)

Kaynak: `firm-04-vardiya-ve-takvim-ayarlari.md` + `00-ORTAK-BLOK-FIRMA-ADMIN-UI.md`.

## Ekran özeti

| Soru | UI |
|------|-----|
| Vardiya usulü? | `NeoSwitch` (Evet/Hayır) |
| Hayır | İki `type="time"` — gündüz aralığı |
| Evet | 4’lü model (gündüz-only / iki / üç / gece–gündüz) + satır düzenlenebilir tablo |
| Hafta sonu | `NeoSwitch` |
| Resmi tatil | `select` (P1) |
| Önizleme | Mavi kutu — `isProductionShiftFilterVisible(state)` |
| Fabrika override | P2 tablo + satır ekle / sil |

## Vardiya filtresi mantığı (mock)

`firmShiftCalendarMock.ts` — `isProductionShiftFilterVisible`: vardiya **kapalı** veya model **gündüz-only (tek)** → **gizli**; aksi halde **görünür**.

## Mock seed

`SHIFT_CALENDAR_SEED` — üç vardiya satırı, `IST-HAD` override örneği.

## Sorular (ürün)

1. Gece vardiyası gün değişiminde çizgi üretim takvimine mi yazılır?
2. Resmi tatil “askı” MES’e otomatik iş emri kilidi mu?
3. Fabrika override önceliği tenant varsayılanının üzerinde mi?
