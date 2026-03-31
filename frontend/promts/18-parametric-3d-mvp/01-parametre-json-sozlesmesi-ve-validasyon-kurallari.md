# 01 — Parametre JSON sözleşmesi ve validasyon kuralları (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: Tüm prefab parametrik 3B elemanları için **ortak üst şema** ve **validasyon kuralları** tasarla. Amaç: ERP ürün kartı, üretim emri ve 3B motorunun aynı JSON’u kullanabilmesi.

KAPSAM:
- Üst alanlar: `schemaVersion`, `elementFamily` (örn. COLUMN | BEAM | CULVERT | PANEL | PROFILE_WALL), `variantCode` (örn. T1, T2), `unit` (sabit `"mm"` öner), `parameters` (tip özel sayılar).
- Her `elementFamily` için `parameters` içinde **izinli anahtar listesi** ve **tip** (integer / float / boolean).
- **Sınır kuralları:** min/max, birbirine bağlı alanlar (örn. iç ölçü < dış ölçü).
- **Hata:** Geçersiz JSON örnekleri ve beklenen hata mesajı sınıfları (mock: `VALIDATION_ERROR`, `GEOMETRY_ERROR`).

### P0
- Tek bir **master örnek JSON** (tüm alanlarla, boş olmayan).
- `schemaVersion: "1.0"` alanı.
- `unit` alanı; tüm sayıların bu birimde olduğu kuralı.
- Geçerli + en az 2 geçersiz örnek (kısa açıklama ile).

### P1
- Opsiyonel `metadata`: `projectId`, `productSku`, `lastModified` (ERP eşlemesi için).
- `parameters` içinde **gruplar**: `section`, `length`, `openings` (panel için).

### P2
- JSON Schema (draft-07) taslağı meta dilde (tam kod zorunlu değil).

ÇIKTI: Tablo (alan | tip | zorunlu | not) + JSON örnekleri + P0/P1/P2 + sorular
```
