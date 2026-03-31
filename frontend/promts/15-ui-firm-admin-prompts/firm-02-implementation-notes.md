# firm-02 — İlk firma kurulum sihirbazı (uygulama notları)

Kaynak: `firm-02-ilk-firma-kurulum-wizard.md` + `00-ORTAK-BLOK-FIRMA-ADMIN-UI.md`.

## Wireframe (ASCII)

```
┌ [← Firma ayarlarına dön]                    [DEMO] ─────────────┐
│ İlk firma kurulumu                                              │
│ ● ─ ● ─ ● ─ ● ─ ● ─ ●   (stepper: Hoş geldin … Özet)            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Adım içeriği (form / özet tablo)                             │ │
│ │  [ Geri ]                              [ İleri / Onayla ]     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
┌ Özet: [Davet e-postasını önizle] → modal (P2) ──────────────────┘
```

## Rota

| URL | Açıklama |
|-----|----------|
| `/firma-kurulum` | Tam sayfa sihirbaz (`AppShell` dışı, `firma` slug ile çakışmaz) |

Giriş: **Firma ayarları** (`/firma-ayarlari`) → **Genel** → **Kurulum sihirbazını aç**.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | 6 adım (Hoş geldin → … → Özet), İleri/Geri, özet tablo, **Onayla ve bitir** → toast + `/firma-ayarlari` |
| P1 | Inline validasyon; firma adımında **opsiyonel logo** dosya seçimi |
| P2 | Özetten **davet e-postası** mock modal |

## Mock veri

`app/src/data/firmOnboardingWizardMock.ts` — `WIZARD_SEED` (Acme, IST-HAD, üç vardiya, ilk yönetici).

## Sorular (ürün)

1. Sihirbaz yalnızca “tenant yok” iken mi açılmalı?
2. Onay sonrası gerçek API’de idempotent “create tenant” mı?
3. Davet e-postası şablonu hangi dilde ve tenant bazlı mı?
