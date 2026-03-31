# plan-08 — Çıktı: Mock veri şeması, kenar durumları, optimistic UI ve P2

**Seçilen zaman alanları yaklaşımı (tutarlı):** `PlanItem` için **`startAt` + `endAt`** kullanılır. `durationHours` UI’da türetilir veya API/mock ile gelir; bu dosyada mock’lar `durationHours`’ı da içerir.

---

## 1) Bilgi mimarisi

- **Menü:** `Production / MES` → `Planlama — Tasarım`.
- **Bu katman:** `PlanningGrid`’in beslendiği tek mock veri kaynağı ve UI’daki boş/yükleme/hata senaryoları.
- **Uyum:** `plan-02` (span/çakışma/kapasite uyarıları), `plan-03` (drawer alanları) ve `plan-05` (statusKey renkleri) ile alan adları eşleşir.

---

## 2) Veri sözlüğü (field -> açıklama -> örnek)

### PlanItem (ızgara öğesi)
- `id`: benzersiz öğe id’si. Örn: `P-501`
- `title`: kullanıcıya görünen kısa başlık. Örn: `DW-210 duvar paneli`
- `productId`: ürün/ERP kimliği. Örn: `PROD-DW-120`
- `imageUrl`: kart görseli; yoksa `null`. Örn: `null`
- `moldId`: kalıp kimliği (grid satırı). Örn: `M-01`
- `startAt`: planlanan başlama tarihi-saat (ISO). Örn: `2026-03-24T06:00:00Z`
- `endAt`: planlanan bitiş tarihi-saat (ISO). Örn: `2026-03-24T14:00:00Z`
- `durationHours`: UI’da hesap/özet için. Örn: `8`
- `status`: `plan-05`teki status anahtarlarıyla aynı. Örn: `IN_PROGRESS`
- `priority`: 1–5 (1 düşük, 5 yüksek). Örn: `3`
- `concreteRecipeId`: onaylı beton reçetesi referansı. Örn: `RC-C30-01`
- `estimatedVolumeM3`: tahmini beton hacmi. Örn: `12.4`
- `estimatedSteelKg`: tahmini demir kg. Örn: `840`
- `projectId` (opsiyonel): proje referansı. Örn: `PRJ-2026-014`
- `orderId` (opsiyonel): emir referansı. Örn: `SO-88421`
- `tags`: etiketler (chip). Örn: `["vibration","QC-A"]`
- `warnings`: uyarı mesajları (string). Örn: `["Kalıp çakışması (mock)"]`

### Beton reçetesi (mock havuzu)
- `recipeId`: reçete id’si
- `label`: kullanıcı etiket adı
- `strengthClass`: ör. `C30`, `C35`

### API hatası
- `code`: makine okunur hata kodu
- `userMessage`: UI’da gösterilecek metin

---

## 3) Kenar durumları (P0)

### Loading
- `PlanningGrid` iskelet ızgara + birkaç satır/sütun placeholder.
- Toolbar tarafında fabrika/filtre placeholder.
- Skeleton metinleri: “Plan yükleniyor… (mock)” kısa.

### Boş
- Hücre boş olduğunda ve filtreye rağmen hiç plan yoksa:
  - Üstte inset well: “Bu aralıkta plan yok”
  - CTA: “İş ekle” (plan-03 + plan-03 boş hücre akışıyla uyumlu).

### Hata (hard error)
- Üst banner `text-red-700` ile:
  - “Plan verisi çekilemedi. Yeniden dene.”
- “Yeniden dene” secondary.
- Hata kodu (mock) hover/tooltip içinde.

### Kısmi yetki (read-only)
- Toolbar’da `Kaydet`/`Yayınla` disabled + banner (opsiyonel):
  - “Salt okunur: değişiklik yapamazsınız.”
- Grid içi DnD ve boş hücre ataması kapalı (plan-03 + plan-07 uyumu).

---

## 4) Optimistic UI (P1)

- DnD/yerleştirme anında:
  - Kart yeni konumda görünür (lokal state güncelle).
  - Hata gelirse:
    - kart eski konuma geri döner (snap-back)
    - toast gösterilir: “Yerleştirme başarısız: {userMessage}”
    - uyarılar `warnings[]` güncellenir (mock: çakışma/kapasite).

---

## 5) P2 kapsamı (performans + genişleme)

- **Sanal scroll:** `PlanningGrid` büyük aralıklarda DOM’u sınırlı tutar.
- **Çoklu seçim:** (wireframe) multi-select ile toplu taşıma önizlemesi.
- **Export:** CSV/Excel (plan-07 P2 buton akışı).
- **Mobil:** ızgara yerine gün seçici + liste (alternatif layout).

---

## 6) Tailwind kısa notlar

- Loading skeleton:
  - `animate-pulse bg-gray-200/60 rounded`
- Üst hata banner:
  - `rounded-2xl bg-red-50/80 border border-red-200 p-3 text-red-700`
- Empty state:
  - `rounded-2xl bg-gray-100 p-5 text-gray-700`
- Optimistic highlight:
  - Drop sonrası kart:
    - `ring-1 ring-gray-400/80`
    - sonra `transition` ile normalize (150ms).

---

## 7) Rol matrisi (plan-08 — yetkiye bağlanmış davranış)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Planı görüntüle | ✓ | ✓ | ✓ |
| DnD ile taşı | ✓ | ✓ (kısıt/uyarı) | ✓ (kendi vardiyası) |
| Boş hücreye atama | ✓ | ✓ | ✓ (kısıtlı) |
| Kaydet | ✓ | ✓ (onay/politika) | ✗ |
| Yayınla | ✓ | ✓ (onay) | ✗ |
| Hata sonrası optimistic geri alma | ✓ | ✓ | ✓ |

---

## 8) Entegrasyon soruları (P0/P1)

1. MES gerçek zamanlı durumda bir `PlanItem` durumu değişirse (örn. IN_PROGRESS → PRODUCED_OK): UI’da hangi kayıt baskın olur (plan local mi, server mi)?
2. Taşıma işlemi sırasında sunucu “kapasite aşımı” hatası dönerse: kart yerleştirilmiş görünmeye devam mı eder (optimistic) yoksa anında snap-back mi yapılır?
3. Çakışma tespiti yalnızca aynı `moldId` + zaman overlap mi, yoksa farklı hat/alt sistem kaynakları da dahil mi?
4. Yetki geçişleri (kullanıcı rol değiştirir) sırasında:
   - açık drawer düzenleme alanları otomatik kapanır mı?

---

## Mock tablolar (zorunlu)

### 1) PlanItem — 25 satır

| id | title | productId | imageUrl | moldId | startAt | endAt | durationHours | status | priority | concreteRecipeId | estimatedVolumeM3 | estimatedSteelKg | projectId | orderId | tags | warnings |
|----|-------|-----------|----------|--------|----------|--------|----------------|--------|----------|--------------------|----------------------|------------------|------------|---------|-------|----------|
| P-501 | DW-210 duvar paneli | PROD-DW-120 | null | M-01 | 2026-03-24T06:00:00Z | 2026-03-24T14:00:00Z | 8 | PLANNED | 2 | RC-C30-01 | 12.4 | 840 | PRJ-2026-014 | SO-88421 | ["vibration","QC-A"] | ["Kalıp çakışması (mock)"] |
| P-502 | PR-08 perde | PROD-PR-008 | null | M-03 | 2026-03-24T06:00:00Z | 2026-03-25T14:00:00Z | 32 | ORDERED_DESIGN | 1 | RC-C35-02 | 24.7 | 1620 | PRJ-2026-021 | SO-88422 | ["priority-low"] | [] |
| P-503 | K-40 kiriş | PROD-K-040 | null | M-05 | 2026-03-24T14:00:00Z | 2026-03-24T22:00:00Z | 8 | IN_PROGRESS | 3 | RC-C30-01 | 9.2 | 1110 | PRJ-2026-014 | SO-88423 | ["steel-intensive"] | ["Kalıp çakışması (mock)"] |
| P-504 | DW-121 duvar paneli | PROD-DW-121 | null | M-01 | 2026-03-24T06:00:00Z | 2026-03-24T10:00:00Z | 4 | HOLD_UNCERTAIN | 2 | RC-C25-01 | 6.1 | 520 | PRJ-2026-014 | SO-88424 | ["awaiting-recipe"] | ["Kalıp çakışması (mock)"] |
| P-505 | PL-200 döşeme | PROD-PL-200 | null | M-09 | 2026-03-25T06:00:00Z | 2026-03-26T06:00:00Z | 24 | PLANNED | 2 | RC-C35-02 | 18.8 | 980 | PRJ-2026-033 | SO-88425 | ["floor"] | [] |
| P-506 | PR-09 perde | PROD-PR-009 | null | M-03 | 2026-03-25T14:00:00Z | 2026-03-25T22:00:00Z | 8 | PLANNED | 1 | RC-C30-01 | 10.3 | 700 | PRJ-2026-021 | SO-88426 | ["qc-b"] | [] |
| P-507 | DW-130 duvar | PROD-DW-130 | null | M-02 | 2026-03-26T06:00:00Z | 2026-03-26T14:00:00Z | 8 | ISSUE_REWORK | 4 | RC-C30-01 | 13.0 | 900 | PRJ-2026-040 | SO-88427 | ["rework"] | ["Kalıp çakışması (mock)"] |
| P-508 | ÖZ-01 özel parça | PROD-OS-001 | null | M-11 | 2026-03-27T06:00:00Z | 2026-03-27T18:00:00Z | 12 | ORDERED_DESIGN | 5 | RC-C40-01 | 7.6 | 680 | PRJ-2026-055 | SO-88428 | ["special","QC-A"] | [] |
| P-509 | K-41 kiriş | PROD-K-041 | null | M-05 | 2026-03-24T14:00:00Z | 2026-03-24T18:00:00Z | 4 | PLANNED | 2 | RC-C30-01 | 4.6 | 560 | PRJ-2026-014 | SO-88429 | ["short-run"] | [] |
| P-510 | DW-122 duvar | PROD-DW-122 | null | M-01 | 2026-03-28T06:00:00Z | 2026-03-28T14:00:00Z | 8 | PLANNED | 2 | RC-C25-01 | 12.2 | 820 | PRJ-2026-014 | SO-88430 | ["batch-2"] | [] |
| P-511 | PL-201 döşeme | PROD-PL-201 | null | M-10 | 2026-03-25T06:00:00Z | 2026-03-25T14:00:00Z | 8 | IN_PROGRESS | 3 | RC-C35-02 | 8.9 | 870 | PRJ-2026-033 | SO-88431 | ["in-progress"] | [] |
| P-512 | PR-10 perde | PROD-PR-010 | https://cdn.mock/precast/pr-10.svg | M-04 | 2026-03-26T14:00:00Z | 2026-03-27T06:00:00Z | 16 | ORDERED_DESIGN | 2 | RC-C30-01 | 15.2 | 1030 | PRJ-2026-060 | SO-88432 | ["night-span"] | [] |
| P-513 | OS-02 özel eleman | PROD-OS-002 | null | M-12 | 2026-03-28T14:00:00Z | 2026-03-28T22:00:00Z | 8 | HOLD_UNCERTAIN | 4 | RC-C40-01 | 5.1 | 430 | PRJ-2026-055 | SO-88433 | ["material-hold"] | ["Kapasite (mock): M-12 eşzamanlı 2 / max 1"] |
| P-514 | DW-123 duvar paneli | PROD-DW-123 | null | M-01 | 2026-03-24T10:00:00Z | 2026-03-24T14:00:00Z | 4 | PLANNED | 1 | RC-C30-01 | 6.0 | 410 | PRJ-2026-014 | SO-88434 | [] | [] |
| P-515 | K-42 kiriş seti | PROD-K-042 | null | M-05 | 2026-03-24T18:00:00Z | 2026-03-25T06:00:00Z | 12 | PLANNED | 3 | RC-C35-02 | 7.8 | 820 | PRJ-2026-014 | SO-88435 | ["over-midnight"] | [] |
| P-516 | PL-202 döşeme | PROD-PL-202 | null | M-09 | 2026-03-29T06:00:00Z | 2026-03-29T14:00:00Z | 8 | CANCELLED | 2 | RC-C25-01 | 0 | 0 | PRJ-2026-070 | SO-88436 | ["cancelled"] | ["Üretim dışı güne yerleşim (mock)"] |
| P-517 | PR-11 perde | PROD-PR-011 | null | M-03 | 2026-03-30T06:00:00Z | 2026-03-30T14:00:00Z | 8 | SCRAP | 1 | RC-C30-01 | 3.3 | 220 | PRJ-2026-021 | SO-88437 | ["scrap"] | ["Hurda (mock)"] |
| P-518 | DW-124 duvar | PROD-DW-124 | null | M-02 | 2026-03-26T06:00:00Z | 2026-03-26T10:00:00Z | 4 | IN_PROGRESS | 3 | RC-C35-02 | 5.5 | 380 | PRJ-2026-040 | SO-88438 | [] | [] |
| P-519 | K-43 kiriş | PROD-K-043 | null | M-06 | 2026-03-27T06:00:00Z | 2026-03-27T18:00:00Z | 12 | PRODUCED_OK | 2 | RC-C30-01 | 7.9 | 740 | PRJ-2026-080 | SO-88439 | ["produced"] | [] |
| P-520 | PL-203 döşeme | PROD-PL-203 | null | M-10 | 2026-03-27T06:00:00Z | 2026-03-27T14:00:00Z | 8 | PRODUCED_OK | 2 | RC-C35-02 | 6.8 | 650 | PRJ-2026-080 | SO-88440 | ["qc-pass"] | [] |
| P-521 | PR-12 perde | PROD-PR-012 | null | M-03 | 2026-03-28T06:00:00Z | 2026-03-29T06:00:00Z | 24 | PLANNED | 4 | RC-C40-01 | 21.4 | 1500 | PRJ-2026-021 | SO-88441 | ["span-over-nonprod"] | ["non-production day (mock)"] |
| P-522 | OS-03 özel parça | PROD-OS-003 | https://cdn.mock/precast/os-03.svg | M-11 | 2026-03-24T14:00:00Z | 2026-03-24T22:00:00Z | 8 | PLANNED | 5 | RC-C40-01 | 9.0 | 910 | PRJ-2026-055 | SO-88442 | ["vip"] | [] |
| P-523 | DW-125 duvar | PROD-DW-125 | null | M-01 | 2026-03-26T14:00:00Z | 2026-03-26T22:00:00Z | 8 | ISSUE_REWORK | 4 | RC-C30-01 | 10.1 | 780 | PRJ-2026-014 | SO-88443 | ["rework"] | ["Kalıp çakışması (mock)"] |
| P-524 | PR-13 perde | PROD-PR-013 | null | M-04 | 2026-03-25T06:00:00Z | 2026-03-25T10:00:00Z | 4 | HOLD_UNCERTAIN | 2 | RC-C25-01 | 6.4 | 510 | PRJ-2026-021 | SO-88444 | ["awaiting-lab"] | ["Eksik reçete seçimi (mock)"] |
| P-525 | K-44 kiriş | PROD-K-044 | null | M-05 | 2026-03-29T14:00:00Z | 2026-03-29T22:00:00Z | 8 | IN_PROGRESS | 3 | RC-C35-02 | 5.6 | 560 | PRJ-2026-014 | SO-88445 | ["weekend-run"] | ["Üretim dışı güne yerleşim (mock)"] |

*Not:* Bazı satırlarda `estimatedVolumeM3`/`estimatedSteelKg` sıfır (cancelled) ve bazı `startAt/endAt` aralıkları span (ertesi güne sarkma) içerir. Bu, `plan-02` span/çakışma tasarımını test etmek içindir.

---

### 2) API hata örnekleri — 4 satır

| code | userMessage |
|------|--------------|
| `CAPACITY_EXCEEDED` | Aynı kalıp ve zaman aralığında kapasite aşımı var (mock). |
| `MOLD_CONFLICT` | Seçilen kalıp için çakışma tespit edildi (mock). |
| `NON_PRODUCTION_DAY` | Bu gün üretim dışıdır. Onay olmadan yerleştirilemez (mock). |
| `RECIPE_NOT_APPROVED` | Seçilen beton reçetesi henüz onaylı değil (mock). |

---

### 3) Beton reçete havuzu (mock) — 6 satır

| recipeId | label | strengthClass |
|----------|-------|----------------|
| RC-C25-01 | C25 Hazır Karışım | C25 |
| RC-C30-01 | C30 Standart | C30 |
| RC-C35-02 | C35 Hızlı Kür | C35 |
| RC-C40-01 | C40 Yüksek Mukavemet | C40 |
| RC-PL-50-01 | Perde/Plaka Özel | C50 |
| RC-QC-01 | QC Onaylı Karışım | C30 |

---

*Kaynak prompt:* `plan-08-mock-veri-sema-kenar-durumlari.md` · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `00b-NEOMORPHISM-TAILWIND.md`, `13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md`."

