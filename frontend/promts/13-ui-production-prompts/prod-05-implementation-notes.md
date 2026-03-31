# prod-05 — Beton / reçete seçimi (uygulama notları)

Kaynak: `prod-05-beton-recete-secimi.md`.

## Form wireframe (ASCII)

```
┌ Onaylı reçete havuzu ───────────────────────────────────────────┐
│ [🔍 Kod veya sınıf ara]                                         │
│  ○ BT-C30-STD   C30/37   [Onaylı]                               │
│  ○ BT-C35-P1    …                                               │
└─────────────────────────────────────────────────────────────────┘
┌ Seçim özeti — kritik notlar    │ Santral paketi önizle (inset)   │
│ • not 1                        │ Emir / m³ / parça / beton kodu  │
└────────────────────────────────┴────────────────────────────────┘
┌ Uyumsuzluk (P1, koşullu) ───────────────────────────────────────┐
┌ Reçete değişim geçmişi — tablo (kim, ne zaman) ─────────────────┐
┌ P2 — Katkı maddeleri (salt) ▼ ──────────────────────────────────┘
```

## Mock 6 reçete

`app/src/data/concreteRecipeMock.ts` — `CONCRETE_RECIPE_SEED` (`cr-01`…`cr-06`).  
`cr-06` — `mismatchWarning` ile P1 uyarı örneği.

## Veri sözleşmesi (özet)

| Alan | Tip | Not |
|------|-----|-----|
| `ConcreteRecipe.id` | string | Satır anahtarı |
| `code` | string | Beton kodu (santral / etiket) |
| `strengthClass` | string | Örn. C30/37 |
| `approved` | `true` | Havuz mock — hepsi onaylı |
| `criticalNotes` | string[] | Özet kutusu maddeleri |
| `additives` | `{ name, dosageLabel }[]` | P2 genişletilmiş görünüm |
| `mismatchWarning?` | string | Parça uyumsuzluğu (opsiyonel) |
| `MOCK_ORDER_CONTEXT` | sabit | Emir no, satır, m³, parça — önizleme metni |
| `MOCK_RECIPE_CHANGE_LOG` | satırlar | P1 geçmiş (zaman, aktör, önceki→yeni) |

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Arama, onaylı etiket, seçim özeti, santral paketi inset |
| P1 | Değişim geçmişi tablosu, uyumsuzluk uyarısı |
| P2 | Katkı maddeleri salt tablo |

## Kod

| Dosya | Açıklama |
|-------|----------|
| `data/concreteRecipeMock.ts` | 6 reçete + emir bağlamı + geçmiş |
| `components/production/ConcreteRecipeSelectionView.tsx` | UI |
| `data/navigation.ts` | `concrete-recipe` → `/beton-recete` |

## Sorular (UX)

1. Reçete değişimi yalnızca belirli rollerde mi ve ikinci onay gerekir mi?
2. Uyumsuzluk “yumuşak uyarı” mı “bloklayan” mı olmalı?
3. Santral paketi önizlemesi emir satırı mı üst emir mi ile kilitlemeli?
