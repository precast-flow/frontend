# Sevkiyat modülü — Prompt 11 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Liste–detay + stepper (ASCII)

```
┌─ Bugünkü planlar [protrude sm] ─┐  ┌─ Detay [protrude güçlü] ───────────────┐
│ SVK kod · rozet · varış         │  │ Başlık · durum rozeti (+✓ teslim)     │
│ pencere                         │  │ [inset] kapasite uyarı + [Düzenle]    │
└─────────────────────────────────┘  │ [inset] araç & rota                    │
                                      │ [inset] yükleme sırası (DnD notu)      │
                                      │ Stepper: [inset done][protrude aktif]… │
                                      │ [inset] adım formu · Geri / İleri      │
                                      │ Aksiyonlar + İptal/ertele (danger)     │
                                      └────────────────────────────────────────┘
```

---

## Stepper kuralı (tutarlılık)

- **Tamamlanan adım:** `shadow-neo-in` (gömülü, pasif his).
- **Aktif adım:** `shadow-neo-out-sm` + ince ring (öne çıkan).
- **Gelecek adım:** düz halka, soluk metin.

---

## Durum makinesi (kısa)

`taslak` → `onay_bekliyor` → `yukleme` → `yolda` → `teslim_edildi` · `iptal` ayrı dal. Tamamlanan planlar “bugün” listesinden düşer (arşiv/rapor).

---

## Tailwind özeti

| Parça | Özet |
|--------|------|
| Plan listesi | `rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm` |
| Detay kartı | `rounded-2xl bg-gray-100 p-4 shadow-neo-out` |
| Araç / sıra | `rounded-xl bg-gray-50/90 shadow-neo-in` |
| Kapasite uyarısı | `rounded-xl bg-gray-100 shadow-neo-in` + `text-red-800` |
| Düzenle | `rounded-xl bg-gray-100 shadow-neo-out-sm` |
| Adım tamam | `rounded-xl shadow-neo-in text-gray-700` |
| Adım aktif | `rounded-xl shadow-neo-out-sm ring-1 ring-gray-400/60` |
| Adım form kabı | `rounded-2xl bg-gray-50/90 p-4 shadow-neo-in` |
| Yükleme başlat (primary) | `rounded-xl bg-gray-800 text-white shadow-neo-out-sm` |
| İptal modal | `rounded-3xl bg-gray-100 shadow-neo-out` |

---

## UX soruları

1. Onay çift imza mı (depo + sevkiyat)?
2. Çıkış kaydı GPS / otomatik kilometre mi?
3. Yükleme sırası değişince MES / Yard anlık mı güncellenir?
4. Kapasite hesabı hacim mi tonaj mı öncelikli?
5. Erteleme yeni pencere mi açar, aynı planı mu düşürür?

---

## Kod

- `app/src/components/sevkiyat/DispatchModuleView.tsx`
- `app/src/components/sevkiyat/DispatchCancelModal.tsx`
- `app/src/data/dispatchMock.ts`
