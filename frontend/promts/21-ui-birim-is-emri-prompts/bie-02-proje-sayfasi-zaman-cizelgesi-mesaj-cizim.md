# bie-02 — Proje sayfası: zaman çizelgesi, mesajlaşma, çizim / geri bildirim

```
[Buraya 00-ORTAK-BLOK-BIRIM-IS-UI.md içeriğini bağlam olarak ekle]

BAĞLAM: docs/20-proje-is-akisi-deep-dive/05-proje-zaman-cizelgesi-ve-mesajlasma.md.

GÖREV: **Tek proje detay sayfası** — tekliften şantiyeye kadar tüm olayların görünümü; proje ofisi kullanıcısı çizim yükler ve geri bildirim yazar; **site içi mesajlaşma** (thread). MOCK.

---

## P0

- **Header:** proje kodu, müşteri, durum, fabrika bağlamı (mock), ana aşama badge.
- **Sekmeler veya dikey bölümler:**
  1. **Özet** — kısa metin + bağlantılı teklif kartı (varsa).
  2. **Zaman çizelgesi / Günlük** — en az 8 olay (oluşturuldu, ofise gönderildi, dosya eklendi, teklif oluşturuldu, iş başlatıldı, … mock).
  3. **Mesajlar** — proje içi thread; mesajlarda **aşama etiketi** (Teklif hazırlığı, Proje ofisi, Mühendislik, …); “klasör” hissi için filtre veya alt başlıklar.
  4. **Dosyalar / Çizimler** — grid veya liste; yükle butonu; revizyon no (mock).
- **Proje ofisi aksiyonları:** geri bildirim metni (textarea) + **Yanıtla ve kaydet**; çizim yükleme (mock).

## P1

- `00c` uyumlu görünüm seçici (ikon / liste / tablo) dosya alanında.
- Üstte “son aktivite” özeti (tek satır).

## P2

- @mention mock (kullanıcı listesi).

---

## MOCK veri zorunluluğu

- Timeline: tarih-saat + aktör (rol veya kullanıcı adı) + kısa açıklama.
- Mesaj: en az **6** mesaj, farklı aşamalarda.

## ÇIKTI ZORUNLULUĞU

1) Wireframe: tam sayfa blok diyagramı
2) Mock timeline tablosu + mock mesaj listesi
3) Tailwind (`00b`)
4) UX soruları: harici e-posta ile senkron mu (hayır de)?

```
