# 11 — UI: Firma Ayarları Ekranı (Kod Override) (P1)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]
[Buraya promts/okan/00-ORTAK-BLOK-STANDARD-ITEMS.md yapıştır — mühendislik entegrasyonu bağlamı]
[Buraya Neomorphism + Tailwind görsel dil özeti yapıştır — inset/protrude, koyu gri primary, nötr arka plan]

GÖREV: Firmanın sistem default kodlarını override edebileceği AYARLAR ekranını wireframe + kontrol
envanteri + kısa Tailwind olarak belgele. Amaç: tek sayfada Element Types, Typologies, Size Formats
ve Naming Template görünür, inline düzenlenebilir. Kod üretimi yok.

ROTA:
- `/settings/naming-conventions` (mock route)
- Üst kabuk: Firma Ayarları modülü içinde "İsim Konvansiyonları" sekmesi.

A) SAYFA KİMLİĞİ VE ÜST ŞERİT

1. Başlık (sol üst):
   - `Firma İsim Konvansiyonları` + `(Demo Data)` opsiyonel alt yazı.
   - Koyu gri başlık; mor yok.

2. Sağ üst:
   - **Firma seçici dropdown** (mock 3 firma: XY Prefab, ACME Precast, Cemre Beton) — aktif firma değişince tablolar yeniden yüklenir.
   - **Import/Export JSON** ikonları (P2'de implement; wireframe'de görünür).
   - **Kaydet** butonu (sağda, primary koyu gri protrude).

---

B) SOL MENÜ (dikey kategori navigasyonu)

Neomorphism inset panel; seçili item protrude.

| İkon | Label | İçerik |
|------|-------|--------|
| folder | **Element Types** | Ana eleman tipleri (Kolon, Kiriş, ...) kod override tablosu |
| layers | **Typologies** | Tipolojiler (Dikdörtgen Kolon, T Kiriş, ...) kod override tablosu |
| ruler | **Size Formats** | Tipoloji başına size format seçici |
| tag | **Naming Template** | Token sırası düzenleyici (detay → 12-ui-template-builder-ekrani.md) |
| sliders | **Firma Profili** | firmCodePrefix, unitSystem, genel ayarlar |

Active item: protrude + primary tint.
Disabled görüntü: düşük opacity.

---

C) ANA PANEL — TAB 1: ELEMENT TYPES

Tablo başlığı: "Eleman Tipleri Kod Override"

| Sütun | Tipi | Davranış |
|-------|------|----------|
| **Eleman Tipi** | read-only metin + ikon | "Kolon (Column)" |
| **IFC Class** | read-only badge | "IfcColumn" küçük etiket |
| **Default Kod** | read-only | "KL" (sistem default) |
| **Firma Kodu (Override)** | inline text input | Override yoksa placeholder "KL"; yazılırsa override kaydı |
| **Preview** | computed read-only | Canlı önizleme: "Örnek: COL-RECT-500-001" |
| **Reset** | small ikon buton | Override'ı siler, default'a döndürür; disabled if no override |

Toplam 9 satır (kolon, kiriş, döşeme, duvar, merdiven, sahanlık, konsol, soket, makas).

Veri örneği (ACME firması için):
```
| Eleman Tipi      | IFC Class      | Default | Override | Preview             |
| Kolon            | IfcColumn      | KL      | [COL]    | PRJ-COL-R-500-001   |
| Kiriş            | IfcBeam        | KR      | [BM]     | PRJ-BM-T-1200-001   |
| Döşeme           | IfcSlab        | DS      | [   ]    | PRJ-DS-HC-800-001   |
| Duvar Paneli     | IfcWall        | DP      | [   ]    | PRJ-DP-SWP-600-001  |
| Merdiven         | IfcStairFlight | MR      | [STR]    | PRJ-STR-STR-300-001 |
| Sahanlık         | IfcSlab/LANDING| SH      | [   ]    | PRJ-SH-RECT-120-001 |
| Konsol           | IfcMember      | KN      | [   ]    | PRJ-KN-RECT-60-001  |
| Soket            | IfcFooting     | SK      | [   ]    | PRJ-SK-CUP-120-001  |
| Makas            | IfcBeam        | MK      | [TR]     | PRJ-TR-Y-20-001     |
```

---

D) ANA PANEL — TAB 2: TYPOLOGIES

Başlık: "Tipoloji Kod Override" + filtrelenebilir element type seçici (üstte chips).

Üstte chip filter:
[Tümü] [Kolon] [Kiriş] [Döşeme] [Duvar] [Merdiven] [Diğer]

Tablo:
| Sütun | Tipi | Davranış |
|-------|------|----------|
| **Tipoloji** | read-only | "Dikdörtgen Kolon (Rectangular Column)" |
| **Eleman Tipi** | read-only badge | "Kolon" |
| **IFC Predefined** | read-only | "COLUMN" |
| **Default Kod** | read-only | "RECT" |
| **Firma Kodu** | inline input | Override |
| **Preview** | computed | Örnek çıktı |
| **Reset** | ikon | default'a döndür |

İlk yüklenen satırlar (filtersiz, tüm tipolojiler): ~45 satır. Scroll container.

---

E) ANA PANEL — TAB 3: SIZE FORMATS

Başlık: "Tipoloji Başına Size Format"

Tablo:
| Sütun | Tipi |
|-------|------|
| **Tipoloji** | read-only |
| **Kullanılan Format (Default)** | read-only, SizeFormat.name |
| **Örnek Çıktı** | read-only | "5-40x40" (canlı örnekle) |
| **Değiştir** | dropdown | SizeFormat listesi; seçilince preview güncellenir |
| **Reset** | ikon |

Dropdown options: tüm SizeFormat kataloğundaki kayıtlar (length_m, length_cm, section_wxh, ...).

Örnek:
```
| Tipoloji         | Default Format      | Örnek   | Değiştir              |
| Dikdörtgen Kolon | length_m_section_cm | 5-40x40 | [Dropdown: seçili]    |
| Çift T Döşeme    | dt_eu_format        | 1200-240-60 | [dt_us_format ▾]  |
```

---

F) ANA PANEL — TAB 4: NAMING TEMPLATE (yönlendirme)

Bu sekmeye tıklandığında → **12-ui-template-builder-ekrani.md** yüzeye yüklenir (detay builder).

Kısa özet göster: mevcut template adı, 3 örnek çıktı, "Düzenle" butonu.

```
[Card]
Aktif Template: "Varsayılan"
Örnek çıktı 1: PRJ-KL-RECT-500-001
Örnek çıktı 2: PRJ-KR-T-1200-042
Örnek çıktı 3: PRJ-DS-HC-800-20-015
[Düzenle →]
```

---

G) ANA PANEL — TAB 5: FIRMA PROFİLİ

Form alanları (inset input grid):
- **Firma Adı** (read-only burada; sadece Firma Yönetimi ekranından değişir)
- **Firma Kodu (FIRM_CODE prefix)** — inline input; 2-5 karakter tercih
- **Birim Sistemi** — radio: Metric / Imperial / Mixed
- **Varsayılan Template** — dropdown (FirmNamingTemplate listesi)
- **Lokasyon / Dil** — dropdown (TR, EN, US_EN)

---

H) CANLI PREVIEW PANELİ

Sağ tarafta sticky panel (veya alt kısımda):

Başlık: "Örnek İsim Üretimi"

3 kart:
1. **Kolon** — örnek element + çıktı
2. **Kiriş** — örnek element + çıktı
3. **Döşeme** — örnek element + çıktı

Her kart:
- Üstte küçük ikon + tipoloji adı
- Ortada monospace çıktı: `PRJ-2026-014-COL-R-5-40x40-001-R0`
- Altta "Token Trace" (açılır):
  ```
  PROJECT_CODE = "PRJ-2026-014"
  FAMILY_CODE  = "COL" (override)
  TYPOLOGY_CODE= "R"   (override)
  SIZE         = "5-40x40" (length_m_section_cm)
  SEQUENCE     = "001" (pad:3)
  REVISION     = "R0"
  ```

Herhangi bir tabloda değişiklik yapıldıkça bu preview canlı güncellenir.

---

I) KONTROL ENVANTERİ

| Kontrol | Yer | Tipi | Davranış |
|---------|-----|------|----------|
| Firma seçici | Sağ üst | Dropdown | Aktif firma değişince tablolar reload |
| Tab menü | Sol | Vertical nav | Aktif tab tabloyu değiştirir |
| Override input | Tab 1, 2 | Text input | Boşluk = override yok (silinir) |
| Format dropdown | Tab 3 | Select | Seçim değişince preview update |
| Reset butonu | Her satır | Icon button | Override kaydı sil |
| Kaydet butonu | Sağ üst | Primary | Tüm değişiklikleri persist (localStorage) |
| İptal butonu | Sağ üst | Secondary | Pending değişiklikleri geri al |
| Canlı preview | Sağ sticky | Read-only kartlar | Her değişiklikte render |

---

J) NEOMORPHISM + TAILWIND İPUÇLARI

- Arka plan: `bg-neutral-100` veya neomorphism base color.
- Kartlar: `rounded-2xl shadow-[inset_4px_4px_8px_#d0d0d0,-4px_-4px_8px_#ffffff]` (inset)
  veya `shadow-[4px_4px_8px_#c0c0c0,-4px_-4px_8px_#ffffff]` (protrude).
- Tab active: protrude + border-left primary 2px.
- Input: inset, `rounded-xl px-3 py-2 bg-neutral-50`.
- Primary button: protrude dark gray, `text-white bg-neutral-700 hover:bg-neutral-800`.
- Badge (IFC Class): `bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md text-xs`.
- Monospace output: `font-mono text-sm bg-neutral-50 px-3 py-2 rounded-lg`.
- Reset icon: küçük X ikonu, hover red tint.

---

K) MOCK VERİ SENARYOLARI

Sayfanın farklı firmalar için nasıl göründüğünü 3 mock örnekle belgele:

1. **XY Prefab** — override yok; tüm tablolarda "Override" sütunu boş; canlı preview'da
   sistem default kodları görünür ("KL-RECT-500-001").

2. **ACME Precast** — 3 override aktif (col→COL, beam→BM, col-rect→R); size format
   Çift T için dt_us_format seçili; preview "PRJ-COL-R-5-40x40-0001-R0".

3. **Cemre Beton** — override yok; template sıkı (FAMILY_CODE, SIZE, SEQUENCE); sizeConcat
   aktif; preview "KL500-001".

---

İSTENEN ÇIKTI:
1. Sayfa wireframe (ascii veya mermaid ile layout).
2. Kontrol envanteri (tablo — yukarıdaki J bölümü tam).
3. 5 tab için ayrı mock veri (her tab'da 3-5 satırlık örnek).
4. Canlı preview kart tasarımı.
5. Tailwind utility ipuçları (10-15 satır).
6. Neomorphism stil notları.
7. 3 firma senaryosunun nasıl göründüğü (H ve K bölümleri).

P0:
- Sayfa wireframe.
- Kontrol envanteri.
- Tab 1, 2, 3 mock veri.

P1:
- Canlı preview paneli.
- Firma profili tab'ı.
- 3 firma senaryo gösterimi.

P2:
- Import/Export JSON.
- Diff görünümü (override vs default fark highlight).
- Audit log (kim ne zaman değiştirdi).

AÇIK SORULAR (UX):
1. Override'lar autosave mi, manual Save'le mi commit olsun? Manuel daha güvenli, ama kullanıcı
   değiştirip Save'e basmayı unutabilir; dirty indicator + "Save" hatırlatma önerilir.
2. Canlı preview hangi örnek element üzerinde çalışacak? Sabit mock mi, kullanıcı seçimi mi?
   Öneri: sabit 3 mock (kolon/kiriş/döşeme); ileride özelleştirilebilir.
3. Override'ı diğer firmalara kopyalama özelliği (clone) gerekli mi?
4. "Toplu reset" — tüm override'ları tek tuşla sil — tehlikeli; confirmation dialog şart.
5. Tab değişince pending değişiklikler ne olur? Warning dialog + auto-save önerisi.
```
