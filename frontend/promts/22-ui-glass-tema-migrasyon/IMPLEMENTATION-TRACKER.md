# Glass migrasyon — Faz 0 / Faz 1 takip dokümanı

Kaynak: `00-ORTAK-BLOK-GLASS-MIGRASYON.md`, `glass-01-strateji-kapsam-ve-fazlar.md`  
Uygulama kodu: `../../app/src/`

---

## Risk ve mitigasyon (özet)

| Risk | Mitigasyon |
|------|------------|
| Z-index / stacking | Sidebar `md:z-[70]`, içerik `z-0`; Planlama sonrası kontrol; tablo: `glass-08` |
| Okunabilirlik | Token ile metin rengi; şüphede panel opaklığını artır |
| Performans | Satır/hücreye blur yok; `gm-glass-lite` / mobil düşük blur |
| Bakım | Tek dosya `glassmorphism.css` + `glassTokens.ts`; `!important` sadece sidebar gibi zorunlu yerde |

---

## Rollback (faz başına, tek cümle)

| Faz | Rollback |
|-----|----------|
| Faz 0 | Doküman silinir / güncellenir; koda etki yok. |
| Faz 1 | `glassmorphism.css` içindeki yeni blokları revert; `glassTokens.ts` eski hal. |
| Faz 2 | Primitives CSS/TS revert; klasik şablon aynı kalır. |
| Faz 3–4 | İlgili modül `className` / CSS seçicileri revert. |
| Faz 5 | QA notları; `ui-template` localStorage `classic` ile anında eski shell. |

---

## 2 haftalık örnek sprint

### Hafta 1

- **S1-P0:** Faz 1 global outlet kuralları (bu commit) + dashboard / CRM smoke test.
- **S1-P1:** `glass-04` TopBar + footer cam ince ayar.
- **S1-P2:** `glass-03` buton/input ilk tur (en çok kullanılan 2 modül).

### Hafta 2

- **S2-P0:** `glass-08` Planlama — Tasarım sticky + z-index doğrulama.
- **S2-P1:** `glass-07` bir modal + bir drawer.
- **S2-P2:** `glass-09` Parametric 3D viewer alanı.

---

## Modül envanteri (MainCanvas × öncelik × faz)

`activeId` → bileşen dosyası → karmaşıklık → önerilen faz → öncelik.

| activeId | Bileşen (path) | Karmaşıklık | Faz | Öncelik |
|----------|----------------|-------------|-----|---------|
| `dashboard` | `components/DashboardView.tsx` | Orta | 1–3 | **P0** |
| `crm` | `components/crm/CrmModuleView.tsx` | Orta | 2–3 | **P0** |
| `quote` | `components/teklif/QuoteModuleView.tsx` | Orta | 3 | P1 |
| `work-start` | `components/satis/StartWorkWizardView.tsx` | Orta | 3 | P1 |
| `project` | `components/proje/ProjectModuleView.tsx` | Orta–yüksek | 3 | P1 |
| `engineering` | `components/muhendislik/EngineeringModuleView.tsx` | Orta | 3 | P1 |
| `parametric-3d` | `components/parametric3d/Parametric3DModuleView.tsx` | Yüksek | 4 | P2 |
| `production-summary` | `components/production/ProductionSummaryDashboard.tsx` | Orta | 2–3 | P0 |
| `mes` | `components/mes/MesModuleView.tsx` | Yüksek | 4 | P1 |
| `planning-design` | `components/production/PlanningDesignView.tsx` | Yüksek | 4 | **P0** |
| `mold-board` | `components/production/MoldBoardView.tsx` | Orta | 3 | P2 |
| `pending-priority` | `components/production/PendingPriorityReportView.tsx` | Orta | 3 | P2 |
| `concrete-recipe` | `components/production/ConcreteRecipeSelectionView.tsx` | Orta | 3 | P2 |
| `batch-plant` | `components/production/BatchPlantOperatorView.tsx` | Orta | 3 | P2 |
| `production-role-preview` | `components/production/ProductionRolePreviewView.tsx` | Düşük–orta | 2 | P2 |
| `production-factory-ops` | `components/production/ProductionFactoryOpsView.tsx` | Orta | 3 | P2 |
| `quality` | `components/kalite/QualityModuleView.tsx` | Yüksek | 3–4 | P1 |
| `yard` | `components/yard/YardModuleView.tsx` | Orta | 3 | P2 |
| `dispatch` | `components/sevkiyat/DispatchModuleView.tsx` | Orta | 3 | P2 |
| `field` | `components/saha/FieldModuleView.tsx` | Orta | 3 | P2 |
| `reporting` | `components/raporlama/ReportingModuleView.tsx` | Orta | 3 | P2 |
| `mobile` | `components/mobil/MobilePreviewModuleView.tsx` | Düşük | 3 | P3 |
| `approval-flow` | `components/onay/ApprovalFlowDesignerView.tsx` | Orta–yüksek | 3 | P2 |
| `roles-permissions` | `components/rbac/RolesAndPermissionsView.tsx` | Orta | 3 | P2 |
| `user-management` | `components/users/UserManagementView.tsx` | Orta | 3 | P2 |
| `unit-work-queue` | `components/unitWorkQueue/UnitWorkQueueView.tsx` | Yüksek | 3–4 | P0 |
| `logistics-field-queues` | `components/unitWorkQueue/LogisticsFieldUnitQueuesView.tsx` | Yüksek | 3–4 | P1 |

**Shell içi sayfalar (MainCanvasOutlet dışı route ama aynı kabuk):** `ProfilePage`, `SettingsPage`, `GlassShowcasePage` → Faz 2–3, P2.

**Hariç (glass-01):** `/login`, `/register`, `/firma-ayarlari` → isteğe bağlı Faz 5+.

---

## Minimum test checklist (00 ortak blok)

- [ ] classic + dashboard  
- [ ] glass + dashboard  
- [ ] glass + sidebar dar / hover  
- [ ] glass + Planlama — Tasarım  
- [ ] glass + modal + drawer  
- [ ] glass light + dark tema  
- [ ] `/glass-showcase`  

---

## Sonraki prompt

**`glass-07-form-wizard-stepper-modal-drawer.md`** (modal/drawer + `UnitWorkQueueView`) veya **`glass-08-tablo-izgara-zaman-cizelgesi.md`** (Planlama — Tasarım).

---

## Yapılan işler günlüğü

### 2026-03-26 — Faz 0 + Faz 1 (başlangıç)

- **Faz 0:** Bu dosya + `README.md` içinde takip linki; modül × öncelik × faz tablosu; 2 haftalık sprint; rollback özeti; risk tablosu.
- **Faz 1 (kod):** `../../app/src/styles/themes/glassmorphism.css` — `--glass-blur-sm|md|lg`; panel sınıflarında `blur(var(--glass-blur-*))`; `.gm-glass-surface-panel`, `.gm-glass-solid-row`; outlet altında `bg-gray-50` / `bg-gray-100` / `bg-white` ve koyu tema `dark:bg-gray-*` eşlemeleri; metin alanı `input` / `textarea` / `select` + placeholder.
- **Token:** `glassTokens.ts` genişletildi (blur, gölge, widget, muted border).
- **Klasik şablon:** Seçiciler yalnızca `html[data-ui-template='glass']` + `.gm-glass-outlet-scope` / sidebar kökü; değişmez.

### glass-02 — Token / katman mimarisi

- **CSS:** `--glass-surface-*`, `--glass-border-default|subtle`, `--glass-text-secondary|disabled`, `--glass-state-*`, `--glass-shadow-raise|inset`; `.gm-glass-surface-panel` / `.gm-glass-control` / `.gm-glass-divider` / `.gm-glass-divider-vertical` yalnızca `glass` veya `.gm-glass-scope` altında; sidebar blur `var(--glass-blur-lg)`.
- **TS:** `glassTokens.ts` — `glass.surface.*`, `glass.border.default`, `glass.state.*`, `glass.shadow.raise|inset`.
- **Örnek:** `/glass-showcase` içinde glass-02 kartı.
- **Doküman:** `glass-02-MIMARI-KARARLAR.md`.

### glass-03 — Primitives (düğme, input, kart, chip, switch)

- **CSS (`glassmorphism.css`):** Outlet altında hedefli buton kuralları (ikincil `bg-gray-100` / `dark:bg-gray-8xx`, KPI `rounded-2xl`, birincil `bg-gray-800` gradient + `dark:bg-gray-200` ayrı), tehlike (`border-red` / `text-red-8xx` + neo-sm), `button:disabled`, tüm outlet `button:focus-visible`, `input/textarea/select:focus-visible`, checkbox/radio `accent-color`, `NeoSwitch` `role="switch"`, `shadow-neo-in` kartlar, `span.rounded-full.border.px-*` chip; yardımcı `.gm-glass-btn-primary|secondary|ghost|danger`, `.gm-glass-card-inset`; `prefers-reduced-motion` ile `transform` kapatma.
- **TS:** `glassPrimitiveClasses` export (`glassTokens.ts`).
- **Örnek:** `/glass-showcase` glass-03 kartı.
- **Envanter özeti:** `glass-03-ENVANTER-OZET.md`.
- **Etkilenen modüller (otomatik):** Örn. **Dashboard** (KPI `rounded-2xl`, ikincil düğmeler), **Teklif** (birincil/ikincil/tehlike neo-sm) — JSX değişmedi, yalnızca glass şablonda CSS.

### glass-04 — Shell ve paylaşılan bileşenler

- **Host sınıfları:** `GlassHeader` → `gm-glass-topbar-host`; `GlassAppShell` footer sarmalayıcı → `gm-glass-footer-host`; `FactorySummaryDrawer` → `gm-glass-drawer-backdrop` / `gm-glass-drawer-panel`; `ProductionRolePreviewBanner` → `gm-glass-role-preview-banner`; `FactoryContextStrip` → `gm-glass-factory-context` (klasik şablonda yalnızca ek sınıf; stiller yalnızca `html[data-ui-template='glass']` altında).
- **CSS (`glassmorphism.css`):** TopBar içi metin, ikincil kontroller, `role="menu"` panelleri, odak halkası; footer link/metin; drawer zemin + panel + iç kartlar; `SiteLoadingOverlay` (Suspense) cam dostu zemin; rol önizleme şeridi; outlet/main altında bağlam metni; `prefers-reduced-motion` ile drawer/overlay blur kapatma.

### glass-05 — Modül envanteri ve migrasyon sırası

- **Doküman:** `glass-05-modul-envanteri-ve-migrasyon-sirasi.md` — `MainCanvas.tsx` tam `activeId` × bileşen tablosu; shell sayfaları (`ProfilePage`, `SettingsPage`, `GlassShowcasePage`); `FirmAdminShell` alt rotaları (Faz 4+); P0–P3 sıra kuralları; `PlanningDesignView` / `UnitWorkQueueView` bağımlılık notları; beş sprintlik örnek sıra; `findModuleIdBySlug` / placeholder uyarısı.

### glass-06 — Sayfa tipleri (dashboard / liste / detay)

- **TSX:** `DashboardView` → `gm-glass-arch-dashboard`; `CrmModuleView` → `gm-glass-arch-list` + `gm-glass-filter-strip`, `gm-glass-list-panel`, `gm-glass-detail-panel`; `QuoteModuleView` → `gm-glass-arch-detail` + `gm-glass-list-panel`, `gm-glass-detail-hero`.
- **CSS (`glassmorphism.css`):** glass-06 — bölüm başlıkları `--glass-text-secondary`; KPI ızgarası ve alt grid nefesi; yapılacaklar satırı hover (gölge kaldırma); filtre şeridi L2; tablo satırı hover (blur yok, token dolgu); CRM boş durum; liste/detay/hero panelleri ortak blur-border-gölge; CRM sekmelerinde `aria-selected` seçili cam.
- **Doküman:** `glass-06-sayfa-tipleri-dashboard-liste-detay.md` güncellendi.

### Genel bakış + MainCanvas glass (tam tur)

- **TSX:** `MainCanvas` kök → `gm-glass-main-canvas`; `DashboardCharts` → `gm-glass-dashboard-charts-root`; tüm grafik/özet kartları → `gm-glass-dashboard-card` (`dashboard/DashboardCharts.tsx`).
- **CSS:** `glassmorphism.css` — modül gövdesi üst şerit (border, metin hiyerarşisi), açıklama satırı; dashboard grafik kartları, iç grafik kuyuları, operasyon özeti satırları, intro/çoklu fabrika uyarısı, yapılacaklar iç bölmeleri.
- **Sıralı migrasyon:** `GLASS-SAYFA-MIGRASYON-KOMUTLARI.md` (35 bölüm; CRM/Teklif/diğer modüller ve diyaloglar için kopyala-yapıştır komutlar).

### Sol menü hover + CRM overlay (GLASS-SAYFA-MIGRASYON)

- **Sidebar / `GlassLayout`:** Dar genişlik ↔ genişlik React ile senkron; `max-md:overflow-x-hidden` (masaüstünde hover kesilmesin).
- **CRM:** `CrmNewCustomerModal` — `gm-glass-drawer-backdrop`, `gm-glass-modal-shell`; `CrmExtraDrawer` — `gm-glass-drawer-backdrop`, `gm-glass-drawer-panel`; `glassmorphism.css` — `gm-glass-modal-shell` metin/içerik/kayıt düğmesi gradient; drawer içi `rounded-xl` kartlar.
