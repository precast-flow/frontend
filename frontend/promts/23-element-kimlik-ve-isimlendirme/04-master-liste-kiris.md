# 04 — Master Liste: KİRİŞ (IfcBeam) (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Prefabrik üst yapı KİRİŞ tipolojilerinin master listesini belgeleyip, her tipoloji için
ElementTypeCatalog/Typology mock JSON kayıtlarını üret. Prefabrik kirişlerin çok farklı kesit
varyasyonları var; bu dosya sektörün tüm yaygın tipolojilerini kapsar.

ANA ELEMAN TİPİ:
- id: 'beam'
- nameTr: 'Kiriş'
- nameEn: 'Beam'
- defaultCode: 'KR'  (firma override: 'BM', 'B', 'BEAM' yaygın)
- ifcClass: 'IfcBeam'
- defaultIfcPredefinedType: 'BEAM'
- category: 'superstructure'
- order: 20

TİPOLOJİ LİSTESİ (15 adet):

| # | id | nameTr | nameEn | defaultCode | IFC PredefinedType | Tanımlayıcı Boyutlar | Not |
|---|----|--------|--------|-------------|--------------------|----------------------|-----|
| 1 | beam-rect | Dikdörtgen Kiriş | Rectangular Beam | RECT | BEAM | span, width, height | Hatıl, döşeme desteği |
| 2 | beam-i | I Kiriş | I-Beam | I | BEAM | span, totalHeight, flangeWidth, webThickness, flangeThickness | Geniş açıklık çatı/döşeme |
| 3 | beam-t | T Kiriş | T-Beam | T | T_BEAM | span, totalHeight, flangeWidth, webWidth, flangeThickness | Döşeme kompozit + aşık |
| 4 | beam-it | Ters T Kiriş | Inverted-T Beam | IT | BEAM | span, totalHeight, bottomFlangeWidth, webWidth, flangeThickness | İki yandan döşeme taşır |
| 5 | beam-l | L Kiriş | L-Beam | L | EDGEBEAM | span, totalHeight, flangeWidth, webWidth, flangeThickness | Tek taraflı kenar döşeme |
| 6 | beam-u | U Kiriş | U / Channel Beam | U | BEAM | span, totalHeight, outerWidth, wallThickness | Oluk profili / kanal |
| 7 | beam-box | Kutu Kiriş | Box Beam | BOX | BEAM | span, outerWidth, outerHeight, wallThickness | Köprü, uzun açıklık |
| 8 | beam-gtr | Oluk Kiriş | Gutter Beam | GTR | BEAM | span, outerWidth, outerHeight, channelDepth, channelWidth | Su drenaj kombo |
| 9 | beam-y | Y / Meyilli Makas Kiriş | Y / Tapered Roof Girder | Y | USERDEFINED ('YGirder') | span, startHeight, peakHeight, endHeight, width | Sanayi çatı makası |
| 10 | beam-ig | I Çatı Makası | I-Roof Girder | IG | GIRDER_SEGMENT | span, startHeight, endHeight, flangeWidth, webThickness, flangeThickness | Değişken kesit I |
| 11 | beam-spd | Söve / Parapet Kirişi | Spandrel Beam | SPD | SPANDREL | span, height, width, upstandHeight | Kenar + parapet kombo |
| 12 | beam-cap | Başlık Kirişi | Cap / Hammerhead | CAP | PIERCAP | span, height, width, corbelProjection | Köprü başlığı / kolon üstü |
| 13 | beam-prl | Aşık | Purlin | PRL | BEAM | span, width, height | Çatı aşığı, makas üstü |
| 14 | beam-crn | Vinç Kirişi | Crane Beam | CRN | BEAM | span, width, height, railHeight, railWidth | Endüstriyel vinç yolu |
| 15 | beam-lnt | Lento | Lintel | LNT | LINTEL | span, width, height | Kapı/pencere üstü |

MOCK JSON ŞABLONU (her tipoloji için):
```json
{
  "typology": {
    "id": "beam-t",
    "elementTypeId": "beam",
    "nameTr": "T Kiriş",
    "nameEn": "T-Beam",
    "defaultCode": "T",
    "ifcPredefinedType": "T_BEAM",
    "identifyingDimensions": ["span", "totalHeight", "flangeWidth", "webWidth", "flangeThickness"],
    "defaultSizeFormatId": "span_cm",
    "geometryHint": {
      "type": "extrusion",
      "section": "T_profile",
      "axis": "X"
    },
    "notes": "Döşeme ile kompozit çalışır. Sektörde en yaygın prefabrik kiriş. 6m-24m açıklık."
  }
}
```

ÖZEL DİKKAT — TERS T (beam-it):
IFC'de ayrı PredefinedType yok; BEAM kullanılır. Ama sektörde yaygın ve geometrisi
farklı (alt kanat geniş, üstte döşeme oturur). ifcObjectType: 'InvertedTBeam' verilebilir
USERDEFINED ile birlikte; veya BEAM + custom attribute ile.

ÖZEL DİKKAT — Y MAKAS (beam-y):
İki ucu alçak, ortası yüksek (meyilli çatı için). IFC'de karşılığı yok;
USERDEFINED + ObjectType 'YGirder'. Sanayi yapılarında (cemrebeton, dayan örneği) çok yaygın.

ÖZEL DİKKAT — AŞIK (beam-prl):
Düşük boyutlu, çatı makası üstüne oturan sekonder kiriş. Genellikle 4-8m açıklık.
IFC PurlIn için ayrı tip yok; BEAM kullanılır.

ÖZEL DİKKAT — VİNÇ KİRİŞİ (beam-crn):
Endüstriyel yapılarda. railHeight ve railWidth ray profili için.
Kategori 'superstructure' ama özellik açısından 'industrial' işareti de alabilir.

İSTENEN ÇIKTI:
1. 15 tipoloji için tam mock JSON kayıtları.
2. Her tipoloji için sektörel kullanım notu ve tipik açıklık/boyut aralığı.
3. Tanımlayıcı boyutların detaylı tanımı (dimension kataloğu eklentisi — varsa yeni dimension ekle).
4. Kiriş için örnek instance isim üretim senaryosu:
   - T kiriş, span 12m, proje PRJ-2026-014, sequence 5, revision 0
   - Default template: "PRJ-2026-014-KR-T-1200-005-R0"
   - Boyut dahil sektörel: "TK1200-05" (bitişik format)
   - Firma "BM" override: "PRJ-2026-014-BM-T-1200-005-R0"
5. IFC 4.3.2 IfcBeamTypeEnum değerleri referansı (BEAM, CORNICE, DIAPHRAGM, EDGEBEAM,
   GIRDER_SEGMENT, HATSTONE, HOLLOWCORE, JOIST, LINTEL, PIERCAP, SPANDREL, T_BEAM,
   USERDEFINED, NOTDEFINED) — hangi tipoloji hangi enum'a eşlendiği tablosu.

TANIMLAYICI BOYUT EKLENTİLERİ (IdentifyingDimension kataloğuna eklenecek yeni öğeler):
- span (mm) — kiriş açıklığı (uzunluğu)
- totalHeight (mm) — toplam yükseklik
- flangeWidth (mm) — başlık genişliği
- flangeThickness (mm) — başlık kalınlığı
- webWidth (mm) — gövde genişliği
- webThickness (mm) — gövde kalınlığı
- bottomFlangeWidth (mm) — alt başlık genişliği (ters T için)
- startHeight, peakHeight, endHeight (mm) — Y ve I makas için değişken
- upstandHeight (mm) — söve üst yükseklik
- corbelProjection (mm) — başlık kirişi konsol çıkıntısı
- railHeight, railWidth (mm) — vinç ray profili
- channelDepth, channelWidth (mm) — oluk kesiti
- outerWidth, outerHeight, wallThickness (mm) — kutu kesiti

P0:
- Tablo (15 satır).
- 15 mock JSON kayıt.
- IfcBeamTypeEnum eşleşme tablosu.
- Tanımlayıcı boyut eklentileri.

P1:
- Sektörel kullanım notları (her tipoloji için 2-3 cümle).
- Instance isim üretim senaryosu (en az 3 varyasyon).
- Kompozit davranış (bkz. T kiriş döşeme ile çalışır) metadata önerisi.

P2:
- Öngerilmeli (prestressed) kiriş varyantı — ayrı tipoloji mi, yoksa attribute mi?
  Öneri: attribute ('prestressing': 'none' | 'pretensioned' | 'post-tensioned').
- Çelik liflı (SFRC) kiriş için ayrı bayrak.
- Kürlenme sonrası birleşim (composite topping) attribute.

AÇIK SORULAR:
1. Öngerilmeli kirişleri (prestressed / pretensioned) ayrı tipoloji mi sayalım, yoksa attribute mi?
   Sektörde öngerilmeli T kiriş (PT-T) ayrı ürün olarak pazarlanıyor.
2. Çift T kesitli KİRİŞ (döşeme değil, kiriş) var mı? Genelde döşeme olarak sınıflanır ama
   bazı sanayi yapılarında kiriş gibi kullanılır.
3. HOLLOWCORE IFC'de IfcBeam predefined type olarak geçiyor ama sektörde döşeme
   olarak anılıyor. Hangi ana tipte tutalım (beam mi slab mi)?
4. Lento (lntl) ayrı eleman tipi mi olmalı (kapı/pencere ile ilişki), yoksa kiriş tipolojisi mi?
5. Söve kirişi (spandrel) ile parapet paneli nasıl ayırdedilir? Spandrel kiriş (taşıyıcı),
   parapet duvar (taşıyıcı olmayan) → ayrı tiplerde kalsın.
```
