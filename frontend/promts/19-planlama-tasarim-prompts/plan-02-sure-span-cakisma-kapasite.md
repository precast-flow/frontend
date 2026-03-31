# plan-02 — Süre: çoklu vardiya/gün span, çakışma ve kapasite uyarıları

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Planlama ızgarasında **süre** kavramını ve **çok hücreye yayılan** üretim öğelerini tanımla; **çakışma / kapasite** uyarılarını ekle.

## 🔍 Konu tanımı
Bir ürün/emir satırı **tek vardiyayı aşabilir** veya **ertesi güne** sarkabilir. Planlayıcı bunu görsel olarak anlamalı; sistem mümkün olan yerde **çakışmayı** işaretlemeli.

## 🎯 Amaç
Planın sadece “yerleşim listesi” değil, **zaman boyutu** taşıdığı hissi: span, süre özeti, uyarılar.

### P0
- Her ızgara öğesinde **planlanan süre** (saat veya vardiya birimi — mock tutarlı olsun).
- **Span davranışı (P0 basit):** Öğe birden fazla `(gün, vardiya)` hücresini kaplıyorsa **birleşik blok** veya **üstte ince timeline bar + altta hücre detayı** — ikisinden birini seç ve tekilleştir.
- Blok üzerinde **mini özet:** toplam süre, başlangıç→bitiş (metin).
- **Çakışma (mock):** Aynı kalıpta aynı vardiyada fiziksel olarak çakışan iki ağır iş → **sarı kenarlık** + tooltip: “Kalıp çakışması (mock)”.

### P1
- Kapasite kuralı: kalıp başına “eşzamanlı max adet” aşımı → uyarı seviyesi (warning vs error).
- Span için **kesişen projeler**de renk şeridi (proje rengi mock).

### P2
- Otomatik öneri: “şu öğeyi şu vardiyaya kaydır” (metin açıklama, algoritma yok).

### Mock tablolar (zorunlu)
1) **Plan öğeleri:** 10 satır — `itemId`, `title`, `moldId`, `start`, `end`, `durationHours`, `status`, `projectColor`.  
2) **Uyarılar:** 5 satır — `itemId`, `severity`, `message`.

ÇIKTI: Wireframe notları + etkileşim kuralları + P0/P1/P2 + Tailwind kısa notlar + sorular
```
