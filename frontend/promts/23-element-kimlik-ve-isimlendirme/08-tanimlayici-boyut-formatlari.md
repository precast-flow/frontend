# 08 — Tanımlayıcı Boyut Formatları (SIZE Token) (P0)

```
[Buraya 00-ORTAK-BLOK-ELEMENT-KIMLIK.md yapıştır]

GÖREV: Instance Mark içindeki SIZE token'ının nasıl üretileceğini tanımla. Her eleman tipolojisinin
tanımlayıcı boyutları nasıl tek bir string'e dönüştürülür; firma bu formatı nasıl değiştirebilir;
birim sistemi (metrik/imperial) nasıl yönetilir.

TEMEL KURAL:
- identifyingDimensions listesi tipoloji bazında belirlenmiş.
- SIZE token üretimi: dimensions değerleri + SizeFormat.outputTemplate + birim dönüşümü.
- Firma SizeFormat'ı override edebilir (örn. 'length_m' yerine 'length_cm').
- mm hassasiyet kaybolmasın: iç veri hep mm, sadece çıktıda dönüşüm.

STANDART SIZE FORMAT ENUM'U (sistem default'ları):

| id | nameTr | Girdi | Çıktı Template | Örnek (girdi → çıktı) |
|----|--------|-------|-----------------|------------------------|
| length_m | Uzunluk (metre) | length veya height | `{value/1000|round:0}` | 5000mm → "5" |
| length_cm | Uzunluk (cm) | length veya height | `{value/10|round:0}` | 5000mm → "500" |
| length_mm | Uzunluk (mm) | length veya height | `{value|round:0}` | 5000mm → "5000" |
| section_wxh | Kesit W×H (cm) | sectionWidth, sectionDepth | `{w/10|round:0}x{d/10|round:0}` | 400×400mm → "40x40" |
| section_wxh_mm | Kesit W×H (mm) | sectionWidth, sectionDepth | `{w}x{d}` | 400×400mm → "400x400" |
| diameter_cm | Çap (cm) | diameter | `D{diameter/10}` | 600mm → "D60" |
| length_cm_section_cm | Uzunluk + Kesit (cm) | height, sectionWidth, sectionDepth | `{h/10}-{w/10}x{d/10}` | 5000×400×400 → "500-40x40" |
| length_m_section_cm | Uzunluk (m) + Kesit (cm) | height, sectionWidth, sectionDepth | `{h/1000}-{w/10}x{d/10}` | 5000×400×400 → "5-40x40" |
| span_cm | Açıklık (cm) | span | `{span/10|round:0}` | 12000mm → "1200" |
| span_m | Açıklık (metre) | span | `{span/1000|round:0}` | 12000mm → "12" |
| span_section | Açıklık + Kesit | span, width, height | `{span/10}-{w/10}x{h/10}` | 12m T kiriş 30x60 → "1200-30x60" |
| length_height | Uzunluk + Yükseklik (cm) | length, height | `{l/10}-{h/10}` | 6000×3000mm → "600-300" |
| length_height_thickness | Duvar boyutu | length, height, thickness | `{l/10}-{h/10}-{t/10}` | 6000×3000×200mm → "600-300-20" |
| length_height_thickness_total | Sandviç toplam | length, height, (inner+core+outer) | `{l/10}-{h/10}-{totalT/10}` | 6000×3000×(60+100+80) → "600-300-24" |
| length_cm_thickness_cm | Döşeme HC | length, thickness | `{l/10}-{t/10}` | 8000×200mm → "800-20" |
| dt_eu_format | Çift T (EU) | length, width, depth | `{l/10}-{w/10}-{d/10}` | 12m×2400×600 → "1200-240-60" |
| dt_us_format | Çift T (US PCI) | width, depth | `{w_ft}DT{d_in}` | 3660mm×711mm → "12DT28" |
| run_rise_width | Merdiven | totalRun, totalRise, width | `{run/10}-{rise/10}-{w/10}` | 3000×1800×1200 → "300-180-120" |
| spiral_dia_rise | Helezon | outerDiameter, totalRise | `D{outer/10}-H{rise/10}` | 2400×3600 → "D240-H360" |
| projection_wxh | Konsol | projection, width, height | `{p/10}-{w/10}x{h/10}` | 600×300×400 → "60-30x40" |
| socket_full | Soket tam | outerLength, outerWidth, totalHeight, socketLength, socketWidth, socketDepth | `{oL/10}-{oW/10}-{oH/10}_{sL/10}-{sW/10}-{sD/10}` | 1200×1200×800 outer, 500×500×600 socket → "120-120-80_50-50-60" |

TIPOLOJI BAZINDA DEFAULT SIZEFORMAT ATAMALARI:

| Typology.id | defaultSizeFormatId | Gerekçe |
|-------------|---------------------|---------|
| col-rect | length_m_section_cm | 5m-40x40 tarzı yaygın |
| col-circ | length_m + '-D' + diameter_cm | Özel template; ör. "5-D60" |
| col-crb, col-frk, col-tpr, col-hol, col-pil, col-arc, col-sqr | length_m | Detay attribute'larda |
| beam-rect, beam-i, beam-t, beam-it, beam-l, beam-u, beam-box | span_m + section suffix | "12-30x60" tarzı |
| beam-y, beam-ig | span_m (peak detay attribute) | "15-Y" prefix |
| beam-prl, beam-lnt, beam-crn, beam-cap, beam-spd, beam-gtr | span_cm | "800" tarzı |
| slab-hc | length_cm_thickness_cm | "800-20" tarzı |
| slab-dt | dt_eu_format (default) veya dt_us_format | Firma tercihine göre |
| slab-st, slab-sol, slab-rib, slab-fil, slab-rf | length_height_thickness | "600-300-20" tarzı |
| wall-sol, wall-shr, wall-prt, wall-prp, wall-rtn | length_height_thickness | "600-300-20" |
| wall-swp | length_height_thickness_total | "600-300-24" (toplam kalınlık) |
| wall-fac, wall-gfr | length_height_thickness | "600-300-10" |
| wall-l, wall-u | Özel: extrusionHeight_legA_legB | "320-240-180" |
| stair-str | run_rise_width | "300-180-120" |
| stair-l, stair-u | Özel: runA_runB_rise_width | "150-150-180-120" |
| stair-spr | spiral_dia_rise | "D240-H360" |
| landing-rect | length_height (width sıra 1) | "120-60" |
| corbel-rect, corbel-tpr | projection_wxh | "60-30x40" |
| socket-cup | socket_full | "120-120-80_50-50-60" |
| truss-flt, truss-y, truss-gbl | span_m | "20" (makas açıklığı) |

BİRİM SİSTEMİ KURALLARI:
- İç veri HEP mm (integer).
- Çıktı dönüşümü SizeFormat içinde.
- Metric firma → mm/cm/m kullanımı.
- Imperial firma → inch/feet dönüşümü (sadece dt_us_format ve ek özel formatlar).
- Karma (mixed) firma: her SizeFormat kendi birim sistemini tutar; çakışma olmaz.

SIZE TEMPLATE SYNTAX:
Basit mustache-like:
- `{fieldName}` — dimension değeri (mm)
- `{fieldName/1000}` — mm'den m'ye
- `{fieldName/10}` — mm'den cm'ye
- `{fieldName|round:0}` — yuvarlama (0 ondalık)
- `{fieldName|pad:3}` — sol doldurma
- Literal karakter (`-`, `x`, `D`, `H`) direkt yazılır

Örnek:
```
Template: "{height/1000|round:0}-{sectionWidth/10}x{sectionDepth/10}"
Girdi:    height=5000, sectionWidth=400, sectionDepth=400
Çıktı:    "5-40x40"
```

FIRMA OVERRIDE SENARYOLARI:

1. Firma metrik CM tercih:
   - col-rect default 'length_m_section_cm' → firma override 'length_cm_section_cm'
   - Örnek değişim: "5-40x40" → "500-40x40"

2. Firma çift-T için US formatı:
   - slab-dt default 'dt_eu_format' → firma override 'dt_us_format'
   - Örnek: "1200-240-60" → "12DT28"

3. Firma özel format tanımlayabilir (P1 özellik):
   - Yeni SizeFormat kaydı: 'acme_column_format' outputTemplate='{height/1000}M-{sectionWidth/10}-{sectionDepth/10}'
   - Örnek: "5M-40-40"

İSTENEN ÇIKTI:
1. Tam SizeFormat kataloğu (20+ kayıt, tablo şeklinde ve her biri için mock JSON).
2. Tipoloji → defaultSizeFormatId eşleme tablosu (yukarıdaki matristen tam kayıt).
3. Template syntax dokümanı (mustache-like DSL açıklaması).
4. Birim dönüşüm kuralları (mm/cm/m, inch/feet).
5. Firma override senaryoları (3 tam örnek; JSON before/after).
6. Yuvarlama kuralı dokümantasyonu (örn. 5499mm → 5m? 5.5m? 550cm?).
7. Mock JSON örneği — bir SizeFormat kaydı:
   ```json
   {
     "id": "length_m_section_cm",
     "nameTr": "Uzunluk (metre) + Kesit (cm)",
     "nameEn": "Length (m) + Section (cm)",
     "inputs": ["height", "sectionWidth", "sectionDepth"],
     "outputTemplate": "{height/1000|round:0}-{sectionWidth/10|round:0}x{sectionDepth/10|round:0}",
     "unitSystem": "metric",
     "separator": "-",
     "examples": [
       { "input": { "height": 5000, "sectionWidth": 400, "sectionDepth": 400 }, "output": "5-40x40" },
       { "input": { "height": 7500, "sectionWidth": 500, "sectionDepth": 600 }, "output": "8-50x60" }
     ]
   }
   ```

P0:
- SizeFormat kataloğu (tablo + mock JSON'lar).
- Typology → SizeFormat default eşlemesi.
- Template syntax DSL dokümanı.

P1:
- Firma override senaryoları.
- Yuvarlama kuralları.
- Örnek before/after JSON.

P2:
- Imperial birim çevrimi (feet/inches) için ayrı format ailesi.
- Custom firma formatları için UI tanım (SizeFormat builder — ayrı dosya 12'de değerlendirilecek).
- Kısaltmalar için template ipuçları (örn. height=5000 ama HC döşemede length olur — aynı 'length' alanına farklı isim).

AÇIK SORULAR:
1. Yuvarlama: 5499mm → "5" (round down) mu, "5.5" (keep decimal) mi, "6" (round half up) mu?
   Öneri: round:0 varsayılan (yarı yukarı); kullanıcı format'ta round:1 yazabilirse ondalık korunur.
2. Çift T default format ülkeye göre otomatik mi? Türk firma varsayılan EU, US firma US;
   FirmProfile.unitSystem'den türet.
3. Aynı dimension için farklı tipolojide farklı isim (kolon height = kiriş span) → SizeFormat tanımı
   tipoloji-özel mi olmalı (örn. 'beam_span_m') yoksa generic mi (örn. 'length_m')? Öneri: generic
   + typology alias mapping (col.height → length; beam.span → length).
4. Sandviç panel toplam kalınlığı hesaplaması (inner+core+outer) SizeFormat içinde mi yapılmalı
   yoksa pre-processor'da mı? Öneri: SizeFormat expression'ı sum(inner,core,outer) destekleyebilir
   ama MVP için pre-processor tercih edilir.
5. Çok uzun SIZE değerleri (örn. soket 6 boyut) okunabilirlik sorunu yaratır → ayraç seçeneği
   firma tarafından override edilebilmeli. Örn. "_" ile ayır: "120-120-80_50-50-60".
```
