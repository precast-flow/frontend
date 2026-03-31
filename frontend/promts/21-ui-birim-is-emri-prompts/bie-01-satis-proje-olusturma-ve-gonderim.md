# bie-01 — Satış: müşteri projesi oluşturma ve proje ofisine gönderim

```
[Buraya 00-ORTAK-BLOK-BIRIM-IS-UI.md içeriğini bağlam olarak ekle]

BAĞLAM: docs/20-proje-is-akisi-deep-dive/00-end-to-end-surec-satistan-santiyeye.md (bölüm 1).

GÖREV: Satış rolü için **yeni müşteri projesi** oluşturma ekranı + **Proje ofisine gönder** aksiyonu. Neomorphism + gri-beyaz; MOCK.

---

## P0

- **Müşteri seçici** (CRM’den; mock liste 5 müşteri).
- **Proje adı / kod** (otomatik öneri mock: PRJ-2025-####).
- **Yapı yeri / adres** (serbest metin + isteğe bağlı harita placeholder).
- **İşin kapsamı ve detayları** (büyük textarea): ne isteniyor, özel şartlar.
- **Teklif / proje ofisi öncesi işaretler:** checkbox veya etiketler — örn. “Metraj çıkışı gerekli”, “Çizim ön inceleme”, “Acil teklif” (mock).
- **Kaydet (taslak)** → durum: Taslak.
- **Proje ofisine gönder** → onay modalı (kısa özet) → durum: Proje ofisinde / İnceleniyor (mock enum).
- Satış için **bildirim toast** mock: “Proje ofisine iletildi.”

## P1

- Dosya eki alanı (çizim PDF, foto — mock dosya adları).
- Son düzenleyen / tarih satırı.

## P2

- Müşteri iletişim kişisi seçimi (CRM alt kayıt mock).

---

## MOCK veri zorunluluğu

- En az **3** taslak proje + **2** gönderilmiş proje listesi (tablo veya kart).

## ÇIKTI ZORUNLULUĞU

1) Wireframe: form + gönder modalı
2) Mock tablo: proje listesi (satış görünümü)
3) Tailwind notları (`00b`)
4) UX soruları: gönder sonrası düzenleme kilitlenir mi?

```
