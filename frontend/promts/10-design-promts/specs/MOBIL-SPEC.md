# Mobil önizleme — Prompt 14 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` — **mor yok**; okunmamış bildirim için **koyu gri nokta** (`bg-gray-800`).

---

## ASCII — tek sayfa

```
┌─────────────────────────────────────────────┐
│  [ protrude cihaz — rounded-[2.5rem] ]      │
│  ┌───────────────────────────────────────┐  │
│  │ 09:41    [ notch pill ]          LTE   │  │
│  │                                        │  │
│  │  [ sekme içeriği — bg-gray-100 ]       │  │
│  │  Görevler | Tarama | Bildirimler       │  │
│  │                                        │  │
│  │  … kartlar / kamera well / inset liste │  │
│  │                                        │  │
│  │ ┌─ pill track (inset) ─────────────┐    │  │
│  │ │ Görevler │ Tarama │ Bildirimler │    │  │
│  │ └─────────────────────────────────┘    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Navigasyon şeması

```text
Alt pill bar (3 sekme)
  ├─ Görevler → büyük protrude görev kartları + tek CTA (koyu gri)
  ├─ Tarama → inset kamera/QR well + protrude “son tarama” özeti
  └─ Bildirimler → inset satırlar; okunmadı ● bg-gray-800
```

Menü: **Lojistik & Saha → Mobil (web önizleme)** (`slug: mobil`).

---

## Tailwind — çerçeve + iç ekran

| Parça | Özet |
|--------|------|
| Dış cihaz | `rounded-[2.5rem] bg-gray-100 p-3 sm:p-4 shadow-neo-out ring-1 ring-gray-200/90` |
| İç ekran | `rounded-[1.85rem] bg-gray-100 min-h-[540px] ring-1 ring-gray-300/60` |
| İç kart (hafif) | `shadow-[2px_2px_5px_rgb(163_163_163/0.2),-2px_-2px_5px_rgb(255_255_255/0.95)]` |
| İç inset | `shadow-[inset_2px_2px_5px_rgb(163_163_163/0.22),inset_-2px_-2px_5px_rgb(255_255_255/0.9)]` |
| Alt pill track | `rounded-full p-1` + inset gölge yukarıdaki |
| Aktif pill | `rounded-full` + hafif dış gölge (`inPhoneOutSm`) |

---

## UX soruları

1. Önizleme gerçek cihaz boyutlarına (CSS `env(safe-area)`) sabitlensin mi?
2. Tarama sekmesi PWA’de kamera izni akışı nasıl kısaltılır?
3. Bildirimler sunucu itmesi mi, yoksa periyodik poll mu?
4. Saha modülünden “Mobil önizleme”ye geçişte aynı görev bağlamı taşınsın mı?
5. Karanlık mod sahada ayrı tema mı, yoksa tek gri palet mi?

---

## Kod

- `app/src/components/mobil/MobilePreviewModuleView.tsx`
- `app/src/data/mobilePreviewMock.ts`

Saha modülünden bağlantı: `FieldModuleView` içinde `onNavigate('mobile')`.
