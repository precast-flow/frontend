# Tasarım sistemi derinleştirme — Prompt 15

Precast Flow mini design system: **neumorphic yüzey token’ları**, tipografi/buton kuralları ve erişilebilirlik notları. Görsel dil referansı: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Madde listesi (özet)

- Yüzeyler **protrude** (kart, birincil kontrol) ve **inset** (well, input, pasif track) olarak ayrılır; aynı ekranda güçlü protrude sayısı sınırlı tutulur.
- Renk: yalnızca nötr gri–beyaz; vurgu **koyu gri** (`gray-800` / `gray-900`); mor ve dekoratif gradient yok.
- Token’lar `app/src/index.css` içinde `@theme` altında tanımlı; semantik adlar yeni bileşenlerde tercih edilir, `shadow-neo-*` takma adları korunur.
- Tabloda **≤7 anlamlı sütun**; fazlası **drawer** veya ikinci adımda.
- Form adımları: **5’ten fazla** zorunlu alan veya **3’ten fazla** kavramsal bölüm → **stepper** veya sihirbaz düşünülür.
- Odak halkası ve klavye: tüm etkileşimli kontrollerde görünür `focus-visible:ring-*`; switch’te `role="switch"` + `aria-checked` (veya gizli checkbox + `peer`).

---

## Gölge token tablosu

| Token (CSS) | Utility (Tailwind v4) | Kullanım |
|-------------|----------------------|----------|
| `--shadow-protrude-sm` | `shadow-protrude-sm` | Araç çubuğu, küçük kart, chip |
| `--shadow-protrude-md` | `shadow-protrude-md` | Ana sahne, modül kartı (varsayılan “kart”) |
| `--shadow-protrude-lg` | `shadow-protrude-lg` | Tek güçlü vurgu (hero / tek CTA alanı) |
| `--shadow-inset-sm` | `shadow-inset-sm` | Hafif well, mobil iç yüzey |
| `--shadow-inset-md` | `shadow-inset-md` | Arama, filtre, tablo üst track, form alanı |
| `--shadow-neo-press` | `shadow-neo-press` | Basılı / aktif protrude kontrol |
| `--shadow-neo-in-deep` | `shadow-neo-in-deep` | Yoğun inset (derin kuyu; seyrek) |

**Geriye dönük eşleme:** `shadow-neo-out-sm` → `var(--shadow-protrude-sm)`; `shadow-neo-out` → `var(--shadow-protrude-md)`; `shadow-neo-in` → `var(--shadow-inset-md)`.

### Koyu tema (`html.dark`)

- **Zemin:** `body` → **`gray-900`** taban + çok hafif **radial gradient** (üst/kenar “ışıma”); düz `gray-950` siyahı yerine derinlik verir. Shell sarmalayıcı koyu modda **`bg-transparent`** — gradient `body` üzerinden görünür.
- **Yükseltilmiş yüzey:** `dark:bg-gray-900` / `dark:bg-gray-800`; **çukur / inset** için yer yer `dark:bg-gray-950` (sayfadan bir ton daha koyu).
- **Metin:** `text-gray-900` → `dark:text-gray-50`; gövde `dark:text-gray-200`–`300`; ikincil `dark:text-gray-400`.
- **Gölgeler:** `index.css` içinde `.dark { ... }` ile `--shadow-protrude-*` / `--shadow-inset-*` yeniden tanımlı (daha koyu “gölge”, hafif üst highlight); neumorphism okunaklı kalır.
- **Birincil CTA (koyu mod):** `dark:bg-gray-200 dark:text-gray-900` (açık yüzey üzerinde koyu metin).
- **Uygulama:** `ThemeProvider` + üst bar tema düğmesi; `localStorage` anahtarı `precast-theme`; ilk boyama için `index.html` içi küçük script.

### `theme.extend` notu (Tailwind v3 / JS config)

Bu prototip **Tailwind v4 `@theme`** kullanır. Eski projede `tailwind.config` ile eşdeğer:

```js
theme: {
  extend: {
    boxShadow: {
      'protrude-sm': '3px 3px 8px rgb(163 163 163 / 0.3), -3px -3px 8px rgb(255 255 255 / 0.92)',
      'protrude-md': '6px 6px 14px rgb(163 163 163 / 0.34), -5px -5px 12px rgb(255 255 255 / 0.96)',
      'protrude-lg': '8px 8px 18px rgb(163 163 163 / 0.38), -6px -6px 14px rgb(255 255 255 / 0.96)',
      'inset-sm': 'inset 2px 2px 6px rgb(163 163 163 / 0.28), inset -2px -2px 6px rgb(255 255 255 / 0.92)',
      'inset-md': 'inset 4px 4px 10px rgb(163 163 163 / 0.36), inset -4px -4px 10px rgb(255 255 255 / 0.95)',
    },
  },
},
```

---

## Radius token tablosu

| Token | Utility | Örnek kullanım |
|-------|---------|----------------|
| `--radius-pf-shell` | `rounded-pf-shell` | Main canvas, büyük modül kabı (`1.5rem` ≈ eski `rounded-3xl`) |
| `--radius-pf-card` | `rounded-pf-card` | Kartlar, drawer panelleri (`1rem` ≈ `rounded-2xl`) |
| `--radius-pf-control` | `rounded-pf-control` | Buton, input, küçük karo (`0.75rem` ≈ `rounded-xl`) |
| `--radius-pf-pill` | `rounded-pf-pill` | Sekme track, chip, switch (`9999px` = tam pill) |

---

## Tipografi ve kontrast

| Rol | Öneri (Tailwind) | Minimum kural |
|-----|------------------|---------------|
| Başlık (sayfa) | `text-xl md:text-2xl font-semibold text-gray-900` | Başlık en az `gray-900` veya eşdeğer kontrast |
| Bölüm başlığı | `text-sm font-semibold text-gray-900` | — |
| Gövde | `text-sm text-gray-700` | Gövde metni **asla** `gray-400` üzerinde tek başına; zemin `gray-100` iken gövde `gray-700+` |
| Yardımcı / meta | `text-xs text-gray-500` | İkincil bilgi; uzun paragraflarda `gray-600` tercih |
| Hata | `text-red-700` veya üstü | Okunaklı; düşük doygun pastel kırmızı kullanma |

---

## Buton hiyerarşisi

| Seviye | Görünüm | Örnek sınıflar |
|--------|---------|----------------|
| **Primary** | Koyu dolu **veya** tek güçlü protrude + koyu metin | `bg-gray-800 text-white shadow-neo-out-sm` (dolu); alternatif: `shadow-protrude-md` + `text-gray-900` (açık yüzeyde güçlü kabartma) |
| **Secondary** | Protrude, nötr | `bg-gray-100 text-gray-800 shadow-neo-out-sm` |
| **Ghost** | Düz / neredeyse düz; hover’da hafif arka plan | `bg-transparent text-gray-800 hover:bg-gray-200/60` (gölge yok veya minimal) |

Bir ekranda **en fazla bir** güçlü primary (dolu koyu veya `shadow-protrude-lg` ile tek vurgu).

---

## Tablo yoğunluğu + drawer kuralı

- Varsayılan: **5–7 sütun**; satır yüksekliği rahat (`py-3` civarı); zebra çok hafif.
- **8+ sütun** veya dar viewport’ta taşma: kritik sütunlar tabloda, geri kalanı **drawer**’da (satır tık / “Detay”).
- Drawer: `shadow-neo-out` veya `shadow-protrude-md`, `rounded-pf-card` / `rounded-3xl` ile ana dil ile uyumlu.

---

## Form stepper eşiği

- **5’ten fazla** zorunlu alan **veya** **3’ten fazla** mantıksal grup (ör. Kimlik / Teknik / Onay) → **stepper** veya sihirbaz değerlendir.
- Her adımda net başlık + tek birincil CTA (“İleri” / “Kaydet”).

---

## Erişilebilirlik

- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100` (veya `ring-offset` zemin rengine göre).
- **Klavye:** Özel `div` tıklanabilir yapma; mümkünse `<button>` / `<a>`. Liste + drawer için mantıklı tab sırası.
- **Switch:** Gerçek uygulamada `role="switch"` + `aria-checked` + Space ile toggle; veya `input[type=checkbox]` gizli + `peer` ile stil (`NeoSwitch` yorumlarına bakın).

---

## Neomorphism: 2 kötü / 2 iyi örnek

**Kötü 1 — Düşük kontrast:** `text-gray-500` gövde metni, `bg-gray-100` kart üzerinde uzun paragraf; WCAG göz ardı edilir, göz yorar.  
**İyi:** Gövde `text-gray-700`, başlık `text-gray-900`.

**Kötü 2 — Aşırı gölge:** Kart + buton + sekme hep `shadow-protrude-lg`; iç içe her şey “patlar”, hiyerarşi kaybolur.  
**İyi:** Ana kab `protrude-md`, iç kartlar `protrude-sm` veya inset; tek alanda bir `protrude-lg`.

**Kötü 3 — Inset içinde soluk metin:** Placeholder rengi gövde gibi kullanmak (`text-gray-400` body).  
**İyi:** Placeholder `text-gray-500`, gerçek içerik `text-gray-800` (inset alan içi).

**İyi 4 — Küçük ölçek (mobil çerçeve):** Telefon mock’unda gölge offset’lerini küçült (bkz. `MobilePreviewModuleView` `inPhoneOut`); masaüstü token’ını aynen sıkıştırma.

---

## Precast Flow’a özel 7 kural

1. **Mor ve renkli dekor gradient yok** — vurgu siyah–beyaz–gri.  
2. **Bir modül sahnesi = bir ana protrude seviyesi** (`shadow-neo-out` / `shadow-protrude-md`); içerik bir kademe daha hafif veya inset.  
3. **Inset = okunabilir içerik:** inset well içinde metin minimum `gray-800` başlık, `gray-700` gövde.  
4. **Birincil CTA:** `bg-gray-800` + `text-white` veya tek `shadow-protrude-lg` odaklı alan; ikisi aynı viewport’ta çakışmasın.  
5. **Tablo + drawer:** fazla sütun drawer’a; tablo satırı tıklanabilirse görsel ipucu (`cursor-pointer`, hover).  
6. **Saha / mobil önizleme:** fiziksel ortam ve küçük ekran için protrude’u **bir kademe düşük** offset ile ölçekle.  
7. **Skip link + odak:** `AppShell` içindeki “İçeriğe atla” korunur; modal/drawer açılınca odak tuzağı düşünülür (ileri aşama).

---

## UX soruları

1. Tasarım token’ları tema moduna (yüksek kontrast) göre ikinci set mi alır, yoksa tek gri ölçek mi korunur?  
2. Yoğun veri ekranlarında neumorphism korunacak mı, yoksa “yoğun mod” düz yüzey + ince border mu?  
3. Switch LED için amber istisnası (00b) üründe kullanılacak mı, yoksa tam gri mi?  
4. `protrude-lg` yalnızca marketing / dashboard hero’da mı, operasyon ekranlarında yasak mı?  
5. Drawer genişliği sabit (`max-w-md`) mi rol bazlı mı genişler?

---

## Kod referansı

- Token tanımları: `app/src/index.css` (`@theme`)
- Örnek switch: `app/src/components/NeoSwitch.tsx`
