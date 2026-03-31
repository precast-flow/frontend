# CRM modülü — Prompt 04 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` (gri–beyaz neumorphism).

---

## Wireframe (metin)

```
[Filtre şeridi — inset well: ara, durum, sektör | Uygula protrude secondary]
[Aksiyon: Yeni müşteri | Yeni kontak | Teklif oluştur (primary) | Proje bağla]

┌─ Liste (protrude sm) ─────────┐  ┌─ Detay (protrude güçlü) ─────────────┐
│ Müşteriler    [Ek alanlar] → drawer    │ Başlık + meta                        │
│ Tablo 6 kolon (yatay scroll)   │ [pill sekmeler: Genel | Projeler | …]   │
│ satır hover / seçili ring      │ Sekme içeriği + inset timeline (Genel) │
└───────────────────────────────┘  └──────────────────────────────────────┘

Boş liste: [inset illüstrasyon alanı] + tek primary “Yeni müşteri”

Modal “Yeni müşteri”: stepper (3 adım) — her adım inset form well; Geri/İleri/Kaydet protrude
```

---

## Sekme içerikleri (özet)

| Sekme | İçerik |
|--------|--------|
| Genel | Vergi no, kayıt tarihi (inset kutular); son aktivite inset timeline |
| Projeler | Yer tutucu liste; ileride proje modülü bağlantısı |
| Teklifler | Kısa metin + Teklif modülüne geçiş linki |
| Notlar | Müşteri notu veya “Not yok” |
| Dokümanlar | Dosya listesi yer tutucu |

---

## Modal / drawer ihtiyaçları

| Bileşen | Amaç |
|---------|------|
| `CrmNewCustomerModal` | Uzun form → 3 adımlı stepper; ESC / dış tık kapatma |
| `CrmExtraDrawer` | Tabloda gösterilmeyen alanlar: vergi no, oluşturulma, satış, şehir |

---

## Bileşen başına 1 satır Tailwind (özet)

| Bileşen | Tailwind özeti |
|---------|----------------|
| Filtre kabı | `rounded-2xl bg-gray-100 p-3 shadow-neo-in` |
| Filtre input | `rounded-xl bg-gray-100 text-gray-800 shadow-neo-in` |
| Uygula | `rounded-xl bg-gray-100 font-semibold text-gray-800 shadow-neo-out-sm active:shadow-neo-press` |
| Liste kartı | `rounded-2xl bg-gray-100 shadow-neo-out-sm` |
| Detay kartı | `rounded-2xl bg-gray-100 shadow-neo-out` |
| Sekme track | `rounded-full bg-gray-100 p-1 shadow-neo-in` |
| Sekme aktif | `rounded-full bg-gray-100 text-gray-900 shadow-neo-out-sm` |
| Timeline | `rounded-xl bg-gray-100 p-3 shadow-neo-in` |
| Modal yüzeyi | `rounded-3xl bg-gray-100 p-5 shadow-neo-out` |

---

## UX soruları

1. Müşteri kartında “birincil kontak” her zaman görünür mü, yoksa sekmede mi?
2. Teklif oluştur: CRM’den mi başlar yoksa her zaman Teklif modülüne yönlendirme mi?
3. Ek alanlar drawer’ı mobilde tam ekran mı, yoksa tablo altında genişleyen satır mı?
4. Pasif müşteriler listede varsayılan gizli mi, yoksa filtre ile mi ayrılır?
5. Dokümanlar: ERP’de versiyonlama ve onay akışı bu ekranda mı, yoksa harici DMS mi?

---

## Kod

- `app/src/components/crm/CrmModuleView.tsx`
- `app/src/components/crm/CrmNewCustomerModal.tsx`
- `app/src/components/crm/CrmExtraDrawer.tsx`
- `app/src/data/crmCustomers.ts`
- `MainCanvas.tsx` — `activeId === 'crm'` yönlendirmesi
