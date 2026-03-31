# qual-04 — Basınç dayanımı testleri (uygulama notları)

Kaynak: `qual-04-basinc-dayanim-testleri.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Basınç dayanımı ──────────────────────────────────────────────────────────┐
│ Sol: form — numune ▼, küp/silindir, yaş 7|28, MPa, [kırılmadı] [geçersiz] │
│      [Satırı ekle]                                                        │
│      P1: cihaz id, kalibrasyon notu (dashed kart)                         │
│ Sağ: tablo (çoklu satır / numune) + P2 SVG yaş–MPa çizgisi               │
└───────────────────────────────────────────────────────────────────────────┘
```

## Mock

`app/src/data/qualityCompressiveMock.ts` — başlangıç 5 satır (aynı numune için 7 + 28 örneği dahil), numune kodu seçenekleri.

## Sekme

Kalite → **Basınç dayanımı** → `QualityCompressiveStrengthView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Numune bağlantısı, tip, yaş günü, MPa, kırılmadı / geçersiz, tablo |
| P1 | Cihaz kimliği + kalibrasyon textarea |
| P2 | Seçili numune için MPa noktalarından polyline (placeholder ölçek 0–50 MPa) |

## Sorular (ürün)

1. Küp 150 ve silindir için MPa hesap formülü UI’da ayrı mı gösterilir?
2. Geçersiz deneme laboratuvar defterine ayrı satır mı düşer?
3. 14 gün ara yaş testi bu ekranda mı, ayrı şablonda mı?
