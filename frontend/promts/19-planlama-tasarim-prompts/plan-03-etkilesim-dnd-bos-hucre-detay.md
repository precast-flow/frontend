# plan-03 — Etkileşim: sürükle-bırak, boş hücre atama, ürün detay drawer

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Planlama ızgarası için **etkileşim modeli**: **drag & drop**, **boş alana tıklayarak atama**, **ürün detayı** (drawer).

## 🔍 Konu tanımı
Planlayıcı öğeleri taşıyarak düzenler; boş zaman/kalıp boşluğuna yeni iş ekler; bir öğeye tıklayınca tüm teknik detayları görür.

## 🎯 Amaç
Operasyon hızı: minimum tıklama, net geri bildirim, hata yapmayı zorlaştıran hedef vurgusu.

### P0
- **Sürükle-bırak:** Öğeyi başka **gün**, **vardiya** veya **kalıp** satırına taşı; sürüklerken **hedef hücre highlight** (inset track).
- **Drop kuralları (mock):** Üretim olmayan güne bırakınca ya **engelle** ya da **onay modal** — birini seç ve tutarlı yaz.
- **Boş hücre tıklama:** “Buraya ata” → kısa akış: **(a)** bekleyen işten seç veya **(b)** yeni öğe oluştur (ürün, miktar, süre, öncelik — alanlar mock).
- **Tıklama — detay drawer:** Sağdan açılan panel (neumorphic protrude container); üstte **görsel/placeholder**, altında **özellik listesi**. Alan adları `plan-08-mock-veri-sema-kenar-durumlari.md` içindeki **PlanItem** şeması ile birebir uyumlu olmalı; bu promptta minimum: görsel, ürün/emir referansı, kalıp, beton reçetesi, miktar/hacim, süre, öncelik, notlar.
- **Salt okunur notu:** Sadece görüntüleme rolünde DnD ve boş hücre ataması **devre dışı** (görsel olarak soluk).

### P1
- Çoklu seçim (checkbox veya marquee) + toplu taşıma.
- Klavye: Esc drawer kapat, Enter detay aç (odaklanmış öğede).

### P2
- Touch cihaz için DnD alternatifi: “Taşı” menü aksiyonu + hedef seçici.

### Mock tablolar (zorunlu)
1) **Bekleyen iş havuzu (kısa):** 8 satır — `queueId`, `title`, `priority`, `risk`.  
2) **Drawer alanları:** tek tablo — `field`, `value`, `group` (ör. Genel / Beton / Kalıp / Lojistik).

ÇIKTI: Etkileşim akışları (madde madde) + wireframe + P0/P1/P2 + sorular
```
