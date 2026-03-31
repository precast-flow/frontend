# plan-05 — Çıktı: Durum renkleri, legend, erişilebilirlik

**İlke:** Renk **yalnız taşıyıcı değil**; her durumda **(1) kart yüzey tonu, (2) ince border, (3) küçük ikon + metin kısaltması** üçlüsü. **00b** ile çakışan **mor/lavanta** kullanılmaz; **`ISSUE_REWORK`** için birincil kod: **koyu gri çerçeve + turuncu ikon** (alternatif legend sütunu).

**Token uygulaması:** Prototipte `--status-*` CSS değişkenleri + Tailwind `border-l-4` / `bg-*` ile eşleme; yüksek kontrast modunda (P1) değişkenler override.

---

## 1) Renk token tablosu (P0 — çekirdek)

| `statusKey` | `colorToken` (CSS var) | Border / vurgu (Tailwind özeti) | Arka plan tonu (kart) | İkon rengi |
|-------------|------------------------|----------------------------------|----------------------|------------|
| `PLANNED` | `--status-planned` | `border-l-slate-500/80` veya `border-l-gray-500` | `bg-gray-50` üzerinde **hafif** `bg-slate-50/60` | `text-slate-600` |
| `ORDERED_DESIGN` | `--status-ordered` | `border-l-amber-400` + ince `ring-amber-200/50` | `bg-amber-50/40` | `text-amber-700` |
| `IN_PROGRESS` | `--status-progress` | `border-l-sky-600` | `bg-sky-50/50` | `text-sky-700` |
| `PRODUCED_OK` | `--status-ok` | `border-l-emerald-600` | `bg-emerald-50/50` | `text-emerald-700` |
| `HOLD_UNCERTAIN` | `--status-hold` | `border-l-orange-500` | `bg-orange-50/40` | `text-orange-800` |
| `ISSUE_REWORK` | `--status-rework` | `border-l-gray-800` + `ring-1 ring-orange-400/60` | `bg-gray-100` (nötr yüzey) | `text-orange-600` |
| `CANCELLED` | `--status-cancel` | `border-l-red-600` + `opacity-90` | `bg-red-50/35` | `text-red-700` |
| `SCRAP` | `--status-scrap` | `border-l-red-700` (daha kalın opsiyon) | `bg-red-50/60` | `text-red-800` |

*Not:* `PLANNED` için “mavi-gri” **saturasyon düşük** slate; gövde metni yine `text-gray-800` üstü (kontrast). **Gölgeler** 00b protrude ile aynı; durum **border-left** ile ayrışır (şekil + konum ipucu).

**Koyu tema (opsiyonel P1):** Aynı anahtarlar; arka planlar `bg-gray-900` tabanında `*/30` opacity ile.

---

## 2) Legend yerleşimi

- **Konum:** **Toolbar** sağ grubunda kompakt tetikleyici: **“Durum anahtarı”** (`rounded-full` pill, inset küçük ikonlar).
- **Genişleme:** Tıklanınca **popover** veya **dropdown panel** — **inset well** (`rounded-2xl`, gölge B tipi 00b), genişlik `min-w-[280px] max-w-sm`.
- **İçerik:**  
  - **Tablo 1:** Tüm `statusKey` satırları: mini swatch (sol border çizgisi) + `labelTR` + kısa `meaning`.  
  - **Tablo 2 (opsiyonel satır):** “Renk körlüğü: ikon şekline bakın” + `ISSUE_REWORK` için **turuncu ikon** vurgusu.
- **Sabit legend:** Dar viewport’ta toolbar’a **sığmazsa** toolbar **⋯** menüsüne taşınır.

---

## 3) Kart üzerinde görsel kod (P0 wireframe)

```
┌─ sol durum şeridi ─┬──────────────────────────────────────┐
│ █ (border-l-4)     │ [ikon 16px]  Kısa başlık…             │
│                    │  Süre / özet satırı                    │
└────────────────────┴──────────────────────────────────────┘
```

- İkon: kartın **sol üst köşesi** veya başlık öncesi; `aria-hidden` değil, **`aria-label`** = `labelTR`.
- **Çakışma / kapasite** (plan-02): durum border’ına **ek** olarak `ring-amber-400` veya `ring-red-500` — legend’da “öncelik: sistem uyarısı” notu.

---

## 4) Erişilebilirlik kuralları

| Kural | Uygulama |
|--------|-----------|
| Renk tek başına | Hayır: border kalınlığı + ikon şekli + **kısa durum etiketi** (gizli `sr-only` veya `abbr`) |
| Kontrast | Durum metni `text-gray-900` / ikon **≥ 4.5:1** uyarı renkleri; açık zeminde `red-700`, `emerald-800` tercih |
| Klavye | Legend tetikleyici: `button`, `Enter`/`Space`; `Esc` panel kapat |
| Ekran okuyucu | Kart: `role="button"` veya grid hücresi bağlamında **tam `aria-label`**: “{title}, {labelTR}, {moldId}, {start–end}” |
| Animasyon | Durum değişiminde yanıp sönme yok; `transition-colors` max 150ms |
| Yüksek kontrast (P1) | Renkler **artırılmış border width** (2px) + **dash pattern** SVG opsiyonel (P2) |

---

## 5) P0 / P1 / P2

| Kademe | İçerik |
|--------|--------|
| **P0** | Üçlü kod (ton + border + ikon); toolbar legend + inset panel; token tablosu; mor yok |
| **P1** | Kullanıcı/tema **yüksek kontrast** preset; toolbar’da durum **çoklu filtre** |
| **P2** | Drawer içi **durum geçmişi** zaman çizgisi; kartta ince **stripe pattern** (isteğe bağlı) |

---

## 6) UX soruları (5)

1. `ORDERED_DESIGN` ile `PLANNED` fabrikada **ayrı** mı kalır, yoksa birleşik “taslak” mü?
2. **`SCRAP` vs `CANCELLED`** aynı renk ailesinde mi kalsın, yoksa **çizgi stili** (kesik border) ile mi ayrışsın?
3. Mavi tonlar (`IN_PROGRESS`, `PLANNED` slate) marka rehberinde “soğuk” sayılıyor mu — **tek hsl** ölçeğine mi kilitlenelim?
4. Legend **her zaman açık** (dar) mı, yoksa **varsayılan kapalı** mı?
5. Durum değişimi **kim** tetikler (MES otomasyon) — kartta “kaynak: otomatik” rozeti gerekir mi?

---

## 7) Rol matrisi (plan-05 — legend / filtre)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Legend görüntüle | ✓ | ✓ | ✓ |
| Durum filtrele (P1) | ✓ | ✓ | ✓ |
| Yüksek kontrast (P1) | ✓ | ✓ | ✓ |
| Durum geçmişi (P2) | ✓ | ✓ | salt görüntüleme |
| Durum değiştir (iş kuralı) | politikaya göre | ✓ | kısıtlı |

---

## Mock tablolar (zorunlu)

### 1) Durum sözlüğü

| statusKey | labelTR | colorToken | iconName | meaning |
|-----------|---------|------------|----------|---------|
| `PLANNED` | Planlandı | `--status-planned` | `calendar-check` | Yer kaplıyor; üretim emri / MES henüz başlamadı (mock). |
| `ORDERED_DESIGN` | Emir / tasarım | `--status-ordered` | `blueprint` | Tasarım veya sipariş teyidi bekleniyor. |
| `IN_PROGRESS` | Üretimde | `--status-progress` | `play-circle` | Kalıp hattında aktif üretim. |
| `PRODUCED_OK` | Tamamlandı | `--status-ok` | `check-circle-2` | Kalite / onay akışına uygun üretildi (mock). |
| `HOLD_UNCERTAIN` | Beklemede | `--status-hold` | `pause-circle` | Kaynak / malzeme / karar bekleniyor. |
| `ISSUE_REWORK` | Sorun / rework | `--status-rework` | `wrench` | Uygunsuzluk veya yeniden işlem; **ikon şekli** birincil ayırt edici. |
| `CANCELLED` | İptal | `--status-cancel` | `x-circle` | İptal; takvime düşük opaklıkla gösterilir. |
| `SCRAP` | Hurda | `--status-scrap` | `trash-2` | Hurdaya ayrıldı; plan dışı ama kayıt tutulur. |

*İkon adları:* Lucide uyumlu isimlendirme (implementasyonda eşdeğer bırakılır).

### 2) Örnek kartlar — 8 satır

| itemId | statusKey | title |
|--------|-----------|-------|
| P-501 | `PLANNED` | DW-210 duvar paneli |
| P-502 | `ORDERED_DESIGN` | PR-22 perde segmenti |
| P-503 | `IN_PROGRESS` | K-60 kiriş |
| P-504 | `PRODUCED_OK` | PL-95 döşeme |
| P-505 | `HOLD_UNCERTAIN` | ÖZ-03 özel eleman |
| P-506 | `ISSUE_REWORK` | DW-211 duvar (rework) |
| P-507 | `CANCELLED` | PL-96 döşeme (iptal) |
| P-508 | `SCRAP` | K-61 kiriş hurda |

---

## 8) Tailwind (kısa notlar)

- Legend tetikleyici: `rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-800 shadow-[inset_2px_2px_4px_…]`
- Legend panel: `rounded-2xl bg-gray-100 p-3 shadow-[inset_4px_4px_8px_…] border border-gray-200/60`
- Swatch satırı: `flex gap-2 items-center border-l-4 border-l-[var(--status-planned)] pl-2`
- Kart birleşik: mevcut neumorphic gövde + **ek** `border-l-4` durum rengi (çift border dikkat: sol birleşik şerit tek katman)

---

*Kaynak prompt:* `plan-05-durum-renkleri-legend-erisim.md` · `status` anahtarları `plan-08` **PlanItem** ile uyumlu olacak şekilde adlandırıldı. · Görsel dil: `00b-NEOMORPHISM-TAILWIND.md` (mor yok; amber/turuncu kontrollü). · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `10-design-promts/prompts/00-ORTAK-BLOK.md`, `13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md`.
