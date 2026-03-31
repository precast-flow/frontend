# bie-08 — Lojistik ve saha: iş emirleri ve otomatik tetik notu

```
[Buraya 00-ORTAK-BLOK-BIRIM-IS-UI.md içeriğini bağlam olarak ekle]

BAĞLAM: docs/20-proje-is-akisi-deep-dive/04-lojistik-saha-otomatik-atama.md. Mevcut sevkiyat / saha: mvp-11, mvp-12.

GÖREV: **Lojistik birimi** ve **Saha (şantiye) birimi** için iş kuyruğu sayfaları (bie-05 şablonu). **Otomatik oluşturulan** iş satırları için görsel ayırt edici (badge: “Plan tetikli” mock). Manuel oluşturma formu (P1). MOCK.

---

## P0

- Lojistik liste: İş emri no, Proje, Üretim emri ref (varsa), Yükleme penceresi, Durum, Hedef saha.
- Saha liste: İş emri no, Proje, Aktivite (teslim / montaj / kontrol), Durum, Tarih.
- Satır detayında harita placeholder veya adres (mock).
- Üretim–lojistik ilişkisini gösteren kısa metin alanı.

## P1

- “Otomatik tetik kuralları” bilgi kutusu (salt okunur metin — ürün politikası özeti).

## P2

- Sevkiyat onay akışı (mvp-11) çapraz link.

---

## MOCK veri zorunluluğu

- En az **3** otomatik + **2** manuel iş emri satırı.
- Tek proje üzerinden zincir: üretim kapandı → lojistik oluştu → saha bekliyor (satır notlarıyla).

## ÇIKTI ZORUNLULUĞU

1) Wireframe: lojistik + saha iki sayfa veya sekmeli tek modül
2) Mock tablolar
3) Karar notu: MVP’de tetikleyici birim **lojistik** mi **üretim** mi (tek cümle seçim)
4) UX soruları: saha mobil genişletme (mvp-12)

```
