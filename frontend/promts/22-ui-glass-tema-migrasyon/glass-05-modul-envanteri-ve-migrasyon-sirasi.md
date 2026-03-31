# glass-05 — Modül envanteri ve migrasyon sırası

**Ortak blok:** Tüm kurallar için tek kaynak [`00-ORTAK-BLOK-GLASS-MIGRASYON.md`](./00-ORTAK-BLOK-GLASS-MIGRASYON.md) (bu dosyada tam metin tekrarlanmaz).

## AMAÇ

`MainCanvas.tsx` üzerinden açılan **tüm modül görünümleri** için envanter çıkar; glass migrasyonunu **doğru sırayla** ve **tekrarsız** yürüt.

## GÖREV

### G5.1 — Router kaynağı

Kaynak: `../../app/src/components/MainCanvas.tsx` (import + `activeId` dallanması).  
`MainCanvasOutlet` yalnızca `findModuleIdBySlug` ile çözülen segmentleri `MainCanvas`’a iletir; bilinmeyen slug → `/` yönlendirmesi.

| activeId | Bileşen dosyası | Tahmini karmaşıklık | Önerilen faz |
|----------|-----------------|---------------------|--------------|
| `dashboard` | `components/DashboardView.tsx` | Orta | 2–3 |
| `crm` | `components/crm/CrmModuleView.tsx` | Orta | 2–3 |
| `quote` | `components/teklif/QuoteModuleView.tsx` | Orta | 3 |
| `work-start` | `components/satis/StartWorkWizardView.tsx` | Orta | 3 |
| `project` | `components/proje/ProjectModuleView.tsx` | Orta | 3 |
| `engineering` | `components/muhendislik/EngineeringModuleView.tsx` | Orta | 3 |
| `parametric-3d` | `components/parametric3d/Parametric3DModuleView.tsx` | Yüksek | 4 |
| `production-summary` | `components/production/ProductionSummaryDashboard.tsx` | Orta | 2–3 |
| `mes` | `components/mes/MesModuleView.tsx` | Yüksek | 4 |
| `planning-design` | `components/production/PlanningDesignView.tsx` | Yüksek | 4 (+ `glass-08`) |
| `mold-board` | `components/production/MoldBoardView.tsx` | Orta | 3 |
| `pending-priority` | `components/production/PendingPriorityReportView.tsx` | Orta | 3 |
| `concrete-recipe` | `components/production/ConcreteRecipeSelectionView.tsx` | Orta | 3 |
| `batch-plant` | `components/production/BatchPlantOperatorView.tsx` | Orta | 3 |
| `production-role-preview` | `components/production/ProductionRolePreviewView.tsx` | Düşük–orta | 2 |
| `production-factory-ops` | `components/production/ProductionFactoryOpsView.tsx` | Orta | 3 |
| `quality` | `components/kalite/QualityModuleView.tsx` | Yüksek | 3–4 |
| `yard` | `components/yard/YardModuleView.tsx` | Orta | 3 |
| `dispatch` | `components/sevkiyat/DispatchModuleView.tsx` | Orta | 3 |
| `field` | `components/saha/FieldModuleView.tsx` | Orta | 3 |
| `reporting` | `components/raporlama/ReportingModuleView.tsx` | Orta | 3 |
| `mobile` | `components/mobil/MobilePreviewModuleView.tsx` | Düşük | 3 |
| `approval-flow` | `components/onay/ApprovalFlowDesignerView.tsx` | Orta–yüksek | 3 |
| `roles-permissions` | `components/rbac/RolesAndPermissionsView.tsx` | Orta | 3 |
| `user-management` | `components/users/UserManagementView.tsx` | Orta | 3 |
| `unit-work-queue` | `components/unitWorkQueue/UnitWorkQueueView.tsx` | Yüksek | 3–4 (+ `glass-07`) |
| `logistics-field-queues` | `components/unitWorkQueue/LogisticsFieldUnitQueuesView.tsx` | Yüksek | 3–4 |
| *(eşleşmeyen `activeId`)* | `MainCanvas` içi placeholder grid | Düşük | — |

### G5.2 — Sayfa rotaları (shell dışı / ayrı `Route`)

`../../app/src/App.tsx` — `ShellResolver` altında, `MainCanvasOutlet` dışında:

| Route / kimlik | Bileşen | Not | Önerilen faz |
|----------------|---------|-----|--------------|
| `/profile` | `pages/ProfilePage.tsx` | Shell içi, `MainCanvas` değil | 2–3 |
| `/settings` | `pages/SettingsPage.tsx` | Shell içi | 2–3 |
| `/glass-showcase` | `pages/GlassShowcasePage.tsx` | Tema / primitive vitrin | 2 |

**`FirmAdminShell`** (`/firma-ayarlari/*`) — bu pakette **opsiyonel**; üretim kabuğundan ayrı layout.

| Alt rota | Bileşen | Önerilen faz |
|----------|---------|--------------|
| index | `pages/firmAdmin/FirmAdminGeneralPage.tsx` | 4+ |
| `takvim` | `pages/firmAdmin/FirmShiftCalendarPage.tsx` | 4+ |
| `fabrikalar` | `pages/firmAdmin/FirmFactoriesPage.tsx` | 4+ |
| `kullanicilar`, `guvenlik` | `pages/firmAdmin/FirmAdminPlaceholderPage.tsx` | 4+ |
| `degisiklik` | `pages/firmAdmin/FirmSettingsChangePreviewPage.tsx` | 4+ |

**Hariç (glass-01):** `/login`, `/register`, `/403`, `/firma-kurulum` — isteğe bağlı son faz.

### G5.3 — Öncelik sırası kuralları

1. **P0:** Dashboard + ürünün en sık kullanılan 2 modülü (örnek: CRM + `unit-work-queue` veya üretim özeti).
2. **P1:** Form / sihirbaz ağırlıklı (Teklif, İş başlat, Mühendislik girişleri).
3. **P2:** Veri yoğun (Planlama — Tasarım, MES, kuyruk ekranları).
4. **P3:** Özel teknoloji (Parametric 3D, ağır canvas).

### G5.4 — Bağımlılık notları

- **`PlanningDesignView`** → `glass-08` öncesi global sticky / z-index kurallarının sabitlendiğini doğrula (`00` §4).
- **`UnitWorkQueueView`** (drawer’lar) → `glass-07` ile birlikte planlanır.

---

## ÇIKTI — İlk 5 sprintte önerilen modül sırası

Örnek ürün önceliği (P0 = dashboard + CRM + kuyruk); gerektiğinde 2. modülü `production-summary` ile değiştir.

1. **Sprint 1:** `dashboard`, `crm`, `production-summary` — glass outlet + tablo/KPI duman testi.
2. **Sprint 2:** `quote`, `work-start`, `engineering` — form ve birincil/ikincil düğme tutarlılığı (`glass-03`).
3. **Sprint 3:** `project`, `quality` (ilk tur), `roles-permissions` — liste/detay yoğunluk.
4. **Sprint 4:** `unit-work-queue`, `logistics-field-queues` + **`glass-07`** drawer/modal turu.
5. **Sprint 5:** `planning-design` + **`glass-08`** sticky/ızgara; ardından `mes` veya `parametric-3d` (P3) seçimi.

---

## Eksik / tutarsızlık notu

- `findModuleIdBySlug` (`navigation.ts`) **hesap** grubunu (`accountNavGroup`) taramıyor; `/profile` ve `/settings` ayrı `Route` ile çözüldüğü için sorun yok. Teorik olarak yanlışlıkla `MainCanvas`’a `profile` / `settings` `activeId` düşerse dallanma olmadığı için **placeholder** grid görünür — pratikte `moduleIdToPath` İngilizce path kullandığı için nadir.
- `DESC_KEY_BY_MODULE` anahtarları nav ile uyumlu; yeni `NavItem` eklendiğinde hem `MainCanvas` switch’ine hem bu tabloya satır eklenmeli.

## NOT

Bu dosya **canlı dokümandır**; yeni modül veya rota eklendikçe tablo güncellenmelidir.

**Son güncelleme:** 2026-03-26 — `MainCanvas.tsx` + `App.tsx` + `navigation.ts` ile eşitlendi.
