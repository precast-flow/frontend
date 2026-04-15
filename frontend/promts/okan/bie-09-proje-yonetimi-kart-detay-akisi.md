# bie-09 — Proje yönetimi: kart bazlı liste + yan panel + detay sayfası

```
[Buraya 00-ORTAK-BLOK-BIRIM-IS-UI.md içeriğini bağlam olarak ekle]

BAĞLAM:
- Referans ekran: Mühendislik Entegrasyonu sayfası.
- Özellikle referans alınacak bölüm: Mühendislik Entegrasyonu içindeki “Mühendislik İşleri” tabı.

KRİTİK TASARIM İLKESİ (zorunlu):
- Bu ekranın tema, görsel dil, component davranışı, boşluk sistemi, kart stili, buton dili ve genel UI hissi **Mühendislik Entegrasyonu sayfasının birebir aynısı** olacak.
- Yeni bir tema, yeni bir renk dili, farklı bir kart/tablolaştırma yaklaşımı üretilmeyecek.

GÖREV:
- Proje Yönetimi sayfası tasarla.
- Yerleşim, “Mühendislik İşleri” tabındaki liste + detay kurgusunu takip edecek; ancak sol taraf **liste görünümü değil kart görünümü** olacak.

---

## P0 (zorunlu)

- Sol panel:
  - Projeler kart görünümü ile yüklenecek.
  - Her kartta kısa özet alanları (proje adı, durum, tarih/son aktivite gibi) olacak.
  - Kart seçimi sonrası sağ panel güncellenecek.
  - Üstte **Filtrele** butonu olacak; tıklandığında filtre seçenekleri açılan alan/panel olarak görünecek.

- Sağ panel:
  - Seçilen projenin **tam detayını değil**, yalnızca önemli bilgilerini gösterecek kısa özet paneli olacak.
  - Bu panelden temel aksiyonlar verilecek (ör: durum güncelle, not ekle, sorumlu ata — mock).
  - Bu panelde **Detaya Git** CTA’sı olacak.

- Detay sayfası akışı:
  - Ayrı bir “Proje Detayı” sayfası olacak.
  - Bu sayfaya erişim **yalnızca** sağ paneldeki **Detaya Git** butonundan sağlanacak.
  - Bu sayfa nav menu’ye eklenmeyecek, doğrudan menü rotası olmayacak.

- Üst alan:
  - Başlığın üstünde breadcrumb olacak.
  - Breadcrumb içinde proje adı açıkça görünecek (ör: Proje Yönetimi / [Proje Adı]).

## P1

- Kartlarda hızlı durum etiketi ve öncelik rozeti.
- Filtre alanında çoklu seçim (durum, sorumlu, tarih aralığı) mock.

## P2

- Sağ panelde “son 3 aktivite” mini zaman çizelgesi.

---

## MOCK veri zorunluluğu

- Sol panelde en az 8 proje kartı (farklı durumlarda).
- Filtre sonrası kart sayısı değişimini gösteren mock davranış.
- Sağ panelde en az 3 temel aksiyon (sadece UI/mock, backend yok).

## ÇIKTI ZORUNLULUĞU

1) Wireframe: sol kart paneli + sağ özet/aksiyon paneli + filtre açılır alanı
2) Proje detayı sayfası wireframe (breadcrumb + proje adı zorunlu)
3) “Sadece Detaya Git ile erişim, nav’a ekleme yok” kuralını açık UX notu olarak yaz
4) Referans uygunluğu checklist’i: “Mühendislik Entegrasyonu teması birebir korundu mu?”

```
