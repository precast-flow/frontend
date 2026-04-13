# eng-02 — Standard Items Assemblies — kayıt formu (yeni / düzenle)

```
[Buraya 00-ORTAK-BLOK-STANDARD-ITEMS.md akışıyla: 00-ORTAK-BLOK + 00b + bağlam]

GÖREV: “Standart öğe setleri” sekmesinde **tek kayıt oluşturma veya düzenleme** ekranı. Referans: demo ERP form ekranı (üstte Save / Save & Close / Close). Tamamen mock veri. Görsel: Neomorphism; demo’daki kırmızı etiketler → **zorunlu alan** göstergesi (asterisk veya “Zorunlu” micro-copy); mavi düğmeler → koyu gri primary protrude.

---

## A) Sayfa kimliği ve üst şerit

1. **Başlık (sol üst):**
   - `Standard Items Assemblies` + isteğe bağlı `(Demo System)`.
   - Form modu netliği: alt başlık veya badge ile **`Yeni`** veya **`Düzenle: {Item Code}`**.

2. **Global aksiyonlar (sağ üst, soldan sağa veya öncelik sırasına göre):**

   | Düğme | Davranış |
   |--------|-----------|
   | **Save** | Sunucuya kaydet (mock: toast “Kaydedildi”); form açık kalabilir veya aynı ekranda kalır. |
   | **Save & Close** | Kaydet ve **liste ekranına** dön (`eng-01`). |
   | **Close** | Kaydetmeden çık; **değişiklik varsa** onay modalı: “Kaydedilmedi; çıkmak istiyor musunuz?” — Evet / Hayır. |

3. Tüm üst şerit **protrude** toolbar.

---

## B) Form alanları (üstten alta, tek sütun veya etiket-satır düzeni)

Demo ekranda etiketler **kırmızı** (zorunlu iması). Wireframe’de her alan için: **Etiket + kontrol**; zorunlu alanlarda etiket sonunda `*` veya küçük kırmızı tonlu `text-red-700` asterisk (00b ile uyumlu, mor yok).

### B.1) Location

- **Etiket:** `Location`
- **Kontrol:** **Dropdown / select** — placeholder: `Select One` (veya Türkçe `Seçiniz`).
- **Genişlik:** Sayfa genişliğinin yaklaşık **üçte biri** veya “tam satır ama max-width” (demo: geniş alan).
- **Zorunlu:** Evet (demo kırmızı etiket).
- **Mock seçenekler:** En az iki lokasyon, örn. `CV Grand Haven (GH)`, `CV Grands Rapids` — liste ekranı ile aynı sözlük.

### B.2) Item Code

- **Etiket:** `Item Code`
- **Kontrol:** **Tek satır text input** (`input type="text"`).
- **Genişlik:** Location’dan **daha dar** (demo: yaklaşık yarı genişlik veya kısa sütun).
- **Zorunlu:** Evet.
- **Validasyon (wireframe notu):** Boş bırakılamaz; mümkünse format kuralı (ürün kararına bırakılabilir — UX sorusu olarak listele).

### B.3) Description

- **Etiket:** `Description`
- **Kontrol:** **Tek satır text input** (demo tek satır; çok satırlı istenirse P2 notu).
- **Genişlik:** Location ile **aynı genişlik bandı** (uzun alan).
- **Zorunlu:** Evet.

### B.4) Unit Of Measure

- **Etiket:** `Unit Of Measure` (veya `Unit of measure`)
- **Kontrol:** **Dropdown / select**.
- **Genişlik:** Uzun alan (Location / Description ile hizalı).
- **Zorunlu:** Evet.
- **Mock seçenekler:** Örn. `EACH - Each`, `SF - Square Feet` (liste ekranındaki `Unit Code` ile tutarlı).

### B.5) Active

- **Etiket:** `Active`
- **Kontrol:** **Checkbox** — tek kutucuk; demo: **işaretli (checked)** varsayılan veya işaretli örnek.
- **Zorunlu:** Hayır (boolean; işaretsiz = false kabulü).
- **Neomorphism:** Checkbox veya **toggle** (00b: checklist ile aynı aile).

---

## C) Hizalama ve yerleşim (demo)

- Etiketler **sağa hizalı**, kontroller **sola** — iki kolonlu form grid (etiket kolonu sabit genişlik, kontrol kolonu esnek).
- Form **sayfanın sol üst** bölgesinde yoğun; sağ ve alt **boş alan** (demo); wireframe’de bilerek ferah bırak.

---

## D) Durumlar

1. **Yeni kayıt:** Alanlar boş (Active hariç varsayılan true olabilir).
2. **Düzenle:** `eng-01` satırından gelen değerlerle dolu.
3. **Kaydet hatası (mock):** Üstte veya alan altında inline hata (inset kırmızı metin).
4. **Read-only mod (isteğe bağlı P2):** Sadece görüntüleme — bu prompt kapsamında değil; sadece not.

---

## E) Klavye ve erişilebilirlik (kısa)

- Tab sırası: Location → Item Code → Description → Unit → Active → Save.
- Her kontrol için `label` `htmlFor` ilişkisi (metinde belirt).

---

## F) Mock senaryo

- Yeni kayıt: kullanıcı doldurur → Save & Close → listeye döner yeni satır görünür.
- Düzenle: `BAR-1200` açılır → Description değişir → Save → toast.

---

## G) Neomorphism + Tailwind

- Form gövdesi büyük **protrude** kart.
- Input/select **inset** well.
- Primary: Save & Close ve Save için koyu gri; Close secondary.

---

## H) Çıktıda üret

1. 00 standart çıktı formatı.
2. **Alan envanteri tablosu** (bu dosyadaki B bölümü özet).
3. Save / Save & Close / Close farkını tek paragrafta netleştir.
4. Üst/alt geçişler (`eng-01` ile).
5. 3–5 UX sorusu (ör. Unit sözlüğü nereden gelir, Item Code unique mi).

ÇIKTI: Form wireframe + Tailwind + mock doldurma + UX soruları
```
