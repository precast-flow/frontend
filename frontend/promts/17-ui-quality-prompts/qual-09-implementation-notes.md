# qual-09 — Rapor arşivi ve izlenebilirlik filtresi (uygulama notları)

Kaynak: `qual-09-rapor-arşiv-ve-filtre-firma-fabrika.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Filtre: firma (salt) · fabrika · proje · tarih ×2 · rapor no · emir no ─────┐
├ Tablo (10 mock): no, tür, dönem, fabrika, oluşturan, versiyon ─────────────┤
│ Sağ: detay meta (qual-06 ile aynı alanlar) + indir geçmişi + hash notu ────┤
└────────────────────────────────────────────────────────────────────────────┘
```

## Mock

`app/src/data/qualityReportArchiveMock.ts` — 10 rapor satırı, `MOCK_ARCHIVE_DOWNLOADS` (kısmi), `MOCK_ARCHIVE_HASH_NOTE`.

## Sekme

Kalite → **Arşiv** → `QualityReportArchiveView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Filtreler; sonuç tablosu; seçili satırda meta listesi |
| P1 | İndir geçmişi (kullanıcı + zaman) |
| P2 | Hash / blok zinciri bilgilendirme metni |

## Sorular (ürün)

1. Arşiv immutable mu; revizyon yeni versiyon mu üretir?
2. İndir geçmişi GDPR kapsamında ne kadar saklanır?
3. Hash zinciri müşteriye gösterilir mi yalnızca dahili audit’e mi?
