# 09 — Firma Override Veri Modeli (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Firmanın sistem katalog kodlarını, size formatlarını ve template davranışını
değiştirebilmesi için veri modelini tanımla. Override'lar katman bazında (eleman tipi,
tipoloji, size format, separator) çalışır; precedence kuralları net olmalı.

AMAÇ:
Firma her şeyi silbaştan tanımlamasın; sistem default sağlasın, sadece farklı olan noktalarda
override yazsın. Override yoksa sistem default'u kullanılır.

OVERRIDE SCOPE'LARI (4 adet):

1. element_type — eleman tipi kodu override
   - refId: ElementTypeCatalog.id (örn. 'col')
   - customCode: string (örn. 'KL' → 'COL')

2. typology — tipoloji kodu override
   - refId: Typology.id (örn. 'col-rect')
   - customCode: string (örn. 'RECT' → 'R')

3. size_format — size format default değiştirme
   - refId: Typology.id (hangi tipoloji için değişecek)
   - customSizeFormatId: SizeFormat.id (hangi format kullanılacak)

4. separator — template içindeki ayraç override
   - refId: '__template__' (global) veya FirmNamingTemplate.id (belirli bir template için)
   - customSeparator: string

FirmCodeOverride ŞEMASI:
```typescript
{
  id: string,
  firmId: string,
  scope: 'element_type' | 'typology' | 'size_format' | 'separator',
  refId: string,                    // scope'a göre değişir
  customCode?: string,              // element_type/typology/separator için
  customSizeFormatId?: string,      // size_format için
  active: boolean,                  // geçici kapatma
  createdAt: string,
  updatedAt: string,
  notes?: string                    // 'Müşteri X için özel' gibi
}
```

PRECEDENCE ZİNCİRİ (yukarıdan aşağı):

```
ProjectLevelOverride (opsiyonel) →
FirmLevelOverride (active=true) →
SystemDefault (catalog)
```

Çözüm fonksiyonu (pseudocode):
```
function resolveCode(scope, refId, firmId, projectId) {
  // 1. Proje bazlı override var mı (gelecek özellik)?
  const projOv = projectOverrides.find(o =>
    o.projectId === projectId && o.scope === scope && o.refId === refId && o.active
  );
  if (projOv) return projOv.customCode;

  // 2. Firma bazlı override var mı?
  const firmOv = firmOverrides.find(o =>
    o.firmId === firmId && o.scope === scope && o.refId === refId && o.active
  );
  if (firmOv) return firmOv.customCode;

  // 3. Sistem default
  if (scope === 'element_type') return elementTypeCatalog.find(e => e.id === refId)?.defaultCode;
  if (scope === 'typology') return typologyCatalog.find(t => t.id === refId)?.defaultCode;
  // ...
}
```

ÇAKIŞMA DURUMLARI:
- Aynı firma için aynı scope+refId çifti iki aktif override → hata; UI'da son yazılan kazansın
  veya unique constraint ile engelle.
- Override silinirse → defaultCode geri döner (silent, history tutulabilir).
- System catalog güncellemesi override'ı etkilemez; override aynı refId'ye bağlı olduğu
  sürece çalışmaya devam eder. Eğer refId'deki item silinirse → override orphan olur,
  cleanup gerekir.

FIRMA PROFİLİ ŞEMASI (override'ları barındıran üst konteyner):
```typescript
{
  id: string,
  name: string,
  slug: string,                   // URL-safe
  unitSystem: 'metric' | 'imperial' | 'mixed',
  defaultTemplateId: string,      // FirmNamingTemplate.id
  firmCodePrefix?: string,        // FIRM_CODE token için değer (örn. 'XY', 'ACME')
  active: boolean,
  createdAt: string,
  updatedAt: string
}
```

3 MOCK FİRMA PROFİLİ SENARYOSU:

### Firma A — "XY Prefab" (Türk, metrik, sade)
```json
{
  "firm": {
    "id": "firm-xy",
    "name": "XY Prefab",
    "slug": "xy-prefab",
    "unitSystem": "metric",
    "firmCodePrefix": "XY",
    "defaultTemplateId": "tmpl-xy-default"
  },
  "overrides": [
    // Sistem default'ları kullanır; sadece FIRM_CODE token ekler.
    // override yok
  ],
  "template": {
    "id": "tmpl-xy-default",
    "name": "Varsayılan",
    "tokens": [
      { "token": "FIRM_CODE", "enabled": true, "order": 1 },
      { "token": "FAMILY_CODE", "enabled": true, "order": 2 },
      { "token": "SIZE", "enabled": true, "order": 3 },
      { "token": "SEQUENCE", "enabled": true, "order": 4 }
    ],
    "separator": "-",
    "sizeConcat": false
  },
  "exampleOutput": "XY-KL-500-001"
}
```

### Firma B — "ACME Precast" (Global, imperial Çift-T, özel kod)
```json
{
  "firm": {
    "id": "firm-acme",
    "name": "ACME Precast",
    "slug": "acme-precast",
    "unitSystem": "imperial",
    "firmCodePrefix": "ACME",
    "defaultTemplateId": "tmpl-acme-default"
  },
  "overrides": [
    { "id": "ov-1", "firmId": "firm-acme", "scope": "element_type", "refId": "col", "customCode": "COL", "active": true },
    { "id": "ov-2", "firmId": "firm-acme", "scope": "element_type", "refId": "beam", "customCode": "BM", "active": true },
    { "id": "ov-3", "firmId": "firm-acme", "scope": "typology", "refId": "col-rect", "customCode": "R", "active": true },
    { "id": "ov-4", "firmId": "firm-acme", "scope": "size_format", "refId": "slab-dt", "customSizeFormatId": "dt_us_format", "active": true }
  ],
  "template": {
    "id": "tmpl-acme-default",
    "tokens": [
      { "token": "PROJECT_CODE", "enabled": true, "order": 1 },
      { "token": "FAMILY_CODE", "enabled": true, "order": 2 },
      { "token": "TYPOLOGY_CODE", "enabled": true, "order": 3 },
      { "token": "SIZE", "enabled": true, "order": 4 },
      { "token": "SEQUENCE", "enabled": true, "order": 5, "padding": 4 },
      { "token": "REVISION", "enabled": true, "order": 6 }
    ],
    "separator": "-",
    "sizeConcat": false,
    "sequencePadding": 4
  },
  "exampleOutput": "PRJ-14-COL-R-5-D40-0001-R0"
}
```

### Firma C — "Cemre Kompakt" (sektörel kısa mark geleneği)
```json
{
  "firm": {
    "id": "firm-cemre",
    "name": "Cemre Beton",
    "slug": "cemre-beton",
    "unitSystem": "metric",
    "firmCodePrefix": "",
    "defaultTemplateId": "tmpl-cemre-kompakt"
  },
  "overrides": [
    { "id": "ov-c1", "firmId": "firm-cemre", "scope": "separator", "refId": "__template__", "customCode": "-", "active": true }
  ],
  "template": {
    "id": "tmpl-cemre-kompakt",
    "name": "Saha Kısa",
    "tokens": [
      { "token": "FAMILY_CODE", "enabled": true, "order": 1 },
      { "token": "SIZE", "enabled": true, "order": 2 },
      { "token": "SEQUENCE", "enabled": true, "order": 3 }
    ],
    "separator": "-",
    "sizeConcat": true,      // KL500 bitişik
    "sequencePadding": 3
  },
  "exampleOutput": "KL500-001"
}
```

UI DURUM YÖNETİMİ NOTU:
- Override listesi firma bazlı; aktif firma değişince liste güncellenir.
- UI'da "Varsayılan" ve "Değiştirilmiş" olarak iki sütun: default kod + custom kod.
- Reset butonu → override kaydı silinir, sistem default'una döner.
- Inline edit: tıklanabilir hücre, Enter/Escape ile commit/cancel.
- Toplu import/export: JSON dosyası ile override seti paylaşılabilir.

İSTENEN ÇIKTI:
1. FirmCodeOverride ve FirmProfile TypeScript tip önerileri.
2. Precedence zinciri açıklaması + pseudocode resolver.
3. 3 firma senaryosunun tam JSON mock'u (XY, ACME, Cemre).
4. Örnek override iş akışı:
   - Firma ACME kolon koduna 'COL' override ekler → resolveCode('element_type', 'col', 'firm-acme')
     → 'COL' döner; sistem default 'KL' değil.
5. Precedence diagram (Mermaid):
   ```
   Request → Project Override? → Firm Override? → System Default
                    yes ↓            yes ↓           always ↓
                  return         return          return
   ```
6. Çakışma çözüm kuralları.
7. Override delete akışı (cascade efekti).

P0:
- FirmCodeOverride + FirmProfile şemaları.
- 3 firma mock senaryosu (tam JSON).
- Precedence resolver pseudocode.

P1:
- Çakışma kuralları.
- UI durum yönetimi notu.
- Toplu import/export fikri.

P2:
- Proje-level override (firma üzeri geçici override) — şimdilik opsiyonel; faz 2'de uygulanabilir.
- Override geçmişi (audit log) — kim ne zaman değiştirdi.
- Şablon mirası: firma parent-child ilişkisi (holding → alt firma).

AÇIK SORULAR:
1. Override geçmişi tutulmalı mı? MVP'de gereksiz ama enterprise'da gerekir.
2. Aynı firmanın farklı projelerde farklı override'lar kullanması gerekebilir.
   Project-level override phase 1'e mi dahil yoksa faz 2'ye mi?
3. Override JSON export/import hangi formatta olmalı (pure JSON, ZIP bundle, CSV)?
4. Firma profili silinirse override'lar ne olur? Soft delete vs hard delete.
5. System catalog güncellemesi (sistem default'unun değişmesi) override'ları etkilemez mi?
   Örn. sistem 'KL' → 'K' güncelledi, ACME override 'COL' hâlâ 'COL' görünür mü? Evet; override
   explicit, catalog update onu etkilemez.
```
