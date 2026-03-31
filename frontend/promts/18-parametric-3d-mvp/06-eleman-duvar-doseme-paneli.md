# 06 — Eleman: Duvar / döşeme paneli (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: **Düz panel** (duvar veya döşeme) — ince dikdörtgen prizma: `length` × `height` × `thickness`. Çok katlı delikler P1; P0’da düz levha.

PARAMETRELER (öner):
- `length` (mm): panel uzun kenar
- `height` (mm): panel dikey kenar (veya döşeme için “genişlik” — isimlendirmeyi netleştir)
- `thickness` (mm): levha kalınlığı
- P1: `opening` listesi — her biri: `x`, `y`, `width`, `height` (panel yüzeyinde yerel 2B koordinat); delikler **tam thickness** boyunca delik (CSG subtract).

GEOMETRİ KURALLARI:
- `thickness` > 0; `length`, `height` > 0.
- Açıklıklar panel sınırları içinde kalmalı.
- Delikler birbiriyle kesişirse: MVP’de “kullanıcıya hata” veya basit birleşik void (P2).

### P0
- `elementFamily: PANEL`, `panelKind`: `WALL` | `SLAB` (enum).
- Düz levha için tek solid; örnek JSON.
- Form: 3 ana alan + önizleme.

### P1
- Tek dikdörtgen açıklık (subtract).
- Çoklu açıklık listesi.

### P2
- Lento / parapet profili (L kesit paneli) — bu dosyada değil, `07` ile ilişkilendir.

ÇIKTI: JSON + geometri + UI alanları + P0/P1/P2 + sorular
```
