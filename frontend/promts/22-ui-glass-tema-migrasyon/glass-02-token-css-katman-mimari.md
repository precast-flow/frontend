# glass-02 — Token, CSS katmanı ve mimari

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

Glass görünümünü **tek yerden** yönetilebilir kıl; `classic` ile **çakışmayan** seçiciler kullan.

## MEVCUT DURUM (REFERANS)

- Token ve panel sınıfları: `../../app/src/styles/themes/glassmorphism.css`
- Shell: `../../app/src/templates/glassmorphism/GlassAppShell.tsx`
- Outlet kapsamı: `.gm-glass-outlet-scope`
- Sidebar kapsamı: `.gm-glass-sidebar-root`

## GÖREVLER

### G2.1 — Token genişletme

Aşağıdaki semantik token’ları (CSS custom properties) tanımla veya mevcutları dokümante et; **light/dark glass** için ayrı değer ver:

- `glass.surface.page` → zemin gradient (mevcut `--glass-bg-primary` ile hizala)
- `glass.surface.panel` / `panel-strong` / `widget`
- `glass.border.default` / `subtle`
- `glass.text.primary` / `secondary` / `disabled`
- `glass.state.hover` / `active` / `selected`
- `glass.shadow.raise` / `inset`
- `glass.blur.sm` / `md` / `lg` (px cinsinden veya isimsel)

**TypeScript**: `glassTokens.ts` içinde bu isimleri `var(--...)` ile eşle.

### G2.2 — Katman kuralları (CSS)

`@layer components` içinde yeni yardımcı sınıflar öner:

- `.gm-glass-surface-panel` — modül içi `bg-pf-surface` yerine geçen tek tip yüzey
- `.gm-glass-control` — input/button ortak zemin (neo gölge yerine cam)
- `.gm-glass-divider` — `border-gray-200/90` yerine token border

Hepsi yalnızca:

```text
html[data-ui-template='glass'] ... 
```

veya `.gm-glass-outlet-scope` altında çalışmalı.

### G2.3 — “Escape hatch”

Yoğun veri satırları için **blur’suz** sınıf:

- `.gm-glass-solid-row` — hafif opak düz renk, blur yok

### G2.4 — Mimari karar dokümanı

Kısa bölüm yaz:

- Ne zaman **saf CSS** yeter?
- Ne zaman **bileşen prop’u** (`variant="glass"`) gerekir?
- Ne zaman **yeni alt bileşen** (`GlassButton` vb.) oluşturulur?

## KABUL KRİTERLERİ

- `classic` şablonda **hiçbir yeni kural tetiklenmiyor** (seçici doğrulaması).
- `glass` şablonda **en az 3 yeni yardımcı sınıf** kullanıma hazır ve `GlassShowcasePage` veya bir modülde örneklenmiş.
- Build kırılmıyor (`npm run build`).

## ÇIKTI

- Güncellenmiş / yeni CSS + TS token listesi.
- 10 satırlık “mimari karar” özeti.
