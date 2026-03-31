## 🔍 Konu Tanımı

Her kullanıcı için iki ana görünüm: **üzerime atanan (birim)** ve **atadığım işler** — birim bazlı, şahıs bazlı görev panosu yok.

## 🎯 Amaç

Üretim amiri, satış müdürü, kalite şefi gibi rollerin **aynı kalıpta** iki listeyi görmesi; örnek mock veride 4–5 iş / emir.

## 🧱 Yapısal analiz

### Üzerime atanan (birim)

- Giriş: birimin kuyruğuna düşen iş emirleri (beklemede, üzerinde, bloke).
- Filtreler: proje, öncelik, tarih, fabrika (çok fabrika varsa).

### Atadığım işler

- Çıkış: bu birimin **başkasına** veya **alt birime** (ör. üretim → kalite) verdiği emirler.
- Durum takibi: salt okunur ilerleme veya sınırlı müdahale (ürün kararı).

### Rol ve birim

- **RBAC** “hangi modülü açarım?” — **birim** “hangi kuyruğu görürüm?”
- Bir kullanıcı birden fazla birime bağlı olabilir (firma kararı); MVP’de tek birim varsayılabilir.

### Rapor hattı (`reports_to`)

- Kişi hiyerarşisi **görev panosu yerine**; isteğe bağlı olarak üstün **birim özetlerini** izlemesi (P2).

## ❗ Riskler

- “Birim” master data yoksa ekranlar çöker — firma admin ile tanımlanmalı (`14-firm-admin` ile uyum).

## ❓ Açık sorular

- Birim yöneticisi tüm birim kuyruğunu mu görür, yoksa sadece kendi atadıkları mı?
