# plan-07 — Çıktı: Toolbar, filtre, arama, taslak/yayın ve yetki

**Seçilen rol/yetki yaklaşımı:** Toolbar aksiyonları **taslak** durumuna göre `enabledWhenDraft` + role göre `visibleRoles[]` ile kontrol edilir. Izgara içi kritik işlemler (DnD, bırakma, yayın) yetkiyle kilitlenir.

**Seçilen P0 tasarım:** Fabrika seçici + arama + filtre popover + plan durumu (Taslak/Yayınlandı) + kayıt/yayın aksiyonları.

---

## 1) Bilgi mimarisi

- **Menü:** `Production / MES` → `Planlama — Tasarım`.
- **Toolbar konumu:** Izgara üstünde tek satır sticky (scroll ile kalır).
- **Yetki katmanı:** Aynı toolbar component’i role göre farklı aksiyonlar gösterir.

---

## 2) Toolbar wireframe (P0)

### Sol grup

1. **Fabrika seçici (mock)**
   - Alan: `Fabrika: [Istanbul Precast]` (dropdown)
   - Değişince “ızgara verileri yenileniyor (mock)” notu göster.
2. **Plan adı / dönem**
   - Örn. `Plan: 24–30 Mar 2026`

### Orta grup

1. **Arama**
   - Placeholder: `Ürün adı / emir no / proje ara...`
   - Arama scope (mock): `PlanItem title` + `orderId` + `projectId`
2. **Filtre popover**
   - Düğme: `Filtreler`
   - Popover içi inset well içinde çoklu filtre:
     - `moldId` (çoklu seçim)
     - `statusKey` (çoklu seçim)
     - `priority` (1-5)
     - `projectId` (mock proje)

### Sağ grup

1. **Plan durumu badge**
   - `Taslak` veya `Yayınlandı`
2. **Aksiyon butonları**
   - `Kaydet` (taslakta aktif)
   - `Yayınla` (yayın yetkisi olan rollerde ve taslaktan)
   - (opsiyonel) `CSV Export` (P2 wireframe)
3. **Son değişiklik (P1’e not)**
   - `Son değişiklik: Planlama tarafından 10:42` (mock)

---

## 3) Yetki modeli ve aksiyon kuralları (P0)

### Yetki roller (tek tip isimlendirme)
- `PLANLAMACI` (tam yetki)
- `URETIM_SEFI` (kısıtlı)
- `VARDIYA_AMIRI` (salt okuma / kısıtlı düzenleme)

### Plan yaşam döngüsü (mock)
- `draft`: düzenlenebilir
- `published`: değişiklikler kısıtlı (yalnızca onay akışları)

### Kritik aksiyonlar
- Izgara DnD (yerleştir/sürükle)
- Boş hücre atama
- `Yayınla`
- `Sil` (opsiyonel)

---

## 4) Rol matrisi (kısa tablo - standart çıktı 9)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| DnD ile yerleştir / taşı | ✓ | ✓ (onaylı mod: P1 noter) | ✓ (yalnızca kendi vardiyası) |
| Boş hücre atama | ✓ | ✓ | ✓ (kısıtlı) |
| Kaydet | ✓ | ✓ | ✗ |
| Yayınla | ✓ | ✓ (onay) | ✗ |
| Taslak / yayın durumu gör | ✓ | ✓ | ✓ |
| Taslak üzerinde silme | ✓ | onay | ✗ |

*(Bu tablo gerçek kural için özelleştirilebilir; P0 tasarım amaçlı.)*

---

## 5) Mock tablolar (zorunlu)

### 1) Toolbar aksiyonları (10 satır)

| action | visibleRoles[] | enabledWhenDraft | defaultState |
|--------|------------------|-------------------|---------------|
| `factoryChange` | [PLANLAMACI, URETIM_SEFI, VARDIYA_AMIRI] | true | enabled |
| `search` | [PLANLAMACI, URETIM_SEFI, VARDIYA_AMIRI] | true | enabled |
| `openFilters` | [PLANLAMACI, URETIM_SEFI, VARDIYA_AMIRI] | true | enabled |
| `clearFilters` | [PLANLAMACI, URETIM_SEFI] | true | disabled |
| `saveDraft` | [PLANLAMACI, URETIM_SEFI] | true | enabled (taslak) |
| `publishPlan` | [PLANLAMACI, URETIM_SEFI] | true | enabled (taslak) |
| `requestRevert` | [PLANLAMACI] | true | enabled |
| `exportCsv` | [PLANLAMACI, URETIM_SEFI, VARDIYA_AMIRI] | false | disabled (draft) / enabled (published) |
| `undoLast` | [PLANLAMACI] | true | disabled (yok) |
| `gridLockToggle` | [URETIM_SEFI] | false | enabled only in published |

### 2) Filtre state (örnek JSON şeması - metin)

```json
{
  "query": "DW-120",
  "filters": {
    "moldIds": ["M-01", "M-05"],
    "statusKeys": ["PLANNED", "IN_PROGRESS"],
    "priorities": [1, 2],
    "projectIds": ["PRJ-2026-014", "PRJ-2026-021"]
  },
  "ui": {
    "draftOnly": true,
    "showOnlyNonProductionAllowed": false
  }
}
```

---

## 6) P0 / P1 / P2 kapsamı

- **P0:** Toolbar bileşenleri (fabrika, arama, filtre popover), plan durumu badge, `Kaydet` ve `Yayınla` yetki kontrollü.
- **P1:** Son değişiklik özeti + Undo/redo veya tek adım geri al (tek buton).
- **P2:** CSV/Excel uyumlu dışa aktar görünümü (wireframe etiket + buton).

---

## 7) Tailwind kısa notlar

- Toolbar kabuğu:
  - `rounded-3xl bg-gray-100 p-3 md:p-4 shadow-[6px_6px_12px_rgb(163_163_163/0.35),-6px_-6px_12px_rgb(255_255_255/0.9)]`
- Filtre popover tetikleyici (protrude pill):
  - `rounded-full bg-gray-100 shadow-[...] border border-gray-200/60`
- Badge:
  - Taslak: `bg-gray-200/40 text-gray-900 border border-gray-300`
  - Yayınlandı: `bg-emerald-50/60 text-emerald-800 border border-emerald-200/60`
- Primary CTA:
  - `bg-gray-800 text-white rounded-xl hover:bg-gray-900`
- Secondary:
  - `rounded-xl bg-gray-100 border border-gray-200/70`

---

## 8) Boş / yükleme / hata

- **Loading:** toolbar tarafında skeleton; filtre popover yokken kapalı kalır.
- **Hata (yetki):** banner `text-red-700` ile “Bu aksiyon için yetkiniz yok” + secondary `Anasayfaya dön`.
- **Filtre sonucu 0:** grid alanında inset empty state: “Filtrene uygun kayıt yok. Filtreleri temizle.”

---

## 9) Üst / alt ekran geçişleri

- Toolbar `Yayınla` → “Yayınlandı” durumu ve grid kilidi (plan-06 ve plan-03 ile uyum).
- `exportCsv` → P2 modal/wizard (wireframe): “Hangi kolonlar? Tarih aralığı.”
- Filter değişimi → grid anlık güncellenir (mock: debounce 300ms).

---

## 10) UX soruları (5)

1. “Taslak” ve “Yayınlandı” badge renkleri sadece metinle mi yoksa ikonla da mı (durum renkleriyle uyumlu)?
2. Filtre popover açıkken grid scroll davranışı: popover kapanmadan scroll olur mu?
3. Arama boşken filtreler var mı yok mu öncelik sırası nasıl?
4. `Yayınla` tıklanınca hard validation mı, yoksa yayın öncesi sadece uyarı mı?
5. Üretim dışı gün politikasında (plan-06 Mod A) yetki olmayan role “onay modal” gösterilmeli mi?

---

## 11) Rol matrisi (plan-07 — tek tablo, tekrar netliği)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Fabrika seçici | ✓ | ✓ | ✓ |
| Arama / filtre | ✓ | ✓ | ✓ |
| Kaydet | ✓ | ✓ | ✗ |
| Yayınla | ✓ | ✓ (onay) | ✗ |
| Export (P2) | ✓ | ✓ | ✓ (görünüm) |
| Grid kilitle (P2) | ✗ | ✓ | ✗ |

---

*Kaynak prompt:* `plan-07-toolbar-filtre-kayit-yetki.md` · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `00-ORTAK-BLOK.md`, `00b-NEOMORPHISM-TAILWIND.md`, `00-ORTAK-BLOK-URETIM-UI.md`. 

