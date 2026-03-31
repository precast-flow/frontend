# glass-08 — Tablo, ızgara, zaman çizelgesi (yoğun veri)

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

**Planlama — Tasarım**, MES, büyük tablolar gibi ekranlarda glass uygulanırken:

- **Okunabilirlik** korunur,
- **Sticky** başlıklar ve **sürükle-bırak** bozulmaz,
- **Performans** kabul edilebilir kalır.

## REFERANS EKRAN

- `../../app/src/components/production/PlanningDesignView.tsx`  
  İç içe: `sticky`, `z-[45]`–`z-[60]`, `absolute` popover, `fixed` overlay.

## İLKELER

1. **Blur politikası**: yalnızca **dış kabuk** veya tek “sahne” paneli; hücre içi blur **yasak** (P0).
2. **Satır / sütun başlıkları**: düz yarı saydam zemin (`gm-glass-solid-row` veya token); border ile ayrım.
3. **Seçili hücre / sürüklenen blok**: accent border + hafif gölge; kontrast yeterli.
4. **Renkli görev blokları** (planlama): mevcut anlam renkleri korunur; cam sadece **arka plan ızgarası** için.

## GÖREVLER

### G8.1 — Sticky stacking denetimi

Planlama görünümünde şu senaryoları test et (glass mod):

- Sol “bekleyen iş” sütunu + üst tarih başlığı + gövde scroll.
- Sidebar collapsed → hover genişleme sırasında **z-index** doğru mu?

Sorun varsa: **minimal** CSS veya JSX düzeltmesi; mümkünse seçici `html[data-ui-template='glass'] .gm-glass-outlet-scope ...` ile sınırlı.

### G8.2 — Genel tablo bileşenleri

Projede tekrar eden `<table>` pattern’leri varsa:

- `thead`: hafif cam veya düz panel.
- `tr:hover`: blur yok.
- `border-collapse` / sticky `th` birlikte çalışır kalsın.

### G8.3 — Scroll container

Cam panelde `overflow-auto` olan kutularda **kenar radius** ve **iç gölge** (inset) ile derinlik hissi; içerik kesilmesin.

## KABUL KRİTERLERİ

- Planlama ekranı glass modda **kullanılabilir** (metin okunuyor, DnD çalışıyor — mock ise en az görsel olarak).
- Chrome Performans panelinde bir scroll etkileşiminde **FPS düşüşü** aşırı değil (subjektif + kısa not).

## ÇIKTI

- Sorun → çözüm madde listesi.
- Ekran görüntüsü veya video timestamp notu (isteğe bağlı).
- P2 maddeleri (örn. sanal liste optimizasyonu) ayrı başlıkta.
