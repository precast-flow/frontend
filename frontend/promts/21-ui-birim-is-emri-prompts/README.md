# Adım 21 — Birim iş emirleri ve proje merkezli UI prompt’ları (mock)

Bu klasör, **birim bazlı iş emirleri**, **proje tek sayfası** (zaman çizelgesi + mesajlaşma) ve **satış → proje ofisi → teklif → mühendislik → üretim → kalite / lojistik / saha** akışının wireframe tarifleridir.

## Ön koşul

1. `docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md`
2. `docs/20-proje-is-akisi-deep-dive/README.md` (okuma sırası)
3. Her dosyada önce **`00-ORTAK-BLOK-BIRIM-IS-UI.md`** bağlamını uygula.

## Çalıştırma sırası

| Sıra | Dosya | Kısa açıklama |
|------|--------|----------------|
| 0 | `00-ORTAK-BLOK-BIRIM-IS-UI.md` | Ortak bağlam (bu dosya tek başına “prompt” değil, blok) |
| 1 | `bie-01-satis-proje-olusturma-ve-gonderim.md` | Satış: müşteri projesi oluştur, proje ofisine gönder |
| 2 | `bie-02-proje-sayfasi-zaman-cizelgesi-mesaj-cizim.md` | Proje ofisi / ortak: zaman çizelgesi, mesaj, çizim yükleme |
| 3 | `bie-03-satis-teklif-proje-baglantisi.md` | Satış: teklif oluşturma (projeye bağlı) |
| 4 | `bie-04-satis-is-baslat-muhendislik-devri.md` | İş başlat, son karar özeti, mühendisliğe devir |
| 5 | `bie-05-birim-is-kuyrugu-atanan-ve-atadigim.md` | **Çekirdek:** üzerime atanan (birim) + atadığım işler |
| 6 | `bie-06-muhendislik-is-emirleri-metraj-uretim-koprusu.md` | İki tip mühendislik iş emri + üretim emrine köprü |
| 7 | `bie-07-uretim-amiri-kalite-arge-atamalari.md` | Üretim amiri kuyruğu; kalite / ARGE ataması |
| 8 | `bie-08-lojistik-saha-is-emirleri.md` | Lojistik ve saha iş listeleri; otomatik tetik notu |

## İlişkili MVP prompt’lar (güncelleme gerekebilir)

- `docs/11-ui-mvp-prototype/mvp-07-proje.md` — proje panosu; **bie-02** ile genişletilir.
- `docs/11-ui-mvp-prototype/mvp-08-muhendislik.md` — **bie-06** ile hizala.
- `docs/13-ui-production-prompts/` — üretim emri; **bie-06/07** köprüsü.
- `docs/11-ui-mvp-prototype/mvp-12-saha-web.md` — saha; **bie-08** ile hizala.
