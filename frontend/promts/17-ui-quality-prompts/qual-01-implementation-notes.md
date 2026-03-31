# qual-01 — Kalite dashboard (uygulama notları)

Kaynak: `qual-01-kalite-dashboard.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Kalite özeti ────────────────────────────────────────────────────────────┐
│ [Bugünkü numune] [Bekleyen test] [Limit dışı] [Onay bekleyen rapor] — P0   │
├ Acil aksiyonlar (tablo, 5 satır) ──────┬ Periyodik rapor (inset) — P1 ──────┤
│                                       │ Haftalık trend (çubuk placeholder) P2│
└───────────────────────────────────────────────────────────────────────────┘
┌ Emir kalite kuyruğu (mvp-09) — mevcut sütun + panel ──────────────────────┘
```

## Mock

`app/src/data/qualityDashboardMock.ts` — KPI sayıları, 5 acil satır, 7 günlük trend yüzdeleri.

## Bileşenler

- `QualityDashboardSection` — özet KPI, tablo, periyodik kart, trend.
- `QualityModuleView` — üstte özet, altında mevcut MES kalite kuyruğu.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Dört KPI kartı; acil aksiyonlar tablosu (5 satır) |
| P1 | “Bu hafta teslim” periyodik rapor inset kartı |
| P2 | Son 7 gün mini çubuk grafik placeholder |

## Sorular (ürün)

1. KPI’lar gerçek zamanlı mı yoksa gün sonu snapshot mı?
2. Acil aksiyonlar tek kullanıcıya mı atanır, role göre mi filtrelenir?
3. Periyodik rapor teslim SLA’sı fabrika bazında override edilebilir mi?
