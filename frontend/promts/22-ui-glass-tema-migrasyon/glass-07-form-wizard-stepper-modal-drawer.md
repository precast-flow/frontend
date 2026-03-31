# glass-07 — Form, wizard, stepper, modal, drawer

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

Çok adımlı akışlar ve **üst üste açılan yüzeyler** glass dilinde tutarlı olsun; **odak sırası**, **klavye** ve **scroll kilidi** bozulmasın.

## KAPSAM

- Wizard örnekleri: `StartWorkWizardView`, onboarding benzeri çok adım UI’lar.
- Modal / dialog: `fixed inset-0` + merkezi kart pattern’leri.
- Yan drawer: `UnitWorkQueueView`, `LogisticsFieldUnitQueuesView` vb.
- İç içe overlay: üst üste iki panel açılabiliyorsa z-index matrisi.

## TASARIM KURALLARI

1. **Backdrop**: cam veya yarı saydam koyu; blur hafif (performans).
2. **Panel (kart)**: L1–L2; içerik alanı L2’nin içinde düz veya hafif cam.
3. **Form alanları**: label + help text + hata mesajı renkleri token ile; hata rengi WCAG.
4. **Primary aksiyon** her zaman görünür (sticky footer veya üst bar) — mümkünse.

## GÖREVLER

### G7.1 — Envanter

`grep -r "fixed inset-0" ../../app/src/components --include="*.tsx"` çıktısını özetle; her dosya için “modal mı drawer mı” etiketle.

### G7.2 — Ortak sınıf veya bileşen

Şunlardan birini seç ve uygula:

- **A)** `.gm-glass-modal-root` / `.gm-glass-modal-panel` CSS sınıfları + mevcut JSX’e `className` ekleme  
- **B)** `GlassModalFrame.tsx` (yalnızca glass shell’de kullanılan ince wrapper)

### G7.3 — Z-index tablosu

Tek sayfalık tablo üret:

| Katman | z-index önerisi | Örnek |
|--------|------------------|-------|
| Sayfa | 0 | main |
| Sidebar | 70 | glass shell |
| TopBar bandı | 95 | mevcut |
| Drawer | ? | … |
| Modal | ? | … |
| Toast (varsa) | ? | … |

Mevcut kodla çelişkiyi çöz; çelişki yoksa “onaylandı” de.

### G7.4 — Regresyon

- Bir modal açıkken **sidebar hover** genişlemesi: içerik tıklanabilirliği ve görünürlük.
- `Escape` ile kapanma.

## KABUL KRİTERLERİ

- En az **2 farklı modal/drawer** glass görünümde.
- `classic` şablonda davranış aynı.

## ÇIKTI

- z-index tablosu (markdown).
- Değişen dosyalar + kısa test notu.
