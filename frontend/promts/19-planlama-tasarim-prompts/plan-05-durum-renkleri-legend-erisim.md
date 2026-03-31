# plan-05 — Durum renkleri, legend ve erişilebilirlik

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Üretim öğelerinin **durumunu** renk ve ikon ile kodla; **legend** ekle; **erişilebilirlik** (kontrast, ikon) kurallarını yaz.

## 🔍 Konu tanımı
Renkler; üretildi, üretimde, iptal, ertelendi, tasarım/emir aşaması gibi durumları **hızlıca** iletmeli. Neumorphic gri-beyaz palete uyum için renkler **accent** olarak kontrollü kullanılmalı.

## 🎯 Amaç
Tek renge bağımlı kalmadan (renk körlüğü) okunabilir durum modeli.

### P0
- **Durum → görsel kod:** Her kartta **arka plan tonu + ince border + küçük durum ikonu** (üçlü).
- **Legend paneli:** Sağ üst veya toolbar’da dar “Durum anahtarı”; tıklanınca genişleyen açıklama (inset well).
- **Önerilen semantik set (özelleştirilebilir CSS değişkenleri):**
  - `PLANNED` — nötr mavi-gri çerçeve
  - `ORDERED_DESIGN` — amber/sarı
  - `IN_PROGRESS` — canlı mavi
  - `PRODUCED_OK` — yeşil
  - `HOLD_UNCERTAIN` — turuncu
  - `ISSUE_REWORK` — mor veya koyu turuncu
  - `CANCELLED` / `SCRAP` — kırmızı
- **00b uyumu:** Mor/lavanta yasak kuralına takılmamak için `ISSUE_REWORK` için **koyu gri + turuncu ikon** alternatifi öner (iki sütunlu legend).

### P1
- Kullanıcı başına **tema ön seti** (yüksek kontrast modu).
- Durum filtresi (toolbar): çoklu seçim.

### P2
- Durum geçmişi zaman çizgisi (drawer içi).

### Mock tablolar (zorunlu)
1) **Durum sözlüğü:** tablo — `statusKey`, `labelTR`, `colorToken`, `iconName`, `meaning`.  
2) **Örnek kartlar:** 8 satır — `itemId`, `statusKey`, `title`.

ÇIKTI: Renk token tablosu + legend yerleşimi + P0/P1/P2 + sorular
```
