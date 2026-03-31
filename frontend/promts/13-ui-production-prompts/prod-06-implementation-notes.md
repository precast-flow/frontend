# prod-06 — Beton santrali operatör (uygulama notları)

Kaynak: `prod-06-beton-santrali-operator.md`.

## Tam ekran wireframe (ASCII)

```
┌ [✓ Santral operatörü] ─────────────────────────────────────────┐
│ ┌ Sıradaki iş ──────────────────────┬──────────────────────────┐ │
│ │ UE-2025… (büyük)                  │ [görsel placeholder]     │ │
│ │ Parça…                            │                          │ │
│ │ Hedef m³ · Kalan m³               │                          │ │
│ │ Reçete özeti (kutu)               │                          │ │
│ ├───────────────────────────────────┴──────────────────────────┤ │
│ │ İlerleme [=========>        ] nn%                               │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ [Döküm başlat] [Duraklat] [Tamamlandı] [Sorun bildir]  ← tek primary │
│ Vardiya notu [textarea] │ Son döküm (1 satır)                     │
│ P2: [QR/barkod placeholder]                                        │
└────────────────────────────────────────────────────────────────────┘
```

## Mock veri

`app/src/data/batchPlantOperatorMock.ts`

- `BATCH_CURRENT_JOB` — emir, parça, hedef m³, reçete kodu + özet metni  
- `BATCH_PREVIOUS_POUR_SEED` — “son döküm” başlangıç satırı; **Tamamlandı** ile güncellenir (mock state)

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | İş kartı, hedef/kalan, reçete özeti, görsel placeholder, inset ilerleme çubuğu, dört aksiyon (tek primary) |
| P1 | Vardiya devir textarea, son döküm özeti |
| P2 | Barkod/QR input placeholder |

## Rol

Checkbox **Santral operatörü**: kapalıyken tüm düğümler ve not alanı devre dışı + salt okunur uyarısı (RBAC mock).

## Birincil düğme kuralı

| Faz | Primary |
|-----|---------|
| `idle` | Döküm başlat |
| `pouring` | Tamamlandı |
| `paused` | Devam et |

## Kod

| Dosya | Açıklama |
|-------|----------|
| `data/batchPlantOperatorMock.ts` | Sabit iş + önceki döküm tohumu |
| `components/production/BatchPlantOperatorView.tsx` | UI + faz / ilerleme |
| `data/navigation.ts` | `batch-plant` → `/beton-santrali` |

## Sorular (UX)

1. Duraklat iken “Tamamlandı” kısmi hacimle mi kapanmalı?
2. Sorun bildir MES’e mi kaliteye mi düşer?
3. Vardiya notu zorunlu mu (imza / audit)?
