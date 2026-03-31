# App shell — Prompt 02 çıktısı (Precast Flow)

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` (gri–beyaz, protrude / inset).

---

## 1) ASCII wireframe (yüzey etiketleri)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [protrude] TOP BAR (shadow-neo-out-sm)                                   │
│  Logo PF │ [inset] global arama │ DEMO │ [protrude] bell │ [protrude] user│
└──────────────────────────────────────────────────────────────────────────┘
┌─────────────────┐  ┌────────────────────────────────────────────────────┐
│ [protrude]      │  │ [protrude] ANA İÇERİK — rounded-3xl (shadow-neo-out) │
│ SIDEBAR         │  │  breadcrumb · başlık · aksiyonlar                     │
│ floating panel  │  │  [inset] filtre well · [protrude] KPI …               │
│ rounded-3xl     │  │                                                     │
│                 │  └────────────────────────────────────────────────────┘
│ 4 grup · modül  │  ┌────────────────────────────────────────────────────┐
│ satırları       │  │ [inset] FOOTER — sürüm · senkron · destek            │
└─────────────────┘  └────────────────────────────────────────────────────┘
```

---

## 2) Sidebar ağaç listesi

**Daralt / genişlet (md+):** Üstte **protrude** ok düğmesi (`ChevronLeft` daralt · `ChevronRight` genişlet). Dar modda genişlik ~`4.75rem`, yalnızca **ikon** + `title` tooltip; grup başlıkları ince ayırıcı çizgi. Varsayılan dar mod; tercih kalıcı depolanmaz (oturum içi toggle). Mobil tam ekran menü açıkken her zaman tam genişlik + metin.

**Başlangıç:** Genel Bakış (`dashboard` / `genel-bakis`)

**Dört grup**

1. **Satış & Müşteri** — CRM / İletişim (`crm`), Teklif & Keşif (`teklif`)
2. **Proje & Mühendislik** — Proje Yönetimi (`proje`), Mühendislik Entegrasyonu (`muhendislik`)
3. **Üretim & Kalite** — Üretim MES (`mes`), Kalite (`kalite`), Yard (`yard`)
4. **Lojistik & Saha** — Sevkiyat (`sevkiyat`), Saha (`saha`), Raporlama (`raporlama`), Mobil önizleme (`mobil`)

*Raporlama + Mobil, 01’deki menü yerleşimi için 4. grup altında toplanır.*

---

## 3) Üst bar davranışı + arama kapsamı (öneri)

- **Logo:** ürün adı + kısa bağlam (ERP · MES · Lojistik); mobilde yalnız monogram.
- **Arama:** tek giriş; önerilen kapsam: müşteri / iletişim, proje, teklif, üretim emri, sevkiyat, şantiye görevi — sonuçlar modül bazlı gruplanır (ileride API).
- **DEMO:** salt okunur ortam etiketi; prod’da `PROD` / `TEST` ile değişir.
- **Bildirim:** sayı rozeti sonraya bırakıldı (prototip).
- **Kullanıcı:** açılır menü (Profil, Ayarlar, Çıkış); dışarı tıklanınca kapanır.

---

## 4) Ana kabuk parçaları — Tailwind özeti (1 satır)

| Parça | Özet |
|--------|------|
| Zemin | `min-h-dvh bg-gray-100` |
| Sidebar | `rounded-3xl bg-gray-100 p-4 shadow-neo-out` |
| Üst bar | `rounded-3xl bg-gray-100 shadow-neo-out-sm flex flex-wrap …` |
| Arama | `rounded-full bg-gray-100 shadow-neo-in text-gray-800 placeholder:text-gray-500` |
| İkon / kullanıcı tetik | `rounded-xl bg-gray-100 shadow-neo-out-sm active:shadow-neo-press` |
| Ana kart alanı | `rounded-3xl bg-gray-100 p-5 md:p-6 shadow-neo-out` |
| Footer | `rounded-2xl bg-gray-100 text-xs text-gray-500 shadow-neo-in` |

---

## 5) UX soruları (açık)

1. Global arama sonuçları tek bir “komut paleti” mi, yoksa tam sayfa liste mi olmalı?
2. Sidebar dar modda (tablet) her zaman ikon-only mi, yoksa üst bar hamburger yeterli mi?
3. DEMO ortamında yıkıcı aksiyonlar (sil / sevk iptal) ek onay mı, yoksa salt görsel uyarı mı?
4. Kullanıcı menüsü: şirket / tesis seçimi kabukta mı, yoksa yalnız Ayarlar’da mı?
5. Bildirimler modül bazlı mı gruplanır (MES vs Sevkiyat), yoksa tek kronolojik akış mı?

---

## Uygulama kodu

Canlı kabuk: `app/src/templates/glassmorphism/GlassAppShell.tsx` (+ `GlassLayout`, `GlassHeader`, `GlassSidebar`), `TopBar.tsx`, `Sidebar.tsx`, `AppFooter.tsx`, `MainCanvas.tsx`, `data/navigation.ts`.
