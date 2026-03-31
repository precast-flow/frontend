## 🔍 Konu Tanımı

Proje **tek sayfasında**: zaman çizelgesi (audit / milestone), **aşama bazlı** mesaj veya ek klasörleme, site içi mesajlaşma.

## 🎯 Amaç

“Tekliften teslimine kadar her şey” görünsün; aşama değişince yeni iletişim **yeni segment** veya **filtre** ile görünsün (klasör metaforu).

## 🧱 Yapısal analiz

### Zaman çizelgesi / denetim izi

- Olaylar: durum geçişi, dosya yükleme, iş emri oluşturma, teklif onayı, üretim emri başlatma, sevkiyat.
- Gösterim: dikey timeline veya **filtrelenebilir** tablo (00c şablonu ile uyumlu).

### Mesajlaşma

- Proje içi thread; **aşama etiketi** (Teklif hazırlığı, Proje ofisi, Mühendislik, Üretim, …).
- “Sonraki aşamaya geçince farklı klasör” UX: **segment** veya **kanal** (aynı thread’de alt başlıklar veya ayrı alt thread’ler — ürün kararı).

### Yeniden kullanım

- Bileşen ileride başka modüllere taşınabilir; şimdilik **proje detay** sayfasında sabitlenir.

## ❗ Riskler

- Mesaj + dosya + zaman çizelgesi aynı ekranda kalabalıklaşır; sekmeler veya collapsible bölümler (P0/P1).

## ❓ Açık sorular

- Harici e-posta entegrasyonu MVP dışı mı?
