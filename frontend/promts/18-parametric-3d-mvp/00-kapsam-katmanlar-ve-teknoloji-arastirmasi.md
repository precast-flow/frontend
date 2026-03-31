# Kapsam: üç katman, teknoloji özeti, faz stratejisi

Bu dosya **komut değil**, ekip içi **okuma / karar özeti**dir. LLM komutları ayrı numaralı dosyalardadır.

---

## 🔍 Konu tanımı

Prefabrik beton elemanlarının (kolon, kiriş, menfez, panel, köşe/perde parçası) **çizilmiş sabit mesh** yerine **kurallar ve ölçülerle** tanımlanması; web arayüzünde ölçü girişiyle **3B önizleme** üretilmesi.

---

## 🎯 Amaç

Hızlı MVP için:

1. Ortak **parametre sözleşmesi** (JSON).
2. **Beş temel eleman tipi** için geometri kuralları.
3. **Görüntüleme** katmanı (döndürme, zoom, ölçek).
4. İleride ERP **ürün / üretim emri** alanlarına bağlanabilir veri modeli.

---

## 🧱 Üç katman

| Katman | İçerik | Not |
|--------|--------|-----|
| **1 — Parametre modeli** | `elementType`, tip kodu (T1…), sayısal alanlar, birim | DB / API ile uyumlu tek şema hedeflenir |
| **2 — Geometri üretimi** | Extrusion, CSG (birleşim/çıkarma), 2B profil → 3B | Asıl iş yükü burada |
| **3 — Render / viewer** | WebGL tabanlı görüntü, kullanıcı etkileşimi | Three.js veya JSCAD viewer yaygın |

---

## ⚖️ Teknoloji alternatifleri (özet)

### JSCAD (OpenJSCAD)

- **Artı:** Tarayıcıda JS ile parametrik 2B/3B; parametre değişince yeniden üretim doğal; export (STL vb.) düşünülebilir.
- **Eksi:** Çok karmaşık endüstriyel yüzeyler zorlaşır.
- **Referans:** [jscad.app/docs](https://jscad.app/docs/), [github.com/jscad/OpenJSCAD.org](https://github.com/jscad/OpenJSCAD.org), [openjscad.xyz](https://openjscad.xyz).

### Replicad (OpenCascade WASM)

- **Artı:** Daha “CAD” yaklaşımı; fillet, STEP vb. için uygun; Three.js ile görselleştirme desteği.
- **Eksi:** Kurulum ve WASM maliyeti; MVP’den bir kademe ağır.
- **Referans:** [replicad.xyz](https://replicad.xyz), [github.com/sgenoud/replicad](https://github.com/sgenoud/replicad).

### Three.js + ExtrudeGeometry + (isteğe bağlı) three-bvh-csg

- **Artı:** Tek React uygulamasında tam kontrol; extrude + boolean senaryoları.
- **Eksi:** Geometri kodunu siz yazarsınız; CSG’de manifold / coplanar sorunları.
- **Referans:** [three-bvh-csg (npm)](https://www.npmjs.com/package/three-bvh-csg).

### Backend CadQuery / sunucu OCCT

- **Artı:** Üretim kalitesi STEP çıktısı.
- **Eksi:** Gerçek zamanlı slider için genelde **önizleme mesh** ayrı üretilir.

**MVP önerisi:** Önce **JSCAD veya Three extrude** ile beş tipi kapat; bir tip için **Replicad** spike ikinci dalga.

---

## 🔄 MVP’deki beş eleman (paket içeriği)

1. Dikdörtgen kesit kolon  
2. Prizmatik kiriş  
3. Kutu menfez (dış kutu − iç boşluk)  
4. Düz duvar / döşeme paneli  
5. L veya U profilli perde / köşe parçası  

---

## ❗ Riskler

- Geometri kernel karmaşıklığı (boolean başarısızlıkları).
- Birim karışıklığı (mm vs cm).
- ERP’deki “ürün tipi” ile JSON `elementType` eşlemesinin tutarsız kalması.

---

## ❓ Açık sorular (ürün ekibine)

- Birim standardı: mm mı, cm mi (sabit)?
- Menfezde iç ölçü mü dış ölçü mü ana giriş?
- L/U profilde hangi üretim standartları (sabit katalog mu, tam serbest mi)?
