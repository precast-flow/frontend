# Teklif modülü — Prompt 05 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Liste → detay → onay (ASCII)

```
┌─ Teklifler [protrude sm tablo] ─────┐  ┌─ Özet bar [protrude] ─────────────────┐
│ No | Müşteri | Proje | Ver | Tutar  │  │ No, müşteri, proje | v2 | Toplam      │
│ durum pill (gri tonları / red metin)│  └───────────────────────────────────────┘
└────────────────────────────────────┘  ┌─ [inset alert] eksik kalem (varsa) ─────┐
                                        └─────────────────────────────────────────┘
                                        ┌─ Kalemler [inset table well] ───────────┐
                                        │ satır hata: ring + kırmızı satır içi    │
                                        └─────────────────────────────────────────┘
  [Kaydet taslak sec] [Onaya gönder PRI] [PDF ghost]     [Versiyon & onay →]

        ┌─ Drawer [protrude] ───────────────────┐
        │ Değişiklik özeti [inset]              │
        │ Versiyon geçmişi [inset]              │
        │ Rol notu                               │
        │ [Onayla sec] [Reddet sec]              │
        └────────────────────────────────────────┘
```

---

## Onay: sayfa mı drawer mı?

**Drawer** seçildi: liste ve detay bağlamı kaybolmaz; onaylayıcı aynı teklif numarası ve kalemleri arkada görür (mobilde tam genişlik panel).

---

## Tailwind özeti (1 satır)

| Parça | Özet |
|--------|------|
| Liste kartı | `rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm` |
| Özet şerit | `rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm` |
| Eksik kalem bandı | `rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-in` + `text-red-800` |
| Kalem kabı | `rounded-2xl bg-gray-100 p-1 shadow-neo-in` |
| Hatalı satır | `ring-1 ring-inset ring-red-200/80 bg-red-50/40` |
| Kaydet taslak | `rounded-xl bg-gray-100 font-semibold text-gray-800 shadow-neo-out-sm` |
| Onaya gönder (tek primary) | `rounded-xl bg-gray-800 text-white shadow-neo-out-sm` |
| PDF önizle | `rounded-xl border border-gray-400/90 bg-transparent text-gray-800` |
| Drawer yüzeyi | `rounded-3xl bg-gray-100 shadow-neo-out` |
| Drawer Onayla/Reddet | `rounded-xl bg-gray-100 shadow-neo-out-sm` (ikisi secondary) |

---

## UX soruları

1. Onaya gönder sonrası düzenleme: yeni versiyon mu zorunlu, yoksa “geri al” penceresi mi?
2. PDF: müşteri logosu ve şartname eki her zaman aynı şablon mu?
3. Çift imza sırası (Finans → Satış) bu drawer’da adım adım mı gösterilir?
4. Red sebebi zorunlu serbest metin mi, kod listesi mi?
5. Kalem hatası satırında inline düzenleme mi, yoksa satır genişleyen form mu?

---

## Kod

- `app/src/components/teklif/QuoteModuleView.tsx`
- `app/src/components/teklif/QuoteApprovalDrawer.tsx`
- `app/src/data/quotesMock.ts`
