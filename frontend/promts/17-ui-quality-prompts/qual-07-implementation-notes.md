# qual-07 — Rapor oluşturma ve önizleme (uygulama notları)

Kaynak: `qual-07-rapor-olusturma-ve-onizleme.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Sol: şablon ▼ · önizleme dili ▼ · üst bilgi kartı · [İndir] [Teslime hazırla] ─┐
│ Sağ: gri PDF kutu + başlık + madde satırları (mock)                             │
│     P1 — üç imza çizgisi (lab / kalite / saha)                                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Mock

`app/src/data/qualityReportMock.ts` — dört şablon id’si, TR/EN önizleme satırları, `formatMockReportNo(seq)`.

## Sekme

Kalite → **Rapor** → `QualityReportBuilderView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Şablon select, firma/fabrika/rapor no/tarih, gri önizleme, indir + teslime hazırla (toast) |
| P1 | Üç imza alt çizgisi |
| P2 | Önizleme dili TR/EN (gövde metinleri `REPORT_PREVIEW_BODY`) |

## Sorular (ürün)

1. Rapor numarası tenant bazında sıralı mı, yıl reset mi?
2. PDF gerçek üretimde sunucu tarafı mı, istemci tarafı mı?
3. “Teslime hazır” müşteri portalına mı düşer, e-posta mı tetikler?
