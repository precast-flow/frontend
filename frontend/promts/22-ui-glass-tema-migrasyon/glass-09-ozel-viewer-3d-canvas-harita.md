# glass-09 — Özel viewer: 3D, canvas, harita

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

Three.js / canvas / WebGL içeren modüllerde glass UI ile **teknik çakışmayı** yönetmek:

- **canvas** tam piksel netliği,
- UI kontrolleri cam,
- **performans** korunur.

## KAPSAM (ÖRNEK DOSYALAR)

- `../../app/src/components/parametric3d/Parametric3DModuleView.tsx`
- `../../app/src/components/parametric3d/ParametricViewer.tsx`
- Benzer şekilde `canvas` veya `three` import eden diğer bileşenler (`grep "from 'three'"`).

## İLKELER

1. **Viewer alanı**: mümkünse **opak veya çok hafif** zemin; arkasına ağır blur verme (anti-aliasing ve sharpness).
2. **Araç çubuğu / parametre paneli**: cam L2 paneller; `pointer-events` doğru (canvas üstüne yanlışlıkla şeffaf katman kalmasın).
3. **Fullscreen / resize**: pencere boyutunda cam panel taşması yok.

## GÖREVLER

### G9.1 — Katman diyagramı

Metin veya ASCII ile göster:

- Hangi `div` canvas’ı sarıyor?
- Hangi `absolute` kontroller canvas üstünde?

### G9.2 — Stil ayrımı

- Viewer köküne `className` ile **cam dışı** stil (örn. `bg-slate-950` sabit) — sadece glass modda mı classic’te de mi? Karar ver ve gerekçelendir.

### G9.3 — Etkileşim

- Mouse orbit / pan sırasında UI **hover** çakışması var mı?

## KABUL KRİTERLERİ

- Parametric 3D modülü glass modda açılıyor; kontroller kullanılabilir.
- `classic` modda önceki davranış korunuyor.

## ÇIKTI

- Katman diyagramı.
- Değişen dosyalar.
- Bilinen sınırlamalar (örn. “iOS Safari blur + canvas”).
