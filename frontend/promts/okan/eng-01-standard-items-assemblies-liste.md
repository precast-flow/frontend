# eng-01 — Standard Items Assemblies — liste / indeks ekranı

```
[Buraya 00-ORTAK-BLOK-STANDARD-ITEMS.md akışıyla: 00-ORTAK-BLOK + 00b + bağlam]

GÖREV: Mühendislik Entegrasyonu modülünde, “Standart öğe setleri” sekmesinin **varsayılan** ekranı: **master liste (grid)**. Tamamen mock veri. Referans: demo ERP “Standard Items Assemblies” liste görünümü; görsel dili Neomorphism + gri-beyaza çevir.

---

## A) Sayfa kimliği ve üst şerit

1. **Sayfa başlığı (sol üst):**
   - Birincil metin: `Standard Items Assemblies` (veya Türkçe ürün kararı: `Standart öğe setleri`).
   - İkincil / bağlam etiketi: `(Demo System)` — küçük, inset veya düz metin (prototip olduğunu belirtir).

2. **Global aksiyonlar (sağ üst, yatay):**
   - **`Add New`** — primary (protrude, koyu gri ton); tıklanınca kayıt formu ekranına gider (`eng-02`, yeni kayıt modu).
   - **`Close`** — secondary veya ghost; tıklanınca: ya üst modül kapanır ya da “Standart öğe setleri” sekmesinden çıkış (ürün kararı; wireframe’de ikisinden birini tek cümleyle yaz).

3. **Yüzey:** Üst şerit `protrude` kart veya tam genişlik toolbar; altına ince inset ayırıcı çizgi.

---

## B) Filtre alanı

1. **“Filter”** — sekme şeklinde veya genişletilebilir başlık (demo ekranda **kapalı**).
2. **Kapalı durum:** Yalnızca “Filter” etiketi + sağda chevron veya “aç” ipucu.
3. **Açık durum (wireframe’de şema olarak tanımla, mock alan öner):**
   - `Location` — çoklu seçim veya tek seçim dropdown (liste ile aynı lokasyon sözlüğü).
   - `Item Code` — metin kısmi arama.
   - `Description` — metin kısmi arama.
   - `Active` — üç durum: Tümü / Evet / Hayır.
   - **`Apply`** (primary küçük) ve **`Clear`** (secondary).
4. Filtre uygulanınca tablo satırları güncellenir (mock’ta anlık filtre simülasyonu).

---

## C) Sayfalama (pagination) şeridi

**Konum:** Tablonun hemen üstünde, yatay hizalı (demo ekranda üst orta / tablo üstü).

1. **`Previous`** — metin link veya düğme; ilk sayfadayken `disabled`.
2. **`Next`** — metin link veya düğme; son sayfadayken `disabled`.
3. **Sayfa seçici:** Dropdown veya native select; gösterim formatı: `Page 1 of 1` (toplam sayfa mock: en az 2 sayfa örneği için ikinci sayfa durumunu da çiz veya metinle tarif et).
4. **Sayfa başına satır:** Dropdown; seçenekler örn. `10, 25, 50, 100`; demo referans: **`50`** seçili.
5. Bu şerit **inset well** içinde (içe gömülü) veya hafif protrude segment.

---

## D) Ana tablo (grid)

### D.1) Sütun başlıkları (soldan sağa)

| Sütun | İçerik tipi | Not |
|--------|-------------|-----|
| **Actions** | İkon düğmeleri | Sabit genişlik; başlık metni “Actions”. |
| **Location** | Metin | Örn. `CV Grand Haven`, `CV Grands Rapids` (mock). |
| **Item Code** | Metin | Örn. `BA-1205`, `CR-0212`, `BAR-1200`. **Sıralama:** başlıkta **artan/azalan** ok ikonu (demo: sortable). |
| **Description** | Metin | Kısa açıklama. |
| **Unit Code** | Metin | Birim kodu + açıklama birleşik gösterim örn. `EACH - Each`. |
| **Active** | Metin veya badge | `Yes` / `No` veya Türkçe `Evet` / `Hayır` (ürün dili tek olsun). |

### D.2) Satır başına aksiyon ikonları (Actions hücresi)

Sola hizalı, **dört** küçük kare düğme (demo):

1. **Düzenle (Edit)** — kalem / kağıt ikonu. Tıklanınca `eng-02` düzenleme modu; ilgili satırın kimliği taşınır.
2. **Görüntüle / Detay (View)** — klasör veya belge ikonu. Tıklanınca `eng-03` detay ekranı; üst özet satırı bu kayıttan dolar.
3. **Kopyala (Copy)** — çift kağıt ikonu. Tıklanınca yeni taslak form veya kopya kayıt akışı (`eng-02`, ön doldurulmuş); kaydetmeden liste değişmez.
4. **Sil (Delete)** — X ikonu. Tıklanınca **onay modalı** (inset uyarı + protrude onay/iptal); onayda satır mock’tan kalkar.

Her ikon için **tooltip** (kısa): düzenle, detay, kopyala, sil.

### D.3) Satır seçimi / vurgu (demo davranışı)

- Belirli bir satırda kullanıcı **Item Code** ve/veya **Description** hücresine tıkladığında bu hücreler **mavi arka plan** ile vurgulanabilir (demo). Neomorphism’ta: **seçili satır** için inset hafif ton veya sol kenarda ince accent çizgisi (mor yok; nötr veya mavi-gri ton çok düşük doygunluk).
- **Tek seçim** varsay; çoklu seçim bu ekranda yok (istemedikçe).

### D.4) Boş liste

- Tablo alanında **inset** boş durum: “Kayıt yok” + `Add New` önerisi.

### D.5) Yükleme

- Tablo gövdesinde skeleton satırları veya tek satır “Yükleniyor…”.

---

## E) Yerleşim ve boşluk

- Demo ekranda tablo üstte; **sayfanın altında geniş beyaz alan** var — wireframe’de tablonun altı boş kalabilir; sayfa **dikey scroll** ile uzar veya tablo sabit yükseklik + iç scroll (ikisinden birini seç ve gerekçeyi UX sorusuna bağla).

---

## F) Mock veri (minimum)

En az **3 satır**, farklı lokasyon ve item code; bir satırda `BAR-1200` / `Barrier 12'0"` gibi detay ekranıyla eşleşen örnek ( `eng-03` ile çapraz mock tutarlılığı).

---

## G) Neomorphism + Tailwind (zorunlu özet)

- Tablo başlık satırı: hafif gri arka plan (inset veya düz), **kalın** başlık yazısı.
- Satır ayırıcılar: ince nötr border.
- Primary aksiyon: `Add New` protrude koyu gri.

---

## H) Çıktıda özellikle üret

1. Bilgi mimarisi + breadcrumb (00 formatı).
2. Bölüm bölüm wireframe (A–E).
3. **Tüm kontrollerin envanter tablosu** (bu dosyadaki gibi kısa bir özet tablo).
4. Durumlar: boş, yükleme, filtre açık, sayfa 2, sil onayı.
5. Üst/alt geçişler: Add, Edit, View, Close.
6. 3–5 UX sorusu (ör. Close’un anlamı, kopya davranışı, filtre varsayılanları).

ÇIKTI: Liste ekranı wireframe + Tailwind satırları + mock tablo + UX soruları
```
