# plan-09 — Düzeltme ve iyileştirmeler (zoom, DnD, yeniden boyutlandırma, özet, kart yoğunluğu)

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

ÖN KOŞUL: `plan-01` … `plan-08` ile tanımlanan planlama ekranı **zaten vardır**. Bu prompt, prototip / ilk uygulamada görülen **eksikleri ve hataları** giderir; `plan-06` (zoom aralığı), `plan-03` (etkileşim), `plan-04` (günlük özet) maddelerini **genişleterek günceller** (çelişki halinde **plan-09** önceliklidir).

---

## 🔍 Konu tanımı
Planlama–tasarım yüzeyinde: (1) **çok az gün** görünüyor ve **zoom etkisi zayıf**; (2) sol **bekleyen iş** listesinden atama **yalnızca tıklama** ile mümkün — **sürükle-bırak** da olmalı; (3) plandaki atanmış işler **yatay uzatılarak** süre/ kapsam büyütülmeli; (4) **aynı kalıp hücresine** iki iş **aynı anda** düşmediği / sürüklenmediği **bozukluk** giderilmeli; (5) **gün özeti** çok yüzeysel — **daha detaylı** olmalı ve güne tıklanınca **yan panelde** o güne ait kırılımlı özet; (6) ızgara **kartlarında** süre (ör. “32 saat”) ve **öncelik** metinleri **kalabalık** — kartta **sadeleştirme**; (7) **vardiya** (Sabah / Öğle / Gece vb.) **sütunları dar** — etiketler **okunmuyor**; yatay alan **genişletilmeli**.

## 🎯 Amaç
Planlayıcı tek ekranda daha uzun ufku görsün; bekleyen işi hem **tıklayıp** hem **sürükleyerek** atabilsin; plandaki blokları **resize** ile süreyi ayarlasın; aynı kalıpta **çoklu iş** kuralları net ve hatasız çalışsın; günlük performansı **özet + detay diyalog** ile inceleyebilsin; kartlar **tek bakışta isim** verirken ağır metrikler **drawer/tooltip**’te kalsın.

---

## 🧱 Yapısal analiz ve davranış kuralları

### A) Zoom ve görünür gün sayısı (plan-06 iyileştirmesi)

**Sorun:** Zoom aralığı dar veya adımlar küçük etki yaratıyor; yatay scroll’da **çok az gün** sığdığı hissi var.

**P0**
- **Zoom ölçeğini genişlet:** “Uzak” uçta hedef: aynı anda **en az ~14–21 iş günü** (mock cihaz genişliğinde) okunabilir şekilde görülebilmeli; üst sınır **~60–90 takvim günü** (veya eşdeğer kompakt sütun) — mevcut “~45 gün” alt sınırını **aşan** bir **compact** mod.
- **İki eksenli zoom (öneri):**  
  - **Sütun genişliği** (gün/vardiya hücresi minimum px).  
  - **Tipografi ölçeği** (başlık vs. kart metni) — zoom düşerken önce ikincil metin küçülsün, **birincil başlıklar** okunaklı kalsın.
- **Zoom presetleri:** Toolbar’da en az 4 kademe: “Yakın / Standart / Geniş / Çok geniş (ay görünümü)”; her preset için **tahmini görünür gün sayısı** tooltip’te yazsın.
- **Ctrl + scroll** hassasiyeti: adım boyutunu artır (ör. mevcut davranışın **2–3×** etkili olması); isteğe bağlı **Shift** ile ince ayar.
- **Minimum hücre genişliği:** zoom “çok uzak” modda bile **vardiya etiketi** için ayrılmış **minimum genişlik** korunsun (B maddesi ile birlikte).

**P1**
- Zoom seviyesini **URL query** veya kullanıcı tercihi olarak sakla (mock).
- “**Bugün**” çizgisi / vurgusu zoom değişince kaybolmasın.

**P2**
- pinch-zoom (trackpad) desteği notu.

---

### B) Vardiya sütunları ve okunabilirlik (yatay genişlik)

**Sorun:** “Sabah / Öğle / Gece” vb. **dar**; metin kesiliyor.

**P0**
- Her **vardiya başlığı** için **minimum genişlik** (ör. `min-w-[…]` düzeyinde wireframe notu); **kısaltma + tam ad** pattern: dar modda “S / Ö / G”, hover’da tam isim.
- Vardiya hücresi **iç padding** artırılsın; gerekirse **dikey yazı yönü** (tek satır, 90°) **P2** — P0’da tercihen yatay tam kelime.
- Gün sütunu içinde vardiyalar **eşit değil**: en uzun etikete göre **dinamik min genişlik** (mock kural metni).

---

### C) Sol bekleyen iş havuzu: tıklama + sürükle-bırak

**Sorun:** Atama çoğunlukla **tıklama** ile; **DnD eksik**.

**P0**
- **Tıklama** akışı **korunur** (mevcut: hedef hücre seç → atanır veya modal).
- **Sürükle-bırak:** Bekleyen iş satırından/kartından sürüklenen öğe, **geçerli** `(gün × vardiya × kalıp)` hücresine **bırakılabilir**; sürüklerken **ghost** önizleme + hedef highlight.
- **Drop hedefleri:** Boş hücre, dolu hücrede **stack alanı** (D maddesi ile uyumlu), veya “sonraki uygun slot” önerisi (P1).
- **İptal:** Esc veya sürükleyip geçersiz alana bırakınca **iptal** + hafif geri bildirim.

**P1**
- Havuzdan sürüklerken **kapasite/çakışma** anlık tooltip (plan-02 ile uyumlu).

---

### D) Aynı kalıpta çoklu iş ve sürükle-bırak hatası (bugfix)

**Sorun:** Aynı kalıba **iki iş aynı anda** yüklenmiyor / DnD **çalışmıyor** (muhtemel neden: tek slot kabulü, `pointer-events`, overlay, veya “çakışma” kuralının yanlış **hard-block** olması).

**P0**
- **Veri modeli kuralı:** Bir `(gün, vardiya, moldId)` hücresinde **birden fazla PlanItem** olabilir; UI **dikey stack** veya **küçük kart ızgarası** ile gösterir.
- **Çakışma vs. çoklu iş:** `plan-02`’deki “uyarı” **fiziksel imkânsızlık** durumlarında kalsın; **basit çoklu yükleme** varsayılan olarak **engellenmesin**. İki seviye:  
  - **İzinli stack** (çoğu senaryo).  
  - **Gerçekten yasak** ise (aynı kalıpta aynı anda tek fiziksel pour vb.) kullanıcıya **açıklayıcı toast** + alternatif slot önerisi — ama **DnD sessizce başarısız olmasın**.
- **Hit target:** Üst üste binen kartlarda **sürükleme tutamacı** ve tıklama alanı net; alt kartın üstüne gelen şeffaf katman `pointer-events` hatası olmasın (teknik not).

**P1**
- “Maksimum eşzamanlı N iş” kalıp parametresi aşılırsa **uyarı** (kırmızı border), yine de kullanıcı onayıyla yerleşsin.

---

### E) Atanan iş bloklarını yatay uzatma (resize = süre / span artırma)

**Sorun:** İş sadece tek vardiya kutusunda “duruyor”; **yandan uzatılamıyor**.

**P0**
- Atanmış üretim kartının **sağ (ve isteğe bağlı sol) kenarında** **resize handle** (ince grip veya 6 nokta ikon).
- Sürükleyerek blok **komşu vardiyalara / sonraki güne** genişler; süre alanı **discrete** (vardiya adımı) veya **sürekli** (saat grid’i) — birini seç; MVP için **vardiya adımı** yeterli.
- Resize sırasında **canlı önizleme**; bırakınca **commit**; çakışma kuralları D maddesi ile tutarlı.
- **Minimum süre:** 1 vardiya; **maksimum:** planlanan aralık sınırı.

**P1**
- `Alt` + resize = ince adım (yarım vardiya mock).
- Klavye: `Shift` + ok ile span uzat/kısalt.

**P2**
- Snapping: tam gün sınırlarına yapışma.

---

### F) Alt gün özeti: daha zengin + güne tıklayınca detay diyalog

**Sorun:** En alttaki gün özeti **yetersiz**; tıklanınca detay yok.

**P0**
- **Footer / özet bandı:** Her gün için mevcut metrikler (adet, m³, demir, uyarı sayısı) **daha yoğun**: örn. **iş sayısı**, **aktif kalıp sayısı**, **riskli iş sayısı** (kısa).
- **Tıklama:** Herhangi bir **gün özetine** tıklanınca **yan drawer / dialog** açılır:  
  - **Başlık:** tarih + gün adı.  
  - **Bölüm 1 — Kalıp kırılımı:** Tablo veya liste: `kalıp`, `iş sayısı`, `özet hacim/adet` (mock).  
  - **Bölüm 2 — İş listesi:** O gün planlanan işlerin **kısa listesi** (ürün adı, kalıp, vardiya, durum rozeti).  
  - **Bölüm 3 — Toplamlar:** m³, adet, demir, diğer toplamlar; **uyarı/eksik** satırı.  
- Boş güne tıklanınca: “Bu gün için plan yok” + “İş ekle” CTA.

**P1**
- Aynı drawer’da **gerçekleşen vs. plan** (MES’ten mock) — opsiyonel sekme.

---

### G) Izgara kartı içeriği: sadeleştirme (isim öne çıksın)

**Sorun:** Kartta süre (örn. “32 saat”) ve öncelik **fazla yer kaplıyor**; kalabalık.

**P0**
- **Kart üzerinde (kompakt):** Öncelikle **ürün / eleman adı** (tek satır, ellipsis + `title` tooltip tam metin).  
- **İkincil satır (opsiyonel):** sadece **kısa kod** veya **emir no** — **öncelik ve saat bilgisi karttan kaldırılsın** (kullanıcı isteği).  
- **Süre, öncelik, detaylı metrikler:** **Drawer**’da (tıklayınca) ve isteğe bağlı **hover tooltip**’te.

**P1**
- Renk kodu / küçük durum noktası (plan-05) korunur; metin yoğunluğu artmaz.

---

## ⚖️ Ek öneriler (modelin fark ettiği boşluklar)

- **Zoom + resize birlikte:** Çok uzak zoom’da resize handle hâlâ erişilebilir olsun (minimum dokunma alanı ~44px).
- **Undo:** Resize veya DnD sonrası tek adım **geri al** (plan-07 ile uyum).
- **Loading:** Gün detayı drawer açılırken iskelet satırlar.
- **Erişilebilirlik:** Resize ve DnD için klavye alternatifi (P1).
- **Tutarlılık:** `plan-08` şemasında `duration` / `span` alanları resize ve DnD ile güncellenir; tek kaynak.

---

### P0 (özet checklist)
- Genişletilmiş zoom + preset + daha etkili scroll/adım.
- Vardiya sütunu min genişlik + okunaklı etiket.
- Bekleyen iş: **tıklama + DnD**.
- Aynı kalıpta çoklu iş + DnD bugfix + stack görünümü.
- Atanan iş: **yatay resize** ile span.
- Gün özeti zenginleştirildi + **güne tıkla → detay drawer**.
- Kart: isim odaklı; süre/öncelik karttan çıkarıldı (detayda).

### P1
- Çakışma tooltip’i, URL’de zoom, gerçekleşen/plan sekmesi, klavye resize.

### P2
- pinch-zoom, snap, touch alternatifleri.

### Mock tablolar (zorunlu)
1) **Zoom presetleri (güncel):** 5 satır — `presetId`, `label`, `approxVisibleDays`, `minShiftColumnPx`, `notes`.  
2) **Aynı hücrede stack örneği:** 6 satır — `cellKey`, `itemId`, `zIndex` veya `stackOrder`.  
3) **Gün detay drawer — kalıp kırılımı:** 10 satır — `moldId`, `jobCount`, `volumeM3`.  
4) **Gün detay drawer — iş listesi:** 12 satır — `itemId`, `title`, `shiftLabel`, `statusKey`.

ÇIKTI: Önce **kısa kök neden analizi** (DnD bug için 2–3 olası teknik neden) + güncellenmiş wireframe notları + mock tablolar + P0/P1/P2 + Tailwind kısa notları + **3–5 UX sorusu**
```
