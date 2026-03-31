# bie-06 — Mühendislik: iki tip iş emri ve üretim emri köprüsü

```
[Buraya 00-ORTAK-BLOK-BIRIM-IS-UI.md içeriğini bağlam olarak ekle]

BAĞLAM: docs/20-proje-is-akisi-deep-dive/03-is-emri-tipleri-ve-muhendislik-devri.md.

GÖREV: Mühendislik modülü liste + detay: **Tip A** (metraj / teklif destek) ve **Tip B** (üretim öncesi gerçekleştirme). Tip B tamamlanınca **Üretim emri oluştur** CTA (üretim birimine). MOCK; docs/11-ui-mvp-prototype/mvp-08-muhendislik.md ile hizala.

---

## P0

- Filtre: İş emri tipi (A / B), proje, durum.
- **Detay sayfası:** dosya yükleme alanları, manuel alanlar (mvp-08 ile uyumlu).
- Tip A için banner: “Bu iş üretim emri oluşturmaz.”
- Tip B için: **Üretim emri oluştur** (modal: fabrika, termin, özet) → başarıda proje zaman çizelgesine olay (metin).

## P1

- Revizyon geçmişi mini tablo.

## P2

- Parametrik ürün köprüsü (18-parametric) placeholder link.

---

## MOCK veri zorunluluğu

- Tip A ve Tip B için **en az 2’şer** örnek satır.
- Oluşan üretim emri mock id (PRD-####).

## ÇIKTI ZORUNLULUĞU

1) Wireframe: liste + Tip B detay + üretim modalı
2) Mock tablolar
3) docs/13-ui-production-prompts/prod-02 ile çapraz referans notu

```
