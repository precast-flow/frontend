# 08 — Viewer, ölçek ve ERP form bağlantısı (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: Parametre girişinin yapıldığı **ERP / ürün kartı** ekranı ile **3B önizleme** alanını birleştiren UX ve veri akışını tasarla. Neomorphism + `00b` ile uyumlu.

BİLEŞENLER:
- Sol veya üst: **form** (eleman ailesine göre dinamik alanlar — `01` şemasına bağlı).
- Sağ veya alt: **viewer** (orbit, zoom, pan; grid zemin opsiyonel).
- **Birim göstergesi** (mm) ve isteğe bağlı **ölçü çizgisi** (mock).
- Parametre değişince model **yeniden üretilir** (debounce notu P1).

VERİ AKIŞI:
- Form → JSON (`01` şeması) → validasyon → geometri motoru → mesh → viewer.
- Hata: validasyon önce; geometri hatası ise kullanıcıya kısa mesaj (mock metinler).

### P0
- Wireframe (metin + ASCII veya blok listesi): form + viewer düzeni.
- Durumlar: `idle`, `validating`, `rendering`, `error`.
- Tailwind: 4–8 kısa satır (container, kart, viewer alanı inset).

### P1
- Debounce 300 ms; loading skeleton.
- “Son kaydedilen parametreler” ile karşılaştırma (unsaved).

### P2
- GLB export butonu.
- İki viewer (ön + üst) küçük pencereler.

### ERP EŞLEMESİ
- `productTypeId` → `elementFamily` + `variantCode` haritası tablosu (örnek 3 satır).
- Üretim emrinde sadece **kopya** mı yoksa **parametre düzenleme** mi (iş kuralı soru olarak bırak).

ÇIKTI: Wireframe + durum diyagramı + P0/P1/P2 + örnek eşleme tablosu + sorular
```
