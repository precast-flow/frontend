# 03 — Eleman: Dikdörtgen kesit kolon (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: **Dikdörtgen kesit kolon** için parametrik 3B tanımı. Geometri: dikdörtgen kesit × yükseklik yönünde **düz extrusion** (veya prizma kutu); donatı yok.

PARAMETRELER (öner):
- `sectionWidth` (mm): kesit genişliği
- `sectionDepth` (mm): kesit derinliği
- `height` (mm): kolon boyu (dik eksen)
- P1: `cornerFillet` (mm) — köşe yuvarlatma; 0 = keskin
- P1: `baseOffset` / `topOffset` (mm) — plaka payı (opsiyonel)

GEOMETRİ KURALLARI:
- `sectionWidth`, `sectionDepth`, `height` > 0.
- Üst/alt yüzeyler birbirine paralel; eksen dünya Z veya model tanımında tek eksen seçimi.
- Fillet varsa: küçük yarıçaplarda manifold kontrolü notu.

### P0
- `elementFamily: COLUMN`, `variantCode` örneği (T1 dikdörtgen).
- Tam **örnek JSON** + geometri adımları (1–5 numara).
- Basit **form wireframe**: 3 alan + önizleme kutusu (Neomorphism, Tailwind kısa).

### P1
- Fillet varsa: hangi motor (JSCAD / Three) için ek risk.

### P2
- Kesit şekli “L” veya “+” (çoklu dikdörtgen birleşimi) — sadece konsept.

ÇIKTI: JSON + geometri + form wireframe + P0/P1/P2 + sorular
```
