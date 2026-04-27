# Ortak blok — Üst yapı eleman kimlik ve isimlendirme (Adım 23)

**Her `23-*` dosyasını LLM'e vermeden önce aşağıdaki bloğu komutun başına yapıştır; ardından ilgili dosyanın `GÖREV` metnini ekle.**

```
[Buraya promts/18-parametric-3d-mvp/00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır — parametre, birim, çıktı formatı kuralları için]

[Buraya promts/okan/00-ORTAK-BLOK-STANDARD-ITEMS.md yapıştır — mühendislik entegrasyonu bağlamı için (UI prompt'larında)]

ELEMENT KİMLİK VE İSİMLENDİRME — ORTAK KURALLAR (Adım 23):

ROL:
- Prefabrik beton domain uzmanlığı + veri modelleme + IFC 4.3.2 standardı bilgisi.
- Türk prefabrik sektör konvansiyonlarına (TS EN 13369, TS 9967) aşina.
- BIM / IFC entity tipleri ve predefined type enumlarını yorumlayabilir.

KAPSAM:
- SADECE üst yapı (superstructure) elemanları. Altyapı, endüstriyel özel ve temel/kazık ayrı fazlarda.
- Kimlik sistemi üç katmanlı: (1) Kaynak Kimliği = IFC GloballyUniqueId, (2) Tip Kodu = sistem katalog referansı,
  (3) Instance Mark = proje bazlı benzersiz isim (token resolver ile üretilir).
- Instance Mark format tokenları: FIRM_CODE, PROJECT_CODE, TYPOLOGY_CODE, FAMILY_CODE, VARIANT_CODE, SIZE, SEQUENCE, REVISION.

VARSAYIMLAR:
- Frontend-only proje (mevcut durumda): TypeScript + React + Vite + Tailwind + Neomorphism tema.
- Persistence: Mock-first + localStorage; gerçek backend yok.
- Birim sistemi: Varsayılan mm; UI gösteriminde m/cm/mm dönüşümü opsiyon.
- Mevcut ilgili dosyalar: frontend/src/parametric3d/types.ts, frontend/src/components/manualPieceTemplateStudio/types.ts,
  frontend/src/components/muhendislikOkan/standardItemsAssemblies/standardItemsAssembliesMock.ts.

İKİ KATMANLI KATALOG MANTIĞI:
- Sistem kataloğu (bizim tanımladığımız): ElementType + Typology + IdentifyingDimension + default kodlar.
- Firma katmanı (override): FirmCodeOverride (kodları firma değiştirir) + FirmNamingTemplate (token sırası ve formatı firma seçer).
- Precedence: Proje ayarı > Firma ayarı > Sistem default.

YASAK (bu paket kapsamında):
- TypeScript .ts / .tsx dosyası üretme. Sadece TİP ŞEMASI (interface/type açıklaması) ver.
- React component KOD'u yazma. Sadece wireframe + kontrol envanteri + kısa Tailwind ipucu.
- Altyapı (menfez, boru, bordür) tipolojilerine girme.
- Endüstriyel özel eleman kataloğu (örn. silo paneli, LNG duvarı) dahil etme.
- Donatı detayı, kalıp çizimi, beton hesabı kuralları — bu paketin dışında.

IFC EŞLEŞTİRME DİSİPLİNİ:
- Her eleman tipi için: IFC class (IfcColumn, IfcBeam, IfcSlab, IfcWall, IfcStairFlight, IfcFooting, IfcMember) + (varsa) PredefinedType atanmalı.
- IFC 4.3.2 Pset_PrecastConcreteElementGeneral ve Pset_PrecastConcreteElementFabrication referansları dip not olarak anılabilir.
- Bilinmeyen veya sektörel özel tipolojilerde USERDEFINED + ObjectType string kullan.

TANIMLAYICI BOYUT DİSİPLİNİ:
- Her tipoloji için "identifying dimensions" listesi: tip içinde varyansı belirleyen minimum boyut seti.
- Örnek: Kolon → [height, sectionWidth, sectionDepth]; Dairesel Kolon → [height, diameter]; Çift T → [length, width, depth, stemCount].
- Bu liste SIZE token'ının üretim girdisidir.

ÇIKTI FORMATI (varsayılan):
1. Kısa özet (1 paragraf).
2. Alan listesi veya tipoloji tablosu (Türkçe sütun başlıkları).
3. Mock JSON örneği (en az 1; master listelerde her tipoloji için birer tane).
4. P0 / P1 / P2 ayrımı (gerekirse).
5. UI prompt'larında: wireframe + kontrol envanteri + Neomorphism notu.
6. Açık sorular (≤5 madde).

STİL:
- Türkçe; teknik terimler parantez içinde İngilizce.
- Tablo ağırlıklı.
- Mermaid diyagramı karmaşık akışlarda.
- Mock veride gerçekçi sektör örnekleri (Cemre, Dayan, TEPE, FİB gibi firma adları yerine XY-AS, ACE-PREF gibi kısa mock kodlar).

DEMO ERP REFERANSI:
- Mevcut "Standard Items Assemblies" ekranındaki pieceMark, productCategory, productCode, crossSection alanları kimlik sistemi ile uyumlu olmalı.
- PieceMarkTemplate.pieceMark -> Instance Mark (Katman 3).
- PieceMarkTemplate.productCode -> ElementType + Typology referansı (Katman 2).
- Yeni alanlar: sourceSystem, sourceGuid, sourceName (Katman 1).
```
