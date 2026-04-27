# 01 — Analiz: Üç Katmanlı Kimlik Mimarisi (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Prefabrik üst yapı elemanları için ÜÇ KATMANLI kimlik mimarisini analitik olarak belgeleyip,
her katmanın sorumluluğunu, hangi problemi çözdüğünü, hangi alanları içerdiğini ve mimari karar
gerekçelerini bir ANALİZ RAPORU olarak üret. Bu dosya kod değil, TASARIM KARARLARINI savunan
bir referans dokümandır.

PROBLEM TANIMI:
- CAD araçlarından (Tekla, Revit, Allplan, AutoCAD) gelen elemanlar farklı konvansiyonlarla isimlendirilmiş.
- Aynı eleman iki firmada iki farklı kodla gelebilir (XY firması "KL-500", ABC firması "COL-5M").
- Aynı firma bile içsel sistemini proje ortasında değiştirebilir.
- Saha tarafında "KL500" gibi geleneksel kısa mark'lar hâlâ yaygın.
- Uluslararası ihracat projelerinde IFC GUID garantili tek ortak payda.

KATMANLAR:

1) KATMAN 1 — Kaynak Kimliği (Source Identity / Global):
   - Asıl değer: IFC GloballyUniqueId (22 karakter Base64), ISO 16739.
   - Her CAD aracı IFC export'ta aynı GUID'i üretir; instance başına benzersizdir.
   - Ek alanlar: source_system ('TEKLA'|'REVIT'|'ALLPLAN'|'AUTOCAD'|'MANUAL'),
     source_name (orijinal CAD adı), source_file (referans dosya adı), import_date.
   - Bu katman READ-ONLY; kullanıcı değiştiremez, sadece import sırasında set edilir.
   - Rol: izlenebilirlik, çift-import koruması, orijinal sistemle eşleşme.

2) KATMAN 2 — Tip Kodu (Product Type Code / Katalog):
   - Eleman TİPİNİ tanımlar, instance değil. "Bu bir dikdörtgen kolon" bilgisi.
   - Alanlar: elementTypeId (FK → sistem kataloğuna), typologyId (FK), variantCode (opsiyonel ek),
     typology resolved code (firma override uygulandıktan sonra).
   - Sistem kataloğu + firma override'ı burada devreye girer.
   - İki farklı firmada aynı tipolojiye farklı kod verilebilir (örn. "KL" vs "COL"); sistemde
     elementTypeId aynıdır, çıktı kodu farklıdır.
   - Rol: sınıflandırma, raporlama, filtreleme, malzeme listesi üretimi.

3) KATMAN 3 — Instance Mark (Proje Bazlı Benzersiz İsim):
   - Sahadaki, çizimin altındaki, kalıphanede çağrılan kod. Proje içinde BENZERSİZ.
   - Token resolver tarafından TÜRETİLİR; elle yazılmaz.
   - Token sırası firma template'inden gelir: [FIRM_CODE, PROJECT_CODE, TYPOLOGY_CODE, FAMILY_CODE,
     VARIANT_CODE, SIZE, SEQUENCE, REVISION].
   - Minimum benzersizlik kombinasyonu: PROJECT_CODE (veya FIRM_CODE) + FAMILY_CODE + SEQUENCE.
   - Diğer tokenlar insan okunabilirliği için.
   - Rol: saha, üretim, sevkiyat, montaj referansı.

DETAY VARYANT AYIRICISI KALDIRILDI:
- Erken tasarımda "KL-500-A-01" / "KL-500-B-01" gibi detay varyant harfi tartışıldı.
- Karar: sequence numarası zaten benzersizliği garanti ediyor; detay farkları attributes JSON'a kaydediliyor.
- Aynı boyut + aynı aile ama farklı donatıya sahip kolonlar → "KL-500-001" ve "KL-500-002" olur;
  farkları attributes üzerinden takip edilir; isim kısa kalır.

ÇIKTI BEKLENTİSİ:
1. Kısa problem özeti (1 paragraf).
2. Üç katmanın ayrıntılı sorumluluk tablosu:
   | Katman | Ne için | Alanlar | Değiştirilebilir mi | Kim yazar |
3. Mermaid diyagramı: CAD → Import → Katman 1 → Katman 2 → Katman 3 akışı.
4. IFC GUID neden seçildi (3–5 madde gerekçe).
5. Detay varyant ayırıcının neden kaldırıldığına dair mimari savunma (2 paragraf).
6. "Aynı tip + aynı boyut + farklı detay" kolonları için örnek senaryo:
   - Tekla'dan 3 kolon gelir, geometrik olarak aynı, donatıları farklı.
   - Her biri farklı GUID alır (Katman 1), aynı ElementType+Typology referansına eşlenir (Katman 2),
     farklı sequence ile "KL-500-001", "KL-500-002", "KL-500-003" olarak isimlenir (Katman 3).
   - Donatı farkları attributes'da.
7. Mock JSON — bir örnek projeElement kaydı üç katmanı da içerecek şekilde:
   ```json
   {
     "id": "pe-001",
     "projectId": "prj-2026-014",
     "firmId": "acme-prefab",
     // Katman 1 — Kaynak
     "sourceSystem": "TEKLA",
     "sourceGuid": "0LV8Qv4f1Ev8NR2WvGNLhA",
     "sourceName": "C-01-400x400-5m",
     // Katman 2 — Tip
     "elementTypeId": "col",
     "typologyId": "col-rect",
     "variantCode": null,
     // Katman 3 — Instance
     "sequence": 1,
     "revision": 0,
     "instanceMark": "PRJ2026-014-KL-500-001-R0",
     // Detaylar
     "dimensions": { "height": 5000, "sectionWidth": 400, "sectionDepth": 400 },
     "attributes": { "rebarConfig": "4Φ20+Φ8/150", "liftingLoop": "2xLL-10", "concrete": "C50" }
   }
   ```

P0:
- Üç katman tablosu.
- Mermaid akış diyagramı.
- IFC GUID gerekçesi.

P1:
- Detay varyant kararının savunması.
- Aynı-tip-aynı-boyut-farklı-detay senaryosu.

P2:
- Katman 1'e ek alan önerileri (örn. revision_guid — revizyonlu import'ta davranış).
- Çoklu kaynak senaryosu: aynı eleman iki farklı CAD'de modellenmiş → hangi GUID kanonik?

AÇIK SORULAR (LLM bu sorulara cevap önermeli):
1. Manuel oluşturulan (CAD'den gelmeyen) eleman için sourceSystem='MANUAL' iken GUID nasıl üretilir?
   Öneri: uygulamada UUID v4 üret, 22 karaktere kısalt.
2. Aynı CAD dosyasının yeni sürümünde GUID korunur mu? Tekla için evet; Revit için kullanıcı davranışına bağlı.
3. Katman 2'de variantCode opsiyonel; ne zaman zorunlu olmalı? Örn. Çift T için width/depth varyantı.
4. Revision akışı instance mark'ta R0, R1, R2 mi yoksa .01, .02 mi? Firma template kararı.
5. İmport sırasında GUID çakışması olursa (aynı proje, aynı GUID iki kez gelirse): skip? overwrite? revision++?
```
