# Adım 23 — Prefabrik Üst Yapı Eleman Kimlik ve İsimlendirme Sistemi

Prefabrik üst yapı elemanları için **firma-özelleştirilebilir kimlik ve isimlendirme** çözümü. CAD araçlarından (Tekla, Revit, Allplan, AutoCAD) gelen elemanları ortak bir sözlüğe çevirmek, her firmanın kendi kod konvansiyonuna göre **benzersiz instance adı** üretmek, ve tüm bunları **IFC 4.3.2** standardına oturtmak hedeflenir.

Bu paket **uygulama kodu üretimi değildir**; master ürün listelerini, veri modeli tasarımını, isimlendirme motor kurallarını ve UI wireframe yönergelerini **LLM'e verilecek prompt'lar olarak** tanımlar. İlerde kod yazılacağı zaman bu dosyalar tek tek alınıp uygulatılacaktır.

## Kapsam

- **Dahil (Phase 1):** Üst yapı (superstructure) elemanları — kolon, kiriş, döşeme, duvar paneli, merdiven, sahanlık, konsol, temel soketi, makas
- **Dahil:** Firma bazlı kod override sistemi, token-tabanlı isim template motoru, IFC import mapping matrisi
- **Hariç (sonraki faz):** Altyapı (menfez, boru, bordür, drenaj, sürekli temel), endüstriyel özel elemanlar
- **Hariç:** TypeScript implementasyon dosyaları, React component kodu (bu paket **prompt** üretir)

## Ön Koşul

- `promts/18-parametric-3d-mvp/00-ORTAK-BLOK-PARAMETRIC-3D.md` — parametrik eleman modeli bağlamı
- `promts/okan/00-ORTAK-BLOK-STANDARD-ITEMS.md` — mühendislik entegrasyonu modülü bağlamı
- `promts/13-ui-production-prompts/` veya `11-ui-mvp-prototype/` Neomorphism + Tailwind görsel dili dokümanları (UI prompt'ları için)

## Çalıştırma Sırası

| Sıra | Dosya | Amaç | Öncelik |
|------|--------|------|---------|
| 0 | `00-ORTAK-BLOK-ELEMENT-KIMLIK.md` | Her LLM komutunun başına yapıştır | — |
| 1 | `01-analiz-uc-katmanli-mimari.md` | Okuma: üç katmanlı mimari, IFC GUID gerekçesi | P0 |
| 2 | `02-sistem-katalog-veri-modeli.md` | TypeScript tip tasarımı (şema önerisi) | P0 |
| 3 | `03-master-liste-kolon.md` | Kolon master listesi (9 tipoloji) | P0 |
| 4 | `04-master-liste-kiris.md` | Kiriş master listesi (15 tipoloji) | P0 |
| 5 | `05-master-liste-doseme.md` | Döşeme master listesi (7 tipoloji) | P0 |
| 6 | `06-master-liste-duvar-panel.md` | Duvar paneli master listesi (10 tipoloji) | P0 |
| 7 | `07-master-liste-merdiven-konsol-makas.md` | Merdiven, sahanlık, konsol, soket, makas | P0 |
| 8 | `08-tanimlayici-boyut-formatlari.md` | SIZE token formatları + birim sistemi | P0 |
| 9 | `09-firma-override-veri-modeli.md` | Firma kod override şeması + precedence | P0 |
| 10 | `10-isimlendirme-template-motoru.md` | Token resolver + unique garanti + senaryolar | P0 |
| 11 | `11-ui-firma-ayarlari-ekrani.md` | Firma override ayar ekranı (wireframe) | P1 |
| 12 | `12-ui-template-builder-ekrani.md` | Template builder drag-drop (wireframe) | P1 |
| 13 | `13-ifc-import-mapping.md` | IFC entity → sistem tipi eşleme + heuristik | P0 |
| 14 | `14-ui-ifc-import-sihirbazi.md` | 3 adım import wizard (wireframe) | P1 |
| 15 | `15-mevcut-kod-entegrasyon-plani.md` | Mevcut `types.ts` değişiklikleri + migration | P0 |
| 16 | `16-acik-sorular-ve-kararlar.md` | Karar bekleyen konular listesi | — |

## Çıktı Beklentisi

Her prompt dosyası **LLM'e verilecek talimat** olarak yazılmıştır. Yanıtta istenen:

- **P0 / P1 / P2** ayrımı
- En az **2 örnek mock JSON** (geçerli + sınır durumu)
- **Tablo** ağırlıklı sunum (alan listesi, tipoloji listesi)
- UI prompt'larında: **wireframe** + **Tailwind** kısa ipuçları + **Neomorphism** notları
- **Açık sorular** (≤5) her dosyanın sonunda
- Kod üretimi zorunlu değil; istenen noktada **TypeScript tip önerisi** veya **sözde kod**

## Birim ve Dil Kuralı

- Boyut birimi varsayılan: **mm** (parametric3d paketi ile uyumlu); SIZE token'ı üretiminde `length_m`, `length_cm` gibi format seçenekleri mevcut
- Dil: Türkçe (teknik terimler parantez içinde İngilizce)
- IFC entity adları ve enum değerleri değişmez (örn. `IfcColumn`, `T_BEAM`)

## Faz Sonrası

Bu paket tamamlandıktan sonra:

- **Faz 2:** Altyapı elemanları master listesi (`24-alt-yapi-kimlik-sistemi/`)
- **Faz 3:** Uygulama kodu — catalog TypeScript dosyaları + template engine + UI bileşenleri (`25-kimlik-sistemi-uygulama/`)
- **Faz 4:** IFC parser entegrasyonu (`web-ifc` veya `IFC.js`)
