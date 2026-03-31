# plan-07 — Toolbar: fabrika, filtre, arama, taslak/yayın, roller

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Planlama ekranının **üst araç çubuğunu** ve **yetki modelini** tanımla.

## 🔍 Konu tanımı
Toolbar; bağlam (fabrika), arama/filtre, planın yaşam döngüsü (taslak/kesin) ve dışa aktarım giriş noktalarını taşır.

## 🎯 Amaç
Aynı ızgara üzerinde güçlü keşif (filtre) ve güvenli yayın (yetki) dengesi.

### P0
- **Fabrika seçici** (mock): üst barda; değişince ızgara verisi yenilenir notu.
- **Arama:** ürün adı, emir no, proje adı (mock).
- **Filtreler:** kalıp, durum, öncelik, proje; **popover** (inset well).
- **Plan durumu:** “Taslak” / “Yayınlandı” göstergesi (badge); kaydet aksiyonu (mock).
- **Rol matrisi (kısa tablo):** planlama tam yetki; şef sınırlı; vardiya salt okunur — hangi aksiyonlar (DnD, yayın, silme).

### P1
- Son değişiklik özeti: “kim, ne zaman” (mock satır).
- Undo/redo veya “son işlemi geri al” (tek adım).

### P2
- Dışa aktar: CSV/Excel uyumlu görünüm (wireframe butonu).

### Mock tablolar (zorunlu)
1) **Toolbar aksiyonları:** 10 satır — `action`, `visibleRoles[]`, `enabledWhenDraft`.  
2) **Filtre state:** örnek JSON şeması (metin olarak).

ÇIKTI: Toolbar wireframe + rol tablosu + P0/P1/P2 + sorular
```
