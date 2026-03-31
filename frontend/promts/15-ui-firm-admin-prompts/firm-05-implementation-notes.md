# firm-05 — Fabrika yönetimi (uygulama notları)

Kaynak: `firm-05-fabrika-yonetimi-ayarlar-ici.md` + `00-ORTAK-BLOK-FIRMA-ADMIN-UI.md`.

## Wireframe (ASCII)

```
┌ Fabrika yönetimi                    [Fabrika ekle] [Kullanıcılar link] ─┐
│ (Üst bar seçici ile ilişki notu)                                         │
├ ○ Varsayılan │ Kod │ Ad │ Şehir │ Aktif │ Detay / Pasifleştir ───────────┤
│ 3 satır mock (MOCK_FACTORIES)                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Mock

`buildFirmFactoriesSeed()` — `MOCK_FACTORIES` (3 fabrika) ile aynı kodlar: IST-HAD, KOC-01, ANK-01.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Tablo, varsayılan radio, ekle modal (kod, ad, şehir, adres), pasifleştir onayı, son aktif uyarısı |
| P1 | Satır ad / detay → drawer: notlar + harita placeholder |
| P2 | `Kullanıcılar` sayfasına link (erişim özeti metni) |

## Üst bar ile ilişki

Sayfadaki bilgi kutusu: ana uygulama `FactoryContext` / top bar seçici bu listenin **aktif** fabrikalarından beslenir; **varsayılan** ilk açılış seçimi (mock metin).

## Sorular (ürün)

1. Pasif fabrika geçmiş emirlerde salt okunur mu kalır?
2. Varsayılan fabrika kullanıcı bazında override edilebilir mi?
3. Kod değişikliği ERP referansı kırar mı (migration)?
