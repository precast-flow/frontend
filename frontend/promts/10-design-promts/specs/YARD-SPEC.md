# Yard modülü — Prompt 10 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Düzen

1. **Üst — harita:** `shadow-neo-out` (ana katman), 4×3 **inset** hücre (`shadow-neo-in`); seçili hücre **`ring-2 ring-gray-800`** + hafif `shadow-neo-out-sm`.
2. **Alt — tablo:** `shadow-neo-out-sm` kart; kolonlar: eleman id, tip, proje, durum, lokasyon, sevkiyata hazır.
3. **Toast (çakışma):** `bg-gray-100 shadow-neo-out-sm` + **metin `text-red-800`**.
4. **Transfer modal:** kabuk `shadow-neo-out`; form **`shadow-neo-in`**; onay **`bg-gray-800`** protrude.

---

## Etkileşim

- Harita hücresi seçimi → tablo **lokasyon** ile filtrelenir (aynı hücreye tekrar tık → filtre kalkar).
- **Lokasyon ata:** B3’te birden fazla kayıt varken **çakışma** toast’ı; aksi halde nötr demo metni.
- **Sevkiyata hazır:** seçili satırda boolean toggle.
- **Transfer talebi:** modal → hedef hücre + not → onayla → satır `location` güncellenir.

---

## Tailwind özeti

| Parça | Özet |
|--------|------|
| Harita kartı | `rounded-3xl bg-gray-100 p-4 md:p-5 shadow-neo-out` |
| Hücre | `rounded-2xl bg-gray-100/90 shadow-neo-in` |
| Hücre seçili | `shadow-neo-out-sm ring-2 ring-gray-800 ring-offset-2 ring-offset-gray-100` |
| Tablo kartı | `rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm` |
| Aksiyonlar | `rounded-xl bg-gray-100 font-semibold text-gray-800 shadow-neo-out-sm` |
| Toast | `rounded-xl bg-gray-100 shadow-neo-out-sm` + `text-red-800` |

---

## UX soruları

1. Hücre kapasitesi (max adet / ton) haritada renk kodlu mu gösterilmeli (yine gri tonlarında)?
2. Transfer onayı için QR / barkod doğrulama zorunlu mu?
3. Sevkiyata hazır bayrağı kalite onayı ile otomatik mi kilitlenmeli?
4. Çok katlı saha (zeminler) aynı ızgarada kat seçici mi?
5. Gece görünümü / düşük ışık tema sadece saha tabletinde mi?

---

## Kod

- `app/src/components/yard/YardModuleView.tsx`
- `app/src/components/yard/YardTransferModal.tsx`
- `app/src/data/yardMock.ts`
