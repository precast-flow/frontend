# mvp-01 — Platform: şirket bağlamı + fabrika seçici (mock)

```
[Buraya 00-ORTAK-BLOK-MVP-UI.md içeriğini yapıştır]

GÖREV: Tek şirket “Acme Prefabrik A.Ş.” varsayımıyla üst platform UI’sini tasarla. Neumorphic gri-beyaz.

### P0
- Üst barda **fabrika seçici** (Select veya neumorphic dropdown): mock fabrikalar `IST-HAD`, `KOC-01`, `ANK-01`.
- Seçim değişince tüm sayfa başlığında küçük metin: “Bağlam: [fabrika adı]”.
- Kullanıcı profilinde (mock) “erişebildiği fabrikalar” listesi salt okunur (2–3 satır).
- Oturum placeholder: “Giriş yapıldı: ayse@acme.com” (gerçek auth yok).

### P1
- Fabrika seçici yanında “son senkron” mock zamanı (inset badge).
- Fabrika özeti drawer: adres, vardiya sayısı placeholder, sorumlu adı mock.

### P2
- “Tüm fabrikalar” aggregate görünümü toggle (dashboard KPI toplamı mock) — sadece yönetici rolü notu.

MOCK VERİ: Fabrika tablosu en az 3 satır (kod, ad, şehir, aktif).

ÇIKTI: App shell ASCII + fabrika seçici davranışı + Tailwind satırları + hangi roller değiştirebilir + UX soruları
```
