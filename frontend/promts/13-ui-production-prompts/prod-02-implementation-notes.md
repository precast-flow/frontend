# prod-02 — Emir listesi ve detay (uygulama notları)

Kaynak: `prod-02-emir-listesi-ve-detay.md` + `00-ORTAK-BLOK-URETIM-UI.md`.

## Liste + detay wireframe (ASCII)

```
┌ KPI: Planlı | Üretimde | Beklemede | Tamamlanan | Bloke ─────────────┐
┌ Emir listesi (inset tablo) ────────────┬─ Detay ─────────────────────┐
│ WO | Proje | Parça | Durum* | Tarih |… │ [Genel][Parça][Beton][Zaman]…│
│    …                                  │  + [Notlar] [Kalite]          │
└───────────────────────────────────────┴───────────────────────────────┘
*Durum: prod-02 görünümü — “Beklemede (QC)” kalite kuyruğu için
```

## 10 mock satır (özet)

| Kod | Parça özeti | Durum (prod-02) |
|-----|-------------|-----------------|
| WO-884 | T kiriş 12m | Üretimde |
| WO-885 | Panel P-40 | Beklemede (QC) |
| WO-886 | Konsol K-02 | Planlandı |
| WO-870 | Segment M | Tamamlandı |
| WO-890 | Duvar D-90 | Bloke (arıza) |
| WO-891 | Hat çıkışı H-12 | Beklemede |
| WO-892 | Kiriş K-40 | Üretimde |
| WO-893 | Trepez T-08 | Planlandı |
| WO-894 | Panel P-40 (kopya) | Beklemede (QC) |
| WO-895 | Özel PS-1 | Bloke (arıza) |

Veri: `app/src/data/mesMock.ts` → `initialWorkOrders`.

## Rol matrisi (kim neyi editler)

| Rol | Liste | Genel / Parçalar / Beton | Zaman | Notlar | Bloke alanları | Kalite |
|-----|-------|---------------------------|-------|--------|----------------|--------|
| Üretim şefi | gör + seç | gör | gör + revizyon okuma | düzenle | düzenle | onay akışı |
| Vardiya amiri | gör + seç | gör | gör | düzenle | düzenle | QC tetik (mock) |
| Usta | salt okunur | salt | salt | salt okunur | salt | salt |
| Santral operatörü | gör | beton/reçete odak | salt | salt | salt | salt |
| Planlama | gör | plan tarihi önerisi (üretim onayı) | salt | yorum | salt | salt |

*Not:* Ekranda tek satırlık mock rol matrisi `MesModuleView` alt footer’da.

## UX soruları

1. “Beklemede” tek rozet altında QC + malzeme birleşir mi, yoksa iki ayrı sütun mu?
2. Bloke çözümü kapatınca otomatik `uretimde` mi, yoksa `planlandi`’ye mi döner?
3. Revizyon timeline ile MES hat olayları tek akışta mı birleşmeli?
4. Parça listesi ERP BOM’dan mı kilitlecek, yoksa sahada düzenlenebilir mi?

## Kod

| Dosya | Değişiklik |
|-------|------------|
| `data/mesMock.ts` | 10 emir, `plannedDate`, `shiftOwner`, `parts`, `revisions`, `block*`, `attachments`, `statusLabelProd02`, gri `statusRowClass` |
| `components/mes/MesModuleView.tsx` | Liste kolonları, 6 detay sekmesi, KPI 5’li, `patchOrder` ile not/bloke |

Kalite modülü filtresi hâlâ `kalite_bekliyor` — davranış korunur.
