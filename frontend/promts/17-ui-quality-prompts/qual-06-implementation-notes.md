# qual-06 — Ürün, reçete ve emir bağlantı paneli (uygulama notları)

Kaynak: `qual-06-urun-recete-emir-baglanti.md` + `00-ORTAK-BLOK-KALITE-UI.md`.

## Wireframe (ASCII)

```
┌ Numune paketi ▼ ─────────────────────────────────────────────────────────┐
│ [amber: emir reçetesi ≠ numune reçetesi] (opsiyonel)                      │
├ [Firma] [Fabrika] [Proje + müşteri] ──────────────────────────────────────┤
├ [Parça chip’leri — geniş kart] [Reçete x2] [Emir] [Döküm]                 │
├ [Harici doküman — tam genişlik] ──────────────────────────────────────────┤
└───────────────────────────────────────────────────────────────────────────┘
```

## Mock

`app/src/data/qualityLinkPanelMock.ts` — iki paket; `lp2` numune reçetesi ile emir reçetesi farklı (çelişki).

## Sekme

Kalite → **Ürün / reçete / emir** → `QualityLinkPanelView`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Kartlar: firma (salt), fabrika, proje, chip’ler, iki reçete kutusu, emir, döküm id; çelişki bandı |
| P1 | Müşteri adı proje kartında |
| P2 | Harici link (example.com mock, `target=_blank`) |

## Sorular (ürün)

1. Reçete çelişkisinde emir kilidi veya numune iptali zorunlu mu?
2. Parça kodları BOM’dan mı, manuel override mü?
3. Harici doküman sürümü audit’te nasıl eşlenir?
