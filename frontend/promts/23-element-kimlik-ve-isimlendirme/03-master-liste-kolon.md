# 03 — Master Liste: KOLON (IfcColumn) (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Prefabrik üst yapı KOLON tipolojilerinin master listesini belgeleyip, her tipoloji için
ElementTypeCatalog/Typology mock JSON kayıtlarını üret. Bu dosya sistemin kolon kataloğunun
kaynak metnidir; ilerde elementTypeCatalog.ts üretilirken buradaki veriler kullanılacak.

ANA ELEMAN TİPİ:
- id: 'col'
- nameTr: 'Kolon'
- nameEn: 'Column'
- defaultCode: 'KL'  (Türk sektör konvansiyonu; firma 'COL', 'C', 'K' olarak override edebilir)
- ifcClass: 'IfcColumn'
- defaultIfcPredefinedType: 'COLUMN'
- category: 'superstructure'
- order: 10

TİPOLOJİ LİSTESİ (9 adet):

| # | id | nameTr | nameEn | defaultCode | IFC PredefinedType | Tanımlayıcı Boyutlar | Not |
|---|----|--------|--------|-------------|--------------------|----------------------|-----|
| 1 | col-rect | Dikdörtgen Kolon | Rectangular Column | RECT | COLUMN | height, sectionWidth, sectionDepth | En yaygın; 40x40'tan 80x80'e kadar |
| 2 | col-circ | Dairesel Kolon | Circular Column | CIRC | COLUMN | height, diameter | Mimari veya endüstriyel |
| 3 | col-sqr | Kare Kolon | Square Column | SQR | COLUMN | height, sectionSize | sectionWidth=sectionDepth özel durumu; ayrı tipoloji tutmak tercih |
| 4 | col-crb | Guseli Kolon | Corbel Column | CRB | COLUMN | height, sectionWidth, sectionDepth, corbelWidth, corbelHeight, corbelProjection, corbelLevel | Kiriş oturma için konsol çıkıntılı; level = kaç guse |
| 5 | col-frk | Çatallı Kolon | Fork-Head Column | FRK | COLUMN | height, sectionWidth, sectionDepth, forkDepth, forkOpening | Üstte çatal ağzı, makas/çift-T oturtmak için |
| 6 | col-tpr | Daralan Kolon | Tapered Column | TPR | COLUMN | height, baseWidth, baseDepth, topWidth, topDepth | Değişken kesit; uzun/mimari kolonlar |
| 7 | col-hol | Boşluklu Kolon | Hollow Column | HOL | COLUMN | height, outerWidth, outerDepth, wallThickness, coreShape | İçi boş; hafifletme veya tesisat için |
| 8 | col-pil | Pilastır | Pilaster | PIL | PILASTER | height, sectionWidth, sectionDepth | Duvar kolonu; duvar içine gömülü |
| 9 | col-arc | Mimari Kolon | Architectural Column | ARC | USERDEFINED ('ArchitecturalColumn') | height, sectionWidth, sectionDepth OR diameter, profileDescriptor | Dekoratif; yiv, kabartma, kaplama varyasyonu |

NOT: Bu tabloda çıkarılacak her satır için aşağıdaki mock JSON şablonuyla bir örnek kayıt üret.

MOCK JSON ŞABLONU (her tipoloji için):
```json
{
  "elementTypeCatalog": {
    "id": "col",
    "nameTr": "Kolon",
    "nameEn": "Column",
    "defaultCode": "KL",
    "ifcClass": "IfcColumn",
    "defaultIfcPredefinedType": "COLUMN",
    "category": "superstructure",
    "order": 10
  },
  "typology": {
    "id": "col-rect",
    "elementTypeId": "col",
    "nameTr": "Dikdörtgen Kolon",
    "nameEn": "Rectangular Column",
    "defaultCode": "RECT",
    "ifcPredefinedType": "COLUMN",
    "identifyingDimensions": ["height", "sectionWidth", "sectionDepth"],
    "defaultSizeFormatId": "length_m_section_cm",
    "geometryHint": {
      "type": "extrusion",
      "section": "rectangle",
      "axis": "Z"
    },
    "notes": "En yaygın prefabrik kolon tipi. Minimum 40x40, maksimum yaygın 80x80. Uzunluk 25m'ye kadar tek parça."
  }
}
```

İSTENEN ÇIKTI:
1. Yukarıdaki 9 tipolojinin her biri için tam mock JSON kaydı.
2. Her tipoloji için TR sektörel kullanım notu (nasıl isimlendirildiği, hangi firmalar kullanıyor).
3. Tanımlayıcı boyutların detaylı tanımı (her dimension için id, nameTr, nameEn, unit, required).
4. Kolon için örnek instance isim üretim senaryosu:
   - Dikdörtgen 40x40, 5m kolon, proje PRJ2026-14, sequence 1, revision 0
   - Varsayılan template çıktısı: "PRJ2026-14-KL-RECT-500-001-R0"
   - Firma override (ACME → COL, R): "PRJ2026-14-COL-R-500-001-R0"
   - Sektörel geleneksel: "KL500-001"
5. IFC 4.3.2 Pset_PrecastConcreteElementGeneral referansı (hangi property'ler ilgili).

GEOMETRY HINT (parametric3d/types.ts ile uyum):
- col-rect → existing ElementFamily 'COLUMN' + variantCode 'T1-DIKDORTGEN' eşleşir
- col-circ → yeni variantCode önerisi 'T1-DAIRE'
- col-crb → yeni variantCode 'T1-GUSE' + ek parametreler
- col-frk → yeni variantCode 'T1-CATAL'
- col-tpr → yeni variantCode 'T1-DARALAN'
- col-hol → yeni variantCode 'T1-BOS'
- col-pil → yeni variantCode 'T1-PIL'
- col-sqr → 'T1-KARE' (dikdörtgenin özel durumu, ayrı tutmak istiyorsak)
- col-arc → 'T1-MIMARI' + profileDescriptor custom

TÜRK SEKTÖR NOTLARI:
- Guseli kolon = sektörde "konsollu kolon" da denilir; İngilizce'de corbel/haunch/bracket karışık kullanılır.
- Çatallı kolon = "fork head column" veya "double-head column"; çift-T döşemenin oturtulduğu.
- Pilastır = çok kullanılmıyor ama IFC'de ayrı bir predefined type olduğu için listede.
- Mimari kolonlarda çoğu firma "ARC-" prefix kullanmaz, sadece proje bazlı isim verir; bu tipoloji
  opsiyonel sayılabilir (P2).

P0:
- Tablo (9 satır).
- 9 mock JSON kayıt (tam).
- Tanımlayıcı boyut kataloğu (her dimension için).

P1:
- IFC 4.3.2 property set referansları.
- Sektörel kullanım notları.
- Instance isim üretim senaryosu (3 varyasyon).

P2:
- col-arc detayı (mimari varyasyonlar — yiv, kabartma, kaplama tipleri).
- col-hol için coreShape enum (circular, rectangular, multiple).
- Kolon tabanı bağlantı tipleri (moment / mafsallı) metadata olarak.

AÇIK SORULAR:
1. col-sqr ayrı tipoloji olarak kalsın mı, yoksa col-rect'in özel durumu mu (sectionWidth=sectionDepth)?
2. col-crb (guseli) için guse sayısı ve yönü (tek/çift, sağ/sol) identifyingDimensions'a girmeli mi yoksa attributes'a mı?
3. Çok-katlı kolon (multi-story column) ayrı tipoloji olmalı mı, yoksa height'ın büyüklüğü yeterli mi?
4. Mimari kolon (col-arc) phase 1'e dahil mi yoksa faz 2'ye bırakılsın mı?
5. Kolon tabanı bağlantı tipleri (soket, ankraj plakası, moment bağlantı) identifyingDimensions mı attributes mı?
```
