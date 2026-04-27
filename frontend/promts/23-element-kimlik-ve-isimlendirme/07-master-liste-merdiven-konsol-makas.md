# 07 — Master Liste: MERDİVEN, SAHANLIK, KONSOL, SOKET, MAKAS (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Üst yapının kalan eleman tiplerini tek dosyada topla: Merdiven, Sahanlık, Konsol,
Kolon Temel Soketi, ve Çatı Makası. Her biri kendi IFC class'ında (IfcStairFlight, IfcSlab/LANDING,
IfcMember, IfcFooting, IfcBeam veya IfcMember).

---

## 7.1 MERDİVEN (IfcStairFlight)

ANA ELEMAN TİPİ:
- id: 'stair'
- nameTr: 'Merdiven'
- nameEn: 'Stair Flight'
- defaultCode: 'MR'  (firma override: 'ST', 'STR', 'M' yaygın)
- ifcClass: 'IfcStairFlight'
- defaultIfcPredefinedType: 'STRAIGHT'
- category: 'superstructure'
- order: 50

TİPOLOJİLER (4 adet):

| # | id | nameTr | nameEn | defaultCode | IFC PredefinedType | Tanımlayıcı Boyutlar |
|---|----|--------|--------|-------------|--------------------|----------------------|
| 1 | stair-str | Düz Kollu Merdiven | Straight Flight | STR | STRAIGHT | totalRun, totalRise, width, stepCount, treadDepth, riserHeight |
| 2 | stair-l | L Merdiven | L-Shaped Stair | L | WINDER | runA, runB, totalRise, width, stepCount, landingPosition |
| 3 | stair-u | U / Geri Dönüşlü Merdiven | Half-Turn / Switchback | U | HALF_TURN_STAIR | runA, runB, totalRise, width, stepCount, gapWidth |
| 4 | stair-spr | Helezon Merdiven | Spiral Stair | SPR | SPIRAL_STAIR | outerDiameter, innerDiameter, totalRise, stepCount, totalAngle |

NOT: L ve U tipi merdivenler genellikle FLIGHT'ları ayrı, sahanlıkla birleşik olarak modellenir.
Bu sistemde bütün olarak tipoloji şeklinde tutulur; IFC export'ta IfcStair + child IfcStairFlight
üretilir (bu export sonraki faz).

---

## 7.2 SAHANLIK (IfcSlab / LANDING)

ANA ELEMAN TİPİ:
- id: 'landing'
- nameTr: 'Sahanlık'
- nameEn: 'Landing'
- defaultCode: 'SH'  (firma override: 'LD', 'LND' yaygın)
- ifcClass: 'IfcSlab'
- defaultIfcPredefinedType: 'LANDING'
- category: 'superstructure'
- order: 55

TİPOLOJİLER (2 adet):

| # | id | nameTr | nameEn | defaultCode | Tanımlayıcı Boyutlar |
|---|----|--------|--------|-------------|----------------------|
| 1 | landing-rect | Dikdörtgen Sahanlık | Rectangular Landing | RECT | length, width, thickness |
| 2 | landing-l | L Sahanlık | L-Landing | L | legA, legB, width, thickness |

---

## 7.3 KONSOL (IfcMember)

ANA ELEMAN TİPİ:
- id: 'corbel'
- nameTr: 'Konsol'
- nameEn: 'Corbel'
- defaultCode: 'KN'  (firma override: 'CB', 'CRB' yaygın)
- ifcClass: 'IfcMember'
- defaultIfcPredefinedType: 'BRACE'  (yaygın yaklaşım; USERDEFINED da mümkün)
- category: 'superstructure'
- order: 60

TİPOLOJİLER (2 adet):

| # | id | nameTr | nameEn | defaultCode | Tanımlayıcı Boyutlar |
|---|----|--------|--------|-------------|----------------------|
| 1 | corbel-rect | Dikdörtgen Konsol | Rectangular Corbel | RECT | projection, width, height |
| 2 | corbel-tpr | Eğimli Konsol | Tapered Corbel | TPR | projection, width, rootHeight, tipHeight |

NOT: Guseli Kolon (col-crb) içinde gömülü guseler ayrı konsol sayılmaz. Bu kategori
KOLON'dan BAĞIMSIZ, doğrudan kirişe oturan kiriş ayak konsolu içindir.

---

## 7.4 KOLON TEMEL SOKETİ (IfcFooting)

ANA ELEMAN TİPİ:
- id: 'socket'
- nameTr: 'Kolon Temel Soketi'
- nameEn: 'Column Cup / Socket Footing'
- defaultCode: 'SK'  (firma override: 'CF', 'PAD' yaygın)
- ifcClass: 'IfcFooting'
- defaultIfcPredefinedType: 'PAD_FOOTING'
- category: 'superstructure'  (üst yapı kolonunun bağlantı elemanı; altyapı katalogunda TEMEL ayrı)
- order: 65

TİPOLOJİLER (1 adet — üst yapı kapsamında):

| # | id | nameTr | nameEn | defaultCode | Tanımlayıcı Boyutlar |
|---|----|--------|--------|-------------|----------------------|
| 1 | socket-cup | Soket Temel | Cup / Socket Footing | CUP | outerLength, outerWidth, totalHeight, socketLength, socketWidth, socketDepth |

NOT: Genel temel tipolojileri (münferit, sürekli, radye, kazık, başlık) altyapı fazına bırakıldı.
Burada SADECE kolonun oturtulduğu prefabrik soket dahil.

---

## 7.5 ÇATI MAKASI (IfcBeam veya IfcMember)

ANA ELEMAN TİPİ:
- id: 'truss'
- nameTr: 'Çatı Makası'
- nameEn: 'Roof Truss / Girder'
- defaultCode: 'MK'  (firma override: 'TR', 'TRUSS', 'G' yaygın)
- ifcClass: 'IfcBeam'  (genelde tek parça bütünsel makas olduğu için)
- defaultIfcPredefinedType: 'USERDEFINED'
- category: 'superstructure'
- order: 70

TİPOLOJİLER (3 adet):

| # | id | nameTr | nameEn | defaultCode | IFC PredefinedType | Tanımlayıcı Boyutlar |
|---|----|--------|--------|-------------|--------------------|----------------------|
| 1 | truss-flt | Düz Makas | Flat Truss | FLT | USERDEFINED ('FlatTruss') | span, height, width |
| 2 | truss-y | Y Makas | Y-Truss | Y | USERDEFINED ('YTruss') | span, startHeight, peakHeight, endHeight, width |
| 3 | truss-gbl | Beşik Makas | Gable Truss | GBL | USERDEFINED ('GableTruss') | span, eaveHeight, peakHeight, width, slopeAngle |

NOT: Kiriş kataloğundaki beam-y ve beam-ig ile çakışma var.
- beam-y: düz uzun kiriş ama ucları alçak ortası yüksek (kiriş gibi davranır).
- truss-y: çatı kapatıcı ana makas, üstüne aşık oturur (struktürel rol farklı).
Karar: her ikisi de katalogda kalsın; IFC import'ta geometri + bağlantı tipi üzerinden heuristik.
Firma hangisi olduğunu manuel doğrulayabilir.

---

MOCK JSON ÖRNEĞİ (Merdiven, tüm diğerleri aynı şablonla üretilecek):
```json
{
  "typology": {
    "id": "stair-str",
    "elementTypeId": "stair",
    "nameTr": "Düz Kollu Merdiven",
    "nameEn": "Straight Flight",
    "defaultCode": "STR",
    "ifcPredefinedType": "STRAIGHT",
    "identifyingDimensions": ["totalRun", "totalRise", "width", "stepCount", "treadDepth", "riserHeight"],
    "defaultSizeFormatId": "run_rise_width",
    "geometryHint": {
      "type": "stair_flight",
      "axis": "X",
      "stepProfile": "rectangular"
    },
    "notes": "Tek kolda düz merdiven. Basamak sayısı 10-20 arası tipik. Total run = stepCount × treadDepth; total rise = stepCount × riserHeight."
  }
}
```

İSTENEN ÇIKTI:
1. Her bölümdeki tipolojiler için tam mock JSON kayıtları (12 adet toplam: 4 merdiven + 2 sahanlık + 2 konsol + 1 soket + 3 makas).
2. Tanımlayıcı boyut eklentileri:
   - totalRun, totalRise, stepCount, treadDepth, riserHeight, runA, runB, landingPosition, gapWidth
   - outerDiameter, innerDiameter, totalAngle (helezon)
   - projection, rootHeight, tipHeight (konsol)
   - socketLength, socketWidth, socketDepth, outerLength, outerWidth, totalHeight (soket)
   - startHeight, peakHeight, endHeight, eaveHeight, slopeAngle (makas)
3. Beam-y vs truss-y ayrımı için heuristik önerisi:
   - Eğer eleman uçlarında kiriş oturma yüzeyi varsa → beam-y (yapısal kiriş)
   - Eğer üstüne aşıklar dizilmişse → truss-y (makas)
   - Import sırasında kullanıcı onayı şart.
4. Merdiven için örnek instance isim üretim senaryosu:
   - Düz kollu, run 300cm, rise 180cm, genişlik 120cm, proje PRJ-2026-014, sequence 2, revision 0
   - Default: "PRJ-2026-014-MR-STR-300-180-120-002-R0"
5. Konsol için senaryolar:
   - Bağımsız konsol, projection 60cm, width 30cm, height 40cm → "PRJ-2026-014-KN-RECT-60-30-40-008-R0"
   - Not: eğer kolona gömülüyse → ayrı kayıt değil, kolon attribute'u.
6. Soket için senaryo:
   - 120×120×80 outer, 50×50×60 socket → "PRJ-2026-014-SK-CUP-120-120-80-50-50-60-001-R0"

P0:
- 5 bölümün tablo + mock JSON kayıtları.
- Tanımlayıcı boyut eklentileri.

P1:
- Beam-y vs truss-y heuristik.
- Instance isim senaryoları.
- L / U merdiven için FLIGHT + LANDING ayrımı (import sonrası işlemler).

P2:
- Rampa (ramp) tipolojisi — phase 1'e mi dahil yoksa faz 2 mi?
- Helezon merdiven geometri ayrıntıları (inner radius 0 → spiral column geçişi).
- Soket + ankraj plakası kombinasyonu (prefab bridge bearing pad) — ayrı eleman mi?

AÇIK SORULAR:
1. Rampa (ADA erişim rampası, otopark rampası) bu pakete dahil olsun mu yoksa faz 2 mi?
2. L ve U merdiven tek parça mı (IfcStairFlight bütünsel) yoksa iki flight + sahanlık mı?
   Üretim tarzına göre değişir; her iki modeli destekleyelim mi?
3. Konsol bağımsız mı olmalı (IfcMember) yoksa ana elemanın alt öğesi mi (kolonun guse çıkıntısı)?
   Karar: bağımsız tip + kolonun attribute'u (her ikisi de); import sırasında karar verilir.
4. Çatı makası çoğunlukla tek parça bütünsel; kafes makas (lattice truss) için alt parça modeli
   gerekecek — bu faz dışı mı?
5. Soket temeli üst yapı kategorisinde mi yoksa altyapı mı? Kolonun ayrılmaz parçası olduğu için
   üst yapıda tutulmasında mantık var; altyapı fazında ikinci soket tipolojisi (bridge socket) eklenebilir.
```
