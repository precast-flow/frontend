# plan-06 — Zoom, hafta navigasyonu, üretim olmayan gün politikası

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Planlama görünümünü **ölçeklenebilir** (zoom) ve **takvim politikasına** uygun hale getir.

## 🔍 Konu tanımı
Kullanıcı bazen birkaç günü yakından, bazen ~aylık aralığı uzaaktan görmek ister. Bazı günler (Pazar, tatil) üretim yapılmaz.

## 🎯 Amaç
Hızlı navigasyon + net “bugün” + üretim dışı günlerde hata riskini düşürme.

### P0
- **Zoom:** Slider veya `Ctrl + scroll` — sütun genişliği + tipografi ölçeği. Aralık: **1 gün yakın** → **~45 gün uzak** (üst sınır mock).
- **Navigasyon:** “Bugün”, **← önceki hafta / sonraki hafta →** (veya seçili zoom’a göre “önceki/sonraki sayfa”).
- **Üretim olmayan gün:** İki moddan birini seç ve dokümante et:
  - **Mod A:** Sütun görünür, **gri arka plan** + “Üretim yok” bandı; drop kısıtlı.
  - **Mod B:** Sütun **hiç gösterilmez**; “Sadece iş günleri” filtresi.
- **Sticky başlıklar:** Zoom’da kaybolmaması için gün başlığı sabit.

### P1
- Takvim feed’i: resmi tatilleri otomatik gri (mock bayrak).
- “Çalışma takvimi” önizlemesi (aylık mini grid).

### P2
- Zaman çizelgesi export genişliği (print) — wireframe notu.

### Mock tablolar (zorunlu)
1) **Takvim günleri:** 14 satır — `date`, `isWeekend`, `isHoliday`, `productionAllowed`.  
2) **Zoom presetleri:** 5 satır — `label`, `dayCount`, `columnWidthToken`.

ÇIKTI: Etkileşim kuralları + wireframe + P0/P1/P2 + sorular
```
