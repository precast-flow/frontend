# qual-10 — Santral ve üretim kısayolları (uygulama notları)

**Kaynak:** `qual-10-santral-ve-uretim-kisayollari.md`  
**16/08 & 12/06:** Modül kimlikleri `batch-plant` (slug `beton-santrali`) ve `mes` — `navigation.ts` ile uyumlu.

## Nerede

| Özellik | Konum |
|--------|--------|
| Numune detay köprüsü | `QualitySamplesListView` — barkod altı, kesik çerçeve blok |
| Kısayollar sekmesi | `QualityModuleView` → sekme **Santral / üretim** (`qualityModule.tab.shortcuts`) |
| Diyagram, push mock, IoT, operatör drawer | `QualityProductionShortcutsView.tsx` |

## P0

- **İlgili dökümü aç:** `onNavigate('batch-plant')` + toast (BP id veya `BP-MOCK`).
- **Üretim emrine git:** `onNavigate('mes')` + toast.
- **Bu döküme numune oluştur:** aynı sekmede drawer; onay → taslak numune toast’u (mock).

## P1

- Push metni: **«Slump limit dışı»** — `qualityShortcuts.pushBody` (TR/EN).

## P2

- IoT: JSON yer tutucu + `qualityShortcuts.iotHint`.

## i18n

- `qualitySamples.bridge*`, `qualityShortcuts.*`, `qualityModule.tab.shortcuts`, `main.desc.quality`.
