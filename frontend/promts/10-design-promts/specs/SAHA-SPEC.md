# Saha modülü — Prompt 12 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` — sahada **gölgeler hafif**, **metin kontrastı yüksek** (`gray-900` / `gray-800` ağırlıklı).

---

## Kart wireframe

```
[ inset badge: Çevrimiçi · senkron ]     [ NeoSwitch: Sade mod ]

[ inset select: Proje (büyük) ]  [ protrude mini: Bugün · N görev ]

┌─ Görev — Teslimat [hafif protrude, büyük padding] ─┐
├─ Görev — Montaj ──────────────────────────────────┤
├─ Görev — Blokaj (+ inset sebep/sorumlu/çözüm özet) ┤
└───────────────────────────────────────────────────┘

┌─ Detay [inset well] ───────────────────────────────┐
│ Not · Foto inset drop · İmza geniş çizim well      │
│ [ Teslim alındı — büyük protrude ]                 │
│ [ Montaj tamamlandı — büyük protrude ]             │
└────────────────────────────────────────────────────┘

Blokaj seçiliyse: inset alanlar + [ Blokajı güncelle ]
```

---

## Tailwind özeti

| Parça | Özet |
|--------|------|
| Mobil sütun | `max-w-lg mx-auto w-full` |
| Senkron rozeti | `rounded-full px-3 py-1 text-gray-800 shadow-neo-in` |
| Proje seçici | `rounded-2xl py-3.5 text-base font-semibold shadow-neo-in` |
| Bugün kartı | Hafif çift gölge + `ring-1 ring-gray-300/70` |
| Görev kartı | `py-5 rounded-2xl` + hafif shadow (neo out küçültülmüş) |
| Seçili görev | `ring-2 ring-gray-800` |
| Detay kabı | `rounded-2xl p-4 shadow-neo-in` |
| Alanlar | `rounded-xl bg-gray-100 shadow-neo-in text-gray-900` |
| Büyük CTA | `min-h-14 rounded-2xl text-base font-bold` + hafif gölge |
| İmza well | `min-h-[140px] rounded-2xl border-2 border-dashed border-gray-500/80 shadow-neo-in` |

---

## Offline (tasarım notu)

Tam offline kuyruk, çakışma çözümü ve arka plan senkronu bu prototipte **yalnızca metin notu**; rozette “Çevrimiçi · senkron OK” inset badge ile yer tutucu.

---

## UX soruları

1. Sade modda hangi alanlar kesin gizlenmeli (yasal kayıt için)?
2. İmza tablette basınç duyarlı mı, yoksa bitmap yeterli mi?
3. Fotoğraf zorunlu adım bazında mı değişir?
4. Blokaj çözülünce otomatik MES / sevkiyat bildirimi mi?
5. Güneş modu: otomatik kontrast artışı sistem temasından mı?

---

## Kod

- `app/src/components/saha/FieldModuleView.tsx`
- `app/src/data/fieldMock.ts`
- `NeoSwitch` (`app/src/components/NeoSwitch.tsx`) — Sade mod
