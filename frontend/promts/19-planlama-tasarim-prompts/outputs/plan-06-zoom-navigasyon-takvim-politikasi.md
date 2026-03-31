# plan-06 — Çıktı: Zoom, hafta navigasyonu ve üretim dışı gün politikası

**Seçilen P0 politika yaklaşımı:** **Mod A (gri sütun + "Üretim yok" bandı)**. Üretim dışı güne **drop** yine plan-03’teki gibi **onay modal** ile ele alınır (sert engel yerine tutarlı “uyarı + onay”).

---

## 1) Bilgi mimarisi

- **Menü:** `Production / MES` → `Planlama — Tasarım`.
- **Izgara davranışı katmanı:** `PlanningGrid` içinde zaman ekseni şablonu.
- **Bu promptun odağı:** Zoom ile birlikte sütun genişliği/tipografi dinamik ayarı + “Bugün” navigasyonu + üretim dışı günlerde hata riskini düşüren görsel/etkileşim kuralları.

---

## 2) Etkileşim kuralları

### A) Zoom (P0)

1. Kullanıcıya **tek kontrol**: `Zoom` slider (0 → 100) + isteğe bağlı `Ctrl + mouse wheel` / `Cmd + wheel` kısayolu.
2. Zoom artınca:
   - Sütun genişliği büyür (kolon width token ile).
   - Hücre içi metinler görünür olur (min tipografi).
   - Span kartlarının okunurluğu artar (örn. title truncate daha az agresif).
3. Zoom azalınca:
   - Kolon width küçülür.
   - Başlıklarda `weekday` kısa, hücrelerde metin gizlenip sadece ikon/etiket kalır (P2’de export dışında).
4. Zoom sınırları (mock):
   - Minimum: `1 gün yakın`
   - Maksimum: `~45 gün uzak`

### B) Navigasyon (P0)

1. Toolbar’da butonlar:
   - `Bugün` (seçili aralığı bugüne snap’ler; “Bugün” başlığında vurgu ring)
   - `← Önceki hafta` / `Sonraki hafta` (veya mevcut zoom’a göre gün adımı; kural: “week-level” sabit, dayCount büyüdükçe aralık daha küçük adımda güncellenir)
2. Zoom değişince:
   - Navigasyon adımı otomatik güncellenir: örn. 1g zoom → “← 1 gün”, 45g zoom → “← 7 gün”.
3. “Bugün” vurgusu:
   - Gün başlığında ince protrude border + ikincil `bg-gray-200` band.
   - Üretim dışı gün aynı anda gelirse (Pazar/tatil) vurgu sadece outline ile kalır; band metni yine görünür.

### C) Üretim olmayan gün politikası (P0)

**Mod A: Gri sütun + "Üretim yok" bandı**
1. `isWeekend=true` veya `isHoliday=true` günlerde:
   - Gün başlığı gri zemin + alt ince band: `Üretim yok`
   - Bu günlerde plan hücresi **drop kuralı**:
     - Drop anında direkt iptal yerine `onay modal` (plan-03 ile uyumlu).
     - Modal’da mesaj: “Bu gün üretim dışıdır. Yine de yerleştirmek ister misiniz?”
2. DnD:
   - Hedef highlight yine gösterilir (drop geri bildirimi).
   - Toast: “Üretim dışı gün — onay gerekiyor” (modal açılmadan önce kısa).

**Mod B (opsiyon P2/alternatif): Sadece iş günleri**
- Üretim dışı gün sütunlarını tamamen gizler; toolbar’da `Sadece iş günleri` toggle.
- Bu mod seçilirse “Bugün” hücresi üretim dışı günse: `Bugün` butonu en yakın iş gününe snap’ler ve küçük açıklama toast’u gösterir.

### D) Sticky başlıklar (P0)

1. Zoom ile header yüksekliği değişse bile gün başlıkları ve vardiya alt başlıkları **sticky** kalır.
2. Sticky katman sırası:
   - Köşe (sol-üst) `z-30`
   - Gün başlıkları `z-20`
   - Kalıp kolonu `z-10`
3. Sticky alan arka plan:
   - `bg-gray-50/95` + hafif `backdrop-blur` (metin okunaklı).

---

## 3) Wireframe notları (wireframe düzeyi)

```
Toolbar: [Zoom slider] [Bugün] [←] [→] [Sadece iş günleri (ops)]

┌───────── kalıp (sticky sol) ─────────┬──────── Gün1 ───┬─── Gün2 ───┬ ...
│                                           (sticky)         (sticky)
│  M-01  |  [V1][V2][V3]  |  [Üretim yok band]  |
│  M-02  |  span card ...   |  disabled/drop-onay |
└─────────────────────────────────────────┴───────────────┴──────────────┘
Kenar: Üretim dışı gün başlığında gri bant + hover tooltip
```

---

## 4) P0 / P1 / P2 kapsamı

- **P0**
  - Zoom slider + `Ctrl/Cmd + scroll` ile aralık ölçekleme
  - Haftaya göre navigasyon (`Bugün`, `önceki/sonraki`)
  - Üretim dışı gün: Mod A (gri sütun + `Üretim yok` bandı) + drop onay modal
  - Sticky header: zoom’da kaybolmama
- **P1**
  - Takvim feed: resmi tatilleri otomatik gri (mock bayrak)
  - `Çalışma takvimi` aylık mini grid preview (pop-over) + “Sadece iş günleri” toggle (gerekirse)
- **P2**
  - Zoom/export print genişliği: wireframe etiketi
  - Alternatif görünüm: zaman ekseni dışa aktarılınca kolon sayısı azalır (print uyumu)

---

## 5) Tailwind (kısa notlar)

- Zoom kontrol (toolbar):
  - `rounded-2xl bg-gray-100 p-3 shadow-[...protrude...]`
- Slider track (inset):
  - `h-2 rounded-full bg-gray-200 shadow-[inset_...]`
- Zoom handle (protrude):
  - `w-4 h-4 rounded-full bg-gray-300 shadow-[6px_6px_12px_rgb(...),-6px_-6px_12px_rgb(...)]`
- Sticky header/gün band:
  - `sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/80`
- Üretim yok band:
  - `bg-gray-100/90 border border-gray-200 rounded-b-xl`
  - Metin: `text-gray-600 text-xs`
- Bugün vurgu:
  - `ring-1 ring-gray-400/80 bg-gray-100`

---

## 6) Boş / yükleme / hata

- **Loading:** header skeleton + birkaç sütun boşluk shimmer.
- **Takvim çekilemez:** toolbar’da `text-red-700` banner + “Yeniden dene” secondary butonu.
- **Zoom aşırı küçülür:** içerik otomatik `truncate + icon-only` moduna geçer (hard hata değil).

---

## 7) Üst / alt ekran geçişleri

- `Bugün` butonu ilgili gün grubuna “snap + scrollIntoView”.
- Üretim dışı gün bandında `Üretim yok` etiketine tıklayınca mini açıklama (tooltip/popup): “Bu gün için MES üretim akışı kapalı (mock).”

---

## 8) UX soruları (5)

1. Zoom’da hücre içinde metin gösterimi: `icon-only` moduna ne zaman düşsün (ör. 25% ve altı)?
2. Üretim dışı gün drop’unda onay modal mı zorunlu, yoksa sadece tooltip mi?
3. “Bugün” vurgusu üretim dışı günlerde de görünür olsun mu, yoksa daha soluk mu kalsın?
4. Navigasyon adımı zoom ile dinamik mi olsun (1g zoom → 1 gün adımı), yoksa her zaman hafta mı?
5. “Sadece iş günleri” toggle’ı Mod B için varsayılan açılsın mı (özellikle planlayıcı için) ?

---

## 9) Rol matrisi (plan-06 — zoom / takvim politikası)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Zoom ayarla | ✓ | ✓ | ✓ |
| Bugün / hafta navigasyonu | ✓ | ✓ | ✓ |
| Üretim dışı günleri görüntüle | ✓ | ✓ | ✓ |
| Üretim dışı güne yerleştirme (onay modal) | ✓ | onay | kısıtlı / onay |
| Çalışma takvimi preview (P1) | ✓ | ✓ | ✓ |

---

## Mock tablolar (zorunlu)

### 1) Takvim günleri — 14 satır

| date | isWeekend | isHoliday | productionAllowed |
|------|-----------|------------|-------------------|
| 2026-03-17 | Tue | false | true |
| 2026-03-18 | Wed | false | true |
| 2026-03-19 | Thu | false | true |
| 2026-03-20 | Fri | false | true |
| 2026-03-21 | Sat | true | false |
| 2026-03-22 | Sun | true | false |
| 2026-03-23 | Mon | false | true |
| 2026-03-24 | Tue | false | true |
| 2026-03-25 | Wed | true | false |
| 2026-03-26 | Thu | false | true |
| 2026-03-27 | Fri | false | true |
| 2026-03-28 | Sat | true | false |
| 2026-03-29 | Sun | true | false |
| 2026-03-30 | Mon | false | true |

*Not:* `isHoliday=true` örnek olarak `2026-03-25` için kullanıldı.

### 2) Zoom presetleri — 5 satır

| label | dayCount | columnWidthToken |
|--------|----------|-------------------|
| 1g | 1 | `w-44` |
| 7g | 7 | `w-32` |
| 14g | 14 | `w-28` |
| 30g | 30 | `w-24` |
| 45g | 45 | `w-20` |

---

*Kaynak prompt:* `plan-06-zoom-navigasyon-takvim-politikasi.md` · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `00b-NEOMORPHISM-TAILWIND.md`, `13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md`."

