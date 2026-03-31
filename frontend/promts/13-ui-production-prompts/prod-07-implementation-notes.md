# prod-07 — Rol bazlı görünüm ve önizleme (uygulama notları)

Kaynak: `prod-07-rol-bazli-gorunum-ve-onizleme.md`.

## Wireframe (ASCII)

```
┌ Üst (AppShell) ────────────────────────────────────────────────┐
│ TopBar                                                          │
├ [Önizleme modu: Üretim şefi — demo]              [ Çık ]        │  ← sarı inset (yalnız önizleme açıkken)
├────────────────────────────────────────────────────────────────┤
│ Ana içerik: prod-07 sayfası                                     │
│  · Rol seçici + Çık                                             │
│  · Audit uyarı kutusu                                          │
│  · Tablo: Rol | Menü | Düzenle | Salt                           │
│  · P1: prod-01…06 gizli sekme listeleri (rol başına)            │
│  · P2: İki rol diff tablosu                                     │
└────────────────────────────────────────────────────────────────┘
```

## Mock roller

`app/src/data/productionRoleMatrixMock.ts` — `ROLE_MATRIX_ROWS` (`chief`, `shift`, `batch_op`, `quality_ro`, `viewer`).  
`prod01`…`prod06` anahtarları sırasıyla üretim özeti, MES, kalıp tahtası, öncelik, beton/reçete, santral ekranlarına karşılık gelir (metin mock).

## Önizleme davranışı

- `ProductionRolePreviewProvider` (`App.tsx`) — global `previewRoleId`.
- `filterNavGroupsForPreview` — üretim grubundaki öğeleri role göre süzer; **`production-role-preview`** her zaman sona eklenir (çıkış / matris ekranına erişim).
- `AppShell` — `previewRoleId` varken `ProductionRolePreviewBanner`; üretim modülünde yetkisiz ekrandaysa `/` yönlendirmesi (`production-role-preview` hariç).

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Matris tablosu, sayfa içi rol seçici, audit metni |
| P1 | `PROD_TAB_HIDDEN_MOCK` — rol × prod-01…06 gizli sekme metinleri |
| P2 | İki rol karşılaştırma tablosu (fark satırları vurgulu) |

## Kod

| Dosya | Açıklama |
|-------|----------|
| `data/productionRoleMatrixMock.ts` | Matris, tab mock, `filterNavGroupsForPreview` |
| `context/ProductionRolePreviewContext.tsx` | Önizleme state |
| `components/production/ProductionRolePreviewBanner.tsx` | Üst şerit |
| `components/production/ProductionRolePreviewView.tsx` | Tam sayfa |
| `components/AppShell.tsx` | Filtre + banner + redirect |
| `data/navigation.ts` | `production-role-preview` → `/uretim-roller` |

## Sorular (ürün)

1. Önizleme yalnızca “sistem yöneticisi / PM” rolüne mi açılmalı?
2. Oturum sonunda önizleme otomatik kapanmalı mı?
3. Diff görünümü PDF / ekip paylaşımı için export edilebilir mi?
