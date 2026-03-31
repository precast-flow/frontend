# qual-08 — Periyodik raporlar ve teslim (uygulama notları)

Kaynak: `qual-08-periyodik-raporlar-ve-teslim.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ [Oluştur] ──────────────────────── [☑ Otomatik oluştur] P2 ─────────────────┐
┌ P1 — Zamanlama özeti (inset): ayın 5’i, haftalık Pazartesi … ─────────────┐
├ Tablo 8 satır: rapor | dönem | durum | son teslim | [Teslim] ─────────────┤
└ Modal teslim: e-posta, kanal (e-posta / portal / SFTP) ───────────────────┘
```

## Mock

`app/src/data/qualityPeriodicReportsMock.ts` — 8 satır, dört durum; `canOpenDeliveryModal` onaylı / teslim bekleyen satırlarda.

## Sekme

Kalite → **Periyodik** → `QualityPeriodicReportsView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Tablo; Oluştur (toast); Teslim modalı (e-posta + kanal) |
| P1 | Zamanlama inset metni (“her ayın 5’i” + haftalık not) |
| P2 | Otomatik oluştur checkbox (yerel state) |

## Sorular (ürün)

1. “Teslim edildi” müşteri onayı mı, sistem log mu?
2. Gecikmiş rapor için eskalasyon e-postası kimlere gider?
3. Otomatik oluşturma job’ı hangi saat diliminde çalışır?
