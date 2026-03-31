# Mühendislik modülü — Prompt 07 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Liste–detay + checklist (wireframe)

```
┌─ Paket listesi [protrude sm] ────┐  ┌─ Detay [protrude güçlü] ──────────────┐
│ [v2] [pill]                      │  │ Başlık, proje, revizyon notu          │
│ Paket adı                        │  │ [Dosya yükle sec] [Revizyon] [Üretim] │
│ PRJ kodu                         │  │   uyarı metni (kırmızı, küçük)       │
└──────────────────────────────────┘  ├─ Dosyalar [inset] ────────────────────┤
                                      │ 🔒 dosya (title=tooltip) | boyut      │
                                      ├─ Checklist [inset well] ──────────────┤
                                      │ [toggle] BOM …                        │
                                      │ [toggle] IFC …                        │
                                      └───────────────────────────────────────┘

Modal “Üretime hazır”: [inset uyarı] + [Onaylıyorum primary]
```

---

## Tailwind özeti (1 satır)

| Parça | Özet |
|--------|------|
| Liste kartı | `rounded-2xl bg-gray-100 p-3 shadow-neo-out-sm` |
| Liste satırı aktif | `rounded-xl bg-gray-100 shadow-neo-in ring-1 ring-gray-300/70` |
| Liste satırı pasif | `rounded-xl bg-gray-100/60 shadow-neo-out-sm` |
| Detay kartı | `rounded-2xl bg-gray-100 p-4 shadow-neo-out` |
| Dosya kabı | `rounded-xl bg-gray-50/80 p-1 shadow-neo-in` |
| Checklist well | `rounded-xl bg-gray-100 p-2 shadow-neo-in` |
| Checklist toggle | `h-7 w-12 rounded-full shadow-neo-in` + thumb `shadow-neo-out-sm` |
| Dosya yükle / revizyon | `rounded-xl bg-gray-100 font-semibold text-gray-800 shadow-neo-out-sm` |
| Üretime hazır | `rounded-xl bg-gray-800 text-white shadow-neo-out-sm` (tek primary) |
| Onay modal | `rounded-3xl bg-gray-100 shadow-neo-out` |
| Modal uyarı | `rounded-xl bg-gray-50/90 p-3 text-sm shadow-neo-in` + `text-red-800` başlık |

---

## UX soruları

1. IFC kilidi: üretim emri kapandığında otomatik kalkmalı mı, manuel müdahale mi?
2. Revizyon oluştur: eski paket anında superseded mi, yoksa yeni paket onaylanınca mı?
3. Checklist şablonu proje tipine göre değişmeli mi (köprü vs bina)?
4. CAD dosyası 100 MB üzeri: chunked upload bu ekranda mı, ayrı istemci mi?
5. BIM senkron (Revit/Navis) entegrasyonu bu listede mi, yalnızca arka planda mı?

---

## Kod

- `app/src/components/muhendislik/EngineeringModuleView.tsx`
- `app/src/components/muhendislik/ChecklistToggle.tsx`
- `app/src/components/muhendislik/ReadyForProductionModal.tsx`
- `app/src/data/engineeringMock.ts`
