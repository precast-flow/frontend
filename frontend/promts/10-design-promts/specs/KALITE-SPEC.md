# Kalite modülü — Prompt 09 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` (gri–beyaz; ret metni `red-800`).

---

## Kuyruk + form wireframe

```
┌─ Bekleyen [protrude sm] ─┐ ┌─ İncelemede ─┐ ┌─ Tamamlandı ─┐
│ QC-… kartları            │ │ …            │ │ …            │
└──────────────────────────┘ └──────────────┘ └──────────────┘

┌─ Kontrol formu [inset well] ─────────────────────────────────┐
│ Ölçü (inset alanlar) | Görsel (textarea inset)                │
│ Test (slump / basınç inset)                                   │
│ Fotoğraf: [drop well] [drop well] [drop well] — border dashed  │
│ [Onayla PRI] [Ret danger+sec] [Tamir talebi]                  │
│ Not: Tamir → MES / karantina                                  │
└───────────────────────────────────────────────────────────────┘

Modal Ret: [protrude] + sebep [inset select] + açıklama [inset textarea] + foto [inset drop]
           [Vazgeç] [Reti onayla — protrude secondary + kırmızı metin/ring]
```

---

## Kuyruk kolonları

| Sütun | İçerik kartında |
|--------|------------------|
| Bekleyen | Kod, eleman, WO, proje |
| İncelemede | Aynı yapı |
| Tamamlandı | Aynı yapı (bugün özeti — başlıkta) |

---

## Tailwind özeti

| Parça | Özet |
|--------|------|
| Kuyruk kartı | `rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm` |
| Kuyruk satırı seçili | `rounded-xl bg-gray-100 shadow-neo-in ring-1 ring-gray-400/70` |
| Form kabı | `rounded-2xl bg-gray-100 p-4 shadow-neo-in` |
| Alanlar | `rounded-xl bg-gray-100 shadow-neo-in text-gray-800` |
| Foto drop well | `rounded-xl border border-dashed border-gray-400/80 bg-gray-50/80 shadow-neo-in` |
| Onayla | `rounded-xl bg-gray-800 text-white shadow-neo-out-sm` |
| Ret (form) | `text-red-800 shadow-neo-out-sm ring-1 ring-gray-300/90` |
| Tamir talebi | `rounded-xl bg-gray-100 text-gray-800 shadow-neo-out-sm` |
| Ret modal | `rounded-3xl bg-gray-100 shadow-neo-out` |

---

## Tamir talebi — iş nereye düşer?

**Not (ürün kararı):** Tamir talebi sonrası kayıt tipik olarak **MES** üretim emri yeniden açılımı veya **karantina / yeniden işlem** kuyruğuna atanır; ekranda `Tamir talebi` MES modülüne yönlendirme ile demo bağlanmıştır.

---

## UX soruları

1. Ret sonrası eleman otomatik hurda mı, yoksa yeniden işlem zorunlu mu?
2. Fotoğraf zorunlu adet hat bazında mı değişmeli?
3. Aynı WO için paralel QC kaydı oluşabilmeli mi?
4. Sebep kodları ISO / şirket standardına göre senkron mu?
5. Tamamlandı sütunu günlük mü sıfırlanır, arşiv mi?

---

## Kod

- `app/src/components/kalite/QualityModuleView.tsx`
- `app/src/components/kalite/QualityRejectModal.tsx`
- `app/src/data/kaliteMock.ts`
