# Proje modülü — Prompt 06 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Sekme bazlı wireframe

| Sekme | İçerik |
|--------|--------|
| **Özet** | Yatay macro stepper: 6 adım (Tasarım→…→Saha); tamamlanan/current `shadow-neo-out-sm`, bekleyen `shadow-neo-in` |
| **Zaman çizelgesi** | Dikey timeline, `shadow-neo-in` kabuk |
| **Eleman listesi** | Üstte toplu aksiyon bar (≥1 seçim); inset filtre well; protrude tablo kartı |
| **Dokümanlar** | Yer tutucu metin |
| **Riskler** | Küçük **protrude** risk kartları (etki + sorumlu) |
| **Maliyet** | Üç inset KPI kutusu (yer tutucu) |

---

## Kolon listesi (eleman tablosu)

| Kolon | Not |
|--------|-----|
| (seçim) | Checkbox |
| Kod | Monospace |
| Tip | Metin |
| Durum | Metin |
| Rev. | Revizyon harfi |

---

## Toplu aksiyon bar — kaç seçimde?

**En az 1 eleman seçildiğinde** görünür (tek seçimle de toplu işlem mümkün; çoklu seçimde aynı bar).

---

## Tailwind özeti (1 satır)

| Bileşen | Özet |
|---------|------|
| Hero | `rounded-2xl bg-gray-100 p-4 md:p-5 shadow-neo-out-sm` |
| Proje seçici | `rounded-xl bg-gray-100 shadow-neo-in text-sm font-semibold` |
| Avatar | `rounded-full bg-gray-200 size-9 ring-2 ring-gray-100 shadow-neo-out-sm` |
| Üretim emrine aktar | `rounded-xl bg-gray-800 text-white shadow-neo-out-sm` (tek primary şeritte) |
| Sekme track | `rounded-full bg-gray-100 p-1 shadow-neo-in overflow-x-auto` |
| Sekme aktif | `rounded-full bg-gray-100 text-gray-900 shadow-neo-out-sm` |
| More menü tetik | `rounded-full shadow-neo-in` + overflow sekmesinde `ring-2 ring-gray-400/80` |
| More açılır | `rounded-2xl bg-gray-100 border shadow-neo-out` |
| Stepper adım (beklemede) | `rounded-2xl bg-gray-100/80 shadow-neo-in` |
| Filtre well | `rounded-2xl bg-gray-100 p-3 shadow-neo-in` |
| Tablo kartı | `rounded-2xl bg-gray-100 p-2 shadow-neo-out-sm` |
| Toplu aksiyon bar | `rounded-xl bg-gray-100 px-3 py-2.5 shadow-neo-out-sm` |
| Risk kartı | `rounded-xl bg-gray-100 p-3 shadow-neo-out-sm` |
| MES modal kabuğu | `rounded-3xl bg-gray-100 p-5 shadow-neo-out` |
| MES modal form | `rounded-2xl bg-gray-50/90 p-4 shadow-neo-in` |

---

## UX soruları

1. Proje değişince seçili elemanlar sıfırlanmalı mı (şu an evet) — taslak kaydı uyarısı gerekir mi?
2. “Üretim emrine aktar” header’daki ile eleman sekmesindeki aynı modal mı, farklı validasyon mu?
3. Riskler: olasılık × etki matrisi bu ekranda mı, yoksa ayrı risk kayıt formu mu?
4. Maliyet: ERP muhasebe ile tek yön mü, yoksa çift yönlü senkron mu?
5. Paydaş ekle: dahili kullanıcı mı, harici e-posta daveti mi?

---

## Kod

- `app/src/components/proje/ProjectModuleView.tsx`
- `app/src/components/proje/ProjectMesModal.tsx`
- `app/src/data/projectsMock.ts`
