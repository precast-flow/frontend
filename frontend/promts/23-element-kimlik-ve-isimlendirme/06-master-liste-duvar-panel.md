# 06 — Master Liste: DUVAR PANELİ (IfcWall) (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Prefabrik üst yapı DUVAR PANELİ tipolojilerinin master listesini belgele. Duvar panelleri
cephe, perde duvar, parapet, istinat gibi geniş bir yelpazede kullanılır; strüktürel olan ve
olmayan paneller ayrı IFC predefined type alır.

ANA ELEMAN TİPİ:
- id: 'wall'
- nameTr: 'Duvar Paneli'
- nameEn: 'Wall Panel'
- defaultCode: 'DP'  (firma override: 'WL', 'W', 'PNL', 'PAN' yaygın)
- ifcClass: 'IfcWall'
- defaultIfcPredefinedType: 'SOLIDWALL'
- category: 'superstructure'
- order: 40

TİPOLOJİ LİSTESİ (10 adet):

| # | id | nameTr | nameEn | defaultCode | IFC PredefinedType | Tanımlayıcı Boyutlar | Not |
|---|----|--------|--------|-------------|--------------------|----------------------|-----|
| 1 | wall-sol | Masif Duvar Paneli | Solid Wall Panel | SOL | SOLIDWALL | length, height, thickness | Taşıyıcı; tek katman |
| 2 | wall-swp | Sandviç Panel | Sandwich Wall Panel | SWP | SOLIDWALL | length, height, innerThickness, coreThickness, outerThickness | İç + yalıtım + dış; yaygın cephe |
| 3 | wall-fac | Mimari Cephe Paneli | Architectural Facade | FAC | USERDEFINED ('FacadePanel') | length, height, thickness, surfaceFinish | Dekoratif kaplama; taşıyıcı değil |
| 4 | wall-gfr | GFRC / GRC Panel | GFRC / GRC Panel | GFR | USERDEFINED ('GFRC') | length, height, shellThickness, ribThickness | Cam elyaf takviyeli; ince kabuk |
| 5 | wall-shr | Perde Duvar | Shear Wall Panel | SHR | SHEAR | length, height, thickness | Yanal yük taşıyıcı |
| 6 | wall-prt | Bölme Duvar | Partition Wall | PRT | PARTITIONING | length, height, thickness | Taşıyıcı olmayan iç bölme |
| 7 | wall-prp | Parapet | Parapet Panel | PRP | PARAPET | length, height, thickness | Çatı/kat üstü koruma |
| 8 | wall-rtn | İstinat Paneli | Retaining Wall Panel | RTN | RETAININGWALL | length, height, thickness, heelWidth, keyDepth | Toprak basıncına dayanıklı |
| 9 | wall-l | L Profil Duvar | L-Profile Wall | L | USERDEFINED ('LProfileWall') | extrusionHeight, legA, legB, thickness | Köşe duvar; iki bacaklı |
| 10 | wall-u | U Profil Duvar | U-Profile Wall | U | USERDEFINED ('UProfileWall') | extrusionHeight, legA, legB, legC, thickness | Üç bacaklı; hazne/oda |

MOCK JSON ŞABLONU:
```json
{
  "typology": {
    "id": "wall-swp",
    "elementTypeId": "wall",
    "nameTr": "Sandviç Panel",
    "nameEn": "Sandwich Wall Panel",
    "defaultCode": "SWP",
    "ifcPredefinedType": "SOLIDWALL",
    "identifyingDimensions": ["length", "height", "innerThickness", "coreThickness", "outerThickness"],
    "defaultSizeFormatId": "length_height_thickness_total",
    "geometryHint": {
      "type": "layered_extrusion",
      "axis": "Z",
      "layers": ["inner", "core", "outer"]
    },
    "notes": "Ortasında yalıtım çekirdeği (PU, EPS, XPS, mineral yün). Toplam kalınlık genellikle 150-300mm. En yaygın cephe paneli tipi."
  }
}
```

ÖZEL DİKKAT — SANDVİÇ PANEL (wall-swp):
- 3 katmanlı: iç beton + yalıtım çekirdeği + dış beton.
- Tanımlayıcı boyutlar: her katman kalınlığı ayrı (innerThickness, coreThickness, outerThickness).
- Toplam kalınlık = inner + core + outer (türetilmiş).
- Çekirdek malzemesi attribute'da ('PU' | 'EPS' | 'XPS' | 'MineralWool').
- İç/dış kat bağlantısı (connector type) attribute'da.
- IFC PredefinedType: SOLIDWALL yeterli; yalıtım bilgisi Pset'te.

ÖZEL DİKKAT — GFRC PANEL (wall-gfr):
- İnce (10-25mm) kabuk + arka destek (ribbed back).
- shellThickness (kabuk) + ribThickness (destek nervür) ayrı.
- Cam elyaf takviyeli; düşük ağırlık (20-40 kg/m²).
- IFC USERDEFINED + ObjectType 'GFRC'.

ÖZEL DİKKAT — MİMARİ CEPHE (wall-fac):
- Taşıyıcı değil; sadece kaplama.
- surfaceFinish attribute: 'smooth' | 'exposed_aggregate' | 'sandblasted' | 'acid_etched' | 'brick_clad' | 'stone_clad'.
- Renk ve doku varyasyonu için ek attribute field ('color', 'texture').
- Bazı firmalarda 'architectural_skin_element' olarak anılır.

ÖZEL DİKKAT — İSTİNAT (wall-rtn):
- Kategori ikilemi: üst yapı mı altyapı mı? Sınır durumda.
- Toprak basıncına dayanıklı; heelWidth (taban çıkıntısı) ve keyDepth (kilit) identifying.
- Bu pakette üst yapı altında kalsın (site retaining walls); altyapı fazında tekrar değerlendirilebilir.

ÖZEL DİKKAT — L / U PROFİL DUVAR (wall-l, wall-u):
- Extrusion-based geometri; parametric3d'deki ProfileWall ile aynı mantık.
- Bacak uzunlukları (legA, legB, legC) ve duvar kalınlığı identifying.
- Mevcut parametric3d/types.ts'deki ProfileWallParams ile bire bir eşleşir.

İSTENEN ÇIKTI:
1. 10 tipoloji için tam mock JSON kayıtları.
2. Sandviç panel için çekirdek malzemesi enum önerisi.
3. Mimari cephe için surfaceFinish enum önerisi.
4. Tanımlayıcı boyut eklentileri:
   - innerThickness, coreThickness, outerThickness (sandviç için)
   - shellThickness, ribThickness (GFRC için)
   - heelWidth, keyDepth (istinat için)
   - legA, legB, legC, extrusionHeight (L/U profil için)
5. Instance isim üretim senaryosu:
   - Sandviç panel, 6m × 3m × (6+10+8)cm, proje PRJ-2026-014, sequence 3, revision 0
   - Default: "PRJ-2026-014-DP-SWP-600-300-240-003-R0" (length-height-totalThickness)
   - Kompakt: "SWP6030-003"
6. IFC 4.3.2 IfcWallTypeEnum eşleşme tablosu:
   | Typology | IfcWallTypeEnum | Not |
   | wall-sol | SOLIDWALL | |
   | wall-swp | SOLIDWALL | Pset yalıtım bilgisi |
   | wall-fac | USERDEFINED | ObjectType 'FacadePanel' |
   | wall-gfr | USERDEFINED | ObjectType 'GFRC' |
   | wall-shr | SHEAR | |
   | wall-prt | PARTITIONING | |
   | wall-prp | PARAPET | |
   | wall-rtn | RETAININGWALL | |
   | wall-l | USERDEFINED | ObjectType 'LProfileWall' |
   | wall-u | USERDEFINED | ObjectType 'UProfileWall' |

AÇIKLIK (OPENING) VERİSİ:
Duvar panellerinde kapı/pencere açıklıkları tipoloji değil attribute:
- attributes.openings: [{ x, y, width, height, type: 'door' | 'window' | 'slot' }]
- Mevcut parametric3d'deki PanelOpening tipi ile uyumlu.

P0:
- Tablo (10 satır).
- 10 mock JSON kayıt.
- Tanımlayıcı boyut eklentileri.
- IfcWallTypeEnum eşleşme tablosu.

P1:
- Sandviç panel çekirdek/connector enum'ları.
- Mimari cephe yüzey enum'ları.
- Instance isim üretim senaryosu (3 varyasyon).
- Açıklık (opening) attribute modeli.

P2:
- Yalıtım performans sınıfları (lambda, R-değeri) attribute metadata.
- Mimari cephe için renk/doku/kaplama katalog entegrasyonu (ayrı materialCatalog).
- L/U profil duvar geometrisinin parametric3d'deki ProfileWallParams ile birleştirilmesi.

AÇIK SORULAR:
1. Sandviç panel: iç/dış katman beton sınıfı farklı olabilir → attribute'da ayrı mı tutulsun?
2. İstinat paneli üst yapı mı altyapı mı? Öneri: üst yapıda tutulsun (building site retaining);
   altyapı için ayrı tipoloji gerekirse faz 2'de.
3. Mimari cephe için 'curtain wall system' gibi montaj sistemi metadata'sı eklensin mi?
4. L/U profil duvar aslında mevcut parametric3d'deki PROFILE_WALL elementFamily ile
   örtüşüyor. Ayrı tipoloji mi yoksa aynı mı? Öneri: ayrı tipoloji (farklı elementType 'wall'
   altında); IFC mapping aynı noktaya gider.
5. Parapet vs Spandrel (söve kiriş): sınır durumu var mı? Spandrel taşıyıcı kiriş,
   parapet taşıyıcı olmayan duvar → net ayrım; sorun yok.
```
