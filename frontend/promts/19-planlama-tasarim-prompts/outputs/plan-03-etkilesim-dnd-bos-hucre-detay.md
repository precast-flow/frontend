# plan-03 — Çıktı: DnD, boş hücre atama, ürün detay drawer

**Drop kuralı (P0 — tek seçim, tutarlı):** Üretim olmayan güne bırakınca **anında engelleme yok**; bırakma anında **onay modal** açılır (“Üretim dışı güne yerleştir — devam?”). İptal → öğe **orijinal konuma snap-back**; onay → yerleşim uygulanır + `warnings[]` içine “non-production day” mock metni eklenebilir. *(Alternatif “sert engel” ürün politikasında plan-07 ile değiştirilebilir.)*

**Zaman alanları (plan-08 ile uyum):** Drawer ve formlar **`startAt` / `endAt`** + türetilmiş **`durationHours`** gösterir; ızgarada hizalama için sunucu/mock ayrıca `anchorDayId` + `startShiftIndex` tutabilir — UI’da bu ikisi **salt okunur özet** satırı olarak gösterilir.

---

## 1) Bilgi mimarisi

- **Menü:** Production / MES → **Planlama — Tasarım**.
- **Ana yüzey:** Izgara + (isteğe bağlı) **Bekleyen iş havuzu** paneli.
- **Detay:** Sağ **Drawer** (`fixed` / `slide-in`), overlay ile grid dim.

---

## 2) Etkileşim akışları (madde madde)

### A) Sürükle-bırak (P0)

1. Kullanıcı span kartına **pointer down** → kart hafif **scale-95** + **gölge artışı** (sürükleme ghost).
2. **Drag over** geçerli hedef hücrede → hücre **inset highlight** (hedef track); geçersizde (salt okunur modda tümü) highlight yok.
3. **Drop** geçerli `(moldId, gün, vardiya)` hücresine → `startAt`/`endAt` yeni köşeye göre kayar; **optimistic** yerleşim (plan-08 P1 ile uyumlu: hata → geri + toast).
4. Drop **üretim dışı gün** hücresine → **onay modal**; iptal = snap-back, onay = kayıt.
5. Drop sırasında **çakışma/kapasite** (plan-02) → kart **sarı/kırmızı ring** korunur; modal zorunlu değil (uyarı ile devam), **kilitle/yayın** akışında blok (plan-07 ile hizalanır — not).

### B) Boş hücre — tıklayarak atama (P0)

1. Boş hücre **tek tık** → **inset** “hedef seçildi” durumu + küçük **popover** veya **alt şerit sheet**: “Buraya ata”.
2. Akış **(a)** Havuzdan seç: bekleyen iş listesinden satır seç → **Onayla** → yeni `PlanItem` veya mevcut kuyruk öğesinin bağlanması (mock).
3. Akış **(b)** Yeni öğe: kısa form — **ürün** (`productId`), **miktar/hacim** (`estimatedVolumeM3`, isteğe bağlı `estimatedSteelKg`), **süre** (`durationHours` veya `endAt`), **öncelik** (`priority`), **beton** (`concreteRecipeId` mock liste) → **Oluştur ve yerleştir**.
4. Üretim dışı güne tıklama → aynı popover açılır; **Oluştur** son adımda **onay modal** (DnD ile aynı kural).

### C) Öğe detayı — drawer (P0)

1. Span kartına **çift tık** *veya* **tek tık** (tercih: **tek tık** = drawer; DnD ile çakışmayı önlemek için **drag handle** veya **200ms gecikmeli** click — aşağıda netleştirildi).
2. Drawer sağdan **slide**; arka plan `bg-black/20`.
3. Üst: **görsel** (`imageUrl` veya placeholder); alt: **PlanItem** alanları **plan-08 şeması ile birebir** (aşağıdaki tablo).
4. **Esc** → drawer kapanır (P1 resmi; P0’da da önerilir).
5. Salt okunur: alanlar `readOnly` görünümü; düzenle butonları gizli.

### D) Salt okunur rol (P0)

1. Toolbar’da **ince şerit**: “Salt okunur”.
2. Kartlar **opacity-90**; pointer ile sürükleme **devre dışı** (`draggable=false`).
3. Boş hücre tıklaması **çalışmaz** veya toast: “Bu rolde atama yapılamaz.”

### E) Klavye (P1)

1. **Esc:** drawer kapat.
2. **Enter:** odaklanmış öğede detay aç (grid’de roving tabindex veya liste modu gerekir — not).

### F) Touch (P2)

1. Kart **⋯** menüsü → **Taşı** → hedef seçici (modal: kalıp + gün + vardiya listeleri) → Uygula.

---

## 3) Wireframe notları

```
[Havuz — opsiyonel sol/sağ]
┌─────────────────────────────────────────────────────────────┐
│ Toolbar …                                    [Salt okunur?] │
├──────────┬──────────────────────────────────────────────────┤
│ Bekleyen │  [ Gün1 / V1 V2 V3 ] [ Gün2 / V1 V2 V3 ]  →scroll  │
│ iş (8)   ├──────────────────────────────────────────────────┤
│ ┌──────┐ │  Kalıp M-01  │ [inset empty] [span card] …        │
│ │ card │ │  Kalıp M-02  │ …                                   │
│ └──────┘ │  …           │                                     │
└──────────┴──────────────────────────────────────────────────┘
```

- **Tıklama vs sürükle:** Öneri — kartta sol **drag handle** (⋮⋮) sadece handle’dan DnD; kart gövdesi **tek tık = drawer**. Alternatif: tüm kart sürüklenebilir + **sağ üst info ikonu** ile drawer (daha az keşfedilir).
- **Boş hücre:** İç metin `text-gray-400 text-xs` “Tıkla — ata”; drag-over’da **inset** + ince `ring-1 ring-gray-400`.
- **Drawer:** `w-full max-w-md` (mobilde full width), **protrude** dış kabuk, iç bölümler **inset well** ile gruplu (Genel / Beton / Kalıp / Lojistik / Uyarılar).

---

## 4) P0 / P1 / P2

| Kademe | Kapsam |
|--------|--------|
| **P0** | DnD + hedef highlight; üretim dışı gün → **onay modal**; boş hücre → havuz veya yeni öğe akışı; drawer PlanItem alanları; salt okunur kapatma |
| **P1** | Çoklu seçim + toplu taşıma; Esc/Enter klavye |
| **P2** | Touch: Taşı + hedef seçici |

---

## 5) Tailwind (kısa notlar)

- Drag ghost: `opacity-90 scale-[0.98] shadow-[6px_6px_14px_rgb(163_163_163/0.45),…] cursor-grabbing`
- Drop hedef (geçerli): `shadow-[inset_3px_3px_6px_…] ring-1 ring-gray-400/60 bg-gray-50/90`
- Drawer panel: `rounded-l-3xl bg-gray-100 shadow-[6px_0_24px_rgb(0_0_0/0.08)] border-l border-gray-200/80`
- Drawer iç well: `rounded-2xl bg-gray-100 shadow-[inset_4px_4px_8px_…] p-4`
- Salt okunur overlay şerit: `bg-gray-200/40 text-gray-700 text-sm px-3 py-1 rounded-full`
- Modal (onay): protrude kart + `rounded-2xl bg-gray-100 p-5`; primary `bg-gray-800 text-white rounded-xl`

---

## 6) Boş / yükleme / hata

- **Boş hücre:** “Tıkla — ata”; salt okunurda gri metin + tıklanamaz.
- **Yükleme:** havuz ve grid iskelet (plan-08).
- **Hata:** üst banner + drawer’da ilgili alan altında `text-red-700` (plan-08).

---

## 7) UX soruları (5)

1. **Tek tık = drawer** ile **sürükle** ayrımı için **drag handle** kabul edilir mi, yoksa “uzun bas = sürükle” tercih edilir mi?
2. Boş hücrede **(a) havuz** ve **(b) yeni öğe** aynı popover’da mı, iki sekmeli mi?
3. Üretim dışı güne yerleştirme **hiç** istenmiyorsa politika **sert engel**e mi döner (şu an modal)?
4. Toplu taşımada çakışma **ilk engel** mi, yoksa taşındıktan sonra **toplu uyarı listesi** mi?
5. Drawer’da **düzenle** (P1+) aynı panelde mi, yoksa “ERP emrine git” ayrı sayfa mı?

---

## 8) Rol matrisi (plan-03)

| Aksiyon | Planlama | Üretim şefi | Vardiya amiri |
|--------|----------|-------------|----------------|
| Sürükle-bırak | ✓ | ✓ | ✓ (politikaya göre kısıtlı) |
| Boş hücreden atama | ✓ | ✓ | ✓ (kendi hatı) |
| Üretim dışı gün — onay modal | ✓ | ✓ | onay veya ✗ |
| Detay drawer görüntüle | ✓ | ✓ | ✓ |
| Drawer’da alan düzenle (ileride) | ✓ | ✓ | kısıtlı |
| Salt okunur mod | ✓ | ✓ | ✓ |

---

## Mock tablolar (zorunlu)

### 1) Bekleyen iş havuzu — 8 satır

| queueId | title | priority | risk |
|---------|-------|----------|------|
| Q-001 | DW-210 duvar paneli — hat A | 2 | düşük |
| Q-002 | PR-15 perde — öncelikli | 1 | yüksek |
| Q-003 | K-55 kiriş seti | 3 | orta |
| Q-004 | PL-88 döşeme — müşteri X | 2 | düşük |
| Q-005 | ÖZ-12 özel eleman | 4 | yüksek |
| Q-006 | DW-211 duvar — revizyon | 2 | orta |
| Q-007 | D-40 döşeme tipi B | 3 | düşük |
| Q-008 | PR-16 perde — çelik yoğun | 1 | yüksek |

### 2) Drawer alanları — PlanItem (plan-08) ile birebir

`field` sütunu **API/mock anahtarı**; `group` UI bölümü.

| field | value (örnek) | group |
|-------|----------------|-------|
| `id` | `plan-item-42a` | Genel |
| `title` | DW-120 duvar paneli | Genel |
| `productId` | PROD-DW-120 | Genel |
| `imageUrl` | `https://cdn.mock/precast/dw-120.svg` veya *boş* | Genel |
| `projectId` | PRJ-2026-014 | Genel |
| `orderId` | SO-88421 | Genel |
| `status` | planned | Genel |
| `priority` | 2 | Genel |
| `tags` | `["vibration","QC-A"]` | Genel |
| `startAt` | 2026-03-24T06:00:00Z | Zaman |
| `endAt` | 2026-03-24T14:00:00Z | Zaman |
| `durationHours` | 8 | Zaman |
| `anchorDayId` | day-2026-03-24 | Zaman |
| `startShiftIndex` | 0 | Zaman |
| `moldId` | M-01 | Kalıp |
| `concreteRecipeId` | RC-C30-01 | Beton |
| `estimatedVolumeM3` | 12.4 | Beton |
| `estimatedSteelKg` | 840 | Beton |
| `warnings` | `["Kalıp çakışması (mock)"]` | Uyarılar |

*Not:* `anchorDayId` / `startShiftIndex` plan-08’de “bir yaklaşım” ile tutarlı; UI **Zaman** grubunda salt okunur özet olarak kalabilir.

---

*Kaynak prompt:* `plan-03-etkilesim-dnd-bos-hucre-detay.md` · Şema hizası: `plan-08-mock-veri-sema-kenar-durumlari.md` (**PlanItem**). · Ortak bloklar: `00-ORTAK-BLOK-PLANLAMA-TASARIM.md`, `10-design-promts/prompts/00-ORTAK-BLOK.md`, `00b-NEOMORPHISM-TAILWIND.md`, `13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md`.
