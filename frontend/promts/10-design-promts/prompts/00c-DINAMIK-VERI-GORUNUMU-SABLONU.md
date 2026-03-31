# 00c — Dinamik veri görünümü şablonu (unified collection / tablo–liste–galeri)

Bu dosya **tüm uygulama genelinde** tekrar kullanılacak bir **veri sunumu kabuğu** tanımlar. Kod üretilmez; wireframe + davranış + Tailwind ipuçları istenir.

**Ön koşul:** `00b-NEOMORPHISM-TAILWIND.md` + `00-ORTAK-BLOK.md` kuralları geçerlidir.

---

## 🎯 Amaç

Aynı iş nesnesi kümesini (satır / kayıt), kullanıcı tercihine göre **dinamik olarak** farklı görünümlerde göstermek. Görünüm değişimi **tek ekran içinde** anlık olmalı; tercih (mock) **hatırlanır** (ör. localStorage anahtarı veya “kullanıcı ayarı” mock alanı).

Bu şablon **template** olarak ele alınır: üretim, CRM, kalite listeleri, envanter vb. tüm liste/tablo sayfalarında aynı iskelet tekrarlanır; sadece **satır şeması** ve **aksiyonlar** sayfaya özel kalır.

---

## 🧱 Görünüm modları (zorunlu dörtlü)

| Mod | Türkçe ad | Kullanım |
|-----|-----------|----------|
| **A — Kompakt / ikon** | “İkon görünümü” | Sol tarafta anlamlı ikon (veya ürün/hat avatarı), 1–2 satır metin; yüksek tarama hızı. |
| **B — Liste** | “Liste görünümü” | Dikey liste; birincil + ikincil satır; sağda badge veya kısa metrik. |
| **C — Kolon / tablo** | “Tablo görünümü” | Sütun başlıkları, sıralanabilir sütunlar (mock), hizalı rakamlar; yoğun veri. |
| **D — Galeri** | “Galeri görünümü” | Neumorphic **kart ızgarası**; kartta özet alanlar + durum; görsel/placeholder alanı (mock görsel veya gri kutu). |

**Kural:** Dört mod da **aynı mock veri kaynağını** gösterir; sadece yerleşim ve bilgi yoğunluğu değişir. Bir modda yapılan seçim (çoklu seçim varsa) diğer moda geçince korunur (mock davranışı tanımla).

---

## 🎛️ Görünüm seçici (toolbar)

- **Konum:** Listenin/tabanın üstünde, sağ üst veya araç çubuğunda **segmented** veya **pill** grubu (neumorphic protrude/inset).
- **Etiketler (öneri):** İkon | Liste | Tablo | Galeri (veya kısaltılmış ikon-only + `title` tooltip mock).
- **Durum:** Aktif mod belirgin (inset track / seçili pill); klavya erişilebilirliği için not düş (P1).

---

## 🧩 Ortak kabuk bileşenleri (her sayfada aynı isimlerle düşün)

1. **Üst çubuk:** Başlık, isteğe bağlı alt başlık (fabrika / bağlam), **görünüm seçici**, arama (inset input), filtre tetikleyici.
2. **Yan/üst filtre şeridi (opsiyonel):** Sayfa özel; şablon sadece yer ayırır.
3. **İçerik alanı:** Seçilen moda göre değişen gövde (A/B/C/D).
4. **Boş durum:** Tüm modlarda tutarlı kısa metin + tek CTA (neumorphic).
5. **Seçim şeridi (P1):** Çoklu seçim açıksa altta inset bar: “N öğe seçildi” + toplu aksiyonlar.
6. **Sayfalama veya “daha fazla” (P2):** Tablo ve galeri için özellikle.

---

## 📐 Davranış kuralları

- **Tek veri modeli:** Tasarımda “satır şeması”nı bir kez yaz; dört modda hangi alanın nerede göründüğünü tablo ile eşle.
- **Görünüm tercihi:** Mock’ta `viewMode: 'icon' | 'list' | 'table' | 'gallery'` ve `persist: true` notu.
- **Tablo modu:** Sütun başlıkları gri arka plan veya inset header; satır hover hafif protrude.
- **Galeri modu:** Kartlar `rounded-2xl` / macOS kart hissi; responsive grid (mock breakpoint notu).
- **Erişilebilirlik:** Kontrast, odak halkası, ikon-only butonlarda metin alternatifi (kısa checklist).

---

## 🎨 Tailwind / Neomorphism notları (kısa)

- Görünüm seçici: `rounded-full` veya `rounded-xl` track; aktif segment `shadow-inner`, pasif `shadow`.
- Tablo: zebra yok veya çok hafif; sınırlar inset çizgi ile.
- Galeri kartı: üstte görsel alanı, altta başlık + 2–3 metrik; gölge `00b` ile uyumlu.

---

## ✅ İlk uygulama yeri (zorunlu referans)

Bu şablonun **ilk somut kullanımı** üretim paketinde **`prod-04` — Bekleyen işler / öncelik raporu** ekranıdır. O prompt’ta dört mod açıkça çizilir ve mock satırlar aynı veriyle dört görünümde gösterilir.

---

## 📤 Prompt çıktısı formatı (LLM’den beklenti)

1. **Bileşen özeti** (1 paragraf).
2. **Toolbar + görünüm seçici** wireframe (metin).
3. **Dört görünüm** için kısa wireframe veya madde madde yerleşim.
4. **Aynı 5–8 mock kayıt** ile dört modda “hangi alan nerede” tablosu.
5. **P0 / P1 / P2** özellik ayrımı (ör. sütun gizleme = P1).
6. **3–5 Tailwind satırı** (toolbar + bir kart + tablo header örneği).
7. **Açık sorular** (en fazla 5).

---

## 🔗 İlişkili dosyalar

- `docs/13-ui-production-prompts/prod-04-bekleyen-is-oncelik-raporu.md` — ilk uygulama.
- `docs/11-ui-mvp-prototype/` — liste ağırsa aynı şablon referansı eklenebilir.
- `docs/17-ui-quality-prompts/` — numune listeleri için tekrar kullanım.
