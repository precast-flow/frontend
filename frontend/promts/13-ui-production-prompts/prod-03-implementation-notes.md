# prod-03 — Kalıp tahtası (uygulama notları)

Kaynak: `prod-03-kalip-tahtasi-board.md`.

## Board ASCII

```
┌ K-01 ────┬ K-02 ────┬ K-03 ────┬ … ─┐
│ [kart]   │ (boş)    │ ┌önerili┐ │    │  ← max 1 iş / hücre
│ WO-884   │          │ │ WO-892│ │    │
└──────────┴──────────┴──────────┴────┘
┌──────── Günlük zaman ekseni (P2) ────────┐
│ [06-08][08-10][10-12] … sütun yüksekliği │
└──────────────────────────────────────────┘
```

## Mock kalıp isimleri

`K-01` … `K-12` — `app/src/data/moldBoardMock.ts` (`MOLD_IDS`).

## Rol matrisi (özet)

| Rol | Tahta |
|-----|--------|
| Usta | Kart taşıma (sürükle / Taşı), arıza bildir |
| Vardiya amiri | Onay / öneri kabulü (üretimde) |
| Planlama | Önerilen iş kabul/red |
| Bakım | Arıza kaydı (modal) |

## Kod

| Dosya | Açıklama |
|-------|----------|
| `data/moldBoardMock.ts` | K-01…K-12, başlangıç yerleşimi, günlük slot yükleri |
| `components/production/MoldBoardView.tsx` | Grid, DnD, Taşı modal, arıza modal, P2 zaman şeridi |
| `data/navigation.ts` | `mold-board` → `/kalip-tahtasi` |

## UX soruları

1. Kalıp fiziksel konumu (A1/B2) ile K-xx kodu her zaman bire bir mi?
2. Önerilen iş reddedilince kart otomatik silinir mi yoksa başka kalıba mı önerilir?
3. Sürükle-bırak mobilde nasıl karşılanır (uzun basış)?
4. Arıza bildirimi MES emir durumuna “bloke” olarak mı yansır?
