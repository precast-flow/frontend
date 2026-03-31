# qual-02 — Numune listesi ve detay (uygulama notları)

Kaynak: `qual-02-numune-listesi-ve-detay.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ [Numune kayıtları] [Özet ve MES kuyruğu] ─────────────────────────────────┐
│ Filtre: tarih×2, fabrika, proje, emir no, durum (P0)                     │
├ Tablo (10 satır mock) ──────────────┬ Detay ─────────────────────────────┤
│ id, tarih, kaynak, reçete, durum…   │ Barkod placeholder (P1)            │
│                                     │ [Genel][Testler][Ekler][Rapor]     │
│                                     │ P2: [Birleştir] [İptal]            │
└─────────────────────────────────────┴────────────────────────────────────┘
```

## Mock

`app/src/data/qualitySamplesMock.ts` — `MOCK_QUALITY_SAMPLES` (10 satır), örnek test / ek / rapor geçmişi yardımcıları.

## Bileşenler

- `QualitySamplesListView` — filtre, tablo, detay paneli, sekmeler, P1 barkod, P2 aksiyonlar.
- `QualityModuleView` — üstte sekme: varsayılan **Numune kayıtları**, ikinci sekmede qual-01 özet + mvp-09 kuyruk.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Filtreler; tablo sütunları; detay sekmeleri (Genel, Testler, Ekler, Rapor geçmişi) |
| P1 | Barkod / etiket alanı (monospace çizgi) |
| P2 | Birleştir + iptal (onay + toast mock) |

## Sorular (ürün)

1. Numune birleştirmede hangi test sonuçları “kazanan” kayda taşınır?
2. İptal sonrası laboratuvar numarası bloklanır mı, yeniden kullanılır mı?
3. Saha numunesi santral dökümü ile aynı emirde nasıl eşleştirilir (BP id)?
