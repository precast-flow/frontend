# 00 — Ortak blok — Glass tema migrasyonu

**Bu paketteki her `glass-*.md` dosyasını çalıştırmadan önce** aşağıdaki kuralları bağlam olarak ekle.

---

## 1) Amaç

- `html[data-ui-template="glass"]` aktifken uygulama genelinde **tutarlı glassmorphism** (yarı saydam katmanlar, blur, yumuşak border, hiyerarşi).
- **`classic` şablon** davranışı ve görünümü **korunur**; regresyon kabul edilmez.

## 2) Teknik sınırlar

- Mümkün olduğunca **additive** yaklaşım: yeni sınıflar, token’lar, `glass` kapsamlı CSS; klasik yolu kıran geniş `!important` yağmurundan kaçın.
- **Tek kaynak token**: `../../app/src/styles/themes/glassmorphism.css` ve gerekiyorsa `glassTokens.ts`; çoğaltılmış renk hex’leri dağıtma.
- **Kapsam tercihi**:
  - Önce ` .gm-glass-outlet-scope` ve ` .gm-glass-sidebar-root` gibi **köprü sınıfları** altında geniş kurallar.
  - Yetersiz kalırsa hedef bileşende **isteğe bağlı `data-glass` / `className` uzantısı** (klasik props ile koşullu değil, mümkünse saf CSS ile).

## 3) Katman modeli (hatırlatma)

- **L0**: sayfa zemini (gradient / blob) — `GlassLayout` / `gm-glass-page`
- **L1**: ana kabuk panelleri (sidebar, main çerçeve, header sarmalayıcı)
- **L2**: modül kökü (`bg-pf-surface` eşleniği)
- **L3**: kart, satır, chip, inline widget  
Her seviyede **blur + opaklık + border** tutarlılığı; iç içe 4+ ağır blur’dan kaçın.

## 4) Z-index ve stacking

- Glass şablonda **sidebar** ana içerikten **üstte** kalmalı (hover genişleme dahil).
- `backdrop-filter` / `transform` / `filter` **yeni stacking context** yaratır; her değişiklikten sonra **Planlama — Tasarım** gibi sticky/`z-[60]` içeren ekranlarda **menü–içerik overlap** kontrolü zorunlu.
- Sabit üst bar (`z-[95]` bandı) ile çakışma: sidebar **altında**, modal/drawer **üstünde** olacak şekilde hiyerarşi dokümante edilmeli.

## 5) Erişilebilirlik

- **Kontrast**: cam üzerinde metin ve kontroller WCAG 2.1 **AA** hedefi (mümkün olduğunca); şüpheli yüzeyde opaklığı artır.
- **focus-visible**: mevcut ring stilleri glass ile görünür kalmalı; cam yüzeyde ring rengi token ile uyumlu.
- **prefers-reduced-motion**: ağır animasyon ve gereksiz transition azaltılsın (`gm-motion` ile uyumlu).

## 6) Performans

- Mobilde blur yoğunluğu düşürülmüş varyant (`glass-lite` veya medya sorgusu).
- Büyük listelerde **her satıra blur** uygulanmaz; satırda düz yarı saydam arka plan tercih edilir.

## 7) Test checklist (minimum)

- [ ] `classic` + ana dashboard
- [ ] `glass` + dashboard
- [ ] `glass` + dar sidebar hover genişlemesi
- [ ] `glass` + Planlama — Tasarım (ızgara, sticky başlıklar)
- [ ] `glass` + en az bir **modal** ve bir **drawer**
- [ ] `glass` + **light** ve **dark** tema (ThemeProvider)
- [ ] `/glass-showcase` (örnek sayfa) bozulmamış

## 8) Çıktı formatı

Her alt promptta üretilen yanıtta şunlar bulunsun:

1. Yapılan işin özeti (madde madde).
2. Dokunulan dosyalar (`../../app/src/...`).
3. Bilinen riskler / bilerek ertelenen P2 maddeler.
4. Sonraki adımda hangi `glass-XX` dosyasının çalıştırılacağı.

---

**Referans:** `../10-design-promts/prompts/prod-06-glassmorphism-template-gecis.md`
