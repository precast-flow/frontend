# 12 — UI: İsimlendirme Template Builder Ekranı (P1)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]
[Buraya Neomorphism + Tailwind görsel dil özeti yapıştır]

GÖREV: Firma kullanıcısının naming template'ini GÖRSELDE düzenleyebileceği drag-drop tabanlı
builder ekranı için wireframe + kontrol envanteri + 3 mock senaryo. Kod üretimi yok.

ROTA:
- `/settings/naming-conventions` > "Naming Template" sekmesi (veya standalone `/settings/naming-template`)

AMAÇ:
- Kullanıcı token'ları sürükle-bırak ile sıralar, enable/disable eder, format seçer.
- Canlı preview ile değişikliği anında görür.
- "Save" ile FirmNamingTemplate kaydedilir.

A) SAYFA KİMLİĞİ

1. Başlık (sol üst):
   - `İsimlendirme Template Builder` + aktif firma adı küçük alt-yazı.

2. Sağ üst:
   - Template seçici dropdown (bir firmada birden fazla template olabilir: "Varsayılan", "Müşteri A için").
   - **Yeni Template** butonu (secondary).
   - **Kaydet** / **İptal** (primary/secondary).

---

B) ANA LAYOUT (3 KOLON)

```
+---------------------+------------------------+------------------------+
|  TOKEN PALETTE      |  AKTIF TEMPLATE        |  CANLI PREVIEW         |
|  (sol, fixed)       |  (orta, drop zone)     |  (sağ, sticky)         |
|                     |                        |                        |
|  [FIRM_CODE]        |  [1] FAMILY_CODE   [x] |  Örnek 1:              |
|  [PROJECT_CODE]     |  [2] SIZE          [x] |  KL-500-001            |
|  [TYPOLOGY_CODE]    |  [3] SEQUENCE      [x] |                        |
|  [FAMILY_CODE]  ✓   |                        |  Örnek 2:              |
|  [VARIANT_CODE]     |                        |  KR-T-1200-015         |
|  [SIZE]         ✓   |  + Drag token here     |                        |
|  [SEQUENCE]     ✓   |                        |  Örnek 3:              |
|  [REVISION]         |                        |  DS-HC-800-20-042      |
+---------------------+------------------------+------------------------+
|  GLOBAL OPTIONS                                                        |
|  Separator: [-] sizeConcat: [□] padding: [3]  revisionPrefix: [R]     |
+----------------------------------------------------------------------+
```

---

C) SOL KOLON — TOKEN PALETTE

Başlık: "Kullanılabilir Token'lar"

Her token bir chip:
- İkon (token tipine göre: bina / proje / katman / ruler / kilit / # / Δ)
- Türkçe ad (tooltip'te İngilizce token adı)
- Aktif template'te kullanılıyorsa küçük ✓ badge'i
- Sürüklenebilir (drag handle solda)

Token listesi:
| Token | TR Label | Açıklama |
|-------|----------|----------|
| FIRM_CODE | Firma Kodu | "ACME", "XY" gibi firma prefix'i |
| PROJECT_CODE | Proje Kodu | "PRJ-2026-014" |
| TYPOLOGY_CODE | Tipoloji Kodu | "RECT", "T", "HC" |
| FAMILY_CODE | Eleman Tipi Kodu | "KL", "KR", "DS" |
| VARIANT_CODE | Varyant Kodu | Opsiyonel alt ayırıcı |
| SIZE | Boyut | Tanımlayıcı boyut stringi |
| SEQUENCE | Sıra No | "001", "042" |
| REVISION | Revizyon | "R0", "R1" |

Stil:
- Inset chip, sürükle simgesi (⋮⋮) solda.
- Hover: protrude efekti.
- Aktif (template'te kullanılıyor): ✓ badge yeşil nötr tone.

---

D) ORTA KOLON — AKTİF TEMPLATE (DROP ZONE)

Başlık: "Aktif Template Sırası"

Her aktif token bir satır kart:
- Sıra numarası (#1, #2, ...)
- Token chip (palette ile aynı görünüm, daha büyük)
- **Format seçici** (token tipine göre aktif):
  - SIZE → SizeFormat dropdown (length_m, section_wxh, dt_eu_format, ...)
  - SEQUENCE → padding input (1-6)
  - REVISION → prefix input (R / r / .)
  - Diğer tokenlar → format seçici yok
- **Prefix/Suffix** (opsiyonel text inputs, collapsed by default)
- **Enable/Disable toggle** (inset switch; disabled = gri, token değer üretmez ama sırada kalır)
- **Sil (X)** butonu (token'ı template'ten çıkarır, palette'e geri gönderir)
- **Sürükle handle** (üst/alt taşıma)

Örnek satır:
```
#2 | [SIZE chip]   Format: [length_m_section_cm ▾]   Prefix: [ ]  Suffix: [ ]   [✓ enabled]  [X]
```

Boş drop zone placeholder:
```
  Buraya token sürükleyin (sol palette'ten)
  veya "+ Token Ekle" butonuna tıklayın
```

---

E) SAĞ KOLON — CANLI PREVIEW

Başlık: "Örnek Çıktı"

3 sabit mock element örneği (sticky):

### Örnek 1: Dikdörtgen Kolon
- Tipoloji: col-rect
- Boyut: height=5000, sectionWidth=400, sectionDepth=400
- Sequence: 1
- Revision: 0

Çıktı (monospace, büyük font):
```
KL-500-001
```

Alttaki "Token Trace" açılır (collapsed by default):
```
#1 FAMILY_CODE  = "KL"   [system default]
#2 SIZE         = "500"  [length_cm]
#3 SEQUENCE     = "001"  [pad:3]
```

### Örnek 2: T Kiriş
- Tipoloji: beam-t, span=12000, ...

### Örnek 3: Hollow Core Döşeme
- Tipoloji: slab-hc, length=8000, thickness=200

Her değişiklikte (token ekle/çıkar/sıra/format) 3 preview anında güncellenir.

---

F) ALT ŞERİT — GLOBAL OPTIONS

Yatay toolbar, form grid:

| Alan | Tipi | Davranış |
|------|------|----------|
| **Separator** | text input (1-3 char) | Ayraç (varsayılan "-") |
| **Size Concat** | checkbox | İşaretli: FAMILY + SIZE bitişik ("KL500") |
| **Sequence Padding** | number input (1-6) | "001" vs "0001" |
| **Revision Prefix** | text input | "R", "r", ".", "rev" |
| **Revision Zero Suffix** | checkbox | R0 gösterilsin mi yoksa gizlensin mi |
| **UPPERCASE enforce** | checkbox | Tüm çıktı büyük harf |

---

G) 3 MOCK SENARYO (UI'da seçilebilir preset)

Sayfanın üst kısmında "Hızlı Başlangıç" kartları (3 adet):

### Senaryo 1: "Küçük Firma — Sade"
```
[FIRM_CODE] [FAMILY_CODE] [SIZE] [SEQUENCE]
separator='-', sizeConcat=false, padding=3
Örnek: XY-KL-500-001
```

### Senaryo 2: "Büyük Proje — Tam Detaylı"
```
[PROJECT_CODE] [FAMILY_CODE] [TYPOLOGY_CODE] [SIZE] [SEQUENCE] [REVISION]
separator='-', sizeConcat=false, padding=4
Örnek: PRJ-2026-014-COL-R-5-40x40-0042-R0
```

### Senaryo 3: "Sektörel Kompakt"
```
[FAMILY_CODE] [SIZE] [SEQUENCE]
separator='-', sizeConcat=true, padding=3
Örnek: KL500-001
```

Her karta tıklanınca template drop zone'a o konfigürasyon yüklenir; kullanıcı üzerine ince ayar yapar.

---

H) KONTROL ENVANTERİ

| Kontrol | Yer | Tip | Etkileşim |
|---------|-----|-----|-----------|
| Token palette chip | Sol | Drag source | Orta'ya bırakıldığında aktif template'e eklenir |
| Aktif token satırı | Orta | Drag target + reorder | Yukarı/aşağı taşı; sıra güncellenir |
| Format dropdown | Her token satırı (uygunsa) | Select | Preview güncellenir |
| Enable toggle | Her token satırı | Switch | Disabled token output'a girmez |
| Sil X | Her token satırı | Button | Token palette'e geri döner |
| + Token Ekle | Drop zone alt | Button | Modal: palette'teki kullanılmamış tokenlar |
| Separator input | Alt şerit | Text | Preview güncellenir |
| sizeConcat | Alt şerit | Checkbox | Preview güncellenir |
| Preset seç | Üst | Clickable card | Drop zone'a yükle |
| Save | Sağ üst | Primary | FirmNamingTemplate persist |
| Cancel | Sağ üst | Secondary | Pending değişiklikleri geri al |
| Template seçici | Sağ üst | Dropdown | Farklı template yükle |
| Yeni Template | Sağ üst | Button | Boş template + isim input modal |

---

I) NEOMORPHISM + TAILWIND İPUÇLARI

- 3-kolon grid: `grid grid-cols-[240px_1fr_320px] gap-6 p-6`
- Palette arka plan: `bg-neutral-100 rounded-2xl shadow-inner p-4`
- Chip: `px-3 py-2 rounded-xl bg-neutral-50 shadow-[3px_3px_6px_#d0d0d0,-3px_-3px_6px_#fff] cursor-grab`
- Aktif drop zone: `border-2 border-dashed border-neutral-300 rounded-2xl min-h-[300px] p-4`
- Active satır: `shadow-[inset_3px_3px_6px_#d0d0d0,inset_-3px_-3px_6px_#fff]`
- Preview kart: `bg-neutral-50 rounded-2xl p-4 shadow-[4px_4px_8px_#c0c0c0,-4px_-4px_8px_#fff]`
- Monospace output: `font-mono text-lg text-neutral-800 bg-white px-4 py-3 rounded-xl`
- Drag indicator (dragging): `opacity-50 scale-95 rotate-1`
- Drop target hover: `border-primary-500` (koyu gri accent)

Drag-drop kütüphane önerisi (implementation aşaması için not):
- `@dnd-kit/core` + `@dnd-kit/sortable` — React modern, accessible.
- Alternatif: `react-beautiful-dnd` (deprecated) — kullanma.

---

J) UX DAVRANIŞ KURALLARI

1. Boş template → "Save" devre dışı.
2. Minimum alan uyarısı: FAMILY_CODE + SEQUENCE yoksa preview kartında uyarı ikonu + tooltip:
   "Bu template benzersizlik garantisi vermiyor. FAMILY_CODE ve SEQUENCE önerilir."
3. Çakışma (aynı token iki kez): palette'de token zaten aktifse ikinci drop engellenir + toast uyarı.
4. Preset yükleme: kullanıcının mevcut değişikliklerini override edeceği için confirmation.
5. Revision prefix boş string → preview'de "R0" yerine "0" görünür; uyarı göster.
6. UPPERCASE enforce toggle → tüm preview anında uppercase.

---

İSTENEN ÇIKTI:
1. 3-kolon layout wireframe (ascii veya mermaid).
2. Token palette chip tasarımı.
3. Aktif template row tasarımı (format seçici, enable, sil).
4. Canlı preview 3 kart tasarımı + token trace.
5. Global options şerit.
6. 3 preset senaryo kartı.
7. Kontrol envanteri (H bölümü tam).
8. Neomorphism + Tailwind utility ipuçları.
9. UX davranış kuralları (6 madde).

P0:
- Layout wireframe.
- Token palette + drop zone.
- Canlı preview 3 kart.
- Global options.

P1:
- 3 preset senaryo.
- Kontrol envanteri.
- UX davranış kuralları.

P2:
- Custom token ekleme (firma kendi token tanımlar — faz 2).
- Template diff (eski vs yeni template çıktı karşılaştırması).
- Bulk regenerate (template değiştikten sonra proje elemanlarının isimlerini yeniden üret).

AÇIK SORULAR (UX):
1. Drag-drop mobile'da nasıl çalışır? Touch desteği `@dnd-kit/core` var ama test şart.
2. Preview için kullanıcı kendi test element'ini girebilmeli mi (3 sabit yerine)?
3. Birden fazla template arası hızlı geçiş nasıl olur? Template seçici dropdown yeterli mi,
   yoksa yan yana karşılaştırma modu mu gerekir?
4. Template isim değiştirme (rename) nerede? Template seçici yanında küçük edit ikonu önerilir.
5. Template silindiğinde bu template'e bağlı proje elemanlarının instance mark'ları ne olur?
   Öneri: silmeden önce uyarı + bağlı element sayısı göster; istersen "Varsayılana taşı" butonu.
```
