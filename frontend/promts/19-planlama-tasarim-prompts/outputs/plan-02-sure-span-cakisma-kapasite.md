# plan-02 — Çıktı: Süre, span, çakışma, kapasite

**Seçilen P0 span modeli (tekilleştirildi):** **Birleşik blok** — plan öğesi, `start`→`end` aralığını kaplayan hücrelerde **tek görsel kart** olarak `grid-column` / `colspan` benzeri **yatay span** ile çizilir; taşan kısım için **üstte ince timeline bar** kullanılmaz (P2’de “gantt özet şeridi” olarak eklenebilir).

---

## 1) Bilgi mimarisi

- **Menü:** Production / MES → **Planlama — Tasarım** (plan-01 ile aynı).
- **Bu promptun ek katmanı:** Aynı öğe **birden fazla `(gün, vardiya)` hücresine** yayılır; süre ve span, **kartın gövdesinde** ve **detay drawer’ında** tekrarlanır.

---

## 2) Wireframe notları

- **Satır ekseni:** Kalıp (satır başına bir “zamanbandı” alanı).
- **Span kartı:**  
  - Hücre ızgarası üzerinde **tek rect**; kenarları **protrude** mini kart; **sol kenarda** ince “proje şeridi” (P1; P0’da gri ton).
  - Kart içi **satır 1:** kısa `title` (truncate).  
  - **Satır 2:** `durationHours` + birim etiketi (`h` veya “≈ 2 vardiya” — mock’ta tutarlı: **saat**).  
  - **Satır 3:** `start → end` (kısa tarih/saat veya “25 Mar 06:00 → 26 Mar 14:00”).
- **Kısmi hücre:** Span’ı bölmek için ızgarada **görsel olarak birleşik**; alt hücrelerde “hayalet” placeholder yok (erişilebilirlik için `aria-rowspan` / `aria-description` ile öğe id’si).
- **Çakışma:** İki span öğesi **aynı kalıp satırında** aynı zaman diliminde **üst üste biniyorsa** (mock geometri), **üstteki** veya **son eklenen** kartta **sarı ring** (`ring-amber-400/80`); ikincil çakışma listesi için `Uyarılar` tablosu.
- **Kapasite (P1):** Eşzamanlı öğe sayısı > `maxConcurrent` → **kırmızı ring** veya **kırmızı sol border** (error); tek öğe uzun span olsa bile “adet” kuralı ihlali.

---

## 3) Etkileşim kuralları

| Kural | Açıklama |
|--------|-----------|
| **Süre kaynağı** | `durationHours` doğruluk için `start`/`end` ile tutarlı; çelişirse öncelik: `end - start` (UI’da uyarı). |
| **Drag** | Span’lı öğe **bir bütün** sürüklenir; bırakınca `start` kayar, `durationHours` sabit kalır (P0 basit). |
| **Resize** | P0’da yok; P1’de sağ kenar çekerek süre uzat (not). |
| **Çakışma tespiti** | Aynı `moldId` + zaman aralığı kesişimi (mock: `start`–`end` overlap) → `severity: warning`. |
| **Kapasite** | Aynı `moldId` + aynı zaman diliminde **eşzamanlı aktif** öğe sayısı > limit → `severity: error` (P1). |
| **Tooltip** | Sarı ring hover: “Kalıp çakışması (mock)”; kırmızı: “Eşzamanlı kapasite aşımı (mock)”. |

---

## 4) P0 / P1 / P2

- **P0:** Süre alanı, span birleşik blok, başlangıç→bitiş özeti, çakışma sarı kenarlık + tooltip.
- **P1:** Eşzamanlı max adet → warning/error; proje rengi şeridi (nötr palete uyumlu sol border tonları).
- **P2:** Otomatik “şu vardiyaya kaydır” metin önerisi; isteğe bağlı üst timeline şeridi.

---

## 5) Tailwind (kısa notlar)

- Span kart: `rounded-xl bg-gray-100 shadow-[6px_6px_12px_rgb(163_163_163/0.35),-6px_-6px_12px_rgb(255_255_255/0.9)] border border-gray-200/60 p-2 min-w-0`
- Proje şeridi (P1): `border-l-4 border-l-gray-600` (projeye göre `gray-500` / `stone-700` — mor yok)
- Çakışma uyarısı: `ring-2 ring-amber-400/80 ring-offset-1 ring-offset-gray-100`
- Kapasite hatası (P1): `ring-2 ring-red-500/70` veya `border-l-4 border-l-red-600`
- Metin: başlık `text-gray-900`, süre `text-gray-700`, ikincil `text-gray-500 text-xs`

---

## 6) Boş / yükleme / hata

- **Veri yok:** Kalıp satırında boş inset hücre.
- **Span taşması görünümü:** Yatay scroll dışında kalan kısım — kartta “…” veya “devamı →” (tıkla drawer).
- **Çakışma + kullanıcı yine de bıraktı:** Uyarı korunur; yayınlama (kilitle) ayrı akış (plan-07 ile hizalanır).

---

## 7) Üst / alt ekran geçişleri

- **Kart tık** → drawer (aynı `itemId`); **uyarı satırına tık** → drawer’da “Uyarılar” sekmesi (mock).

---

## 8) UX soruları (5)

1. **Süre birimi** fabrikada her zaman saat mi, yoksa “vardiya” (ör. 1 vardiya = 8 saat) resmi birim mi?
2. Span sırasında **gece vardiyası / üretim dışı gün** geçişi: blok otomatik bölünsün mü, tek blok olarak gri tatil gününden “geçsin” mi?
3. Çakışma **mümkün** mü (uyarı ile) yoksa **hiç kayıt edilmesin** mi (hard validation)?
4. Eşzamanlı kapasite: **ağır iş** ve **hafif iş** aynı mı sayılır, yoksa **pozisyon tipi** ağırlığı var mı?
5. Aynı kalıpta **üst üste** iki öğe (çakışma) varsayılanı: **hataya** mı, **yalnızca uyarıya** mı?

---

## 9) Rol matrisi (plan-02: span + uyarılar)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Süre / span’i görüntüle | ✓ | ✓ | ✓ |
| Span’lı öğeyi sürükle-bırak | ✓ | ✓ | ✓ (kendi vardiya satırı politikasına bağlı) |
| Çakışma uyarısını görmezden gelerek kaydet | ✓ | ✓ | ✗ veya onay |
| Kapasite ihlali (error) ile kayıt | ✓ | onay | ✗ |
| Otomatik “kaydır” önerisini uygula (P2) | ✓ | ✓ | ✗ |

---

## Mock tablolar (zorunlu)

### 1) Plan öğeleri — 10 satır

| itemId | title | moldId | start | end | durationHours | status | projectColor |
|--------|-------|--------|-------|-----|---------------|--------|--------------|
| P-ITEM-1 | DW-120 duvar paneli | M-01 | 2026-03-24T06:00:00Z | 2026-03-24T14:00:00Z | 8 | planned | gray-600 |
| P-ITEM-2 | PR-08 perde | M-03 | 2026-03-24T06:00:00Z | 2026-03-25T14:00:00Z | 32 | planned | gray-600 |
| P-ITEM-3 | K-40 kiriş | M-05 | 2026-03-24T14:00:00Z | 2026-03-24T22:00:00Z | 8 | planned | gray-500 |
| P-ITEM-4 | DW-121 duvar paneli | M-01 | 2026-03-24T06:00:00Z | 2026-03-24T10:00:00Z | 4 | planned | **stone-700** |
| P-ITEM-5 | PL-200 döşeme | M-09 | 2026-03-25T06:00:00Z | 2026-03-26T06:00:00Z | 24 | planned | **stone-700** |
| P-ITEM-6 | PR-09 perde | M-03 | 2026-03-25T14:00:00Z | 2026-03-25T22:00:00Z | 8 | planned | gray-500 |
| P-ITEM-7 | DW-130 duvar | M-02 | 2026-03-26T06:00:00Z | 2026-03-26T06:00:00Z | 0 | error | gray-600 |
| P-ITEM-8 | ÖZ-01 özel parça | M-11 | 2026-03-27T06:00:00Z | 2026-03-27T18:00:00Z | 12 | planned | gray-600 |
| P-ITEM-9 | K-41 kiriş | M-05 | 2026-03-24T14:00:00Z | 2026-03-24T18:00:00Z | 4 | planned | **stone-700** |
| P-ITEM-10 | DW-122 duvar | M-01 | 2026-03-28T06:00:00Z | 2026-03-28T14:00:00Z | 8 | planned | gray-500 |

*Not:* `P-ITEM-4` ile `P-ITEM-1` aynı kalıpta zaman overlap → çakışma uyarısı. `P-ITEM-7` süre 0 → `status: error` (tutarsızlık örneği). Tasarım amaçlı; gerçek üründe `durationHours` düzeltilir.

### 2) Uyarılar — 5 satır

| itemId | severity | message |
|--------|----------|---------|
| P-ITEM-4 | warning | Kalıp çakışması (mock): M-01 üzerinde P-ITEM-1 ile aynı zaman dilimi. |
| P-ITEM-1 | warning | Kalıp çakışması (mock): M-01 üzerinde P-ITEM-4 ile aynı zaman dilimi. |
| P-ITEM-9 | warning | Kalıp çakışması (mock): M-05 üzerinde P-ITEM-3 ile aynı zaman dilimi. |
| P-ITEM-1 | warning | Kapasite (mock): M-01 eşzamanlı iş sayısı 2 / max 2 — sınırda. |
| P-ITEM-7 | error | Süre tutarsız: durationHours 0; start/end ile eşleşmiyor. |

---

*Kaynak prompt:* `plan-02-sure-span-cakisma-kapasite.md` · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `10-design-promts/prompts/00-ORTAK-BLOK.md`, `00b-NEOMORPHISM-TAILWIND.md`, `13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md`.
