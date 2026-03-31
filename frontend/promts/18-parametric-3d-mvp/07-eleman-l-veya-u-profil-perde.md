# 07 — Eleman: L veya U profil perde / köşe (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: **L şekilli** veya **U şekilli** ince perde parçası — 2B profil (L veya U) seçilen **ekstrüzyon yüksekliği** boyunca uzatılır. Kalınlık tek değer (MVP).

PARAMETRELER (öner — L profil):

- `profileType`: `"L"` | `"U"`
- `legLengthA` (mm): bir bacak uzunluğu
- `legLengthB` (mm): diğer bacak (L için); U için üçüncü bacak `legLengthC` (opsiyonel)
- `wallThickness` (mm): profil duvar kalınlığı
- `extrusionHeight` (mm): prizma yüksekliği (dik çıkış)
- P1: iç köşe yuvarlatma yarıçapı

2B PROFİL TANIMI:
- L: iki dikdörtgen şerit birleşimi (union) veya tek poligon outline; **iç boşluk** (ince L kabuk) MVP’de **tek kalınlık** olarak sadece dış L şekli (dolu) veya **basit L prizma** (iki kutu birleşimi) — net seç.

GEOMETRİ KURALLARI:
- Tüm bacak uzunlukları > `wallThickness`.
- U profilinde simetri varsayımı açıkla.

### P0
- `elementFamily: PROFILE_WALL` veya `CORNER_PIECE`.
- `profileType: L` için tam örnek JSON + 3–8 geometri adımı (union veya extrude).
- Çizim: yüzden görünüm wireframe (metin).

### P1
- U profil parametreleri.
- İçi boş L (kanal) — iki katmanlı çıkarma.

### P2
- Eğik kesit.

ÇIKTI: Profil seçimi + JSON + geometri + P0/P1/P2 + sorular
```
