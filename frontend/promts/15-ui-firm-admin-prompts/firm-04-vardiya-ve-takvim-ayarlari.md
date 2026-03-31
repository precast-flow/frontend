# firm-04 — Vardiya ve çalışma takvimi ayarları

```
[Buraya 00-ORTAK-BLOK-FIRMA-ADMIN-UI.md yapıştır]

GÖREV: Kullanıcı sorularına doğrudan cevap veren UI: vardiya var mı, gece–gündüz mü.

### P0
- **Soru 1:** “Vardiya usulü kullanılıyor mu?” → Evet/Hayır (neumorphic toggle veya radio).
- **Soru 2:** Hayırsa: tek “gündüz” çalışma saati aralığı (iki time picker mock).
- **Soru 3:** Evet ise: model seçimi — `Gündüz-only (tek) | İki vardiya | Üç vardiya | Gece–gündüz (çoklu seçim veya radio grubu)`.
- Vardiya saatleri tablosu (satır: ad, başlangıç, bitiş) — mock 2–3 satır.
- Hafta sonu üretimi: Evet/Hayır.

### P1
- Resmi tatil davranışı select.
- Önizleme metni: “Üretim ekranında vardiya filtresi: [görünür/gizli]” (dinamik metin).

### P2
- Fabrika bazlı override (tablo + “+ fabrika için özel”).

### Ek (fabrika-özel şart)
- Her fabrika satırında ayrı vardiya modeli seçimi mock (örn. IST-HAD=2 vardiya, ANK-01=tek vardiya).
- Render önizlemede “seçili fabrikada vardiya filtresi görünür/gizli” metni ayrı göster.

ÇIKTI: Ekran + P0/P1/P2 + 12 üretim fazına etki özeti + sorular
```
