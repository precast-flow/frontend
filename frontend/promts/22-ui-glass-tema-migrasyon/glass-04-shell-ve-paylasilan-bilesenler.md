# glass-04 — Shell ve paylaşılan bileşenler

```
[Buraya 00-ORTAK-BLOK-GLASS-MIGRASYON.md tam metnini yapıştır]
```

## AMAÇ

Tüm sayfalara yayılan **üst bar, alt bilgi, drawer, banner** gibi ortak parçaların glass şablonda neo gri blok gibi kalmamasını sağlamak; **classic** yolunu bozmadan.

## KAPSAM DOSYALARI (BAŞLANGIÇ LİSTESİ — GÜNCELLE)

- `../../app/src/components/TopBar.tsx`
- `../../app/src/components/AppFooter.tsx`
- `../../app/src/components/FactorySummaryDrawer.tsx`
- `../../app/src/components/FactoryContextStrip.tsx`
- `../../app/src/components/SiteLoadingOverlay.tsx`
- `../../app/src/components/production/ProductionRolePreviewBanner.tsx` (varsa)
- `../../app/src/templates/glassmorphism/GlassHeader.tsx` / `GlassAppShell.tsx`

## GÖREVLER

### G4.1 — TopBar

- Arka plan: cam panel (blur + border); içerideki **dropdown / popover** kökleri kesilmesin (`overflow-visible` zinciri kontrolü).
- Arama, fabrika seçici, bildirim paneli, kullanıcı menüsü: **açıkken** z-index üst barın altında kalmamalı ama sidebar modal sırasına göre doğru katmanda olmalı.
- İkon ve metin renkleri: `glass.text.*` token ile uyum.

### G4.2 — Footer

- İnce cam şerit veya ana zemine yakın düz yüzey; link kontrastı AA.

### G4.3 — Drawer / overlay

- `FactorySummaryDrawer` ve benzeri: cam panel + arka plan dim; **focus trap** ve ESC davranışı bozulmaz.

### G4.4 — Loading overlay

- Glass zeminde okunaklı spinner/metin; `classic` ayrı görünüm korunur.

## KISITLAR

- TopBar dosyasında classic görünümü korumak için:
  - Tercih: **`html[data-ui-template='glass']` seçicili CSS** ile TopBar içi sınıfları override et.
  - Zorunlu kalırsa: `useUiTemplate()` ile koşullu `className` — **minimal satır**, davranış değişmez.

## KABUL KRİTERLERİ

- Glass modda: üst bar + footer + en az bir drawer **görsel olarak cam ailesinde**.
- Planlama tam ekranında üst bar dropdown’ları **kesik görünmüyor**.
- `classic` modda: mevcut ekran görüntüleri ile **aynı** (sidebar hariç zaten classic AppShell).

## ÇIKTI

- Ekran görüntüsü veya kontrol listesi (glass dark + glass light).
- Dokunulan dosyalar.
