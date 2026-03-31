# firm-03 — Firma genel ayarlar (uygulama notları)

Kaynak: `firm-03-firma-genel-ayarlar.md` + `00-ORTAK-BLOK-FIRMA-ADMIN-UI.md`.

## Form wireframe (ASCII)

```
┌ Genel | Bölgesel ──────────────────────────────────────────────
│ ┌─ Genel ───────────────────────────────────────────────────┐
│ │ Ünvan · Kısa ad · Vergi no · Adres · Tel · E-posta          │
│ │ [Logo önizleme inset] [Dosya seç] [Kaldır]                 │
│ │ ☐ KVKK metni (mock)                                         │
│ │ Slug: [acme-prefabrik    ] (disabled)                       │
│ └─────────────────────────────────────────────────────────────┘
│ ┌─ Bölgesel ────────────────────────────────────────────────┐
│ │ Saat dilimi · Dil · Tarih biçimi                             │
│ │ “Etkilenen arayüz” not kutusu                                │
│ └─────────────────────────────────────────────────────────────┘
│ [ Kaydet ]  [ İptal ]
└────────────────────────────────────────────────────────────────
```

## Mock seed

`app/src/data/firmGeneralSettingsMock.ts` — `FIRM_GENERAL_SETTINGS_SEED`.

## P0 / P1 / P2

| Seviye | Özellik |
|--------|---------|
| P0 | Sekmeler Genel / Bölgesel; alanlar; Kaydet / İptal |
| P1 | Logo + önizleme (data URL); KVKK checkbox + kısa metin |
| P2 | Tenant slug alanı disabled + not |

## Davranış (mock)

- **Kaydet:** baseline güncellenir, toast; dil `tr`/`en` ise `setLocale` ile uygulanır.
- **İptal:** baseline’a geri dönüş + toast.

## Sorular (ürün)

1. Vergi no formatı ülkeye göre mi doğrulanmalı?
2. Slug değişikliği ticket + onay süreci mi?
3. KVKK onayı audit log’a yazılmalı mı?
