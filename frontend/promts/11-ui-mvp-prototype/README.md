# Adım 11 — MVP UI prototip prompt’ları (mock veri, P0 / P1 / P2)

Bu klasör, **`docs/10-ui-prototype/prompts/`** (Neomorphism + Tailwind, `00b` + `00-ORTAK-BLOK` + `01`–`16`) üzerine inşa edilir.

## Ön koşul

1. `docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md` ve `00-ORTAK-BLOK.md` kurallarını benimse.
2. İdeal: `01-temel-mantik-ve-arayuz.md` ve `02-app-shell.md` çıktılarıyla hizala (kabuk ve navigasyon).

## Girdi analizi

- `docs/07-product-strategy/mvp-detailed-analysis-report.md`
- `docs/07-product-strategy/mvp-decisions-reanalysis.md` (**kararlar burada**)

## Bu adımın amacı

- **Sadece frontend + mock data** ile eksiksiz tıklanabilir prototip tarifleri.
- Her dosyada **P0 / P1 / P2** açıkça ayrılmış görevler.
- **Tek şirket**, içinde **çok fabrika** (seçici mock).
- **Hiyerarşik onay** tüm süreçlere genişler (UI: onay akışı tasarımcısı).
- **Kalite**, üretimle **bitişik** modül.
- **Mühendislik**: dosya + manuel.
- **Şantiye**: web; mobil sonraya.
- Global müşteri admin / modül lisansı: **tasarıma girilmez** (kısa not yeterli).

## Çalıştırma sırası

| Sıra | Dosya |
|------|--------|
| 0 | `00-ORTAK-BLOK-MVP-UI.md` — her prompt’un başına ekle |
| 1 | `mvp-00-p0-p1-p2-sozlugu.md` |
| 2 | `mvp-01-platform-sirket-fabrika-mock.md` |
| 3 | `mvp-02-onay-akisi-tasarimci.md` |
| 4 | `mvp-03-roller-ve-izinler.md` |
| 5 | `mvp-04-kullanici-yonetimi.md` |
| 6 | `mvp-05-crm.md` |
| 7 | `mvp-06-teklif.md` |
| 8 | `mvp-07-proje.md` |
| 9 | `mvp-08-muhendislik.md` |
| 10 | `mvp-09-uretim-ve-kalite.md` |
| 11 | `mvp-10-yard.md` |
| 12 | `mvp-11-sevkiyat.md` |
| 13 | `mvp-12-saha-web.md` |
| 14 | `mvp-13-raporlama.md` |
| 15 | `mvp-14-dashboard-ve-bildirim-mock.md` |
| 16 | `mvp-15-gelecek-modul-lisans-notu-p2.md` |
| 17 | `mvp-16-uctan-uca-mock-senaryo.md` |

## Çıktı standardı (her prompt için)

Her yanıtta: ASCII veya yapısal wireframe + **mock veri tabloları** (örnek 5–10 satır) + bileşen başına kısa Tailwind satırı (`00b` ile uyumlu) + P0/P1/P2 işaretleme.
