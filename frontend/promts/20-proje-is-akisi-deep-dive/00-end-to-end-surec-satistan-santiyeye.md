## 🔍 Konu Tanımı

Satıştan şantiye kapanışına kadar **proje merkezli** süreç: müşteri projesi oluşturma, proje ofisi inceleme, teklif, iş başlatma, mühendislik birimine devir, üretim ve kalite / lojistik / saha iş emirleri.

## 🎯 Amaç

Tek bir **proje kaydı** üzerinden tüm aşamaların izlenebilmesi; operasyonel işin **şahıs değil birim** üzerinden yönetilmesi.

## 🧱 Sistem içindeki yeri

### 1) Satış — müşteri projesi oluşturur

- Müşteri seçilir; **yapı yeri / kapsam / işin detayı / talepler** (serbest alanlar + yapılandırılmış alanlar ürün kararı).
- **Teklif öncesi / proje ofisi girdisi** gereken alanlar işaretlenir (teklif oluşturulacak veya metraj çıkışı için zemin hazırlığı).
- **“Oluştur”** → proje taslak kaydı; **“Proje ofisine gönder”** → proje ofisi kuyruğuna düşer (birim iş emri veya proje durumu geçişi — ürün kararı).

### 2) Proje ofisi — inceleme, çizim / ekler, geri bildirim

- Projenin **tek sayfası** üzerinde: yüklenen çizimler, revizyon notları, **geri bildirim** metni.
- **Site içi proje mesajlaşması** (thread); ileride başlam bağlamlarında yeniden kullanılabilir bileşen; şimdilik proje sayfasında tutulur.
- **Zaman çizelgesi / denetim izi:** kim ne zaman ne ekledi / durumu ne değiştirdi (teklif aşamasından teslim/şantiye aşamasına kadar).

### 3) Satış — teklif

- Proje ofisi çıktılarına göre **teklif** oluşturur (mevcut teklif modülü ile uyumlu); fiyat / kapsam **projeye bağlı** kalır.

### 4) İş başlatıldığında — satış günceller, mühendisliğe devreder

- **“İş başlat”** (veya eşdeğeri): güncel **fiyat / karar / sözleşme** özeti projeye işlenir.
- **Mühendislik (proje) ekibine** son kararlarla birlikte devir: artık **gerçek üretim öncesi mühendislik** çalışması başlar.

### 5) Mühendislik — iki tür iş emri (birim)

- **A)** Teklif / metraj için: **metraj + çıkış** iş emri (üretim değil, ön analiz).
- **B)** Üretim öncesi: **çizim + teknik kapanış** iş emri; tamamlanınca **üretim emri** üretim birimine gider (mevcut MES dilindeki üretim emri ile köprü).

### 6) Üretim — üretim amiri

- Üzerinde **eşzamanlı birden çok iş emri** (mock senaryoda 4–5 örnek).
- **Üzerime atanan (birim)** ve **Atadığım işler** görünümleri.

### 7) Üretim → kalite, lojistik, saha

- Üretim; **kalite** birimine (ör. beton / ARGE numune talebi — MVP’de sınırlı), **lojistik** ve **saha** birimine iş emri çıkarabilir.
- **Lojistik ve saha** için bir kısım atamalar **otomatik** tetiklenebilir (üretim planına göre — ürün kararı); MVP’de “hangi birim oluşturur” netliği `04-lojistik-saha-otomatik-atama.md` dosyasında.

### 8) Şantiye / saha

- Modül adı **saha** ile uyumlu; **şantiye birimi** iş emirleri (montaj, teslim, kontrol listesi) aynı modelde.

## ❗ Riskler

- **Proje** ile **teklif** ve **üretim emri** arasında çift kaynak; tek proje anahtarı şart.
- Birim tanımı (org şeması) ile **rol** (RBAC) karışması.

## ❓ Açık sorular

- Proje ofisine gönderim **onay** gerektirir mi?
- Metraj iş emri ile üretim öncesi mühendislik iş emri aynı anda mı, sıralı mı?
