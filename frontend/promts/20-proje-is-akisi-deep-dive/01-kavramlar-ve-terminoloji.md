## 🔍 Konu Tanımı

**Proje**, **iş emri**, **birim**, **aşama** ve mevcut dokümandaki **üretim emri** ile kavramların hizalanması.

## 🎯 Amaç

Aynı terimi farklı modüllerde iki kez tanımlamamak; `modules-landscape` ile uyum.

## 🧱 Yapısal analiz

| Kavram | Tanım |
|--------|--------|
| **Müşteri projesi** | CRM müşterisi bağlantılı; tekliften üretime tek iz sürülebilir ana kayıt. |
| **Proje aşaması** | Teklif hazırlığı, teklif, sözleşme, mühendislik, üretim, sevkiyat, saha, kapanış (detay ürün kararı). |
| **Birim** | Organizasyon birimi (Satış, Proje ofisi, Mühendislik, Üretim, Kalite, Lojistik, Saha…). Kullanıcı rolleri bu birimlere bağlanır. |
| **İş emri (birim)** | Birime atanan veya birimin başka birine verdiği **operasyonel iş birimi**; kişi bazlı görev panosu değil. |
| **Üretim emri (MES)** | Fabrika üretiminde kullanılan mevcut kavram; mühendislik çıktısından **üretim birimine** aktarılır. |
| **Metraj / teklif destek iş emri** | Mühendislik biriminde; teklif veya metraj çıkışı için; üretim emrinden ayrı tür. |

## 🔄 Sistem içindeki yeri

- `../04-data-ownership/core-entities.md` ile çakışırsa bu dosya **iş akışı** tarafını günceller; veri sahipliği ayrıca revize edilir.

## ❓ Açık sorular

- “Proje” ERP’de ayrı aggregate mı, yoksa teklif + üretim emirleri üzerinden mi projeksiyon?
