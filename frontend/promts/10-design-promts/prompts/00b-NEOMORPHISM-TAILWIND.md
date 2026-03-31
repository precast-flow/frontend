# Neomorphism + Tailwind — görsel dil referansı (Precast Flow)

Bu dosya **tüm UI prompt’larıyla birlikte** kullanılır. Amaç: macOS Control Center benzeri **yumuşak kart / pill** yapıları; **sadece gri–beyaz** palet; **okunabilirlik** öncelikli.

---

## 1) Renk ve yasaklar

- **Arka plan:** `bg-neutral-100` veya `bg-gray-100` / `bg-stone-100` (çok açık gri, morumsu ton yok).
- **Yüzey (kart / panel):** `bg-gray-100` üzerinde `bg-gray-50` veya `bg-white/80` ile hafif kontrast (abartısız).
- **Metin:** başlık `text-gray-900`, gövde `text-gray-700`, ikincil `text-gray-500`. Asla düşük kontrastlı “gri üzerine gri” body metni.
- **YASAK:** mor, lavanta, pembe, neon, gökkuşağı gradient dekor; “trend” renkli gölgeler.
- **Vurgu / aktif:** siyah-beyaz-gri: `text-gray-900`, `ring-gray-400`, `bg-gray-200` veya ince `border-gray-300`. İsteğe bağlı tek vurgu: **koyu gri** (`bg-gray-800` text-white) sadece birincil CTA’da.

---

## 2) Neomorphism iki yüzey tipi

**A) Dışa çıkmış (protrude / kart / buton)**  
Çift gölge: açık (sol-üst) + koyu (sağ-alt).

Örnek Tailwind (arbitrary — projede `tailwind.config` ile token yapılabilir):

```text
shadow-[6px_6px_12px_rgb(163_163_163/0.35),-6px_-6px_12px_rgb(255_255_255/0.9)]
rounded-2xl bg-gray-100
```

**B) İçe gömülü (inset / input / track / pasif alan)**  

```text
shadow-[inset_4px_4px_8px_rgb(163_163_163/0.35),inset_-4px_-4px_8px_rgb(255_255_255/0.95)]
rounded-2xl bg-gray-100
```

**Okunabilirlik kuralı:** inset alan içindeki metin mutlaka `text-gray-800` ve üstü; placeholder `text-gray-500`.

---

## 3) Köşe yarıçapı (macOS hissi)

- Büyük konteynerler: `rounded-3xl`
- Kartlar: `rounded-2xl`
- Pill / toggle track: `rounded-full`
- Küçük ikon butonları: `rounded-xl`

---

## 4) Switch / toggle (referans mantık — Tailwind ile)

Kullanıcının verdiği örnek: **inset track** + **dışa çıkmış thumb** + **LED**. Aynı mantık Tailwind’de:

- **Track (konteyner):** `relative h-14 w-36 rounded-full bg-gray-100` + inset gölge (yukarıdaki B).
- **Thumb:** `absolute` konumlu, `rounded-full`, gradient yerine düz `bg-gradient-to-br from-gray-200 to-gray-300` *minimal* veya düz `bg-gray-200` + protrude gölge (A).
- **LED:** küçük `rounded-full`; kapalı `bg-gray-400`, açık `bg-amber-400` *sadece LED için* istisna (isteğe bağlı). İstemezsen açık/kapalı için `bg-gray-600` / `bg-gray-400`.
- **Erişilebilirlik:** gerçek uygulamada `input type="checkbox"` + `peer` veya `role="switch"` + klavye; prompt çıktılarında bunu **not düş**.

Örnek kısa pattern (üretim kodu değil, referans):

```text
peer sr-only … peer-checked:translate-x-[…] 
thumb: transition, protrude shadow, track: inset shadow
```

---

## 5) macOS tarzı kart grid

- Ana içerik alanı: geniş **tek sütun** veya **2 sütun grid** (`gap-4`).
- Her kart: protrude gölge + `rounded-2xl` + iç padding `p-4 md:p-5`.
- Kart içi bölüm ayırıcı: ince `border-gray-200/80` veya ikinci inset “well” alanı (çok hafif).

---

## 6) Tablo, liste, yoğunluk

- Tablo başlığı: `bg-gray-50` veya hafif protrude üst şerit; satırlar zebra **minimal** (`even:bg-gray-50/50`).
- Satır hover: `hover:shadow-sm` veya `hover:bg-gray-100` (kontrastı düşürme).
- Asla 12+ sütunu tek satırda sıkıştırma; fazlası drawer’da.

---

## 7) Her prompt çıktısında istenen “Tailwind satırı”

Her **ana bileşen** (sidebar, üst bar, kart, input, tablo kabı, toggle) için **tek satır** örnek utility önerisi yazılabilir (tam JSX/React üretmek zorunlu değil).

---

## 8) Checklist (tasarım üretirken)

- [ ] Arka plan ve kartlar gri-beyaz; mor yok  
- [ ] Metin kontrastı yeterli (gövde minimum gray-700)  
- [ ] Input/search **inset**; primary buton **protrude** veya dolu koyu gri  
- [ ] Toggle/track örneği ile tutarlı dil  
- [ ] Focus ring görünür (`ring-2 ring-gray-400 ring-offset-2 ring-offset-gray-100`)  
- [ ] Bir ekranda en fazla 1–2 güçlü “protrude” CTA  
