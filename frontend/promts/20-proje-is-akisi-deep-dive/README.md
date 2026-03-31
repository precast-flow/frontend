# Adım 20 — Proje yaşam döngüsü ve birim bazlı iş emirleri (analiz)

Bu klasör, **satış → proje ofisi → teklif → iş başlatma → mühendislik → üretim → kalite / lojistik / saha** zincirini **birim üzerinden iş emri** modeliyle anlatır. Kod yok; karar ve tartışma zemini.

## Okuma sırası

| Sıra | Dosya |
|------|--------|
| 0 | `00-end-to-end-surec-satistan-santiyeye.md` — uçtan uca süreç özeti |
| 1 | `01-kavramlar-ve-terminoloji.md` — proje, aşama, iş emri türleri |
| 2 | `02-birim-kuyruklari-ve-rol-orgusu.md` — üzerime atanan / atadığım; birim–rol ilişkisi |
| 3 | `03-is-emri-tipleri-ve-muhendislik-devri.md` — metraj/teklif işi vs üretim öncesi mühendislik; üretim emrine köprü |
| 4 | `04-lojistik-saha-otomatik-atama.md` — lojistik ve saha iş emirleri; kimin oluşturduğu / tetiklediği |
| 5 | `05-proje-zaman-cizelgesi-ve-mesajlasma.md` — proje sayfası zaman çizelgesi, aşama klasörleri, iç mesajlaşma |

## UI prompt paketi

Uygulama yüzeyi: **`../21-ui-birim-is-emri-prompts/README.md`** (`bie-01` … `bie-08`).

## İlişkili mevcut dokümanlar

- `../03-contexts-modules/modules-landscape.md` — modül manzarası
- `../11-ui-mvp-prototype/mvp-06-teklif.md`, `mvp-07-proje.md`, `mvp-08-muhendislik.md`, `mvp-09-uretim-ve-kalite.md`, `mvp-12-saha-web.md` — bu analizle **çelişen** yerlerde **Adım 20 önceliklidir** (ürün yönü güncellemesi).
- `../02-actors/organizasyon-hiyerarsi-ve-gorev-gorunurlugu.md` — `reports_to`; görev panosu kaldırıldı, birim iş ile hizala.
