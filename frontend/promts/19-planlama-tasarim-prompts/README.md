# UI prompt paketi — Planlama / Tasarım (Adım 19 — üretim zaman × kalıp ızgarası)

**Konum:** Üretim modülü — planlama–tasarım ekranı (gün × vardiya × kalıp matrisi, sürükle-bırak, günlük özetler, durum renkleri, zoom).

**Ön koşullar:**

- `docs/10-ui-prototype/prompts/00-ORTAK-BLOK.md`
- `docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md`
- `docs/13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md` (üretim özel kurallar)
- Analiz: `docs/12-production-deep-dive/` (bağlam için)

**Not:** Bu ekranın ana yüzeyi **2D planlama ızgarası**dır; `00c` (ikon/liste/tablo/galeri) bu pakette **zorunlu değildir** — istenirse **yan panelde** veya **bekleyen iş havuzunda** `00c` ile uyumlu liste kullanılabilir (`plan-03`).

## Çalıştırma sırası

| Sıra | Dosya | Odak |
|------|--------|------|
| 0 | `00-ORTAK-BLOK-PLANLAMA-TASARIM.md` | Her prompt öncesi kısa bağlam + ortak blok referansı |
| 1 | `plan-01-izgara-zaman-kalip-vardiya.md` | Sütun: günler; alt: vardiyalar; satır: kalıplar; hücre yapısı |
| 2 | `plan-02-sure-span-cakisma-kapasite.md` | Çok günlük/vardiyalık süre, görsel span, çakışma uyarıları |
| 3 | `plan-03-etkilesim-dnd-bos-hucre-detay.md` | Sürükle-bırak, boş hücreye atama, ürün detay drawer |
| 4 | `plan-04-gunluk-alt-ozet-metrikler.md` | Günlük m³, adet, demir vb. toplamlar |
| 5 | `plan-05-durum-renkleri-legend-erisim.md` | Durum → renk eşlemesi, legend, kontrast |
| 6 | `plan-06-zoom-navigasyon-takvim-politikasi.md` | Zoom, hafta kaydırma, üretim olmayan günler |
| 7 | `plan-07-toolbar-filtre-kayit-yetki.md` | Toolbar, filtre, taslak/yayın, roller |
| 8 | `plan-08-mock-veri-sema-kenar-durumlari.md` | Mock şema, tablolar, yükleme/boş/hata, P2 |
| 9 | `plan-09-duzeltme-ve-iyilestirmeler.md` | Zoom ölçeği, vardiya genişliği, havuz DnD, resize, çoklu iş/bugfix, gün özeti drawer, kart sadeleştirme |

**Not:** `plan-09`, prototipte çıkan sorunlara yöneliktir; `plan-06` / `plan-03` / `plan-04` ile çelişirse **plan-09 önceliklidir**.

Her dosyada **P0 / P1 / P2** ve **mock gereksinimleri** zorunludur.

## Çıktı beklentisi (tüm promptlar için)

Wireframe açıklaması + **mock veri** (dosyada istenen satır sayısı) + **P0/P1/P2** + kısa **Tailwind/neumorphic** notları + **UX soruları**.
