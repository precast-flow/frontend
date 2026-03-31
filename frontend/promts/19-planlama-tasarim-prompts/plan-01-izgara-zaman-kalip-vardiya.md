# plan-01 — Izgara: zaman ekseni × vardiya × kalıp satırları

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Üretim modülü “Planlama / Tasarım” sayfasının **iskelet ızgarasını** tasarla.

## 🔍 Konu tanımı
Kullanıcı; fabrikada hangi **kalıpta**, hangi **gün** ve **vardiyada** hangi üretim öğesinin (ürün/emir satırı) yer alacağını tek bakışta görmeli. Üst bölüm **zaman** (sütun), sol bölüm **kalıp** (satır), kesişim **hücre**dir.

## 🎯 Amaç
Excel benzeri okunabilirlik: gün başlıkları, her gün altında **en fazla 3 vardiya** (fabrika politikasına göre 1–3), sol tarafta **kalıp** listesi.

### P0
- **Sütun hiyerarşisi:** Seviye 1 = **takvim günü** (tarih + haftanın günü kısaltması); Seviye 2 = **vardiya** (V1/V2/V3 veya “Sabah/Öğle/Gece” mock).
- **Sol donmuş kolon:** Kalıp kimliği (kod + kısa ad); isteğe bağlı ikincil satır: kapasite ipucu (mock metin: “max eşzamanlı …”).
- **Hücre:** Belirli `(gün, vardiya, kalıp)` kesişiminde **yerleşen kart/chip** alanı; bir hücrede **birden fazla öğe** stack (dikey liste) veya taşmada “+N”.
- **Sticky davranış:** Yatay kaydırmada **gün başlıkları** ve dikeyde **kalıp kolonu** sabit kalsın (wireframe notu).
- **Breadcrumb / menü yeri:** Production/MES altında “Planlama — Tasarım” (mock).

### P1
- Kalıp satır grupları (ör. “Hat A / Hat B” grup başlığı).
- Vardiya sayısı fabrika ayarına göre dinamik (1–3); boş vardiya satırı göster/gizle.

### P2
- Yoğun fabrikada **sanal scroll** veya “sadece dolu kalıpları göster” filtresi.

### Mock tablolar (zorunlu)
1) **Günler:** 7 satır — `date`, `weekday`, `isNonProduction` (bool).  
2) **Vardiyalar:** 3 satır — `id`, `label`, `order`.  
3) **Kalıplar:** 12 satır — `moldId`, `name`, `lineHint` (string).

ÇIKTI: Bilgi mimarisi + bölüm listesi + bileşen listesi + neumorphic özet + P0/P1/P2 + **3–5 UX sorusu**
```
