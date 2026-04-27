# 02 — Sistem Katalog Veri Modeli (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Üst yapı kimlik sistemi için TypeScript TİP ŞEMALARINI öner. Bu dosya YALNIZCA tip/şema
tasarımı üretir; implementation (fonksiyon, store, hook) YOKTUR. Her tip için alan listesi,
zorunluluk, örnek değer, ilişkiler (FK mantığı), ve kısa açıklama verilecek.

KAPSAM — ÖNERECEĞİN TİPLER:

1) Sistem Kataloğu (immutable, uygulamanın sabit verisi)
   - ElementTypeCatalog
   - Typology
   - IdentifyingDimension
   - SizeFormat (enum + metadata)
   - IfcMappingRule

2) Firma Katmanı (firma bazlı override, localStorage / backend'te saklanır)
   - FirmProfile
   - FirmCodeOverride
   - FirmNamingTemplate
   - NamingTokenConfig (template içindeki tek token ayarı)
   - NamingToken (enum)

3) Proje Instance (gerçek eleman kayıtları)
   - ProjectElement
   - ProjectElementRevision (revizyon tarihçesi)
   - ProjectSequenceCounter (sequence yönetimi)

4) Enum'lar ve sabitler
   - ElementCategory ('superstructure' | 'substructure' | 'industrial' | 'architectural')
   - SourceSystem
   - IfcClassName
   - IfcPredefinedType (union)

DETAYLI GEREKSİNİMLER:

### ElementTypeCatalog
Ana eleman tipleri (Kolon, Kiriş, Döşeme, Duvar, Merdiven, Sahanlık, Konsol, Soket, Makas).
Alanlar:
- id (string, kebab-case, örn: 'col')
- nameTr, nameEn (string)
- defaultCode (string, sektörel varsayılan; firma override edebilir)
- ifcClass (IfcClassName)
- defaultIfcPredefinedType (opsiyonel)
- category (ElementCategory; phase 1'de hep 'superstructure')
- order (number, UI sıralama için)
- description (opsiyonel string)
- allowedTypologies (Typology.id[] — referans tutarlılığı için)

### Typology
Eleman tipinin alt kategorisi (Dikdörtgen Kolon, T Kiriş, Hollow Core Slab vb.).
Alanlar:
- id (string, örn: 'col-rect')
- elementTypeId (FK → ElementTypeCatalog.id)
- nameTr, nameEn
- defaultCode (firma override edebilir)
- ifcPredefinedType (opsiyonel; element type'ın default'unu override eder)
- ifcObjectType (opsiyonel, USERDEFINED durumları için string)
- identifyingDimensions (IdentifyingDimension.id[])
- defaultSizeFormatId (SizeFormat.id — SIZE token'ının nasıl üretileceği)
- geometryHint (opsiyonel; parametric3d motoruyla eşleşir)
- notes (opsiyonel)

### IdentifyingDimension
Tanımlayıcı boyut tanımları (height, sectionWidth, span, thickness, diameter, vb.).
Alanlar:
- id (string, camelCase)
- nameTr, nameEn
- unit ('mm' | 'cm' | 'm' | 'in' | 'ft')
- required (boolean)
- description (opsiyonel)

### SizeFormat
SIZE token'ının nasıl üretileceğini tanımlar (örn. 'length_m' → değer mm'den m'ye çevrilip yuvarlanır).
Alanlar:
- id ('length_m' | 'length_cm' | 'section_wxh' | 'width_ft_depth_in' | 'span_cm_section' | 'length_height' | ...)
- nameTr, nameEn
- inputs (IdentifyingDimension.id[] — hangi boyutları kullandığı)
- outputTemplate (string, örn. '{length/1000}' veya '{sectionWidth}x{sectionDepth}')
- separator (opsiyonel)
- paddingRules (opsiyonel — sıfır doldurma kuralları)

### IfcMappingRule
IFC entity + predefined type → sistem tipi eşlemesi.
Alanlar:
- id
- ifcClass (IfcClassName)
- ifcPredefinedType (opsiyonel)
- ifcObjectType (opsiyonel — USERDEFINED özel adı)
- heuristic (opsiyonel; örn. "slab_has_cores" → HollowCore)
- systemElementTypeId (FK)
- systemTypologyId (opsiyonel FK — heuristik yoksa)
- priority (number — çakışan kurallar için)

### FirmProfile
Her firmanın ayarlar kök kaydı.
Alanlar:
- id
- name
- defaultTemplateId (FK → FirmNamingTemplate)
- activeOverridesId (FK → kod override seti)
- unitSystem ('metric' | 'imperial' | 'mixed')
- createdAt / updatedAt

### FirmCodeOverride
Firmanın sistem kodunu değiştirmesi.
Alanlar:
- id
- firmId (FK)
- scope ('element_type' | 'typology' | 'size_format' | 'separator')
- refId (scope'a göre: ElementTypeCatalog.id | Typology.id | SizeFormat.id | '__template__')
- customCode (string)
- active (boolean — geçici olarak kapatılabilir)

Precedence (kullanım sırası):
- Proje-level override (proje ayarı) > Firma-level override > Sistem default.

### FirmNamingTemplate
Token sırası ve her token'ın ayarı.
Alanlar:
- id
- firmId (FK)
- name (örn. 'Varsayılan', 'Müşteri X için')
- tokens (NamingTokenConfig[])
- separator (string, varsayılan '-')
- sizeConcat (boolean — SIZE ile ayraçsız birleşsin mi, örn. 'KL500' vs 'KL-500')
- sequencePadding (number, varsayılan 3 → '001')
- revisionPrefix (string, varsayılan 'R' → 'R0', 'R1')

### NamingTokenConfig
Template içindeki tek token ayarı.
Alanlar:
- token (NamingToken)
- enabled (boolean)
- order (number)
- prefix (opsiyonel — token değeri başına eklenir)
- suffix (opsiyonel)
- formatId (opsiyonel — token-specific format, örn. SIZE için SizeFormat.id)

### NamingToken (enum)
- 'FIRM_CODE'
- 'PROJECT_CODE'
- 'TYPOLOGY_CODE'
- 'FAMILY_CODE'
- 'VARIANT_CODE'
- 'SIZE'
- 'SEQUENCE'
- 'REVISION'

### ProjectElement
Gerçek eleman instance kaydı (mevcut PieceMarkTemplate / ProductionPiece ile uyumlu olmalı).
Alanlar:
- id (uuid)
- projectId, firmId
- elementTypeId, typologyId
- variantCode (opsiyonel)
- sourceSystem, sourceGuid, sourceName, sourceFile (opsiyonel)
- dimensions (Record<IdentifyingDimension.id, number>)
- sequence (number, projectSequenceCounter tarafından atanır)
- revision (number, 0-based)
- instanceMark (resolved string — name resolver çıktısı)
- attributes (Record<string, unknown>) — donatı, ankraj, yüzey, beton sınıfı, vs.
- status ('draft' | 'active' | 'archived')
- createdAt / updatedAt

### ProjectSequenceCounter
Sequence üretimi için.
Alanlar:
- id
- projectId
- scope: 'element_type' | 'typology' | 'type_and_size' (hangi grup içinde sıra artacak)
- scopeKey (computed: elementTypeId[-typologyId][-sizeSignature])
- currentValue (number)

### Enum'lar
- IfcClassName: 'IfcColumn' | 'IfcBeam' | 'IfcSlab' | 'IfcWall' | 'IfcStairFlight' | 'IfcFooting' | 'IfcMember' | 'IfcPlate' | 'IfcCovering'
- IfcPredefinedType: IFC 4.3.2 spec'teki union (Column/Beam/Slab/Wall/Stair için ayrı ayrı)
- SourceSystem: 'TEKLA' | 'REVIT' | 'ALLPLAN' | 'AUTOCAD' | 'MANUAL' | 'IFC_GENERIC'

ÇIKTI BEKLENTİSİ:
1. Her tip için TypeScript tip tanımı (type veya interface, implementasyon yok).
2. Her tipin AÇIKLAMA paragrafı (1-2 cümle).
3. Alan listesi TABLOSU (sütunlar: alan, tip, zorunlu, örnek, açıklama).
4. İlişki diyagramı (Mermaid ER veya class).
5. 2 mock JSON — bir ElementTypeCatalog kaydı (Kolon) + bir ProjectElement kaydı (Dikdörtgen Kolon instance).
6. Migration notu: mevcut PieceMarkTemplate'den ProjectElement'e geçiş nasıl olur (kısaca).

P0:
- ElementTypeCatalog, Typology, IdentifyingDimension, NamingToken, FirmNamingTemplate,
  FirmCodeOverride, ProjectElement tip şemaları.
- İlişki diyagramı.

P1:
- IfcMappingRule, SizeFormat, ProjectSequenceCounter.
- Migration notu.

P2:
- ProjectElementRevision (revizyon tarihçesi için ayrı model mi, yoksa ProjectElement içinde versions[]?).
- Çok-dilli alanlar için i18n stratejisi (nameTr/nameEn yerine nameI18n: Record<lang,string>?).

AÇIK SORULAR:
1. Katalog sistem tarafından güncellenebilir mi? Eğer evet, firma override'lar eski kataloğa
   bağlıysa ne olur? Migration scripti gerekir mi?
2. SizeFormat.outputTemplate için basit mustache syntax mi (`{height/1000}`) yoksa daha yapılandırılmış
   bir AST mi? Basit mustache MVP için yeterli olabilir.
3. ProjectSequenceCounter.scope'u firma default'unda belirlensin mi, yoksa template'e bağlı olsun mu?
4. attributes alanı tamamen serbest JSON mu, yoksa category bazlı schema registry mi olsun?
5. IfcMappingRule priority çakışmasında ne olur? İlk maç mi kazanır, yoksa en yüksek priority mi?
```
