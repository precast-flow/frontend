# glass-03 — Primitives: düğme, input, kart, chip

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

Modüllerde tekrar eden **kontrol ve konteyner** görünümlerini glass diline çekmek; **her sayfada tekrar tekrar** aynı Tailwind yığınını yazmayı önlemek.

## KAPSAM (BİLEŞEN TÜRLERİ)

1. **Primary / secondary / ghost / danger** butonlar (mevcut class pattern’leri: `rounded-xl`, `shadow-neo-*`).
2. **Text input, textarea, select** (border, focus ring, placeholder rengi).
3. **Checkbox / switch** (track ve thumb cam uyumu).
4. **Kart**: başlık + aksiyon + gövde (neo `shadow-neo-out` yerine cam).
5. **Badge / chip / etiket** (ince border, düşük blur veya blur yok).

## UYGULAMA STRATEJİSİ (SIRALI)

### A) Envanter

`../../app/src/components` içinde `grep` ile şunları say:

- `shadow-neo-out`, `shadow-neo-in`, `bg-pf-surface`, `rounded-3xl` (yoğun kullanım)

### B) CSS-first yaklaşım

`html[data-ui-template='glass'] .gm-glass-outlet-scope` altında:

- `button` ve `a` için **çok genel** seçicilerden kaçın; mümkünse **ortak class** ekleyin (örn. modül köküne `glass-controls` — sadece gerekirse).

Önerilen güvenli hedefler:

- `.gm-glass-outlet-scope button.rounded-xl` — çok geniş olabilir; **önce** en çok kullanılan 2–3 modülde manuel class `gm-glass-btn` denemesi yap, sonra genelle.

### C) Bileşen çıkarma (isteğe bağlı)

Tekrar çok yüksekse yeni dosya:

- `../../app/src/templates/glassmorphism/primitives/GlassButton.tsx`  
  Kural: **default export classic’i import etmez**; sadece glass shell içinde kullanılır veya `className` birleştirir.

## ETKİLEŞİM DURUMLARI (ZORUNLU)

- **Hover**: hafif parlak border + `translate-y` en fazla 1px.
- **Active**: opaklık + inset gölge.
- **Disabled**: blur aynı, opaklık ~%60; metin okunur kalsın.
- **Focus-visible**: `ring-2` glass accent rengi.

## KABUL KRİTERLERİ

- En az **2 farklı modülde** (ör. Dashboard + bir form modülü) buton/input görünümü glass ile tutarlı.
- `classic` şablonda bu modüller **piksel olarak önceki neo görünümde** (regresyon yok).

## ÇIKTI

- Değişen dosya listesi.
- Önce/sonra kısa tarif (1 paragraf).
- P2: tüm modüllerde otomatik `button` seçici genişletmesi — bilerek ertelendiyse not düş.
