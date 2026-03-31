# 04 — Eleman: Prizmatik kiriş (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: **Prizmatik kiriş** (basit dikdörtgen kesit × açıklık uzunluğu) için parametrik 3B tanımı. MVP’de tek parça prizma; kutu kiriş veya düz beton kiriş; ankraj/donatı çizilmez.

PARAMETRELER (öner):
- `span` (mm): kiriş uzunluğu (genelde ana eksen boyunca X)
- `width` (mm): kesit genişliği (Y)
- `height` (mm): kesit yüksekliği (Z)
- P1: `bearingLength` (mm) — mesnet uzunluğu (görsel blok olarak uçlarda küçük ek prizmalar — opsiyonel mock)
- P1: `camber` (mm) veya derece — eğim (MVP’de 0 önerilir)

GEOMETRİ KURALLARI:
- `span`, `width`, `height` > 0.
- Koordinat sistemi: net tanımla (örn. kiriş X boyunca; Y ve Z kesit).
- Mesnet ekleri P0’da **yok**; sadece tek kutu.

### P0
- `elementFamily: BEAM`, örnek `variantCode` (örn. RECT_PRISM).
- `01` ile uyumlu üst şema + `parameters` bloğu.
- Örnek JSON + 3–6 adımlı geometri tanımı.

### P1
- Uç mesnet blokları (boolean veya ayrı küçük kutular).

### P2
- T kiriş / L kesit — sadece parametre listesi taslağı.

ÇIKTI: JSON + geometri + form alanları listesi + P0/P1/P2 + sorular
```
