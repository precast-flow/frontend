# 22 — UI Glass tema migrasyonu (prompt paketi)

Bu klasör, **Glass şablonu** (`data-ui-template="glass"`) altında **tüm sayfaların ve iç öğelerin** neo / düz yüzeyden tutarlı cam (glassmorphism) diline taşınması için **sırayla veya paralel** çalıştırılabilecek ayrıntılı promptlardır.

## Önkoşul (mevcut implementasyon)

- Şablon geçişi ve ilk katman: `../10-design-promts/prompts/prod-06-glassmorphism-template-gecis.md`
- Uygulama kodu: `../../app/src/templates/glassmorphism/`, `../../app/src/styles/themes/glassmorphism.css`
- **Canlı takip (Faz 0 / Faz 1 + modül tablosu):** [`IMPLEMENTATION-TRACKER.md`](./IMPLEMENTATION-TRACKER.md)
- **Sayfa sırayla glass’a taşıma (komut listesi):** [`GLASS-SAYFA-MIGRASYON-KOMUTLARI.md`](./GLASS-SAYFA-MIGRASYON-KOMUTLARI.md)
- **glass-02 mimari özeti:** [`glass-02-MIMARI-KARARLAR.md`](./glass-02-MIMARI-KARARLAR.md)
- **glass-03 grep özeti:** [`glass-03-ENVANTER-OZET.md`](./glass-03-ENVANTER-OZET.md)
- **glass-04 shell + paylaşılan bileşenler:** `gm-glass-topbar-host`, `gm-glass-footer-host`, drawer/banner/context host sınıfları + `glassmorphism.css` — ayrıntı [`IMPLEMENTATION-TRACKER.md`](./IMPLEMENTATION-TRACKER.md).
- **glass-05 modül envanteri:** [`glass-05-modul-envanteri-ve-migrasyon-sirasi.md`](./glass-05-modul-envanteri-ve-migrasyon-sirasi.md) — `MainCanvas` + shell rotaları tablosu, sprint sırası.
- **glass-06 sayfa arşetipleri:** [`glass-06-sayfa-tipleri-dashboard-liste-detay.md`](./glass-06-sayfa-tipleri-dashboard-liste-detay.md) — `gm-glass-arch-*`, CRM/Teklif panelleri.

## Çalıştırma sırası (öneri)

| Sıra | Dosya | Amaç |
|------|--------|------|
| 0 | `00-ORTAK-BLOK-GLASS-MIGRASYON.md` | Tüm promptlara ortak kurallar |
| 1 | `glass-01-strateji-kapsam-ve-fazlar.md` | Kapsam, risk, faz planı |
| 2 | `glass-02-token-css-katman-mimari.md` | Token, global CSS, kapsam sınıfları |
| 3 | `glass-03-primitives-dugme-input-kart.md` | Buton, input, kart, chip |
| 4 | `glass-04-shell-ve-paylasilan-bilesenler.md` | TopBar, footer, paylaşılan layout |
| 5 | `glass-05-modul-envanteri-ve-migrasyon-sirasi.md` | Hangi dosya, hangi sırada |
| 6 | `glass-06-sayfa-tipleri-dashboard-liste-detay.md` | Sayfa şablonları |
| 7 | `glass-07-form-wizard-stepper-modal-drawer.md` | Form ve overlay’ler |
| 8 | `glass-08-tablo-izgara-zaman-cizelgesi.md` | Veri yoğun / sticky / DnD |
| 9 | `glass-09-ozel-viewer-3d-canvas-harita.md` | Three.js, canvas, özel viewer |
| 10 | `glass-10-i18n-dark-mode-erisimilik-qa.md` | Tema, a11y, test, regresyon |

## Çıktı beklentisi (her teknik prompt için)

Uygulayan model / geliştirici şunları üretmeli veya güncellemeli:

1. **Değişen dosya listesi** (path bazlı).
2. **Klasik şablonda regresyon yok** (`ui-template=classic` aynı görünüm).
3. **Ekran görüntüsü veya kısa kontrol listesi** (light/dark glass).
4. **P0 / P1 / P2** ayrımı.

## Not

Bu paket **ürün özelliği** değil **görsel sistem migrasyonu**dur; iş kuralları veya mock veri şeması değiştirilmez (aksi promptta yazılı değilse).
