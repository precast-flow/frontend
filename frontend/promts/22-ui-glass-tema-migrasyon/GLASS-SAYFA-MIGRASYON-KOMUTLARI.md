# Glass şablon — sayfa sıralı migrasyon komutları

**Amaç:** Klasik görünümü bozmadan (`html[data-ui-template='classic']`) her yüzeyi glass diline taşımak.  
**Teknik:** Önce `glassmorphism.css` (`html[data-ui-template='glass']` + gerekirse `gm-glass-*` host), sonra diyalog/drawer bileşenleri.

**Nasıl kullanılır:** Aşağıdan **tek bir** `##` bölümünü seçip asistana gönderin. Örnek:

```text
@10-ui-prototype/promts/22-ui-glass-tema-migrasyon/GLASS-SAYFA-MIGRASYON-KOMUTLARI.md içindeki "## 05 — CRM modülü" bölümünü glass şablona göre uygula; diyaloglar dahil.
```

---

## Durum özeti

| No | Bölüm | Durum |
|----|--------|--------|
| 01 | Genel bakış + MainCanvas ortak krom | **Yapıldı** |
| 01b | Sol menü dar / hover genişleme (glass) | **Yapıldı** — `GlassLayout` `max-md:overflow-x-hidden`; `Sidebar` genişlik React senkronu |
| 02 | Shell: Profil | Bekliyor |
| 03 | Shell: Ayarlar | Bekliyor |
| 04 | Shell: Glass showcase | Bekliyor |
| 05 | CRM + modal/drawer | **Yapıldı** — `CrmNewCustomerModal` (`gm-glass-drawer-backdrop` + `gm-glass-modal-shell`), `CrmExtraDrawer` (`gm-glass-drawer-*`), `glassmorphism.css` modal + CRM drawer kartları |
| 06 | Teklif + onay drawer + PDF modal | Kısmen |
| 07–30 | Diğer `MainCanvas` modülleri | Bekliyor |
| 31+ | Auth / firma / 403 / 404 | Bekliyor |

---

## 01 — Genel bakış (`/`) + MainCanvas ortak gövde

**Rota:** `/` (`activeId: dashboard`)  
**Dosyalar:** `components/DashboardView.tsx`, `components/dashboard/DashboardCharts.tsx`, `components/MainCanvas.tsx`  
**Diyalog:** Yok  

**Yapılan:** `gm-glass-main-canvas`, `gm-glass-dashboard-card`, `gm-glass-dashboard-charts-root`; `glassmorphism.css` içinde üst breadcrumb/başlık metinleri, grafik kartları, KPI alanı (`glass-06` ile birlikte), yapılacaklar kutusu, çoklu fabrika uyarısı.

---

## 02 — Shell: Profil

**Rota:** `/profile`  
**Dosyalar:** `pages/ProfilePage.tsx`, varsa `components/ModuleShellFrame.tsx`  
**Diyalog:** Sayfada tanımlıysa listele  

**Komut:** Bu bölüm başlığını kopyalayıp: «Profil sayfasını ve altındaki tüm diyalogları glass şablona uyarla.»

---

## 03 — Shell: Ayarlar

**Rota:** `/settings`  
**Dosyalar:** `pages/SettingsPage.tsx`  
**Diyalog:** Varsa  

**Komut:** «Ayarlar sayfası + diyaloglar — glass.»

---

## 04 — Shell: Glass showcase

**Rota:** `/glass-showcase`  
**Dosyalar:** `pages/GlassShowcasePage.tsx`  
**Diyalog:** Yok  

**Komut:** «Showcase sayfası glass token’larla tam hizalı mı kontrol et; gerekiyorsa güncelle.»

---

## 05 — CRM modülü

**Rota:** `/crm`  
**Dosyalar:** `components/crm/CrmModuleView.tsx`, `CrmNewCustomerModal.tsx`, `CrmExtraDrawer.tsx`  
**Diyalog / drawer:** `CrmNewCustomerModal`, `CrmExtraDrawer`  

**Yapılan:** Liste/detay `glass-06` host sınıfları; modal arka plan `gm-glass-drawer-backdrop`, gövde `gm-glass-modal-shell` + `glassmorphism.css`; ek alanlar drawer `gm-glass-drawer-panel` + backdrop; iç `rounded-xl` kartlar için drawer altı seçiciler.

**Komut (genişletme):** «CRM’de kalan neo yüzeyleri veya yeni diyalogları glass’a çek.»

---

## 06 — Teklif modülü

**Rota:** `/teklif`  
**Dosyalar:** `components/teklif/QuoteModuleView.tsx`, `QuoteApprovalDrawer.tsx`  
**Diyalog / drawer:** `QuoteApprovalDrawer`, sayfa içi PDF `fixed` modal  

**Komut:** «Teklif modülü overlay’lerini glass şablonda `gm-glass-*` + CSS ile topbar z-index hiyerarşisine uygun şekilde güncelle.»

---

## 07 — İş başlat (sihirbaz)

**Rota:** `/is-baslat`  
**Dosyalar:** `components/satis/StartWorkWizardView.tsx`  
**Diyalog:** İç `role="dialog"` varsa  

---

## 08 — Proje

**Rota:** `/proje` → `components/proje/ProjectModuleView.tsx`  

---

## 09 — Mühendislik

**Rota:** `/muhendislik` → `components/muhendislik/EngineeringModuleView.tsx`  

---

## 10 — Parametrik 3B

**Rota:** `/parametrik-3b` → `components/parametric3d/Parametric3DModuleView.tsx`  

---

## 11 — Üretim özeti

**Rota:** `/uretim-ozet` → `components/production/ProductionSummaryDashboard.tsx`  

---

## 12 — MES

**Rota:** `/mes` → `components/mes/MesModuleView.tsx` (+ `QualityRejectModal`, `QualityRecordDrawer` vb.)  

---

## 13 — Planlama — Tasarım

**Rota:** `/planlama-tasarim` → `components/production/PlanningDesignView.tsx`  
**Not:** `glass-08` sticky / z-index ile birlikte ele alınmalı.  

---

## 14 — Kalıp tahtası

**Rota:** `/kalip-tahtasi` → `MoldBoardView.tsx` (modal’lar)  

---

## 15 — Öncelik raporu

**Rota:** `/oncelik-raporu` → `PendingPriorityReportView.tsx`  

---

## 16 — Beton reçete

**Rota:** `/beton-recete` → `ConcreteRecipeSelectionView.tsx`  

---

## 17 — Beton santrali

**Rota:** `/beton-santrali` → `BatchPlantOperatorView.tsx`  

---

## 18 — Üretim rolleri önizleme

**Rota:** `/uretim-roller` → `ProductionRolePreviewView.tsx`  

---

## 19 — Fabrika vardiya / kalıp / ekip

**Rota:** `/fabrika-vardiya-kalip-ekip` → `ProductionFactoryOpsView.tsx`  

---

## 20 — Kalite

**Rota:** `/kalite` → `QualityModuleView.tsx`  

---

## 21 — Yard

**Rota:** `/yard` → `YardModuleView.tsx`, `YardLocationAssignModal.tsx`, `YardTransferModal.tsx`  

---

## 22 — Sevkiyat

**Rota:** `/sevkiyat` → `DispatchModuleView.tsx`  

---

## 23 — Saha

**Rota:** `/saha` → `FieldModuleView.tsx`  

---

## 24 — Raporlama

**Rota:** `/raporlama` → `ReportingModuleView.tsx`  

---

## 25 — Mobil önizleme

**Rota:** `/mobil` → `MobilePreviewModuleView.tsx`  

---

## 26 — Onay akışı tasarımcısı

**Rota:** `/onay-akisi` → `ApprovalFlowDesignerView.tsx`  

---

## 27 — Roller ve izinler

**Rota:** `/roller-izinler` → `RolesAndPermissionsView.tsx`  

---

## 28 — Kullanıcı yönetimi

**Rota:** `/kullanicilar` (ana shell) → `UserManagementView.tsx`  

---

## 29 — Birim iş kuyruğu

**Rota:** `/birim-is-kuyrugu` → `UnitWorkQueueView.tsx` (drawer’lar)  

---

## 30 — Lojistik / saha iş kuyruğu

**Rota:** `/lojistik-saha-is-kuyrugu` → `LogisticsFieldUnitQueuesView.tsx`  

---

## 31 — Giriş

**Rota:** `/login`  
**Dosyalar:** `pages/LoginPage.tsx`, `AuthLayout.tsx`  

---

## 32 — Kayıt

**Rota:** `/register`  

---

## 33 — 403 / 404

**Rota:** `/403`, `*`  
**Dosyalar:** `ForbiddenPage.tsx`, `NotFoundPage.tsx`  

---

## 34 — Firma kurulum sihirbazı

**Rota:** `/firma-kurulum` → `FirmOnboardingWizardPage.tsx`  

---

## 35 — Firma ayarları (kabuk)

**Rota:** `/firma-ayarlari` …  
**Dosyalar:** `FirmAdminShell.tsx`, `FirmAdminGeneralPage.tsx`, `FirmShiftCalendarPage.tsx`, `FirmFactoriesPage.tsx`, `FirmSettingsChangePreviewPage.tsx`, `FirmAdminPlaceholderPage.tsx`  

**Komut:** «Firma ayarları altındaki tüm sayfaları glass şablonda `FirmAdminShell` düzeyinde host + sayfa başına cam yüzey uygula.»

---

## Ortak hatırlatma (her tur)

1. Stiller **`html[data-ui-template='glass']`** altında kalmalı.  
2. Z-index: üst bar `z-[95]`, drawer/modal sırası `00-ORTAK-BLOK` / `glass-04`.  
3. Diyalog: backdrop + panel için `FactorySummaryDrawer` / `gm-glass-drawer-*` kalıbını örnek al; ortalanmış diyalog için `gm-glass-modal-shell`.  
4. İş bitince bu dosyada ilgili satırın **Durum** hücresini güncelleyin.

**Son güncelleme:** 2026-03-26  
