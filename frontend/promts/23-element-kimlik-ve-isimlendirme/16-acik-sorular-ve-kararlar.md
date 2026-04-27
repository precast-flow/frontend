# 16 — Açık Sorular ve Karar Bekleyen Konular

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Bu paket boyunca ortaya çıkan ve KARAR bekleyen konuların merkezi listesi.
Kararlar kullanıcı/tasarım ekibi tarafından onaylandıktan sonra ilgili prompt dosyalarına
yansıtılır. Bu dosya canlı bir karar kütüğü olarak tutulmalı; her madde için öneri +
etkilenen dosyalar + karar alanı ayrıdır.
```

---

## Karar Maddeleri

### 1. Çift T isimlendirme geleneği (US vs EU)
- **Konu:** `slab-dt` için SIZE token'ı US PCI formatı (`12DT28`) mı yoksa EU metric formatı (`DT-3000-700`) mı default olsun?
- **Öneri:** FirmProfile.unitSystem'dan türet: metric firma → `dt_eu_format`; imperial firma → `dt_us_format`; firma override ile manuel seçim.
- **Etkilenen dosya:** `05-master-liste-doseme.md`, `08-tanimlayici-boyut-formatlari.md`, `09-firma-override-veri-modeli.md`
- **Karar:** [ ] EU default, [ ] US default, [ ] unitSystem'e göre otomatik (öneri)

---

### 2. Guseli kolon (col-crb) — ayrı tipoloji mi, kolonun attribute'u mu?
- **Konu:** Guse (corbel) kolonun ayrılmaz parçası ise kolonun attribute'larına yazılır, bağımsız
  eleman sayılmaz. Ama bazı firmalar guseyi ayrı üretim parçası olarak görüyor.
- **Öneri:** İki ayrı model:
  - `col-crb`: guseli kolon tipolojisi (guse kolonun içinde; tek prefabrik parça)
  - `corbel-rect`, `corbel-tpr`: bağımsız konsol elemanı (kolona sonradan monte)
- **Etkilenen dosya:** `03-master-liste-kolon.md`, `07-master-liste-merdiven-konsol-makas.md`
- **Karar:** [x] İki ayrı tip (öneri — şimdilik plan bu; onay gerekir)

---

### 3. Size separator (ayraç) — tire mi bitişik mi?
- **Konu:** Instance mark'taki token ayracı ("-") sektörde farklılık gösterir. "KL-500-001" vs "KL500.001" vs "KL_500_001".
- **Öneri:** Varsayılan `-`; template'te firma seçer; filesystem-safe kontrol yap.
- **Etkilenen dosya:** `10-isimlendirme-template-motoru.md`, `12-ui-template-builder-ekrani.md`
- **Karar:** [ ] `-` default + override serbest, [ ] firma zorunlu seçsin

---

### 4. Makas IFC eşlemesi — IfcBeam mi IfcMember mi?
- **Konu:** Çatı makası tek parça bütünsel olabilir (IfcBeam) veya birleşik yapısal member (IfcMember).
- **Öneri:** Tek parça prefabrik makas → IfcBeam + USERDEFINED + ObjectType='RoofTruss'. Kafes makas (lattice truss) ileride farklı tip olarak değerlendirilir.
- **Etkilenen dosya:** `07-master-liste-merdiven-konsol-makas.md`, `13-ifc-import-mapping.md`
- **Karar:** [x] IfcBeam/USERDEFINED (öneri)

---

### 5. Birim sistemi — metrik zorunlu mu, imperial opsiyonel mi?
- **Konu:** Mevcut PieceMarkTemplate.header imperial alanlar içeriyor (lengthFt, widthIn, depthFrac).
  Yeni sistem mm-tabanlı iç veri ama UI imperial gösterebilmeli.
- **Öneri:** İç veri mm; UI'da FirmProfile.unitSystem'a göre metric/imperial render; SizeFormat seviyesinde dönüşüm.
- **Etkilenen dosya:** `08-tanimlayici-boyut-formatlari.md`, `15-mevcut-kod-entegrasyon-plani.md`
- **Karar:** [x] mm iç, UI'da seçim (öneri)

---

### 6. Sequence scope — type+size mi sadece type mi?
- **Konu:** Aynı proje içinde KL elemanları tek sayaçla (A=type only) mı yoksa her boyut için ayrı (B=type+size) sayaçla mı numaralandırılsın?
  - A: KL-001, KL-002, ..., KL-050 (boyut karışık)
  - B: KL-500-001, KL-500-002 (ayrı), KL-600-001 (yeni sayaç)
- **Öneri:** Default A (tip only); firma B'yi tercih ederse template'te seçer.
- **Etkilenen dosya:** `10-isimlendirme-template-motoru.md`, `02-sistem-katalog-veri-modeli.md` (ProjectSequenceCounter)
- **Karar:** [ ] A default, [ ] B default, [ ] her iki opsiyon (firma seçer — öneri)

---

### 7. Firma profili çoklu mu tekli mi?
- **Konu:** Aynı firmanın farklı müşterilerine farklı isim konvansiyonu uygulama ihtiyacı olabilir.
  (Tek firma kullanıcısı X müşteri için "COL-", Y müşteri için "KL-" kullanmak istiyor.)
- **Öneri:** Bir firma altında birden fazla FirmNamingTemplate olsun; proje seviyesinde hangi template'in kullanılacağı seçilsin. FirmCodeOverride firma-level sabit; template sadece ayraç/token seviyesinde değişebilir.
- **Etkilenen dosya:** `09-firma-override-veri-modeli.md`, `10-isimlendirme-template-motoru.md`, `11-ui-firma-ayarlari-ekrani.md`
- **Karar:** [x] Çoklu template tek firma altında (öneri)

---

### 8. Katalog güncelleme — sistem default kodları değişirse override'lar ne olur?
- **Konu:** Sistem "KL" default kodunu "K" yapsın derse, ACME firma override'ı "COL" aynı
  kalır mı? Evet. Ama default kullanan firma (XY) yeni "K" kodunu görür.
- **Öneri:** Override explicit; system default değişimi override'ları etkilemez.
  UI'da "Varsayılan artık K; override 'COL' aktif (değişiklik yok)" bilgisi gösterilebilir.
- **Etkilenen dosya:** `09-firma-override-veri-modeli.md`, `11-ui-firma-ayarlari-ekrani.md`
- **Karar:** [x] Override'lar etkilenmez (öneri)

---

### 9. Katman 4 — Altyapı tipleri sonraki fazda
- **Konu:** Bu paket sadece üst yapıyı kapsıyor. Altyapı (menfez, boru, bordür, sürekli temel, kazık, başlık) için ayrı faz.
- **Öneri:** Faz 2 paketi: `frontend/promts/24-alt-yapi-kimlik-sistemi/`; sistem veri modeli aynı, sadece katalog genişlemesi.
- **Etkilenen dosya:** README.md, tüm master listeler (kapsam beyanı)
- **Karar:** [x] Faz 2'ye ertele (onaylandı — plan başlangıcında bu karar verildi)

---

### 10. Endüstriyel ve mimari özel elemanlar
- **Konu:** Silo paneli, rafine gazı duvarı, çekincesiz kolon süsleri gibi özel tipler kapsam dışı mı kalsın?
- **Öneri:** Faz 3 paketi; sistem modeli aynı; sadece extensible catalog mantığı.
- **Etkilenen dosya:** README.md
- **Karar:** [ ] Faz 3'e ertele, [ ] Phase 1 sonuna eklenebilir

---

### 11. Detay varyant ayırıcısı (kaldırıldı mı, kalıyor mu)?
- **Konu:** Önceki iterasyonda "KL-500-A-01" / "KL-500-B-01" gibi detay varyant harfi önerilmişti. Kullanıcı "sequence yeter" dedi.
- **Öneri:** VARIANT_CODE token'ı kalır (opsiyonel; col-crb için 'LEFT'/'RIGHT' guse yönü gibi). Detay varyant harfleri otomatik üretim OFF; sequence benzersizliği sağlar.
- **Etkilenen dosya:** `01-analiz-uc-katmanli-mimari.md`, `10-isimlendirme-template-motoru.md`
- **Karar:** [x] Detay varyant kaldırıldı; VARIANT_CODE opsiyonel kaldı (onaylandı)

---

### 12. Instance mark revision davranışı
- **Konu:** Revizyon artınca instance mark nasıl değişir?
  - (a) "KL-500-001-R0" → "KL-500-001-R1" (sadece revision değişir)
  - (b) "KL-500-001" → "KL-500-002" (yeni sequence alır, eski pasif)
- **Öneri:** (a) Mark sabit; revision suffix değişir. Eski revizyonlar ProjectElementRevision tarihçesinde.
- **Etkilenen dosya:** `10-isimlendirme-template-motoru.md`, `02-sistem-katalog-veri-modeli.md`
- **Karar:** [x] (a) Mark sabit, revision suffix (öneri)

---

### 13. Duplicate GUID handling
- **Konu:** Aynı IFC GUID'li eleman iki kez import edilmeye çalışılırsa ne olur?
- **Öneri:** Wizard Step 3'te kullanıcıya radio seçim: (1) atla (2) üzerine yaz (3) revizyon ekle.
- **Etkilenen dosya:** `14-ui-ifc-import-sihirbazi.md`, `13-ifc-import-mapping.md`
- **Karar:** [x] Kullanıcıya sor; default "atla" (öneri)

---

### 14. Mimari kolon (col-arc) — Phase 1'e dahil mi?
- **Konu:** Dekoratif mimari kolon tipi çoğu sektör için nadir. Phase 1'e gerek yok olabilir.
- **Öneri:** Phase 1'e dahil et ama "low priority" flag'i ile; UI'da son sırada gösterilir.
- **Etkilenen dosya:** `03-master-liste-kolon.md`
- **Karar:** [ ] Dahil, [ ] Faz 2'ye ertele

---

### 15. Rampa (ADA / otopark rampası) — Phase 1'e dahil mi?
- **Konu:** Erişim rampası, otopark rampası prefabrik üretilir. Merdiven ailesinin bir parçası mı, ayrı tip mi?
- **Öneri:** Ayrı tip: `ramp` (id: 'ramp'); 2 tipoloji (`ramp-str`, `ramp-l`). Phase 1'de eklenmezse Phase 2'de kolayca eklenir.
- **Etkilenen dosya:** `07-master-liste-merdiven-konsol-makas.md`
- **Karar:** [ ] Dahil et, [ ] Faz 2'ye ertele

---

### 16. Öngerilmeli (prestressed) kiriş — ayrı tipoloji mi attribute mi?
- **Konu:** "PT-T kiriş" (öngerilmeli T kiriş) sektörde farklı ürün olarak pazarlanıyor.
  Tipoloji mi attribute mi?
- **Öneri:** Attribute: `attributes.prestressing: 'none' | 'pretensioned' | 'post-tensioned'`. Tipoloji aynı (beam-t), üretim tekniği attribute.
- **Etkilenen dosya:** `04-master-liste-kiris.md`
- **Karar:** [x] Attribute (öneri); ayrı tipoloji değil

---

### 17. Waffle slab (çift yönlü nervürlü) — ayrı tipoloji mi?
- **Konu:** Nervürlü döşeme tek yönlü (slab-rib). Çift yönlü (waffle) ayrı kalıp; ayrı tip mi?
- **Öneri:** Phase 2'ye bırak. Şimdilik slab-rib tek yönlü varsayılır; waffle gerektiğinde eklenir.
- **Etkilenen dosya:** `05-master-liste-doseme.md`
- **Karar:** [ ] Dahil et, [x] Faz 2'ye ertele (öneri)

---

### 18. Instance mark uppercase enforcement
- **Konu:** Filesystem-safe için tüm instance mark UPPERCASE mi olsun? Sektör genelde uppercase ama bazı firmalar küçük harf tercih edebilir.
- **Öneri:** Template seviyesinde `uppercaseEnforce` bayrağı (default true); firma kapatabilir.
- **Etkilenen dosya:** `10-isimlendirme-template-motoru.md`, `12-ui-template-builder-ekrani.md`
- **Karar:** [x] Default uppercase on, firma kapatabilir (öneri)

---

### 19. Legacy migration — kullanıcı tetiklemeli mi otomatik mi?
- **Konu:** parametric3d SavedDesign v1 → v2 migration ne zaman çalışır?
- **Öneri:** Uygulamalar açılışında otomatik; ilk 7 gün v1 key saklanır (rollback için); UI'da "Eski veri tespit edildi, migrate edildi" toast.
- **Etkilenen dosya:** `15-mevcut-kod-entegrasyon-plani.md`
- **Karar:** [x] Otomatik + rollback window (öneri)

---

### 20. Backend gerekli mi?
- **Konu:** Firma override, naming template, proje element sayıları büyüyebilir; localStorage yeterli mi?
- **Öneri:** Phase 1: localStorage (mock persistence). Phase 2: Supabase veya Prisma + REST; mevcut frontend-only proje disiplinini korurken hazırlık yap.
- **Etkilenen dosya:** `02-sistem-katalog-veri-modeli.md`, `15-mevcut-kod-entegrasyon-plani.md`
- **Karar:** [ ] Phase 1'de sadece localStorage, [x] Faz 2'de backend değerlendir (öneri)

---

### 21. Sandviç panel çekirdek malzeme katalogu
- **Konu:** PU, EPS, XPS, mineral yün yalıtım çekirdeği tipleri için ayrı katalog mu, enum mu?
- **Öneri:** MVP: basit enum (attributes.coreType: 'PU' | 'EPS' | 'XPS' | 'MineralWool' | 'Other').
  Phase 2: ayrı MaterialCatalog (lambda değeri, R-değeri, fiyat entegrasyonu).
- **Etkilenen dosya:** `06-master-liste-duvar-panel.md`
- **Karar:** [x] Phase 1 enum, Phase 2 katalog (öneri)

---

### 22. Template uppercase ile token prefix/suffix etkileşimi
- **Konu:** Token prefix "v-" lowercase ise uppercase enforce ne yapar? "V-" yapar mı?
- **Öneri:** Uppercase enforce tüm string'e uygulanır (token value + prefix + suffix birlikte).
- **Etkilenen dosya:** `10-isimlendirme-template-motoru.md`
- **Karar:** [x] Hepsini uppercase (öneri)

---

### 23. Proje silinirse sequence counter ne olur?
- **Konu:** Proje silindi; o projedeki sequence counter'lar orphan kalır.
- **Öneri:** Cascade delete; ProjectSequenceCounter.projectId FK ile soft delete.
- **Etkilenen dosya:** `02-sistem-katalog-veri-modeli.md`
- **Karar:** [x] Cascade delete (öneri)

---

### 24. Çok katlı kolon (multi-story column) — ayrı tipoloji mi?
- **Konu:** 30m kolon çok katlı bina için tek parça olabilir; tipoloji mi attribute mi?
- **Öneri:** Height'a göre tip zorunlu değil; attributes.multiStory: boolean + attributes.storyCount.
- **Etkilenen dosya:** `03-master-liste-kolon.md`
- **Karar:** [x] Attribute (öneri)

---

## Özet Karar Panosu

| # | Konu | Önerilen Karar | Durum |
|---|------|----------------|-------|
| 1 | Çift T format | unitSystem'a göre oto | Onay bekliyor |
| 2 | Guseli kolon | İki tip (crb + corbel) | Onay bekliyor |
| 3 | Size separator | `-` default + override | Onay bekliyor |
| 4 | Makas IFC | IfcBeam/USERDEFINED | Onay bekliyor |
| 5 | Birim | mm iç, UI seçim | Onay bekliyor |
| 6 | Sequence scope | A default (type only) | Onay bekliyor |
| 7 | Çoklu template | Evet, firma altında | Onay bekliyor |
| 8 | Catalog güncelleme | Override'lar bozulmaz | Onay bekliyor |
| 9 | Altyapı | Faz 2 | Onaylı |
| 10 | Endüstriyel | Faz 3 | Onay bekliyor |
| 11 | Detay varyant | Kaldırıldı | Onaylı |
| 12 | Revision | Mark sabit, suffix değişir | Onay bekliyor |
| 13 | Duplicate GUID | Kullanıcıya sor | Onay bekliyor |
| 14 | Mimari kolon | Phase 1 opsiyonel | Onay bekliyor |
| 15 | Rampa | Faz 2 | Onay bekliyor |
| 16 | Öngerilmeli kiriş | Attribute | Onay bekliyor |
| 17 | Waffle slab | Faz 2 | Onay bekliyor |
| 18 | Uppercase | Default on, firma kapat | Onay bekliyor |
| 19 | Migration | Otomatik + rollback | Onay bekliyor |
| 20 | Backend | Phase 1 mock, Faz 2 | Onay bekliyor |
| 21 | Yalıtım malzeme | Phase 1 enum | Onay bekliyor |
| 22 | Uppercase + prefix | Hepsi uppercase | Onay bekliyor |
| 23 | Proje silme | Cascade | Onay bekliyor |
| 24 | Multi-story kolon | Attribute | Onay bekliyor |

Toplam: **24 karar maddesi** — paket teslim kriterinde "en az 20 madde" hedefi karşılanmıştır.
