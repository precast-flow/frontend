# 10 — İsimlendirme Template Motoru (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: ProjectElement.instanceMark alanını türeten NAME RESOLVER algoritmasını belgele.
Token sırası, her token'ın değer çözümü, minimum alan garantisi, sequence sayacı algoritması,
revizyon davranışı, validasyon kuralları ve 4 tam senaryo.

NOT: Bu dosya hâlâ prompt; gerçek kod Phase 2'de yazılacak. Pseudocode kabul edilir.

NAMING TOKEN'LARI (enum):
- FIRM_CODE
- PROJECT_CODE
- TYPOLOGY_CODE
- FAMILY_CODE
- VARIANT_CODE
- SIZE
- SEQUENCE
- REVISION

TOKEN RESOLVER (her token için ne dönmeli):

1) FIRM_CODE:
   - Kaynak: FirmProfile.firmCodePrefix
   - Boş string ise token skip edilir (ayraç çift gelmemeli).
   - Örnek: "ACME", "XY", ""

2) PROJECT_CODE:
   - Kaynak: Project.code (ProjectContext'ten)
   - Opsiyonel ama çok önerilir (benzersizlik için).
   - Örnek: "PRJ-2026-014", "14", "2026-014"

3) TYPOLOGY_CODE:
   - Kaynak: resolveCode('typology', projectElement.typologyId, firmId, projectId)
   - Override chain: project > firm > system.
   - Örnek: "RECT", "T", "HC", "SWP"

4) FAMILY_CODE:
   - Kaynak: resolveCode('element_type', projectElement.elementTypeId, firmId, projectId)
   - Örnek: "KL", "KR", "DS", "DP", "MR"

5) VARIANT_CODE:
   - Kaynak: projectElement.variantCode (opsiyonel string)
   - Geometrik varyant alt-alt tipi için (örn. col-crb'de 'LEFT' vs 'RIGHT' guse yönü).
   - Default: null/undefined → token skip.

6) SIZE:
   - Kaynak: generateSize(typology.defaultSizeFormatId OR override, projectElement.dimensions)
   - SizeFormat'ın outputTemplate'i çözülür.
   - Örnek: "500-40x40", "1200-30x60", "12DT28"

7) SEQUENCE:
   - Kaynak: allocateSequence(projectId, scopeKey)
   - scopeKey = örn. 'col-rect__500-40x40' (typology + size imzası) veya sadece 'col' (sade mod).
   - Padding: firmTemplate.sequencePadding (varsayılan 3).
   - Örnek: "001", "015", "0042" (padding 4)

8) REVISION:
   - Kaynak: projectElement.revision (number, 0-based).
   - Prefix: firmTemplate.revisionPrefix (varsayılan 'R').
   - Örnek: "R0", "R1", "R2", ".01", ".02"

RESOLVER ALGORİTMA (pseudocode):

```
function resolveInstanceMark(element: ProjectElement, template: FirmNamingTemplate, firm: FirmProfile, project: Project): string {
  const tokens = template.tokens
    .filter(t => t.enabled)
    .sort((a, b) => a.order - b.order);

  const values: string[] = [];

  for (const tokenConfig of tokens) {
    const raw = resolveTokenValue(tokenConfig.token, element, firm, project);
    if (!raw && raw !== 0) continue;   // skip empty

    let formatted = applyFormat(raw, tokenConfig);
    if (tokenConfig.prefix) formatted = tokenConfig.prefix + formatted;
    if (tokenConfig.suffix) formatted = formatted + tokenConfig.suffix;
    values.push(formatted);
  }

  // Size concat logic
  if (template.sizeConcat) {
    return mergeSizeConcat(values, template.tokens, template.separator);
  }

  return values.join(template.separator);
}

function resolveTokenValue(token, element, firm, project) {
  switch (token) {
    case 'FIRM_CODE':     return firm.firmCodePrefix;
    case 'PROJECT_CODE':  return project.code;
    case 'TYPOLOGY_CODE': return resolveCode('typology', element.typologyId, firm.id, project.id);
    case 'FAMILY_CODE':   return resolveCode('element_type', element.elementTypeId, firm.id, project.id);
    case 'VARIANT_CODE':  return element.variantCode;
    case 'SIZE':          return generateSize(
      resolveSizeFormat(element.typologyId, firm.id, project.id),
      element.dimensions
    );
    case 'SEQUENCE':      return padLeft(element.sequence, firm.template.sequencePadding);
    case 'REVISION':      return firm.template.revisionPrefix + element.revision;
  }
}
```

SIZE CONCAT (bitişik size) DAVRANIŞI:
- Sektörel "KL500" geleneği için.
- FAMILY_CODE ile SIZE arasında ayraç kalkar.
- Örn. tokens = [FAMILY, SIZE, SEQUENCE], separator='-', sizeConcat=true:
  - normal: "KL-500-001"
  - concat: "KL500-001"
- Algoritma: FAMILY sonrası SIZE geliyorsa iki token'ı doğrudan birleştir, ayraç koyma.

MİNİMUM ALAN GARANTİSİ:
Proje içinde benzersizlik için EN AZ şu token seti enabled olmalı:
- PROJECT_CODE veya FIRM_CODE (scope tanımı)
- FAMILY_CODE (ne tip olduğu)
- SEQUENCE (aynı tip içinde sıra)

Eğer bu minimum set eksikse → template validation hatası; kullanıcı uyarılır.

Tavsiye minimum: { PROJECT_CODE, FAMILY_CODE, SEQUENCE } — 3 token.
Kompakt minimum: { FAMILY_CODE, SEQUENCE } — 2 token (tek-projede).

SEQUENCE SCOPE STRATEJİLERİ:

İki strateji:

A) Type-and-size scoped (daha okunaklı isim):
   - scopeKey = `${elementTypeId}__${typologyId}__${sizeSignature}`
   - Örnek: "col__col-rect__500-40x40" için sayaç ayrı
   - Aynı tip + boyut kolonlar "KL-500-40x40-001, -002, -003" olarak sıralanır
   - Farklı boyutlu kolon "KL-400-30x30-001" diye başlar (kendi sayacı)
   - Avantaj: saha okunabilirliği; dezavantaj: karmaşık ayrı sayaçlar

B) Type-only scoped (basit):
   - scopeKey = `${elementTypeId}` sadece
   - Örnek: tüm kolonlar proje içinde "KL-001, KL-002, ... KL-050" sıralanır
   - Boyut fark etmez; tek sayaç.
   - Avantaj: sadelik; dezavantaj: isim boyut sırasına göre gruplaşmaz.

ÖNERİLEN DEFAULT: (B) Type-only scoped. Firmanın alışkanlığına göre override edilebilir.

SEQUENCE SAYACI ALGORİTMASI:

```
function allocateSequence(projectId, scopeKey): number {
  let counter = projectSequenceCounter.find(c => c.projectId === projectId && c.scopeKey === scopeKey);
  if (!counter) {
    counter = { projectId, scopeKey, currentValue: 0 };
    projectSequenceCounter.insert(counter);
  }
  counter.currentValue += 1;
  projectSequenceCounter.update(counter);
  return counter.currentValue;
}
```

- Silme sonrası sayaç GERİLEMEZ (hole'lu sıra olabilir).
- Bulk import'ta aynı scope'ta gelen N öğe için atomic increment x N.

REVISION AKIŞI:
- Yeni element → revision=0 (başlangıç).
- Element üzerinde önemli değişiklik (donatı değişti, boyut revizesi) → revision++.
- Instance mark'taki revision token otomatik güncellenir.
- Revizyon tarihçesi ayrı kayıtta (ProjectElementRevision) tutulabilir.

FORMAT OPERATÖRLERİ (token.prefix/suffix/padding harici):

- padding: int (sol sıfır doldurma, SEQUENCE için)
- prefix: string (token değeri başına; örn. VARIANT_CODE için 'V-')
- suffix: string
- format: string (özel format — örn. SIZE için SizeFormat.id)

VALIDASYON KURALLARI:

1. Token listesi boş ise → hata "En az 2 token gerekli".
2. Minimum alan seti eksik → uyarı (kullanıcı force edebilir ama risk gösterilir).
3. Aynı token iki kez enabled → hata "Duplicate token".
4. Separator boş string ise ve sizeConcat false ise → uyarı (tokenlar yapışır).
5. Separator özel karakter (/ \ : * ? " < > |) → filesystem-safe kontrol yap.
6. Uzun isim (> 64 char) → uyarı.
7. Üretilen isim zaten projede varsa (aynı sequence+scope) → hata; sequence++ ile retry.

4 TAM SENARYO:

### Senaryo 1 — Küçük firma, sade (XY Prefab)
Input:
- Element: col-rect, height=5000, sectionWidth=400, sectionDepth=400, sequence=1, revision=0
- Template: [FIRM_CODE, FAMILY_CODE, SIZE, SEQUENCE], sep='-', sizeConcat=false
- Firma: firmCodePrefix='XY'

Trace:
- FIRM_CODE='XY'
- FAMILY_CODE='KL' (sistem default)
- SIZE='500' (length_m → "5", ama length_cm → "500"; bu firmanın format'ı length_cm)
- SEQUENCE='001' (padding=3)
Output: "XY-KL-500-001"

### Senaryo 2 — Büyük firma, proje kodlu (ACME)
Input:
- Element: col-rect, height=5000, w=400, d=400, sequence=42, revision=0, variant=null
- Template: [PROJECT_CODE, FAMILY_CODE, TYPOLOGY_CODE, SIZE, SEQUENCE, REVISION], sep='-', padding=4
- Firma: override {col→'COL', col-rect→'R'}; format 'length_m_section_cm'
- Project: code='PRJ-2026-014'

Trace:
- PROJECT_CODE='PRJ-2026-014'
- FAMILY_CODE='COL' (override)
- TYPOLOGY_CODE='R' (override)
- SIZE='5-40x40'
- SEQUENCE='0042'
- REVISION='R0'
Output: "PRJ-2026-014-COL-R-5-40x40-0042-R0"

### Senaryo 3 — Sektörel kompakt (Cemre)
Input:
- Element: beam-t, span=12000, width=300, height=600, sequence=5
- Template: [FAMILY_CODE, SIZE, SEQUENCE], sep='-', sizeConcat=true
- Format: span_cm → "1200"

Trace:
- FAMILY_CODE='KR'
- TYPOLOGY_CODE (skip — enabled=false bu template'te)
- SIZE='1200'
- SEQUENCE='005'
- sizeConcat → FAMILY_CODE + SIZE birleşik
Output: "KR1200-005"

### Senaryo 4 — Firma özel prefix (Multi-firm)
Input:
- Element: wall-swp, length=6000, height=3000, inner=60, core=100, outer=80, sequence=7
- Template: [FIRM_CODE, PROJECT_CODE, FAMILY_CODE, TYPOLOGY_CODE, SIZE, SEQUENCE], sep='-'
- Firma: firmCodePrefix='FIB'; override typology wall-swp→'SAND'
- Format: length_height_thickness_total → "600-300-24"

Trace:
- FIRM_CODE='FIB'
- PROJECT_CODE='2026-33'
- FAMILY_CODE='DP'
- TYPOLOGY_CODE='SAND'
- SIZE='600-300-24'
- SEQUENCE='007'
Output: "FIB-2026-33-DP-SAND-600-300-24-007"

İSTENEN ÇIKTI:
1. Resolver algoritmasının pseudocode'u (full).
2. Sequence sayacı algoritması + scope stratejileri (A/B karşılaştırma tablosu).
3. 4 senaryo TAM trace (her token için ara değer).
4. Validasyon kuralları listesi (7 madde).
5. Size concat mantığı + 2 görsel örnek.
6. Minimum alan teoremi: hangi kombinasyonların benzersizliği garanti ettiği.
7. Revision akışı diyagramı (Mermaid).

P0:
- Resolver pseudocode.
- Sequence algoritması.
- 4 senaryo trace.
- Minimum alan kuralı.

P1:
- Validasyon kuralları.
- Size concat detayları.
- Revision akışı.

P2:
- Custom token (firma kendi token'ını ekleyebilsin mi?) — phase 2.
- Template versiyonlama (mevcut isimler eski template'e bağlı; template değişirse ne olur?).
- i18n template (farklı dillerde farklı çıktı).

AÇIK SORULAR:
1. Sequence scope default hangisi olsun — A (type+size) mi B (type only) mi?
2. Silinmiş element'in sequence'ı tekrar kullanılabilir mi? MVP'de hayır (hole'lu sıra OK).
3. Bulk import'ta 100 kolon geldi; sequence aralık 1-100 mu yoksa mevcut sayaç + 1'den mi?
4. Template değiştirilirse eski instance mark'lar otomatik regenerate mi olur, yoksa dondurulur mu?
   Öneri: eski isimler donar; sadece yeni eklenenler yeni template kullanır; manuel "regenerate all" butonu.
5. Instance mark case sensitivity (büyük/küçük harf) nasıl yönetilir? Filesystem-safe olsun →
   her token'ı UPPERCASE'e çevir (varsayılan), ama firma lowercase tercih edebilmeli.
```
