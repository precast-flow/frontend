# glass-03 — Bileşen envanteri (grep özeti)

`../../app/src/components/**/*.tsx` içinde yaklaşık eşleşme sayıları (dosya başına satır; toplam ~55 dosyada dağılım):

| Örüntü | Yaklaşık kullanım |
|--------|-------------------|
| `shadow-neo-out` (out / out-sm) | **Yüksek** — onlarca dosya (Planlama, Proje, MES, CRM, Teklif, …) |
| `shadow-neo-in` | **Yüksek** — formlar, paneller, ızgaralar |
| `bg-pf-surface` | **Düşük** — çoğunlukla shell / birkaç modül |
| `rounded-3xl` | **Düşük–orta** — modallar ve kabuk |

**P2 (bilerek ertelendi):** Tüm `button` öğelerine tek seçici ile müdahale — yan etki riski; bunun yerine neo + `rounded-xl` / `rounded-2xl` + `bg-gray-*` kombinasyonları ve isteğe bağlı `gm-glass-btn-*` kullanıldı.
