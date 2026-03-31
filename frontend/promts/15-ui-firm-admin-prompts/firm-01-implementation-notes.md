# firm-01 — Firma admin kabuğu ve menü (uygulama notları)

Kaynak: `00-ORTAK-BLOK-FIRMA-ADMIN-UI.md` bağlamı + `firm-01-admin-shell-ve-menus.md`.

## ASCII wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Ana uygulamaya dön]                                           │
│ FIRMA                                                            │
│  · Genel          (aktif)                                        │
│  · Çalışma takvimi & vardiya                                     │
│  · Fabrikalar                                                    │
│  · Kullanıcılar                                                  │
│  · Güvenlik                                                      │
├─────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Ayarlar > …                                          │
│ Acme  [DEMO]                         [ Demo kullanıcı ▼ ]        │
├ [P1 Eksik bilgi: logo yok — inset] ─────────────────────────────┤
│ Ana içerik (Outlet)                                              │
├─────────────────────────────────────────────────────────────────┤
│ P2: SaaS süper-admin notu (küçük metin)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Rotalar

| Path | İçerik |
|------|--------|
| `/firma-ayarlari` | Genel (`FirmAdminGeneralPage`) |
| `/firma-ayarlari/takvim` | Takvim / vardiya placeholder |
| `/firma-ayarlari/fabrikalar` | Fabrikalar placeholder |
| `/firma-ayarlari/kullanicilar` | Kullanıcılar placeholder |
| `/firma-ayarlari/guvenlik` | Güvenlik placeholder |

Ana `AppShell` dışında tanımlıdır (`:moduleSlug` ile çakışmaması için).

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Sol menü, üst bar (kısa ad + DEMO + kullanıcı), breadcrumb |
| P1 | Logo eksik inset banner (`FIRM_ADMIN_TENANT.logoMissing`) |
| P2 | Süper-admin geçişi yok notu |

## Mock tenant

`app/src/data/firmAdminMock.ts` — `Acme Prefabrik A.Ş.`, kısa ad `Acme`, fabrika kod önizlemesi.

## Giriş noktası

Hesap **Ayarlar** (`/ayarlar`) → **Genel** sekmesinde **Firma ayarlarına git** → `/firma-ayarlari`.

## Sorular (ürün)

1. Firma admin yalnızca `tenant_admin` rolüne mi açılmalı?
2. DEMO etiketi ortam değişkeninden mi beslenmeli?
3. Logo yükleme bu kabukta mı yoksa marka modülünde mi?
