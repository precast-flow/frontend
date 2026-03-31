# qual-03 — Slump / çekme hızlı giriş (uygulama notları)

Kaynak: `qual-03-slump-cekme-hizli-giris.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Slump / çekme — max ~520px genişlik ─────────────────────────────────────┐
│ Döküm ▼  |  Emir no (ops.)                                                │
│ [════════ reçete bandı 0–250 mm ════════]  nokta = giriş                  │
│ [   145   ] mm  ← büyük input                                             │
│ Sıcaklık (ops.) | Saat (time)                                             │
│ ┌─ fotoğraf inset (P1) ─────────────────────────────────────────────┐    │
│ └─ offline not (P2) ─────────────────────────────────────────────────┘    │
│ [ Kaydet ]                                                                │
└───────────────────────────────────────────────────────────────────────────┘
```

## Mock

`app/src/data/qualitySlumpQuickMock.ts` — dört döküm (3 + ANK fabrika kapsamı için bir ek); her biri `slumpMinMm` / `slumpMaxMm`.

## Route / sekme

Kalite modülü → **Slump / çekme** sekmesi → `QualitySlumpQuickView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Döküm dropdown, emir no alanı, büyük slump (mm), sıcaklık + saat, band görseli, limit dışı uyarı, kaydet |
| P1 | Fotoğraf `input type=file` + inset dashed alan |
| P2 | Offline kuyruk textarea |

## Sorular (ürün)

1. Slump tek ölçüm mü, iki ölçümün ortalaması mı?
2. Limit dışı kayıtta otomatik numune / retest talebi açılır mı?
3. Offline kuyruk cihazda mı tutulur, senkron çakışması nasıl çözülür?
