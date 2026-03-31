# UI prompt paketi — Üretim derinleşmesi (Adım 13)

**Ön koşul:** `docs/12-production-deep-dive/` analiz dokümanları okunmuş olmalı.  
**Görsel dil:** `docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md` + `00-ORTAK-BLOK.md`.

## Amaç

Sadece **frontend + mock veri** ile üretim modülüne ait ekranları **rol bazlı** tasarlamak. Kalite laboratuvarı ekranları **yok**; beton sadece **seçilebilir onaylı reçete havuzu** olarak mock listelenir.

## Çalıştırma sırası

| Sıra | Dosya | Odak |
|------|--------|------|
| 0 | `00-ORTAK-BLOK-URETIM-UI.md` | Her prompt öncesi yapıştır |
| 1 | `prod-01-uretim-ozet-dashboard.md` | Şef/vardiya sabah özeti |
| 2 | `prod-02-emir-listesi-ve-detay.md` | Emir CRUD görünümü mock |
| 3 | `prod-03-kalip-tahtasi-board.md` | Kalıp × iş kartları |
| 4 | `prod-04-bekleyen-is-oncelik-raporu.md` | Sıralama, gecikme |
| 5 | `prod-05-beton-recete-secimi.md` | Emirde karışım seçimi → santral paketi özeti · `prod-05-implementation-notes.md` |
| 6 | `prod-06-beton-santrali-operator.md` | Santral ekranı · `prod-06-implementation-notes.md` |
| 7 | `prod-07-rol-bazli-gorunum-ve-onizleme.md` | Matris + rol gibi gör · `prod-07-implementation-notes.md` |
| 8 | `prod-08-fabrika-ozel-vardiya-kalip-ve-ekip-komutu.md` | Fabrika vardiya/kalip/ekip komutu · `prod-08-implementation-notes.md` |

Her dosyada **P0 / P1 / P2** ve **mock tablolar** zorunludur.
