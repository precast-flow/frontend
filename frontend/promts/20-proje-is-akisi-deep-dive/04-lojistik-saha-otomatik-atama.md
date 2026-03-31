## 🔍 Konu Tanımı

**Lojistik** ve **saha (şantiye)** birimlerine düşen iş emirleri: kim **oluşturur**, ne **otomatik** tetiklenir.

## 🎯 Amaç

Üretim planına göre lojistik planlama ve sahadaki teslim / montaj işlerinin **tek proje** üzerinden görünmesi.

## 🧱 Yapısal analiz

### Üretim → lojistik / saha

- Üretim; **kalite** (numune, ARGE), **lojistik** (yükleme, rota), **saha** (teslim, montaj) için iş emri açabilir.
- **Otomatik atama (MVP önerisi):** Üretim emrinde “sevkiyat/teslim penceresi” veya “planlanan üretim bitişi” oluştuğunda **lojistik birimine** bir iş emri (taslak) düşer; lojistik saha planını buna göre yapar.
- **Saha** iş emirleri: lojistik **veya** üretim tarafından tetiklenebilir (ürün kararı — tek sahip seçilmeli).

### Tek sorumlu (karar)

- **Seçenek 1:** Lojistik, saha iş emirlerini **oluşturur ve atar** (üretim planlama çıktısını okur).
- **Seçenek 2:** Üretim emri kapanırken **otomatik** lojistik + saha iş emirleri yaratılır; atanan birimler bunları düzenler.

MVP için **tek bir “oluşturan birim”** seçilmesi önerilir; bu dosya **Seçenek 1 veya 2** olarak işaretlenmiş mock ile UI’da netleştirilir.

### Şantiye modülü

- Mevcut **saha web** (`mvp-12`) ile aynı bağlam; iş emri listesi **birim** dilinde tekrarlanır.

## ❓ Açık sorular

- Çok şantiye / çok teslimat noktasında iş emri **bölünür mü**?
