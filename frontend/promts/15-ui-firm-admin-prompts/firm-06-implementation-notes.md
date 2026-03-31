# firm-06 — Ayar değişikliği özeti ve uyarı (uygulama notları)

Kaynak: `firm-06-ayar-degisim-ozet-ve-uyari.md` + `00-ORTAK-BLOK-FIRMA-ADMIN-UI.md`.

## Wireframe (ASCII)

```
┌ Ayar değişikliği özeti ─────────────────────────────────────────────────┐
│ Bekleyen değişiklikler (tablo: alan | önce | sonra)                        │
│ [Kaydet öncesi önizleme]                                                 │
├ Geçerlilik başlangıcı [datetime-local] (P2) ────────────────────────────┤
├ Etkilenen modüller: Üretim · Raporlama · Panolar (P1) ───────────────────┤
└ Modal: diff tablosu + (vardiya değişirse) amber band (P0) + [Kaydet] ────┘
```

## Mock

`app/src/data/firmChangePreviewMock.ts` — `MOCK_PENDING_CHANGES` (vardiya, varsayılan fabrika, hafta sonu). `changesIncludeShiftPolicy()` amber bandı için.

## Route / nav

`/firma-ayarlari/degisiklik` — `FirmSettingsChangePreviewPage`; sidebar: `firmAdmin.nav.changePreview` (`FileDiff`).

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Önizleme modalı, önce/sonra tablo, vardiya politikası değişince amber uyarı |
| P1 | Etkilenen modül ikonları (Üretim, Raporlama, Panolar) |
| P2 | `datetime-local` ile geçerlilik başlangıcı (mock); modal altında metin |

## Sorular (ürün)

1. Geçerlilik tarihi tek tenant saat diliminde mi sabitlenmeli?
2. Vardiya değişikliği için çift onay veya e-posta bildirimi gerekir mi?
3. Kayıt sonrası etkilenen ekranlara “yenile” banner’ı gösterilmeli mi?
