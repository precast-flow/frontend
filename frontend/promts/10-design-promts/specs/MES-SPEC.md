# MES modülü — Prompt 08 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` — panoda gölgeler kasıtlı olarak **hafif** (görsel gürültü azaltma).

---

## Pano vs tablo

| Görünüm | Kim için (öneri) | Not |
|---------|------------------|-----|
| **Pano** | Planlayıcı | Varsayılan; hat × slot ızgarası, emir chip’leri |
| **Tablo** | Hat sorumlusu | Yoğun liste, durum satır renkleri (gri tonları) |

Aynı `orders` state’i paylaşılır; geçiş üstte **protrude** segmented ile.

---

## ASCII

```
[KPI] [KPI] [KPI]   — küçük protrude
┌─ inset kontrol: tarih | vardiya pill | hat seç ─┐  [ Pano | Tablo ] protrude
└────────────────────────────────────────────────┘
┌─ Orta (8 col) ─────────────────────┐ ┌─ Detay protrude (4) ─┐
│ Board: inset hücreler, hafif chip  │ │ Emir, kalıp, beton…  │
│ veya Tablo: protrude kart içi      │ │                      │
└────────────────────────────────────┘ └──────────────────────┘
[Emir oluştur PRI] [Slot taşı] [Başlat] [Duraklat] [Tamamla] [Kalıba bağla]

Modal çakışma: [inset uyarı] + [alternatif slot] protrude liste
```

---

## Tailwind / yüzey özeti

| Parça | Özet |
|--------|------|
| KPI şeridi | `rounded-xl bg-gray-100 shadow-neo-out-sm` |
| Üst kontrol kabı | `rounded-2xl bg-gray-100 p-3 shadow-neo-in` |
| Vardiya pill aktif | `rounded-full bg-gray-100 shadow-neo-out-sm` |
| Pano / Tablo geçişi | `rounded-full bg-gray-100 p-1 shadow-neo-out-sm` |
| Board hücre | ince `border` + çok hafif inset `shadow-[inset_2px_…]` |
| Emir chip | `rounded-lg border` + çok düşük kabartma shadow |
| Tablo kartı | `rounded-2xl bg-gray-100 p-2 shadow-neo-out-sm` |
| Detay panel | `rounded-2xl bg-gray-100 p-4 shadow-neo-out` |
| Tek primary | `bg-gray-800 text-white` — **Emir oluştur** |
| Çakışma modal uyarı | `rounded-xl bg-gray-50/90 shadow-neo-in` |
| Alternatif slot | `rounded-xl bg-gray-100 shadow-neo-out-sm` |

---

## UX soruları

1. Slot çakışmasında otomatik en yakın boş slot önerisi yeterli mi?
2. Vardiya değişiminde yarım kalan emirler hangi kuralla taşınır?
3. Tablo görünümünde sürükle-bırak pano ile aynı API’yi mi kullanmalı?
4. “Tamamlandı” geri alınabilir mi, yoksa yeni düzeltme emri mi?
5. Kalıba bağla: RFID / barkod doğrulama bu ekranda mı, terminalde mi?

---

## Kod

- `app/src/components/mes/MesModuleView.tsx`
- `app/src/components/mes/SlotConflictModal.tsx`
- `app/src/data/mesMock.ts`
