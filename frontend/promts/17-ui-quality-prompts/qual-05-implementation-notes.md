# qual-05 — Genel test sonuç formu (uygulama notları)

Kaynak: `qual-05-test-sonuc-formu-genel.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Test tipi ▼ (16/02 ref) ─────────────────────────────────────────────────┐
┌ inset well — dinamik alanlar (Hava % veya Yoğunluk kg/m³) ──────────────────┐
│ limit satırı + alan altı uyarı (dışarıdaysa)                               │
└────────────────────────────────────────────────────────────────────────────┘
[ limit dışı genel bandı (varsa) ]
[ Kaydet ]  [ Şablon kaydet ]
┌ P2 — Onay ☑ · imza çizgisi / ad soyad placeholder ────────────────────────┘
```

## Mock

`app/src/data/qualityTestCatalogMock.ts` — iki tip: `air_entrained` (Hava %), `fresh_density` (Yoğunluk); her birinde `min`/`max` mock limit.

## Sekme

Kalite → **Test formu** → `QualityTestResultFormView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Katalog select, dinamik alanlar (shadow-neo-in well), kaydet, limit uyarıları |
| P1 | Şablon kaydet → toast (mock) |
| P2 | Onay checkbox + imza alanı (ad soyad) |

## Sorular (ürün)

1. Şablon kullanıcıya mı yoksa tenant geneline mi açılır?
2. Limitler reçeteden mi gelir, katalog + proje override mı?
3. İmza adımı tek mi, çift onay (lab + kalite müdürü) mu?
