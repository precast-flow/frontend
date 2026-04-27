# 05 — Master Liste: DÖŞEME (IfcSlab) (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Prefabrik üst yapı DÖŞEME (slab / flooring) tipolojilerinin master listesini belgele.
Döşeme elemanları prefabrik sektöründe geniş açıklık çözümü olarak kritik; Hollow Core ve
Çift T dünya genelinde en yaygın prefabrik döşeme tipleri.

ANA ELEMAN TİPİ:
- id: 'slab'
- nameTr: 'Döşeme'
- nameEn: 'Slab'
- defaultCode: 'DS'  (firma override: 'SL', 'S', 'SLAB' yaygın; US'te 'SLB')
- ifcClass: 'IfcSlab'
- defaultIfcPredefinedType: 'FLOOR'
- category: 'superstructure'
- order: 30

TİPOLOJİ LİSTESİ (7 adet):

| # | id | nameTr | nameEn | defaultCode | IFC PredefinedType | Tanımlayıcı Boyutlar | Not |
|---|----|--------|--------|-------------|--------------------|----------------------|-----|
| 1 | slab-hc | Hollow Core Döşeme | Hollow Core Slab | HC | USERDEFINED ('HollowCore') | length, width, thickness, coreCount, coreDiameter | Dünyada en yaygın; genişlik standart 1200mm |
| 2 | slab-dt | Çift T Döşeme | Double-Tee Slab | DT | USERDEFINED ('DoubleTee') | length, width, depth, flangeThickness, stemWidth, stemCount | Büyük açıklık; genişlik 2400/3000mm |
| 3 | slab-st | Tek T Döşeme | Single-Tee Slab | ST | USERDEFINED ('SingleTee') | length, width, depth, flangeThickness, stemWidth | Mimari uygulamalar, nadir |
| 4 | slab-sol | Masif Döşeme | Solid Slab | SOL | FLOOR | length, width, thickness | Tam dolu kesit |
| 5 | slab-fil | Filigran / Yarı Dolu | Filigree / Half Slab | FIL | FLOOR | length, width, precastThickness, toppingThickness | Ön dökümlü alt + saha dökümü üst |
| 6 | slab-rib | Nervürlü Döşeme | Ribbed Slab | RIB | FLOOR | length, width, thickness, ribHeight, ribSpacing, ribCount | Tek yönlü nervür |
| 7 | slab-rf | Çatı Döşemesi | Roof Slab | RF | ROOF | length, width, thickness, slopeAngle | Eğimli üst örtü |

MOCK JSON ŞABLONU:
```json
{
  "typology": {
    "id": "slab-hc",
    "elementTypeId": "slab",
    "nameTr": "Hollow Core Döşeme",
    "nameEn": "Hollow Core Slab",
    "defaultCode": "HC",
    "ifcPredefinedType": "USERDEFINED",
    "ifcObjectType": "HollowCore",
    "identifyingDimensions": ["length", "width", "thickness", "coreCount", "coreDiameter"],
    "defaultSizeFormatId": "length_cm_thickness_cm",
    "geometryHint": {
      "type": "extrusion",
      "section": "hollowcore_profile",
      "axis": "X",
      "standardWidth": 1200
    },
    "notes": "Standart genişlik 1200mm (bazı üreticilerde 2400mm). Kalınlık 150/200/250/320/400mm. Açıklık 6-18m."
  }
}
```

ÖZEL DİKKAT — HOLLOW CORE (slab-hc):
- IFC'de IfcBeam/HOLLOWCORE olarak da geçer (IFC 4.3.2 IfcBeamTypeEnum) ama döşeme
  işlevi görür. Kategori ikilemi: beam mi slab mi?
- Karar: sektör kullanımına göre SLAB altında tutulur; IFC import sırasında
  IfcBeam/HOLLOWCORE → slab-hc eşlemesi yapılır.
- Genişlik standarttır (1200mm yaygın); uzunluk ve kalınlık varyasyonu tüm üreticilerde.
- Çekirdek sayısı kalınlığa bağlı (150mm → 3 çekirdek, 400mm → 9-10 çekirdek).

ÖZEL DİKKAT — ÇİFT T (slab-dt):
Sektörde iki isimlendirme geleneği var:
(a) US/PCI geleneği: '12DT28' = 12 feet genişlik + 28 inch derinlik
(b) EU / metrik: 'DT-240-60' = 2400mm genişlik + 600mm derinlik (Türkiye'de daha yaygın)

Önerilen: her iki formatı SizeFormat olarak tanımla, firma profili hangisini kullanıyorsa seçer:
- 'dt_us_format' (us feet/inch)
- 'dt_eu_format' (metric)

Standart boyutlar (metric):
- Genişlik: 2400mm, 3000mm
- Derinlik (stem height + flange): 400-800mm
- Flange kalınlığı: 50-75mm
- Stem sayısı: 2 (çift T), 3 (triple T — nadir)
- Açıklık: 10-30m

ÖZEL DİKKAT — FİLİGRAN (slab-fil):
- Ön dökümlü ince plaka (40-60mm) + saha dökümü (ek 150-200mm topping).
- precastThickness (ön döküm) + toppingThickness (saha) ayrı alanlar.
- Toplam kalınlık = precastThickness + toppingThickness.

ÖZEL DİKKAT — ÇATI DÖŞEMESİ (slab-rf):
- IFC PredefinedType 'ROOF' kullanılır (FLOOR yerine).
- Eğim açısı (slopeAngle) opsiyonel; düz çatıda 0.
- Bazı firmalar ayrı eleman tipi olarak tutar ('roof-slab'); sistemde tipoloji olarak yeterli.

İSTENEN ÇIKTI:
1. 7 tipoloji için tam mock JSON kayıtları.
2. Çift T için iki ayrı SizeFormat tanımı (US + EU) ve hangi firma hangisini kullandığı notu.
3. Hollow Core için standart boyut-çekirdek eşleştirme tablosu:
   | Kalınlık (mm) | Çekirdek Sayısı | Çekirdek Çapı (mm) | Öz Ağırlık (kN/m²) |
4. Tanımlayıcı boyut eklentileri (coreCount, coreDiameter, stemCount, ribCount, toppingThickness).
5. Instance isim üretim senaryosu:
   - Hollow Core, 8m uzun, 20cm kalın, proje PRJ-2026-014, sequence 12, revision 0
   - Default template: "PRJ-2026-014-DS-HC-800-20-012-R0"
   - US style Çift T: "12DT28-003"
   - EU metric Çift T: "PRJ-2026-014-DS-DT-1200-800-60-003-R0"

EU / US / TR İSİMLENDİRME KARŞILAŞTIRMASI:
| Tip | US (PCI) | EU (metric) | TR sektör |
|-----|---------|-------------|-----------|
| Hollow Core | HC8 (8-inch thick) | HC-200 (200mm) | HC-20 veya TT8 |
| Çift T | 12DT28 | DT-3000-700 | TT300-70 veya ÇT-300-70 |

IFC 4.3.2 NOTLARI:
- IfcSlabTypeEnum: FLOOR, ROOF, LANDING, BASESLAB, USERDEFINED, NOTDEFINED
- Hollow Core ve Double Tee için USERDEFINED + ObjectType kullanılır.
- Pset_PrecastSlab property seti: typeDesignator, toppingType, componentSpacing,
  componentAngle, nominalThickness.
- Pset_PrecastConcreteElementFabrication: pieceMark, serialNumber, productionLotId,
  erectionDates — tüm döşeme tiplerine uygulanır.

P0:
- Tablo (7 satır).
- 7 mock JSON kayıt.
- Çift T için US/EU format ikilemi + öneri.
- Hollow Core standart boyut tablosu.

P1:
- Tanımlayıcı boyut eklentileri.
- Instance isim üretim senaryosu (en az 3 varyasyon).
- Pset_PrecastSlab mapping notu.

P2:
- Triple T (3 stemli) döşeme — ayrı tipoloji mi attribute mi?
- Inverted Ribbed Slab (ters nervürlü) — nadir ama var.
- Topping (üst kaplama) metadata (fresh / bonded / non-bonded).

AÇIK SORULAR:
1. Hollow Core: IFC import'ta IfcBeam/HOLLOWCORE olarak gelirse SLAB altında tutmak doğru mu?
   (Sistemde tek yer; kullanıcı kafası karışmaz.)
2. Çift T default format US mu EU mu? Türk pazarı EU, ama global ihracat için US template opsiyonu lazım.
3. Filigran döşemenin 'precastThickness' vs 'toppingThickness' gerçekten ayrı identifying dimension
   mı, yoksa attribute mi? Kalıp değişiyorsa ayrı tipoloji (farklı sizeSignature üretir).
4. Nervürlü döşeme (slab-rib) genellikle tek yönlü; çift yönlü nervür (waffle slab) ayrı tipoloji mi?
5. Çatı döşemesi (slab-rf) hollow core / çift T üzerine de uygulanabilir → tipoloji mi attribute mi?
   Öneri: ayrı tipoloji olarak dursun; slab-hc-roof, slab-dt-roof varyantı gereksiz.
```
