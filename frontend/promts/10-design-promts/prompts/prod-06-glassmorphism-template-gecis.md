# prod-06 — Neomorfikten Glassmorphism'e tüm site geçişi (tek tema)

```
[Buraya 00-ORTAK-BLOK-URETIM-UI.md yapıştır]

REFERANS GÖRSEL:
- Kullanıcının iPhone ekran görüntüsünü baz al. Görseldeki “buhulu cam” hissini birebir hedefle: yarı saydam yüzeyler, ince border, yumuşak highlight, yeterli backdrop blur derinliği ve katmanlı opaklık.
- Renk/şeffaflık/oranları yakalamak için token seviyesinde eşleştirmeyi hedefle.

AMAÇ:
Mevcut sistemdeki (neomorfik) tüm görsel dili tamamen kaldırıp tüm siteyi tek bir Glassmorphism görünümüne dönüştürmek.
Bu görev sadece küçük bir stil dokunuşu değil: arayüz katmanlarının tamamı “glass + katman derinliği + buhulu overlay” prensibiyle yeniden tasarlanacak.

KRİTİK KORUMA KURALLARI (ZORUNLU):
1) İşlevsel CSS’lere dokunma:
   - layout/pozisyon/ölçü davranışı (örn: `flex`, `grid`, `w-*`, `h-*`, `p-*`, `m-*`, `position`, `display`),
   - komponentin çalışmasını sağlayan hit area / etkileşim örtüşmesi (örn: dropdown açılınca overlay düzgün görünmeli),
   - animasyon/transition’ın varlık mantığı ve süre mantığı,
   aynen bırak.
2) Sadece görsel CSS/utility değiştir:
   - arkaplanlar (gradient/texture dahil),
   - opaklık,
   - border renk/kalınlık/radius,
   - shadow türleri (neomorfik inset çift gölge dahil),
   - backdrop-filter/backdrop-blur,
   - hover/focus/active/disabled görünümü.
3) Tek tema:
   - Açık/koyu/white gibi alternatif temalar üretme veya var olanı görsel olarak “aynı glass paleti”ne sabitle.
   - Eğer mevcut bir tema switch’i varsa: hangi seçim olursa olsun glass tokenları kullanılmalı; UI iki farklı görünüm üretmemeli.

GLASSMORPHISM TASARIM PRENSİPLERİ (ZORUNLU UYGULAMA):
1) Global zemin:
   - Tam sayfa arkaplanında “gradient + çok hafif radial/blob ışık lekeleri + düşük kontrast noise/grain”.
   - Düz beyaz zemin yok; her yüzey cam hissi taşımalı.

2) 3 seviye cam yüzeyi (katmanlı mimari):
   - Seviye-1 (shell / üst yüzey): daha belirgin border + daha güçlü backdrop blur + daha yüksek opaklık.
   - Seviye-2 (içerik kartları): orta opaklık + daha ince border + orta blur.
   - Seviye-3 (ikincil yüzeyler / etiketler): daha düşük opaklık + daha düşük blur + daha ince border.
   - Bu seviyeler tüm bileşenlerde tutarlı olmalı (dashboard, tablo, form, popover, modal, toast).

3) “Buhulu cam” dropdown / popover davranışı (özellikle):
   - Dropdown menüsü açıldığında arka plan katmanları “b u h u l u cam” hissi vermeli.
   - Bunun için menü overlay’i veya popover wrapper’ı arka plana backdrop blur uygulasın.
   - Nested menüler:
     - her katman farklı cam seviyesine oturtulsun (Seviye-2/3),
     - opaklık/blur değerleri kademeli azalsın,
     - okunabilirlik korunmalı.

4) Hover/Focus/Active/Disabled görsel dili:
   - Hover: border parlaklığını artır + opaklık azıcık yükselt + lift hissi çok düşük (agresif kaldırma yok).
   - Focus-visible: cam yüzeyini bozmayan ince ve tutarlı bir outline.
   - Active: opaklık veya kontrast farkı; blur sabit kalabilir.
   - Disabled: opacity düşür; metin okunabilirliğini koru.

5) Neomorfik izleri sıfırlama (zorunlu):
   - Neomorfik “inset” kabartma/çukur desenlerini ve soft light/dark gölge kombinasyonlarını kaldır.
   - Kartların “kabartı/çukur” hissi olmayacak; yerine cam/ışık kırılması benzeri subtle highlight gelmeli.

6) Performans / Erişilebilirlik:
   - Blur maliyetini kontrol et: backdrop-blur ağırlığı sadece overlay/popover katmanlarında yoğun olsun.
   - `prefers-reduced-motion`: animasyon yoğunluğunu azalt.
   - Kontrast: metin ve etkileşimli öğelerde okunabilirliği koru.
   - Mobil için “glass-lite” fallback hedefle (daha az blur, daha sade shadow).

UYGULAMA STRATEJİSİ (BÜTÜN SİTE, KATMANLI):
1) Neomorfik görsel izleri bul:
   - `neomorph`, `inset`, “light shadow/dark shadow” pattern’leri,
   - `box-shadow` tanımları ve psödo elementle çizilen kabartma/çukur desenleri,
   - beyaz temaya sabitlenmiş background/foreground hardcode’ları (örn: `bg-white` / `text-black` kombinasyonları).
2) Sadece görsel parametreleri glass eşdeğerleriyle değiştir:
   - shadow -> cam/gelse uygun dış shadow + çok düşük iç highlight,
   - background -> gradient + frosted surface,
   - border -> ince ve yarı saydam.
3) Tokenlaştır:
   - Tek bir yerde `glass` token seti tut (Tailwind theme veya CSS variables).
   - Tüm bileşen yüzeyleri aynı tokenları kullansın ki “tek tema” gerçekte tek kalsın.

TAILWIND NOTU (VARSA):
- Tailwind kullanılıyorsa değişiklikleri utility sınıfları üzerinden yap (örn: `backdrop-blur-*`, `bg-white/opacity`, `border-white/opacity`).
- Neomorfik utility/mixins/komponent varyantları varsa: onları glass tokenlara yönlendir; yeni bir “light/dark” tema üretme.

ÇIKTI BEKLENTİSİ:
1) Düzenlenen dosyaların listesi (net path bazlı) + her dosyada “hangi görsel katman güncellendi” kısa açıklama.
2) Glass token/utility seti özeti (değerler + hangi seviyelere karşılık geldiği).
3) Dropdown/nested overlay için mekanizma özeti (overlay/backdrop-blur nerede ve hangi z-index katmanlarında).
4) En az 3 mock senaryo:
   - Dashboard: header + KPI kartları cam yüzeyi
   - Liste/Tablo: toolbar + satır hover cam derinliği
   - Form: input/select/button cam yüzeyi + focus ring
5) P0 / P1 / P2 öncelik:
   - P0: Global zemin + ana cam kart yüzeyleri
   - P1: Form/Tablo kontrolleri + ana dropdown
   - P2: Nested popover/mikro etkileşimler + performans fallback

KABUL KRİTERLERİ (DONE TANIMI):
- Neomorfik kabartma/çukur hissi görsel olarak tamamen kalkmış.
- Tek bir glass paleti tüm sayfalarda tutarlı.
- Dropdown / nested menüler “buhulu cam” hissini veriyor.
- İşlevsel davranış bozulmuyor (layout/ölçü/hit-area ve komponent çalışması korunuyor).
- Klavye `focus-visible` görünümü tutarlı ve erişilebilir.
```
