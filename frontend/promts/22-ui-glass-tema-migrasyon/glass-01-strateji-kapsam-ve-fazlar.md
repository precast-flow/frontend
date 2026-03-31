# glass-01 — Strateji, kapsam ve fazlar

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

Glass migrasyonunu **tek seferde big-bang** yapmak yerine; ölçülebilir fazlarla ilerleyip her fazda **classic regresyonu sıfıra yakın** tutmak.

## KAPSAM TANIMI

### Dahil

- `../../app/src/` altında, **`MainCanvas` ve `ShellResolver` ile render edilen** tüm modül görünümleri (dashboard, CRM, üretim, kalite, planlama, parametric 3D, vb.).
- Shell bileşenleri: glass şablonda zaten kısmen var; **TopBar içi kontroller**, **footer linkleri**, **ortak banner/drawer** stilleri.
- **Paylaşılan primitive** görünümler: buton, input, select, textarea, checkbox, radio, switch, badge, tab, tooltip (kullanıldığı yerlerde).

### Hariç (aksi karar yoksa)

- `/login`, `/register`, `/firma-ayarlari` gibi **ayrı shell** rotaları — isteğe bağlı Faz 4.
- `node_modules` ve build çıktıları.

## RİSKLER

1. **Z-index / stacking**: cam + sticky + fixed overlay bir arada; regresyon riski yüksek.
2. **Okunabilirlik**: yarı saydam üst üste metin; özellikle tablo ve küçük font.
3. **Performans**: blur her hücrede; düşük cihazlarda jank.
4. **Bakım**: saf CSS ile yüzlerce `!important`; ileride tema genişlemesi zorlaşır.

## FAZ PLANI (ÖNERİ)

| Faz | İçerik | Bitti kriteri |
|-----|--------|----------------|
| **Faz 0** | Mevcut durum envanteri + ekran listesi | `glass-05` tablosu dolduruldu |
| **Faz 1** | Global token + outlet kapsamlı kurallar genişletme | Tüm modül kökleri cam yüzeye yakın |
| **Faz 2** | Primitives (`glass-03`) + ortak bileşenler (`glass-04`) | Buton/input tutarlılığı |
| **Faz 3** | Sayfa tipleri (`glass-06`–`07`) | Form/liste/dashboard |
| **Faz 4** | Yoğun veri (`glass-08`) + özel viewer (`glass-09`) | Planlama ızgarası, 3D |
| **Faz 5** | QA (`glass-10`) + login/firma admin (opsiyonel) | Checklist tamam |

## GÖREV (BU PROMPT İÇİN)

1. Repo içinde `../../app/src/components` ve `pages` için **modül başına bir satırlık** öncelik öner (P0 = her gün kullanılan akış).
2. Faz planını kendi takvimine göre **2 haftalık** örnek sprint’e böl (sadece plan metni).
3. Her faz için **tek cümle “rollback” stratejisi** yaz (örn. “glass CSS blokunu feature flag ile devre dışı”).

## ÇIKTI

- 1 sayfa markdown: tablo (modül × öncelik × faz).
- 3–5 risk + mitigasyon maddesi.
