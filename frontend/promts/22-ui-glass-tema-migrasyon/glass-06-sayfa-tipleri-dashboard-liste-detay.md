# glass-06 — Sayfa tipleri: dashboard, liste, detay

**Ortak blok:** [`00-ORTAK-BLOK-GLASS-MIGRASYON.md`](./00-ORTAK-BLOK-GLASS-MIGRASYON.md)

## AMAÇ

Her modül farklı olsa da üç **arşetip** üzerinden glass tutarlılığı sağlamak:

1. **Dashboard**: KPI kartları, özet listeler, mini grafik alanları.
2. **Liste / directory**: filtre çubuğu + tablo veya kart grid.
3. **Detay**: başlık, sekmeler, yan panel, aksiyon çubuğu.

## TASARIM İLKELERİ

### Dashboard

- KPI: **L3** widget (düşük blur veya blur yok); sayılar **yüksek kontrast**.
- Bölüm başlıkları: `glass.text.secondary`.
- Kart grid: kartlar arası **16–24px** nefes; cam üst üste binmesin.

### Liste

- Filtre alanı: tek **L2** şerit; input’lar `glass-03` ile uyumlu.
- Satır hover: **tek satır blur yok**; hafif arka plan + border parlaklığı.
- Boş durum (empty state): illüstrasyon/metin cam üzerinde okunaklı.

### Detay

- Üst “hero” veya başlık bandı: **L2**; aksiyon butonları sağda hizalı.
- Sekmeler: aktif sekme **seçili cam** veya alt çizgi accent; focus-visible net.

## UYGULAMA ÖZETİ (kod)

| Arşetip | Örnek modül | Host / yardımcı sınıflar |
|---------|-------------|---------------------------|
| Dashboard | `DashboardView` | `gm-glass-arch-dashboard` |
| Liste (+ master–detay) | `CrmModuleView` | `gm-glass-arch-list`, `gm-glass-filter-strip`, `gm-glass-list-panel`, `gm-glass-detail-panel` |
| Detay ağırlıklı | `QuoteModuleView` | `gm-glass-arch-detail`, `gm-glass-list-panel`, `gm-glass-detail-hero` |

Glass stilleri: `../../app/src/styles/themes/glassmorphism.css` içinde **glass-06** bloğu (`html[data-ui-template='glass']` altında). Klasik şablonda yalnızca ek `gm-glass-*` sınıfları vardır; görünüm değişmez.

## GÖREV (UYGULAMA) — kontrol listesi

1. **Dashboard** — KPI ızgarası gap, bölüm `h2` ikincil metin, yapılacaklar satırı hover (blur yok).
2. **CRM** — filtre şeridi L2, tablo hover, boş durum paneli, liste/detay sütun panelleri, sekme `aria-selected`.
3. **Teklif** — liste paneli + detay hero bandı L2, tablo hover CRM ile aynı dil.

## KABUL KRİTERLERİ

- [x] Glass modda üç arşetipte de **aynı panel dili** (border, blur bandı, gölge) hissedilir.
- [x] `classic` modda görünüm değişmez.

## ÇIKTI — P0 / P1

**P0 (yapıldı)**

- Arşetip kök sınıfları + liste/detay ortak panel sınıfları.
- `glassmorphism.css` glass-06: başlık tonları, KPI gap, tablo hover (blur kaldırma), filtre şeridi, paneller, CRM sekmeleri.

**P1 (sonraki sprint)**

- `DashboardCharts` / `OperationSnapshotCard` içi kartlara `gm-glass-*` ihtiyaç halinde.
- Diğer liste modülleri (`unit-work-queue`, vb.) için `gm-glass-list-panel` / `gm-glass-filter-strip` kopyalama.
- `ProjectModuleView` detay hero ile `gm-glass-detail-hero` hizası.

## Değişen dosyalar

- `../../app/src/components/DashboardView.tsx`
- `../../app/src/components/crm/CrmModuleView.tsx`
- `../../app/src/components/teklif/QuoteModuleView.tsx`
- `../../app/src/styles/themes/glassmorphism.css`
- Bu dosya (`glass-06-…md`)

**Son güncelleme:** 2026-03-26
