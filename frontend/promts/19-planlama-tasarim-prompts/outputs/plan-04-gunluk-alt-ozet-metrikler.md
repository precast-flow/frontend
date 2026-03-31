# plan-04 — Çıktı: Günlük alt özet, metrikler, uyarı rozetleri

**Hesaplama kaynağı (mock, plan-08 uyumu):** Günlük toplamlar, seçili aralıktaki `PlanItem` kayıtlarından türetilir: **`pieces`** = ilgili günle kesişen öğe sayısı; **`volumeM3`** = Σ `estimatedVolumeM3` (kesişim gününe oransal dağıtım P2 — P0’da tam gün içi öğeler **tam** sayılır); **`steelKg`** = Σ `estimatedSteelKg`. Çeliik tooltip: *“Kaynak: emir satırı tahminleri; kg/m³ = çelik ÷ hacim (özet satırında gösterim için).”*

**P0 yerleşim seçimi:** **Sticky alt özet bandı** — Ana ızgaranın **altında** tam genişlikte **tek şerit** (`sticky bottom-0 z-40`); içinde her **takvim günü** için **vardiya sütunlarıyla hizalı** bir **birleşik hücre** (gün grubu `colspan = vardiya sayısı`). Böylece yatay kaydırmada gün başlıkları ile özet sütunları **aynı grid template** üzerinde kalır. *(Alternatif: gün başına üç ayrı mini kutu — P1 vardiya kırılımına bırakıldı.)*

---

## 1) Bilgi mimarisi

- **Menü:** Production / MES → **Planlama — Tasarım**.
- **Yeni katman:** Izgara gövdesi + **Özet şeridi** (footer). Üst toolbar’daki tarih aralığı değişince özet **yeniden hesaplanır** (mock).

---

## 2) Yerleşim şeması

```
┌── kalıp (sticky sol) ──┬── Gün1 [V1][V2][V3] ── Gün2 [V1][V2][V3] ── … ──→
│                        │  [  ızgara gövdesi — span kartlar   ]
│                        │  … mold satırları …
├────────────────────────┴─────────────────────────────────────────────────
│ ÖZET (sticky)          │  ┌───────────────────┐ ┌───────────────────┐
│ (opsiyonel etiket:     │  │ Gün 1             │ │ Gün 2             │
│  “Gün özetleri”)       │  │ adet · m³ · kg ⚠  │ │ adet · m³ · kg    │
│                        │  └───────────────────┘ └───────────────────┘
└────────────────────────┴─────────────────────────────────────────────────
```

- **Dikey alan:** Özet yüksekliği ~ **56–72px** (P0 kompakt); genişletilebilir **chevron** ile P1’de vardiya satırı açılır.
- **Yatay scroll:** Özet satırı **grid ile kilitli** — sol donmuş kolonda “Toplam / Özet” etiketi (ince, `text-gray-500`).

---

## 3) Metrik hiyerarşisi

| Öncelik | Metin / değer | Not |
|---------|----------------|-----|
| **1** | **Adet** (`pieces`) | “**12** elem” — birincil rakam, `text-gray-900 font-semibold` |
| **2** | **Hacim** (`volumeM3` toplam) | “**86 m³**”, `text-gray-800` |
| **3** | **Çelik** (`steelKg` toplam) | “**5,4 t**” veya kg (≥1000 ise t, 1 ondalık); tooltip: kg/m³ ve veri kaynağı |
| **4** | **Uyarı rozeti** | `warningsCount > 0` → **inset** pill + sayı; hover’da kod listesi özeti |

**Rozet kuralları (P0):**

- `warningsCount === 0` → rozeti gösterme veya gri “0”.
- `warningsCount > 0` → **amber** ring veya `bg-amber-100/80 text-amber-900` (00b: LED/amber istisnası ile uyumlu); **error** severity içeren kod varsa **kırmızı** kenar (`border-l-red-600`).

**Metin örnekleri (tek satır kompakt):**  
`12 el · 86 m³ · 5,4 t` + `⚠ 3`  
İkincil satır (isteğe bağlı, dar ekranda gizli): `Kapasite üstü · Eksik reçete: 1`

---

## 4) P0 / P1 / P2

| Kademe | İçerik |
|--------|--------|
| **P0** | Gün grubu başına alt özet hücresi; adet, m³, çelik; uyarı sayısı + severity’ye göre vurgu; sticky alt band; çelik tooltip |
| **P1** | V1/V2/V3 **mini dağılım**: üç küçük rakam veya tek satır **segmented bar** (gri tonları, mor yok); “riskli termin” sayısı (`riskyTermCount` mock) |
| **P2** | Senaryo **A | B** toggle — yan yana iki özet şeridi veya diff rakamları (wireframe etiketi); gün içi **oransal** hacim/çelik payı |

---

## 5) Tailwind (kısa notlar)

- Özet şerit kabuğu: `border-t border-gray-200/80 bg-gray-50/95 backdrop-blur-sm sticky bottom-0 z-40 shadow-[0_-4px_12px_rgb(0_0_0/0.05)]`
- Gün özet hücresi: `rounded-2xl bg-gray-100 p-2 md:p-3 shadow-[inset_3px_3px_6px_rgb(163_163_163/0.25),inset_-3px_-3px_6px_rgb(255_255_255/0.9)] min-w-[140px]`
- Birincil rakam: `text-lg font-semibold text-gray-900 tabular-nums`
- İkincil metrik: `text-sm text-gray-700 tabular-nums`
- Uyarı pill: `rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-amber-400/50 bg-amber-50 text-amber-900`
- Vardiya mini bar (P1): üç segment `h-1.5 rounded-full bg-gray-300` + dolu kısımlar `bg-gray-600` / `bg-gray-500` / `bg-gray-400`

---

## 6) Boş / yükleme / hata

- **Boş gün:** “0 el · 0 m³ · —” ; hücre **soluk** `opacity-80`.
- **Yükleme:** özet şeritte **shimmer** barlar (3–5 blok).
- **Hata:** şerit solunda `text-red-700` “Özet hesaplanamadı”; yenile ikonu.

---

## 7) Üst / alt ekran geçişleri

- Özet hücreye **tık** (P1): o güne **filtre** veya **drawer** “gün özeti” (iş listesi mock).
- Toolbar **aralık** değişimi → özet animasyonsuz yenilenir (veya kısa `transition-opacity`).

---

## 8) UX soruları (5)

1. **Adet** tanımı: benzersiz `PlanItem` mı, yoksa **erp satır / sevkiyat birimi** mi?
2. Çok günlük span: hacim/çelik **sadece başlangıç gününe** mi yazılır, **günlere bölünür** mü (P2)?
3. “Kapasite üstü” eşiği **günlük m³** mü, **vardiya + hat** mı, ikisi birlikte mi?
4. Özet **fabrika geneli** mi yoksa seçili **hat filtresi** ile mi daralır?
5. Kullanıcı özet şeridini **gizleyebilir** mi (daha fazla grid alanı)?

---

## 9) Rol matrisi (plan-04 — özet şeridi)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Günlük özetleri görüntüle | ✓ | ✓ | ✓ |
| Metrik tooltip / detay | ✓ | ✓ | ✓ |
| Özetten güne filtre (P1) | ✓ | ✓ | ✓ |
| Senaryo karşılaştırma (P2) | ✓ | ✓ | salt görüntüleme |
| Kapasite eşiğini yapılandırma | ✓ | öneri | ✗ |

---

## Mock tablolar (zorunlu)

### 1) Günlük özet — 7 satır

| date | pieces | volumeM3 | steelKg | warningsCount |
|------|--------|----------|---------|---------------|
| 2026-03-24 | 12 | 86.2 | 5380 | 2 |
| 2026-03-25 | 18 | 102.5 | 6910 | 1 |
| 2026-03-26 | 9 | 54.0 | 3120 | 0 |
| 2026-03-27 | 15 | 91.3 | 6050 | 3 |
| 2026-03-28 | 4 | 18.5 | 980 | 1 |
| 2026-03-29 | 0 | 0 | 0 | 0 |
| 2026-03-30 | 7 | 41.2 | 2650 | 1 |

*Not:* 29–30 Mart üretim dışı/hafta sonu senaryosu için düşük veya sıfır örnekler.

### 2) Uyarı kodları — 5 satır

| code | label | severity |
|------|-------|----------|
| `CAP-DAY` | Günlük kapasite üstü (mock) | warning |
| `RCP-MISS` | Eksik / onaysız beton reçetesi | warning |
| `MOLD-CLASH` | Kalıp çakışması | warning |
| `CAP-SHIFT` | Vardiya bazlı kapasite aşımı | error |
| `NON-PROD` | Üretim dışı güne yerleşim | warning |

---

*Kaynak prompt:* `plan-04-gunluk-alt-ozet-metrikler.md` · PlanItem alanları: `plan-08-mock-veri-sema-kenar-durumlari.md`. · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `10-design-promts/prompts/00-ORTAK-BLOK.md`, `00b-NEOMORPHISM-TAILWIND.md`, `13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md`.
