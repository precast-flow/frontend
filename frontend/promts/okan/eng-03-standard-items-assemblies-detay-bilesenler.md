# eng-03 — Standard Items Assemblies — detay ve bileşen (piece mark) ızgarası

```
[Buraya 00-ORTAK-BLOK-STANDARD-ITEMS.md akışıyla: 00-ORTAK-BLOK + 00b + bağlam]

GÖREV: Listeden bir kayda girildiğinde (**View/Details**) gösterilen **detay sayfası**: üstte **salt okunur özet** (ana assembly bilgisi), altta **bileşen satırları** (alt öğeler / piece mark bağlantıları). Referans demo: “Standard Items Assembles - Details” (başlıkta demo yazımı “Assembles”; ürün dilinde tutarlılık için **Assemblies** kullan). Tamamen mock veri.

---

## A) Sayfa kimliği ve üst şerit

1. **Başlık (sol üst):**
   - `Standard Items Assemblies - Details` + `(Demo System)` (isteğe bağlı).
   - Demo ekranda başlık rengi koyu kırmızımsı — Neomorphism’ta: **koyu gri veya nötr** başlık; vurgu mor değil.

2. **Sağ üst:**
   - **`Close`** — secondary; tıklanınca **`eng-01` liste** ekranına döner (breadcrumb ile uyumlu).

---

## B) Üst bölüm — özet tablosu (salt okunur)

**Tek satırlık yatay özet** (demo: tablo görünümü); kullanıcı düzenleyemez. Tüm hücreler **read-only** metin veya inset disabled görünümlü.

| Sütun | Örnek mock değer | Not |
|--------|------------------|-----|
| **Location** | `CV Grand Haven (GH)` | Liste/form ile aynı format. |
| **Item Code** | `BAR-1200` | Ana kayıt anahtarı. |
| **Description** | `Barrier 12'0"` | Tırnak/ölçü karakterleri mock’ta olduğu gibi. |
| **Unit Code** | `EACH - Each` | Formdaki Unit Of Measure ile uyumlu gösterim. |
| **Active** | `Yes` | veya `Evet` — ürün dili tek. |

**Yüzey:** İnce border veya inset row; başlık satırı opsiyonel (tek satır olduğunda sütun etiketleri üstte küçük başlık olarak).

---

## C) Ana bölüm — bileşen ızgarası (data entry grid)

Bu grid, seçilen **ana assembly** altına bağlanan **alt kalemleri** listeler; her satır bir bileşen.

### C.1) Sütunlar (soldan sağa)

| Sütun | Kontrol tipi | Davranış |
|--------|----------------|----------|
| **Actions** | Tek **+ (artı)** düğmesi (mavi kare demo → Neomorphism protrude küçük kare) | **Yeni satır ekle:** tıklanınca grid’e boş bir satır eklenir (veya son satır düzenlenir). |
| **Piece Mark** | **Aranabilir dropdown / combobox** | Mevcut “piece” veya stok kalemlerinden seçim; seçim **sonraki sütunları doldurur** (aşağıda). |
| **Description** | **Tek satır text input** | Kullanıcı düzenleyebilir; demo ekranda bazı satırlarda boş olabilir. |
| **Product Category** | **Salt okunur metin** (auto) | Piece Mark seçilince dolar, örn. `Barrier`. |
| **Prd Code** | **Salt okunur metin** (auto) | Örn. `Barrier` (demo). |
| **Cross Section** | **Salt okunur metin** (auto) | Örn. `BAR - Barrier`. |
| **Active** | Boş / checkbox / metin | Demo ekranda sütun **boş** görünebilir; wireframe’de netleştir: boolean için checkbox veya liste ile uyumlu `Yes`/`No`. |

### C.2) Piece Mark seçimi — cascade (otomatik doldurma)

- Kullanıcı Piece Mark’ta bir öğe seçtiğinde (örn. `BA-1205 - Barrier 12'-5"`):
  - **Product Category**, **Prd Code**, **Cross Section** otomatik dolar.
  - **Description** boş bırakılabilir veya seçimden öneri ile doldurulabilir (ürün kararı — UX sorusu).

### C.3) + (ekle) davranışı

- **+** tıklanınca: yeni satır eklenir; Piece Mark boş veya placeholder.
- İsteğe bağlı: satır silme ikonu (demo’da yok; P1 olarak not düş).

### C.4) Validasyon (wireframe notları)

- Kaydet aksiyonu bu ekranda **görünmüyorsa** (sadece Close): değişikliklerin nasıl persist edildiği belirsiz — **UX kararı zorunlu:**
  - **Seçenek A:** Üst şeritte gizli **Save** ekle (önerilir).
  - **Seçenek B:** Otomatik taslak kayıt.
  - Wireframe prompt çıktısında bu üç seçenekten birini **öner** ve gerekçe yaz.

---

## D) Demo ile tutarlı mock örnek

- Üst özet: `BAR-1200` / `Barrier 12'0"` / `CV Grand Haven (GH)`.
- Grid’de en az **bir satır:** Piece Mark `BA-1205 - Barrier 12'-5"`; Product Category `Barrier`; Prd Code `Barrier`; Cross Section `BAR - Barrier`; Description boş veya dolu.

---

## E) Yerleşim

- Üst özet **tam genişlik** ince band.
- Grid **geniş**, minimal üst/alt boşluk (demo ferah).
- Yatay scroll: çok sütun taşarsa tablo içi yatay kaydırma.

---

## F) Neomorphism + Tailwind

- Özet: inset veya hafif protrude strip.
- Grid başlığı: inset header row.
- Combobox: inset trigger; panel protrude veya dropdown shadow nötr.

---

## G) Çıktıda üret

1. 00 standart çıktı formatı.
2. Üst özet + grid için **kontrol envanteri** (tablo).
3. Cascade akışını madde madde.
4. Save stratejisi (C.4) için net öneri.
5. `eng-01` ile geçiş: View → bu sayfa → Close → liste.
6. 3–5 UX sorusu (ör. aynı piece iki kez, silme, sürümleme).

ÇIKTI: Detay wireframe + Tailwind + mock satırlar + UX soruları
```
