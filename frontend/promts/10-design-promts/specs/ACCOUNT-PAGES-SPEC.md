# Profil ve ayarlar (shell içi)

Neumorphic gri dil — `prompts/00b-NEOMORPHISM-TAILWIND.md`.

## Rotalar

| Yol | Bileşen | Not |
|-----|---------|-----|
| `/profile` | `ProfilePage` | Avatar + kişisel / iş bilgileri + güvenlik yer tutucuları |
| `/settings` | `SettingsPage` | Sol sekme: Genel, **Fabrikalar** (`SettingsFactoriesPanel` — mock CRUD + `localStorage`), Bildirimler, Dil & bölge, Sözlükler, **Gelecek & lisans** (mvp-15), **Uçtan uca senaryo** (mvp-16 — `e2eScenarioMock` + modül kısayolları) — `NeoSwitch` + select |

Ana kabuk (`AppShell`) altında **nested route**; içerik `<Outlet />` ile değişir.

**Modül URL’leri (yenilemede korunur):** `data/navigation.ts` içindeki her `slug` ilk path segmenti olur — örn. `/crm`, `/teklif`, `/onay-akisi`. Genel bakış: `/` veya `/genel-bakis`. Geçersiz segment (ör. `/bilinmeyen`) ana sayfaya yönlendirilir.

## Bağlam

`AppShellOutletContext` (`app/src/appShellOutletContext.ts`): `onNavigate` — profil/ayarlar sayfalarında “Genel bakış”, “Ayarlar / Profile git” gibi eylemler; hedef path `moduleIdToPath()` ile üretilir (`data/navigation.ts`).

## Sidebar

`data/navigation.ts` içinde `accountNavGroup` (**Hesap**): Profil, Ayarlar. Aktif öğe `activeModuleIdFromPathname(pathname)` ile URL’den türetilir (`/profile`, `/settings`, modül slug’ları).

## Dosyalar

- `app/src/pages/ProfilePage.tsx`, `SettingsPage.tsx`
- `app/src/components/ModuleShellFrame.tsx` — breadcrumb + başlık + açıklama kabı
- `app/src/components/MainCanvasOutlet.tsx` — `index` (`/`) ve `:moduleSlug` → `MainCanvas` (slug → `findModuleIdBySlug`)
