# Precast Flow — UI prototip

`prompts/` altındaki **Neomorphism + Tailwind (gri–beyaz)** kurallarına uygun çalışan React kabuğu.

## Klasör yapısı

| Yol | Açıklama |
|-----|-----------|
| `prompts/` | Tasarım ve modül prompt’ları (`00-ORTAK-BLOK`, `00b`, `01` …) |
| `react-wireframe-prompts.md` | Kısa indeks |
| `app/` | Vite + React + TypeScript + Tailwind v4 uygulaması |
| `AUTH-PAGES-SPEC.md` | `/login`, `/register`, `/403`, 404 — neumorphic auth & hata sayfaları |
| `ACCOUNT-PAGES-SPEC.md` | `/profile`, `/settings` — kabuk içi profil ve ayarlar |

## Kurulum ve çalıştırma

```bash
cd app
npm install
npm run dev
```

Tarayıcıda Vite’ın verdiği yerel adresi açın (genelde `http://localhost:5173`).

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## Görsel dil

- Zemin ve yüzeyler: `gray-100` / `gray-50`; metin `gray-900`–`gray-500`.
- **Protrude:** kartlar, ikon butonları, ana içerik kabı — `shadow-neo-out` / semantik `shadow-protrude-md` (`src/index.css` içinde `@theme`).
- **Inset:** global arama, filtre well, seçili olmayan pasif alanlar — `shadow-neo-in` / `shadow-inset-md`.
- Birincil CTA: `bg-gray-800` + `text-white` (mor / dekoratif gradient yok).

**Tasarım sistemi (prompt 15):** token tabloları, buton hiyerarşisi, tablo/drawer, stepper eşiği, a11y — `TASARIM-SISTEMI-SPEC.md`.

**Koyu tema:** üst barda ay/güneş; `localStorage` (`precast-theme`). Zemin **`gray-900` + hafif radial gradient** (düz siyah değil); kartlar `gray-800/900`, inset alanlar bazen `gray-950`. Gölge token’ları `.dark` altında; odak `ring-offset` **`gray-900`** ile zemine hizalı.

**App shell (prompt 02):** dört gruplu menü (masaüstünde **daraltılabilir** yan panel, ikon modu), üst barda logo + inset arama + kullanıcı menüsü; gölge hiyerarşisi ve metin çıktıları için bkz. `APP-SHELL-SPEC.md`.

**Dashboard (prompt 03):** `DASHBOARD-SPEC.md` + `app/src/components/DashboardView.tsx`; varsayılan ekran Genel Bakış.

**CRM (prompt 04):** `CRM-SPEC.md` + `app/src/components/crm/`.

**Teklif (prompt 05):** `TEKLIF-SPEC.md` + `app/src/components/teklif/`.

**Proje (prompt 06):** `PROJE-SPEC.md` + `app/src/components/proje/`.

**Mühendislik (prompt 07):** `MUHENDISLIK-SPEC.md` + `app/src/components/muhendislik/`.

**MES (prompt 08):** `MES-SPEC.md` + `app/src/components/mes/`.

**Kalite (prompt 09):** `KALITE-SPEC.md` + `app/src/components/kalite/`.

**Yard (prompt 10):** `YARD-SPEC.md` + `app/src/components/yard/`.

**Sevkiyat (prompt 11):** `SEVKIYAT-SPEC.md` + `app/src/components/sevkiyat/`.

**Saha (prompt 12):** `SAHA-SPEC.md` + `app/src/components/saha/`.

**Raporlama (prompt 13):** `RAPORLAMA-SPEC.md` + `app/src/components/raporlama/`.

**Mobil önizleme (prompt 14):** `MOBIL-SPEC.md` + `app/src/components/mobil/`.

**Uçtan uca demo (prompt 16):** `DEMO-AKISI-SPEC.md` · senaryo adımları `app/src/data/demoFlow.ts` (isteğe bağlı veri; Genel Bakış’ta grafik panosu var).

**Genel bakış grafikleri:** `dashboardMock.ts` + `app/src/components/dashboard/DashboardCharts.tsx`.
