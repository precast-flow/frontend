# 14 — UI: IFC Import Sihirbazı (P1)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]
[Buraya Neomorphism + Tailwind görsel dil özeti yapıştır]

GÖREV: CAD dosyasından eleman import'u için 3 adımlı sihirbaz (wizard) ekranını wireframe +
kontrol envanteri + mock akış olarak belgele. Kod üretimi yok; sadece UI/UX tasarımı.

ROTA:
- `/projects/{projectId}/elements/import` (mock)
- Ana proje sayfasından "Import" butonuna tıklayınca açılır (modal yerine full-page wizard önerilir).

KAPSAM:
- Desteklenen formatlar: .ifc (ana hedef), .xml (yardımcı), .csv (basit import, manuel mapping).
- MVP'de tam IFC parser yok; wizard UI + mock parser + mock mapping.

---

A) ÜST ŞERİT — STEPPER

3 adım, yatay progress:

```
[●] Yükle → [○] Eşlemeyi İncele → [○] Onay ve Import
 1            2                     3
```

Active: protrude + primary tint.
Completed: checkmark ikon + nötr yeşil.
Pending: inset, düşük opacity.

Step ile ilerleme ileri/geri butonları sağ altta.

---

B) ADIM 1 — DOSYA YÜKLEME

Başlık: "CAD Dosyasını Yükle"

İçerik:

1. **Drag-drop alanı** (büyük, merkezi):
   - Placeholder: "Dosyayı buraya sürükleyin veya tıklayın"
   - Desteklenen format badge'leri: `.ifc` `.ifczip` `.xml` `.csv`
   - Tıklanınca native file picker açılır.
   - Drop sırasında highlight; validation: uzantı + boyut (< 100MB uyarı).

2. **Yüklenen dosya özeti** (drop sonrası):
   ```
   [ikon] dosya-adi.ifc    124 MB    [X kaldır]
   ```

3. **Kaynak sistem seçici** (opsiyonel; otomatik tespit):
   - Dropdown: Tekla / Revit / Allplan / AutoCAD / Auto-detect
   - Dosya header'ından çıkarılır (IFC FILE_DESCRIPTION satırı); eğer bulunamazsa kullanıcı seçer.

4. **Proje eşleşmesi**:
   - Hedef proje: (aktif proje read-only) veya dropdown (başka proje seç).
   - Yeni proje oluşturma butonu: "+ Yeni Proje"

5. **Parse başlatma**:
   - "Parse et" butonu (primary) → mock progress göstergesi (skeleton loader).
   - Parse tamamlanınca adım 2'ye geçiş aktifleşir.

Kontrol envanteri (Adım 1):

| Kontrol | Tip | Davranış |
|---------|-----|----------|
| Drop zone | Div drop target | Dosya kabul |
| File picker | Input file (hidden) | Tıklayınca açılır |
| Kaynak seçici | Dropdown | Manual override |
| Proje seçici | Dropdown | Yeni proje opsiyonu |
| Parse butonu | Primary | Enable: dosya var + proje seçili |

---

C) ADIM 2 — MAPPING'İ İNCELE

Başlık: "Import Edilecek Elemanlar — Eşleme Kontrolü"

Üst şerit (özet istatistik):
```
Toplam: 487 eleman  |  Otomatik eşlenen: 462  |  Manuel gerekli: 25  |  Hata: 0
```

Ana içerik — filtreleyebilir tablo:

| Sütun | Tip | Açıklama |
|-------|-----|----------|
| [✓] | Checkbox | Import'a dahil et (tümü seçili default) |
| Kaynak Ad | read-only | IFC'deki ifcName (örn. "C-01-400x400") |
| IFC Class | badge | IfcColumn |
| IFC PredefType | badge | COLUMN |
| Eşleşen Tip | dropdown | System ElementType (örn. Kolon) |
| Eşleşen Tipoloji | dropdown | System Typology (örn. Dikdörtgen Kolon) |
| Güven | icon + % | Otomatik eşleşme güven skoru (yüksek/orta/düşük) |
| Boyutlar | read-only | "5000×400×400" özet |
| Aksiyon | menü | Detay, skip, yeniden eşle |

Filter chip'leri üstte:
- [Tümü] [Kolon] [Kiriş] [Döşeme] [Duvar] [Merdiven] [Diğer]
- [Otomatik eşlenen] [Manuel gerekli] [Skip]
- Search input: kaynak adına göre ara.

Toplu işlemler toolbar:
- Seçilenleri: "Tipoloji ata" / "Skip et" / "Aynı firma kuralına dönüştür"
- "Otomatik düzelt tüm benzerler" — aynı kaynak adını içeren elementleri tek dropdown ile düzelt.

Satır detayı (genişleyen panel veya yan drawer):
- Full IFC property set listesi (property ismi + değer).
- Extracted dimensions (her tanımlayıcı boyut).
- Önerilen instance mark preview (template uygulanmış).
- Kullanıcı dimensions'ı düzeltebilir (inline).

Uyarı/hata işaretleri:
- Kırmızı: eşleşme yok, manuel gerekli.
- Sarı: düşük güven, kontrol edilsin.
- Yeşil: yüksek güven, hazır.

Kontrol envanteri (Adım 2):

| Kontrol | Tip |
|---------|-----|
| Toplam istatistik üst şerit | Read-only |
| Filter chip'ler | Toggle |
| Search input | Text |
| Satır checkbox | Toggle |
| Tipoloji dropdown | Select |
| Güven ikonu | Tooltip açıklar |
| Satır genişlet | Accordion |
| Toplu işlem butonları | Primary/secondary |
| Skip all errors | Warning button |

---

D) ADIM 3 — ONAY VE IMPORT

Başlık: "Import Özeti"

Sol panel — Özet istatistik kartları:

```
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  Import edilecek    │ │  Skip edilecek      │ │  Yeni sayaç         │
│      462            │ │       25            │ │  başlangıç: 1-462   │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

Orta panel — Eleman tipi dağılımı (bar chart veya tablo):

| Eleman Tipi | Adet | Örnek Instance Mark |
|-------------|------|----------------------|
| Kolon | 125 | PRJ-KL-RECT-500-001 ... 125 |
| Kiriş | 180 | PRJ-KR-T-1200-001 ... 180 |
| Döşeme | 95 | PRJ-DS-HC-800-20-001 ... 95 |
| Duvar Paneli | 52 | PRJ-DP-SWP-600-001 ... 52 |
| Merdiven | 10 | PRJ-MR-STR-300-001 ... 10 |

Uyarılar panel (alt):

```
[!] 3 element için aynı GUID zaten bu projede mevcut.
    [○] Üzerine yaz  [●] Atla  [○] Revizyon olarak ekle (revision++)

[!] 5 element'in boyut extraction'ı eksik.
    Bu elementler draft olarak kaydedilecek; manuel tamamlanması gerekir.

[!] 2 element için kaynak sistem tespit edilemedi.
    sourceSystem='IFC_GENERIC' olarak kaydedilecek.
```

Import butonu (sağ alt, büyük primary):
- "Import Et (462 element)"
- Tıklanınca confirmation modal.

Progress bar (import sırasında):
```
[############...............]  287/462 eleman import ediliyor...
                                Mevcut: Dikdörtgen Kolon "C-042"
[İptal]
```

Bittikten sonra:
- Success toast: "462 eleman başarıyla import edildi."
- Link: "Proje eleman listesine git →"
- Log butonu: "Import log'u görüntüle" (JSON detay).

Kontrol envanteri (Adım 3):

| Kontrol | Tip |
|---------|-----|
| Özet kartlar | Read-only |
| Tip dağılımı tablosu | Read-only |
| Uyarı paneli + radio | Radio grubu |
| Import butonu | Primary |
| Confirm modal | Dialog |
| Progress bar | Determinate |
| Cancel butonu | Secondary (import sırasında) |
| Success toast | Transient notification |
| Log açma | Secondary |

---

E) NAVIGASYON VE DURUM YÖNETİMİ

- Geri butonu her zaman görünür (Adım 1'de disable).
- İleri butonu: validation geçerse enable.
- Adım arasında state kalıcı (tarayıcı yenileme → hidden localStorage / sessionStorage).
- Import başladıktan sonra geri dönüş yok; iptal = rollback (db temiz).

Breadcrumb:
```
Projeler > PRJ-2026-014 > Import > Adım 2/3
```

---

F) NEOMORPHISM + TAILWIND İPUÇLARI

- Stepper: inset track + protrude active dot.
- Drop zone: `border-2 border-dashed border-neutral-300 rounded-3xl p-12 text-center bg-neutral-50`
- Hover drop zone: `border-primary-500 bg-primary-50/30`
- Tablo satırı: `odd:bg-neutral-50 even:bg-white hover:bg-neutral-100`
- Badge (IFC class): `bg-neutral-200 text-xs font-mono px-2 py-0.5 rounded`
- Güven high: green dot; mid: yellow; low: red.
- Summary kart: `bg-white rounded-2xl shadow-[4px_4px_8px_#d0d0d0,-4px_-4px_8px_#fff] p-6`
- Primary buton: `bg-neutral-800 text-white rounded-xl px-6 py-3 shadow-[...]`
- Progress bar: inset track + protrude fill.

---

G) 2 MOCK AKIŞ SENARYOSU

### Senaryo A: Temiz import (az hata)
- Dosya: `proje-14-tekla.ifc` (Tekla'dan export, 250 element).
- Adım 1: dosya drop → kaynak "Tekla" auto-detect → proje PRJ-2026-014 seçili → Parse.
- Adım 2: 245 element yüksek güvenle eşlendi; 5 element için tipoloji seçimi gerekli.
  Kullanıcı 5 elementi manuel düzeltir (hepsi "Eğimli Konsol" = corbel-tpr).
- Adım 3: özet onaylanır; 250 element import edilir; başarı.

### Senaryo B: Karışık import (orta hata)
- Dosya: `karisik-proje.ifc` (CAD'den eski export, 487 element).
- Adım 1: format ok; kaynak auto-detect başarısız → manuel "Revit" seçilir.
- Adım 2: 462 otomatik, 25 manuel gerekli.
  Kullanıcı filtreler: "Manuel gerekli" chip → 25 element listelenir.
  Toplu işlem: "Aynı kaynak adına sahip 12 element"ı seç → "slab-fil" olarak toplu ata.
  Kalan 13 için tek tek düzeltme.
  3 element skip edilir (proje dışı olduğu düşünülür).
- Adım 3: 484 element import edilecek; GUID çakışması yok; warning paneli boş.
  Import başlar; 2 dk süren progress; tamamlanır.

---

İSTENEN ÇIKTI:
1. Üst şerit stepper tasarımı (wireframe).
2. Adım 1 drop zone + kaynak seçici wireframe + kontrol envanteri.
3. Adım 2 tablo + filter + toplu işlem wireframe + kontrol envanteri.
4. Adım 3 özet kartları + uyarı paneli + import buton + progress.
5. Navigasyon kuralları.
6. 2 mock akış senaryosu (A ve B) tam.
7. Neomorphism + Tailwind utility notları.

P0:
- 3 adım wireframe.
- Adım 1 ve Adım 3 kontrol envanteri.
- 2 akış senaryosu.

P1:
- Adım 2 detayları (filter, bulk, drawer).
- Uyarı/hata işareti sistemi.
- Progress bar davranışı.

P2:
- Drag-drop klasör yükleme (birden fazla IFC dosyası).
- Incremental import (parça parça; cancel edilse bile kaydedilenler kalır).
- Import geçmişi ekranı (hangi dosya, kaç element, ne zaman).

AÇIK SORULAR (UX):
1. Adım 2'de 487 eleman varsa tablo pagination mı virtual scroll mu? Virtual scroll öneri.
2. Büyük IFC dosyalarında (500MB+) browser'da parse mı, server'da mı? MVP'de sadece küçük
   (<100MB); production'da server-side parse gerekebilir.
3. Import sırasında cancel edildiğinde rollback gerçekten atomik olacak mı?
   Öneri: import'u batch (50'şer) olarak yap; rollback her batch'in başında kontrol.
4. Duplicate GUID handling için user preference kaydedilsin mi (hatırla)?
5. Log formatı (success toast sonrası "Log'u görüntüle"): JSON download mu, inline viewer mı?
```
