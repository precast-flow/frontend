# 15 — Mevcut Kod Entegrasyon Planı (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Mevcut frontend kod tabanına (özellikle parametric3d/types.ts ve
manualPieceTemplateStudio/types.ts) bu yeni kimlik sistemini entegre etmek için
ADIM ADIM değişiklik listesi + migration notu + yeni dosya planı. Gerçek kod
değil; migration stratejisi ve dosya görevlendirmesi.

KONTEKST — MEVCUT KOD DURUMU:

### frontend/src/parametric3d/types.ts (schemaVersion '1.0')
Mevcut:
- ElementFamily: 'COLUMN' | 'BEAM' | 'CULVERT' | 'PANEL' | 'PROFILE_WALL'
- variantCode string (örn. 'T1-DIKDORTGEN')
- Params union: ColumnParams | BeamParams | CulvertParams | PanelParams | ProfileWallParams
- SavedDesign: parametrik tasarım kayıtları localStorage'da

### frontend/src/components/manualPieceTemplateStudio/types.ts
Mevcut:
- PieceMarkTemplate: { id, location, pieceMark, productCategory, productCode, crossSection, ... }
- ProductionInstanceRow: { id, guid, ctrlNum, pieceSn, ... }
- ProductionPiece: { id, jobId, templateId, productCategory, productCode, pieceMark, ... }
- Pek çok header alanı (lengthFt, widthIn, depthFrac, ...) imperial birimle uyumlu

### frontend/src/components/muhendislikOkan/standardItemsAssemblies/
- standardItemsAssembliesMock.ts: mock data for StandardItemsAssemblies module.

Bu entegrasyon bu üç noktada değişiklik gerektiriyor.

---

## A. parametric3d/types.ts DEĞİŞİKLİKLERİ

### A.1 schemaVersion '2.0' geçişi
- Mevcut `'1.0'` literal değeri `'1.0' | '2.0'` union'a genişletilir.
- Yeni alanlar sadece '2.0' altında zorunlu; '1.0' kayıtlar geriye uyumlu kalır.
- Migration helper: `upgradeToV2(payload: ParametricPayload): ParametricPayload` — eski
  kayıtları v2'ye dönüştürür.

### A.2 ElementFamily union genişletme
Eski:
```
ElementFamily = 'COLUMN' | 'BEAM' | 'CULVERT' | 'PANEL' | 'PROFILE_WALL'
```

Yeni (ElementTypeCatalog ile hizalı):
```
ElementFamily =
  | 'COLUMN' | 'BEAM' | 'SLAB' | 'WALL'
  | 'STAIR' | 'LANDING' | 'CORBEL' | 'SOCKET' | 'TRUSS'
  | 'CULVERT' | 'PROFILE_WALL'       // geriye uyumluluk
```

NOT: PANEL → WALL olarak yeniden adlandırılabilir; PANEL'in PanelKind ('WALL'|'SLAB') ayrımı
artık iki farklı elementFamily olur. Migration script: PANEL + panelKind 'WALL' → WALL;
PANEL + panelKind 'SLAB' → SLAB.

### A.3 Yeni alanlar ParametricPayload içinde (schemaVersion '2.0')
```typescript
type ParametricPayload = {
  schemaVersion: '1.0' | '2.0'
  elementFamily: ElementFamily
  variantCode: string
  unit: 'mm'
  panelKind?: PanelKind

  // YENİ — Katalog referansı (2.0)
  elementTypeId?: string      // 'col' | 'beam' | ...
  typologyId?: string          // 'col-rect' | 'beam-t' | ...

  // YENİ — Kaynak kimliği (2.0)
  sourceSystem?: SourceSystem
  sourceGuid?: string
  sourceName?: string

  parameters: ParametricParameters
}
```

### A.4 Parametrik tip eşleme tablosu (katalog → params)

| typologyId | ParametricParameters tipi |
|------------|---------------------------|
| col-rect | ColumnParams (mevcut) |
| col-circ | CircularColumnParams (yeni) |
| col-crb | CorbelColumnParams (yeni) |
| col-frk, col-tpr, col-hol, col-pil, col-arc, col-sqr | ColumnVariantParams (yeni) |
| beam-rect | BeamParams (mevcut) |
| beam-t, beam-it, beam-l, beam-u, beam-i, beam-box, beam-y, beam-ig, ... | BeamVariantParams (yeni) |
| slab-hc | HollowCoreParams (yeni) |
| slab-dt | DoubleTeeParams (yeni) |
| slab-sol, slab-fil, slab-rib, slab-rf, slab-st | SlabVariantParams (yeni) |
| wall-sol, wall-swp, wall-fac, wall-gfr, wall-shr, wall-prt, wall-prp, wall-rtn | WallPanelParams (PanelParams evrimi) |
| wall-l, wall-u | ProfileWallParams (mevcut — sadece rename) |
| stair-str, stair-l, stair-u, stair-spr | StairFlightParams (yeni) |
| landing-rect, landing-l | LandingParams (yeni) |
| corbel-rect, corbel-tpr | CorbelParams (yeni) |
| socket-cup | SocketFootingParams (yeni) |
| truss-flt, truss-y, truss-gbl | TrussParams (yeni) |

### A.5 defaultPayload() genişletilmesi
Her yeni elementFamily için default parametre seti tanımla.

---

## B. manualPieceTemplateStudio/types.ts DEĞİŞİKLİKLERİ

### B.1 PieceMarkTemplate genişletme

Mevcut alanlar korunur (geriye uyumluluk). Yeni alanlar eklenir:

```typescript
type PieceMarkTemplate = {
  // MEVCUT ALANLAR (hepsi korunur)
  id: string
  location: string
  pieceMark: string         // → Katman 3 (instance mark) yerini alacak
  description: string
  productCategory: string   // → ElementType referansı (legacy string + yeni FK)
  productCode: string       // → Typology referansı (legacy string + yeni FK)
  crossSection: string
  active: boolean
  header: { ... }
  materialItems: TemplateMaterialRow[]
  materialAssemblies: TemplateAssemblyRow[]
  costs: CostRow[]

  // YENİ ALANLAR (opsiyonel; migration'da dolu olmayabilir)
  elementTypeId?: string          // catalog ref
  typologyId?: string             // catalog ref
  firmId?: string                 // firma referansı
  sourceSystem?: SourceSystem
  sourceGuid?: string
  sourceName?: string
  sourceFile?: string
  importDate?: string
  namingTemplateId?: string       // hangi template ile üretildi
  sequence?: number
  revision?: number
}
```

### B.2 ProductionInstanceRow zenginleştirme

Mevcut `guid` alanı zaten var — bu doğrudan `sourceGuid` olarak kullanılabilir veya
ayrı `sourceGuid` field eklenir.

```typescript
type ProductionInstanceRow = {
  // MEVCUT
  id: string
  status: string
  ctrlNum: string
  pieceSn: string
  guid: string               // instance GUID (mevcut); uuid v4
  // ...

  // YENİ (opsiyonel)
  sourceGuid?: string         // IFC GUID (mevcut guid'den ayrı)
  sourceSystem?: SourceSystem
  sourceName?: string
}
```

NOT: Mevcut `guid` alanı instance-level sistem UUID'si; `sourceGuid` CAD'den gelen IFC GUID.
İkisi farklı; karıştırılmamalı.

### B.3 ProductionPiece genişletme
Aynı desen — mevcut alanlar korunur, yeni kimlik alanları eklenir.

### B.4 pieceMark üretim akışı
Mevcut: Manuel yazılıyor.
Yeni: Name Resolver ile otomatik üretiliyor.
- PieceMarkTemplate.pieceMark — optional manual override; dolu ise auto-generate yerine kullan.
- Auto-generate durumunda Name Resolver çağrılır; elementTypeId + typologyId + firmId + projectId + sequence girdileri kullanılır.

---

## C. YENİ DOSYA LİSTESİ

Phase 2 uygulama fazında oluşturulacak dosyalar:

### C.1 Katalog dosyaları (immutable sistem data)
```
frontend/src/catalog/
├── elementTypeCatalog.ts         # 9 ElementTypeCatalog kaydı (kolon, kiriş, ...)
├── typologyCatalog.ts            # 45+ Typology kaydı (col-rect, beam-t, ...)
├── identifyingDimensions.ts      # IdentifyingDimension kataloğu
├── sizeFormats.ts                # SizeFormat kataloğu
├── ifcMappingRules.ts            # IfcMappingRule kayıtları
└── index.ts                      # re-export
```

### C.2 Firma katmanı (mutable, localStorage/backend)
```
frontend/src/firm/
├── firmProfile.ts                # FirmProfile store + default
├── firmCodeOverride.ts           # override CRUD
├── namingTemplate.ts             # FirmNamingTemplate CRUD
├── nameResolver.ts               # instance mark üretim fonksiyonu
└── codeResolver.ts               # resolveCode(scope, refId, firmId, projectId)
```

### C.3 Proje elementleri
```
frontend/src/project/
├── projectElement.ts             # ProjectElement store + CRUD
├── sequenceCounter.ts            # ProjectSequenceCounter store
└── projectElementRevision.ts     # revision geçmişi
```

### C.4 IFC import
```
frontend/src/ifc/
├── ifcParser.ts                  # mock (Phase 2); web-ifc entegre (Phase 3)
├── ifcMapper.ts                  # mapping engine (rule + heuristic)
├── dimensionExtractor.ts         # shape → identifyingDimensions
└── pset.ts                       # property set → attributes
```

### C.5 UI components
```
frontend/src/components/namingSettings/
├── NamingConventionsPage.tsx     # /settings/naming-conventions
├── ElementTypesOverrideTable.tsx
├── TypologiesOverrideTable.tsx
├── SizeFormatsTable.tsx
├── FirmProfileForm.tsx
└── LivePreviewPanel.tsx

frontend/src/components/namingTemplateBuilder/
├── TemplateBuilderPage.tsx       # /settings/naming-template
├── TokenPalette.tsx
├── ActiveTemplateList.tsx
├── LivePreviewCards.tsx
└── GlobalOptionsBar.tsx

frontend/src/components/ifcImport/
├── IfcImportWizard.tsx           # /projects/{id}/elements/import
├── Step1UploadPanel.tsx
├── Step2MappingReview.tsx
├── Step3ConfirmImport.tsx
└── MappingRow.tsx
```

---

## D. MIGRATION STRATEJİSİ

### D.1 parametric3d SavedDesign migration
- localStorage key `precast-parametric-designs-v1` okunur.
- Her design için schemaVersion kontrol:
  - '1.0' → `upgradeToV2()` çalıştır; elementFamily'ye göre elementTypeId + typologyId auto-tahmin.
  - '2.0' → olduğu gibi kal.
- Yeni key: `precast-parametric-designs-v2` altında yazılır; v1 silinmez (geri dönüş için).

Auto-eşleme mapping (v1 variantCode → v2 typologyId):
```
'T1-DIKDORTGEN' → col-rect
'RECT_PRISM'    → beam-rect
'T3-BOX-KAPALI' → (culvert — altyapı; Phase 2'de ayrı)
'T4-DUZ-LEVHA'  → wall-sol (panelKind='WALL') veya slab-sol (panelKind='SLAB')
'T5-L-KOSE'     → wall-l (profileType='L')
'T5-U-KOSE'     → wall-u (profileType='U')
```

### D.2 PieceMarkTemplate migration
- Mevcut `productCategory` + `productCode` + `crossSection` string değerleri katalog'a mapping tablosu ile çözülür.
- Bulunamayan kayıtlar draft status'a alınır; manuel mapping istenir.
- sourceSystem='MANUAL' default; sourceGuid uuid v4 ile üretilir.

### D.3 Geriye uyumluluk notu
- Yeni alanlar TÜMÜ opsiyonel; eski kod çalışmaya devam eder.
- Legacy string alanlar ('productCode', 'productCategory') korunur; yeni FK (elementTypeId, typologyId) paralel yürür.
- İlerde legacy string'ler deprecated olabilir; refactor ile kaldırılır.

---

## E. UYGULAMA SIRASI (Phase 2)

1. **Katalog dosyalarını oluştur** (C.1) — master listelerden statik veri.
2. **Firma katmanını oluştur** (C.2) — override + template + resolver.
3. **localStorage stores** (FirmProfile, FirmCodeOverride, FirmNamingTemplate, ProjectSequenceCounter).
4. **Migration helper** — eski parametric3d kayıtlarını v2'ye dönüştür.
5. **parametric3d/types.ts genişletme** (A bölümü).
6. **manualPieceTemplateStudio/types.ts genişletme** (B bölümü).
7. **UI — Naming Conventions ekranı** (C.5 ilk blok).
8. **UI — Template Builder** (C.5 ikinci blok).
9. **IFC Parser mock + Mapper** (C.4, ilk olarak mock veri).
10. **IFC Import Wizard** (C.5 üçüncü blok).
11. **End-to-end test mock veriyle**.
12. **Legacy migration script'i çalıştır** — kullanıcı verisini v2'ye taşı.

---

## F. RİSKLER VE AZALTMALAR

| Risk | Açıklama | Azaltma |
|------|----------|---------|
| Legacy veri kaybı | SavedDesign migration başarısız | v1 key silme; sadece v2'ye kopyala; rollback path |
| Name collision | İki eleman aynı instance mark üretirse | Sequence algoritması unique; double-check sorgusu |
| Override consistency | Firma override ile aktif proje çakışması | Resolver fonksiyonu tek doğru kaynak; test coverage şart |
| PieceMarkTemplate sayı büyüyor | UI performans | Virtual scroll; pagination |
| IFC parse browser limit | Büyük dosyalar | Web Worker; Streaming parse; server-side opsiyonu |

---

İSTENEN ÇIKTI:
1. parametric3d/types.ts değişiklik detay (schemaVersion, ElementFamily, yeni alanlar).
2. manualPieceTemplateStudio/types.ts değişiklik detay.
3. Yeni dosya ağacı (C bölümü tam).
4. Migration stratejisi (D bölümü tam).
5. Uygulama sırası (E bölümü — 12 adım).
6. Risk tablosu (F).

P0:
- parametric3d ve manualPieceTemplateStudio değişiklikleri.
- Yeni dosya ağacı.
- Migration stratejisi.

P1:
- Uygulama sırası (12 adım).
- Risk tablosu.

P2:
- Backend tarafı (eğer eklenirse) — DB schema / Prisma / REST endpoint önerileri.
- Test stratejisi (unit + e2e senaryoları).
- Feature flag stratejisi (v1/v2 paralel).

AÇIK SORULAR:
1. Mevcut `guid` alanı (ProductionInstanceRow) instance GUID mi IFC GUID mi? Kod tabanında
   tarama yap; karışıklık varsa ikisini ayır.
2. productCategory/productCode legacy string alanlar deprecated edilecek mi?
   Geriye uyumluluk için ne kadar süre destekleyeceğiz?
3. Migration script kullanıcı tetiklemeli (manuel) mi otomatik mi (açılışta)?
   Öneri: otomatik + rollback link (ilk 7 gün v1 key saklı).
4. Backend eklenecek mi (Supabase / Prisma)? Firma override ve proje verisi localStorage için büyük olabilir.
5. Name resolver çağrısı senkron mu async mi? Sequence counter concurrent ortamda atomik
   olmalı; localStorage'da single-tab yeterli ama multi-tab'da race var.
```
