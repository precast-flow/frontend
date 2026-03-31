# 05 — Eleman: Kutu menfez (box culvert) (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: **Kutu menfez** — dış dikdörtgen prizma içinde **iç boşluk** (delik) ile tünel; **CSG çıkarma** (subtract) gerekir. Duvar kalınlığı veya iç/dış ölçülerden biri ana giriş olmalı.

PARAMETRELER (iki tutarlı varyanttan birini seç ve dokümanda sabitle):

**Varyant A — Dış ölçü + duvar kalınlığı**
- `outerLength`, `outerWidth`, `outerHeight` (mm)
- `wallThickness` (mm) — dört duvarda eşit (MVP basitliği)

**Varyant B — Dış + iç ölçü**
- `outerLength`, `outerWidth`, `outerHeight`
- `innerLength`, `innerWidth`, `innerHeight` (iç boşluk; merkez hizalı varsayım)

GEOMETRİ KURALLARI:
- İç hacim dışın içinde; tüm duvar kalınlıkları > 0.
- Çıkarma işlemi sonrası **kapalı** (üst yüzey açık menfez değilse) üst yüzeyi netleştir: MVP’de **kapalı kutu tünel** (alt + yan + üst duvarlar) veya **açık üst U** — seç ve tek senaryoda kal.

### P0
- `elementFamily: CULVERT` veya `BOX_CULVERT`.
- Seçilen varyant için tam validasyon eşitsizlikleri (örn. `innerWidth < outerWidth - 2*t`).
- Örnek JSON + CSG adımları: `outerSolid - innerVoid`.
- Boolean başarısızlık riskine 1 paragraf.

### P1
- Tek tarafta kalınlık farkı (asimetrik duvar).

### P2
- Eğim (gradient) — sadece fikir.

ÇIKTI: Varyant kararı + JSON + validasyon + geometri + P0/P1/P2 + sorular
```
