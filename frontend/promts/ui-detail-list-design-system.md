# Okan / Precast — detay & liste UI tasarım sistemi (AI prompt)

Bu dosya, yeni **modül sayfaları**, **müşteri / proje / teklif detayları** ve **gömülü (embedded) paneller** tasarlarken Cursor’a verilecek sabit referanstır. Kod yazdırırken bu kuralları açıkça isteyin: *“`frontend/promts/ui-detail-list-design-system.md` kurallarına uy.”*

---

## 1. Ürün vizyonu (kısa)

- Arayüz **ERP + mühendislik + satış** karışımı: yoğun veri, net hiyerarşi, az gürültü.
- **Teknik kullanıcı** (parça listesi, IFC, boyutlar) ↔ **ticari kullanıcı** (bütçe, sözleşme, faturalar, risk) aynı shell içinde farklı sekmelerle ayrılır; ticari tarafta **proje yönetimi “diğer proje” detay sayfasına zorunlu gitme** yoksa liste + sağ panel yeterlidir.

---

## 2. Sayfa kabuğu (shell)

1. **Dış sayfa** (`rounded-[1.25rem]`, `min-h-0 flex-1 flex-col gap-2 overflow-hidden`) — tam ekran modül kökü.
2. **Üst bölüm** (breadcrumb + isteğe bağlı H1): padding `px-[0.6875rem] py-1`; breadcrumb `text-xs`, `ChevronRight` ayırıcılar.
3. **H1 kuralı**: Başlıkta **yalnızca ana isim + “Detayı” / modül adı**; altında **şehir, kod, satışçı, durum rozeti, VIP etiketleri gibi ikinci meta satırı** genelde **ekleme** — bu bilgiler **Genel** sekmesinde veya sağ özet panelinde dursun. İstisna: kullanıcı özellikle “hero meta” isterse.
4. **Tek cam kart** (`rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 p-2.5`) — **sekme şeridi + sekme içeriği** bu kartın içinde. **İç içe ikinci “tam cam” kart** (aynı blur + border + rounded-2xl) **yapma**; gömülü liste/detay bileşenleri bu kartın zemininde **düz** (`relative flex h-full min-h-0 … gap-0`) kalsın.
5. **Sekmeler**: yatay scroll, `rounded-full border px-3 py-2 text-xs font-semibold`; aktif: `border-sky-300/70 bg-sky-100/70 … dark:bg-sky-900/35`.
6. **Sekme gövdesi scroll**:
   - Form / metin / grid sekmeleri: `min-h-0 flex-1 overflow-y-auto text-sm …`
   - **Split liste + detay**, gömülü teklif, doküman gezgini: `min-h-0 flex-1 flex flex-col overflow-hidden` (içeride kendi panelleri scroll alır).

---

## 3. Liste + detay (split) deseni

Referans bileşenler: `ProjectDetailPieceCodesPanel` (ürün listesi), `CustomerProjectsCommercialPanel` (CRM’de ticari proje listesi), `QuoteModuleView` (teklif; **embedded** modda dış kart yok).

### Yerleşim

- Kök: `ref={splitRef}` + `className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden gap-0"` (tam sayfa yükseklik gerekiyorsa proje detayında olduğu gibi `h-[calc(100vh-11.5rem)]` vb. eklenebilir; **gömülü sekmede** `h-full` + üst `min-h-0` zinciri yeterli).
- **Sol liste**: `okan-project-split-list okan-split-list-active-lift` + `flex h-full min-h-0 shrink-0 flex-col overflow-hidden p-3` + `style={{ width: \`calc(${splitRatio}% - 5px)\` }}`.
- **Ayraç**: `relative z-10 mx-1 hidden w-2 shrink-0 cursor-col-resize lg:flex` içinde `rounded-full border` buton; sürüklemede `splitRatio` 30–55% (veya ürün listesindeki aralık) clamp.
- **Sağ panel**: `okan-project-split-aside` + `flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 lg:pl-2`.

### Liste satırları

- Satır konteyner: `rounded-lg border border-slate-200/50 bg-white/50 dark:border-slate-700/50 dark:bg-slate-900/25`.
- Seçili: `okan-project-list-row--active bg-sky-500/10 dark:bg-sky-400/10`.
- Sol ikon: `size-8 shrink-0 rounded-lg bg-slate-100 … ring-1 ring-inset`.
- Kod: `font-mono font-semibold`; ikincil metin: `text-xs` / `text-[11px]`.
- İlerleme çubuğu: `h-1.5 rounded-full bg-slate-200/70` + dolgu `bg-sky-500/80`.

### Sağ detay sekmeleri

- Üst başlık alanı: ince `border-b border-slate-200/25 dark:border-white/10`.
- Sekmeler: küçük **pill** veya **segmented** kontrol; içerik `min-h-0 flex-1 overflow-y-auto`.
- **Ticari / CRM projeler**: `Özet`, `Bütçe & sözleşme`, `Faturalar`, `Riskler` gibi sekmeler mock metinle doldurulabilir; **navigate ile tam proje detayına** gitme zorunlu değilse **gitme**.

---

## 4. Gömülü modül (ör. CRM “Teklifler” sekmesi)

- `embedded` prop: breadcrumb ve modül kökündeki **ikinci cam kartı** kapat.
- `QuoteModuleView` pattern: dış `flex h-full min-h-0 flex-1 flex-col overflow-hidden`; split kökünde **border/blur yok**; state için `storageKeyPrefix` ile `sessionStorage` izin ver.
- Üstte **bilgilendirme bandı** (“Teklif özeti… Aşağıda tam liste…”) **istemedikçe ekleme** — liste ve filtreler yeterli.

---

## 5. Doküman / filtre çekmecesi

- Filtreler soldan sheet: `absolute inset-y-0 left-0 z-20 w-64 … -translate-x-[105%]` kapalı; açıkken `translate-x-0`.
- Liste `overflow-y-auto`, sayfalama veya “daha fazla” sentinel ürün listesindeki gibi olabilir.

---

## 6. Tipografi ve yoğunluk

- Üst başlıklar: `text-sm font-semibold` (liste başlığı), bölüm etiketleri: `text-xs font-semibold uppercase tracking-wide text-slate-500`.
- Tablolar: `rounded-xl border border-slate-200/40 bg-white/40` hücreler; mühendislik modunda daha sık veri yoğunluğu kabul edilir.

---

## 7. i18n ve mock

- Kullanıcıya görünen sabit Türkçe string’ler kısa süreli mock için kabul edilebilir; kalıcı metinler `useI18n` + `en.ts` / `tr.ts`.
- `crmCustomers`, `projectManagementCardsMock`, `allQuotes` gibi kaynaklar **id ile birleştirilir**; eksik kartta satır düşürülür veya “mock yok” mesajı.

---

## 8. Yeni sayfa isteği şablonu (kopyala-yapıştır)

Aşağıdaki bloğu doldurup gönderin:

```text
Yeni sayfa / sekme: [ad]
Rota veya giriş noktası: [ör. CRM müşteri detayı > X sekmesi]
Kullanıcı rolü: [teknik | ticari | ikisi]
Liste var mı: [evet/hayır] — varsa split oranı ve sütunlar: [...]
Detay sağ panel sekmeleri: [...]
Tam sayfa detaya link: [evet/hayır — hayırsa split içinde kal]
Özel filtreler / sessionStorage anahtarı: [...]
Referans: frontend/promts/ui-detail-list-design-system.md + [varsa dosya adı]
```

---

## 9. Kontrol listesi (PR öncesi)

- [ ] Sekme içeriği yüksekliği: dış zincirde `min-h-0` + `flex-1` + `overflow-hidden` doğru mu?
- [ ] Cam kart **tek kat** mı?
- [ ] Gömülü modda gereksiz breadcrumb / özet bandı yok mu?
- [ ] Liste seçimi klavye / `aria-current` uygun mu?
- [ ] `npm run build` temiz mi?
