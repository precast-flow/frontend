# Raporlama modülü — Prompt 13 çıktısı

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` — grafik yoğunluğunda **arka plan sade**; grafik alanları **inset** (kesik çerçeve + hafif gömülü gölge).

---

## Bilgi mimarisi

- **Menü:** Lojistik & Saha → **Raporlama** (`slug: raporlama`).
- **Breadcrumb:** Precast Flow / Raporlama (MainCanvas üst başlık).

---

## Sayfa bölümleri (üstten alta)

| Bölüm | Yüzey |
|--------|--------|
| Kayıtlı görünümler | Küçük **protrude** chip butonları |
| Sol: rapor kataloğu | **Protrude** kart; kategoriler arası **inset** ayırıcı çizgi; rapor satırları seçili değil **inset**, seçili **protrude** + koyu ring |
| Sağ üst: parametreler | **Inset well**; tarih alanları inset |
| Çalıştır | **Primary protrude** (`bg-gray-800`) |
| Sonuç kartı | **Protrude** dış kabı |
| Grafikler | Üç **inset** placeholder (kesik border, gri blok) |
| Tablo | **Inset** kab (`shadow-neo-in`); zebra hafif |
| Dışa aktar | **Secondary protrude** (CSV / PDF metin) |
| Drill-down | Sağ **protrude** drawer (CrmExtraDrawer ile aynı desen) |

---

## Bileşen listesi

Card, Table, Drawer, Button (primary/secondary), chip, date input, catalog list.

---

## Tailwind özeti (ana parçalar)

| Bileşen | Özet |
|--------|------|
| Katalog kartı | `rounded-2xl bg-gray-100 p-4 shadow-neo-out-sm ring-1 ring-gray-200/80` |
| Kategori ayırıcı | `h-px bg-gray-200 shadow-neo-in` |
| Rapor satırı (pasif) | `rounded-xl shadow-neo-in bg-gray-100/80` |
| Rapor satırı (aktif) | `shadow-neo-out-sm ring-2 ring-gray-800` |
| Parametre well | `rounded-2xl shadow-neo-in p-4` |
| Grafik placeholder | `rounded-xl border-dashed border-gray-400/70 shadow-neo-in` |
| Tablo kabı | `rounded-2xl shadow-neo-in overflow-hidden` |
| Favori chip | `rounded-xl shadow-neo-out-sm px-3 py-2 text-xs font-semibold` |
| Drawer panel | `rounded-l-3xl md:rounded-3xl bg-gray-100 shadow-neo-out` |

---

## Boş / yükleme / hata

- **Çalıştır öncesi:** `ran === false` iken kısa metin: parametre + Çalıştır.
- Bu prototipte varsayılan `ran: true`; favori / rapor seçimi sonucu güncellenir.

---

## Üst / alt geçişler

- Drawer dışına tıklama veya X ile kapanır.
- Kayıtlı görünüm chip’i raporu seçer ve sonucu gösterir.

---

## UX soruları

1. Planlı raporlar zamanlanmış e-posta ile mi, yoksa sadece uygulama içi mi?
2. CSV ve PDF için aynı kolon seti mi, yoksa PDF’de özet + logo şablonu mu?
3. Drill-down derinliği sabit mi (satır → detay), yoksa çok katmanlı explorer mı?
4. Kayıtlı görünümler kullanıcı / rol bazlı mı paylaşılır?
5. Büyük veri setinde sayfalama mı, sanal liste mi, sunucu tarafı cursor mu?

---

## Kod

- `app/src/components/raporlama/ReportingModuleView.tsx`
- `app/src/data/reportingMock.ts`
